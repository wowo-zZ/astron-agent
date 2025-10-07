import json
import os
from typing import Any

import requests  # type: ignore
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from workflow.exception.e import CustomException
from workflow.exception.errors.err_code import CodeEnum
from workflow.extensions.fastapi.base import JSONResponseBase
from workflow.extensions.middleware.getters import get_cache_service
from workflow.extensions.otlp.trace.span import Span
from workflow.utils.hmac_auth import HMACAuth


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.exclude_paths: list[str] = []
        self.api_key = os.getenv("APP_MANAGE_PLAT_KEY", "")
        self.api_secret = os.getenv("APP_MANAGE_PLAT_SECRET", "")

    async def dispatch(self, request: Request, call_next: Any) -> Any:
        span = Span()
        with span.start() as span_ctx:
            # Check if the path is in the exclude paths
            if any(request.url.path.startswith(path) for path in self.exclude_paths):
                return await call_next(request)

            # Get the authentication header
            x_consumer_username = request.headers.get("x-consumer-username")
            if x_consumer_username:
                return await call_next(request)

            authorization = request.headers.get("authorization")
            if not authorization:
                return JSONResponseBase.generate_error_response(
                    request.url.path, "authorization header is required", span_ctx.sid
                )

            try:
                x_consumer_username = await self._get_app_source_detail_with_api_key(
                    authorization, span_ctx
                )
            except CustomException as e:
                span_ctx.record_exception(e)
                return JSONResponseBase.generate_error_response(
                    request.url.path, e.message, span_ctx.sid, e.code
                )
            except Exception as e:
                span_ctx.record_exception(e)
                return JSONResponseBase.generate_error_response(
                    request.url.path,
                    CodeEnum.APP_GET_WITH_REMOTE_FAILED_ERROR.msg,
                    span_ctx.sid,
                    CodeEnum.APP_GET_WITH_REMOTE_FAILED_ERROR.code,
                )

            # Add the authentication information to the request state
            headers = list(request.scope["headers"])
            headers.append((b"x-consumer-username", x_consumer_username.encode()))
            request.scope["headers"] = headers
            return await call_next(request)

    def _gen_app_auth_header(self, url: str) -> dict[str, str]:
        """
        Generate authentication headers for the application management platform.

        :param url: The request URL for which to generate authentication headers
        :return: Dictionary containing authentication headers,
                empty dict if credentials are missing
        """

        # Return empty dict if credentials are not configured
        if not self.api_key or not self.api_secret:
            return {}

        return HMACAuth.build_auth_header(
            request_url=url,
            api_key=self.api_key,
            api_secret=self.api_secret,
        )

    async def _get_app_source_detail_with_api_key(
        self, authorization: str, span: Span
    ) -> str:
        """
        Get the app source detail with api key
        """

        url = os.getenv("APP_MANAGE_PLAT_APP_DETAILS_WITH_API_KEY")
        if not url:
            raise CustomException(
                CodeEnum.APP_GET_WITH_REMOTE_FAILED_ERROR,
                err_msg="APP_MANAGE_PLAT_APP_DETAILS_WITH_API_KEY not configured",
            )

        api_key = authorization.split(" ")[1].split(":")[0]
        if not api_key:
            raise CustomException(
                CodeEnum.PARAM_ERROR,
                err_msg="authorization header is invalid",
            )

        app_id = await self._get_app_id_with_cache(api_key)
        if app_id:
            return app_id
        url = f"{url}/{api_key}"
        resp = requests.get(url, headers=self._gen_app_auth_header(url))
        span.add_info_event(f"Application management platform response: {resp.text}")
        if resp.status_code != 200:
            raise CustomException(
                CodeEnum.APP_GET_WITH_REMOTE_FAILED_ERROR, cause_error=resp.text
            )
        """
        Response body:
            {
                "sid": "app00d00001@dx18c38bf54957a04802",
                "code": 0,
                "message": "success",
                "data": {
                    "appid": "007d72a3",
                    "name": "11212311313131",
                    "source": "78263c167bab",
                    "desc": "12121"
                }
            }
        """
        code = resp.json().get("code")
        if code != 0:
            raise CustomException(
                CodeEnum.APP_GET_WITH_REMOTE_FAILED_ERROR,
                cause_error=json.dumps(resp.json(), ensure_ascii=False),
            )

        app_id = resp.json().get("data", {}).get("appid")
        if not app_id:
            raise CustomException(
                CodeEnum.APP_GET_WITH_REMOTE_FAILED_ERROR,
                err_msg="appid is null",
                cause_error=json.dumps(resp.json(), ensure_ascii=False),
            )
        await self._set_app_id_with_cache(api_key, app_id)
        return app_id

    async def _get_app_id_with_cache(self, api_key: str) -> str:
        """
        Get the app id with cache
        """
        cache_service = get_cache_service()
        app_id: str = cache_service[f"workflow:app:api_key:{api_key}"]
        return app_id

    async def _set_app_id_with_cache(self, api_key: str, app_id: str) -> None:
        """
        Set the app id with cache
        """
        cache_service = get_cache_service()
        cache_service[f"workflow:app:api_key:{api_key}"] = app_id
