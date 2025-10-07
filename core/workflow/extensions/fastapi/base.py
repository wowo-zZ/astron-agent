from starlette.responses import JSONResponse

from workflow.domain.entities.response import Resp
from workflow.exception.errors.err_code import CodeEnum


class JSONResponseBase:
    """
    Base class for JSON responses.
    """

    @staticmethod
    def generate_error_response(
        url_path: str,
        error_message: str,
        sid: str,
        code: int = CodeEnum.PARAM_ERROR.code,
    ) -> JSONResponse:
        """
        Generate an error response.
        :param url_path: The path of the request
        :param error_message: The error message
        :param sid: The session ID
        :param code: The error code
        :return: The error response
        """

        # Handle chat endpoints with SSE response format for real-time communication
        if url_path in [
            "/workflow/v1/debug/chat/completions",
            "/workflow/v1/chat/completions",
            "/workflow/v1/debug/resume",
            "/workflow/v1/resume",
        ]:
            return Resp.error_sse(code, error_message, sid)

        # Handle other endpoints with standard JSON response format
        else:
            return Resp.error(code, error_message, sid)
