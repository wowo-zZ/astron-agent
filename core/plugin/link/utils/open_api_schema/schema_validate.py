"""OpenAPI schema validation utilities.

This module provides validation functionality for OpenAPI specifications,
including format checking, version validation, and schema compliance.
"""

import base64
import json
import re
from typing import Dict, List, Optional

import jsonschema
from common.otlp.trace.span import Span
from openapi_spec_validator import validate
from openapi_spec_validator.validation.exceptions import OpenAPIValidationError
from plugin.link.utils.open_api_schema.common_schema import open_api_schema_template
from yaml import safe_load  # type: ignore


class OpenapiSchemaValidator:
    """Validator for OpenAPI schema specifications.

    This class provides comprehensive validation for OpenAPI schemas,
    including format validation, version checking, and compliance verification.
    """

    def __init__(
        self, schema: str, schema_type: int, span: Optional[Span] = None
    ) -> None:
        self.schema = schema  # TODO: eliminate unnecessary assignments
        self.schema_type = schema_type
        self.span = span

    def get_schema_dumps(self) -> str:
        """Get JSON string representation of the schema.

        Returns:
            JSON formatted string of the schema
        """
        return json.dumps(self.schema, ensure_ascii=False)

    def pre(self) -> Optional[List[Dict[str, str]]]:
        """Preprocess and decode the schema data.

        Returns:
            List of errors if preprocessing fails, None if successful
        """
        if not self.span:
            return None
        with self.span.start(func_name="OpenapiSchemaValidator.pre") as span_context:
            span_context.add_info_events({"schema_type": self.schema_type})
            try:
                self.schema = base64.b64decode(self.schema).decode("utf-8")
            except Exception as err:
                msg = f"非法的openapi schema，无效的base64 编码，原因{err}"
                msg_trace = (
                    f"非法的openapi schema {self.schema}，无效的base64 编码，原因{err}"
                )
                span_context.add_error_event(msg_trace)
                errs = [{"error_message": msg}]
                return errs
            if self.schema_type == 1:
                self.schema = safe_load(self.schema)
                span_context.add_info_events(
                    {"schema": json.dumps(self.schema, ensure_ascii=False)}
                )
                return None
            else:
                if not isinstance(self.schema, str):
                    errs = [
                        {
                            "error_message": "openapi schema 格式不对，应该将obj序列化为str传入"
                        }
                    ]
                    span_context.add_error_event(json.dumps(errs, ensure_ascii=False))
                    return errs
                try:
                    self.schema = json.loads(self.schema)
                except Exception as err:
                    msg = (
                        "非法的openapi schema，schema_type 为0时需要将传入的openapi schema应是"
                        f"json body序列化后的字符串, 具体错误原因{err}"
                    )
                    msg_trace = (
                        f"非法的openapi schema: {self.schema}，"
                        "schema_type 为0时需要将传入的openapi schema应是json body序列化后的字符串"
                    )
                    span_context.add_error_event(msg_trace)
                    errs = [{"error_message": msg}]
                    return errs
                span_context.add_info_events(
                    {"schema": json.dumps(self.schema, ensure_ascii=False)}
                )
                return None

    def schema_validate(self) -> Optional[List[Dict[str, str]]]:
        """
        description: 校验 schema 信息
        """
        err = self.pre()
        if err:
            return err
        if self.span:
            with self.span.start(
                func_name="OpenapiSchemaValidator.schema_validate"
            ) as span_context:
                try:
                    if not isinstance(self.schema, dict):
                        self.schema = json.loads(self.schema)
                    if isinstance(self.schema, dict):
                        validate(self.schema)
                    else:
                        return [
                            {"error_path": "openapi", "error_message": "invalid schema"}
                        ]
                except OpenAPIValidationError as err:
                    errs = [{"error_path": "", "error_message": str(err)}]
                    span_context.add_error_event(json.dumps(errs, ensure_ascii=False))
                    return errs
                except Exception as err:
                    errs = [{"error_path": "", "error_message": f"{err}"}]
                    span_context.add_error_event(json.dumps(errs, ensure_ascii=False))
                    return errs
        return self._common_validate()

    def _common_validate(self) -> Optional[List[Dict[str, str]]]:
        if err := self._common_validate_json():
            return err
        if err := self._common_validate_version():
            return err
        if err := self._common_validate_operation_id():
            return err
        return None

    def _common_validate_operation_id(self) -> Optional[List[Dict[str, str]]]:
        """
        description:
        """
        if not self.span:
            return None
        with self.span.start(
            func_name="OpenapiSchemaValidator._common_validate_operation_id"
        ) as span_context:
            err: List[Dict[str, str]] = []
            if isinstance(self.schema, dict):
                paths = self.schema.get("paths", {})
            else:
                return [
                    {"error_path": "openapi", "error_message": "schema must be dict"}
                ]
            for _, path_detail in paths.items():
                for _, method_detail in path_detail.items():
                    operation_id = method_detail.get("operationId", "")
                    if not operation_id:
                        err.append(
                            {
                                "error_path": "paths.get.operationId",
                                "error_message": "operationId 不能为空",
                            }
                        )
                        span_context.add_error_event(
                            json.dumps(err, ensure_ascii=False)
                        )
            return err

    def _common_validate_json(self) -> Optional[List[Dict[str, str]]]:
        if not self.span:
            return None
        with self.span.start(
            func_name="OpenapiSchemaValidator._common_validate_json"
        ) as span_context:
            err: List[Dict[str, str]] = []
            validator = jsonschema.Draft7Validator(open_api_schema_template)
            errors = list(validator.iter_errors(self.schema))
            if errors:
                for error in errors:
                    err.append(
                        {
                            "error_path": error.json_path,
                            "error_message": error.message,
                        }
                    )
                span_context.add_error_event(json.dumps(err))
            return err

    def _common_validate_version(self) -> Optional[List[Dict[str, str]]]:
        """
        description: 其他校验
        """
        if not self.span:
            return None
        with self.span.start(
            func_name="OpenapiSchemaValidator._common_validate_version"
        ) as span_context:
            err: List[Dict[str, str]] = []
            # 1. Validate protocol version number
            if not isinstance(self.schema, dict):
                return [
                    {"error_path": "openapi", "error_message": "schema must be dict"}
                ]
            if "openapi" not in self.schema:
                err.append({"error_path": "openapi", "error_message": "openapi 不存在"})
                span_context.add_error_event(json.dumps(err))
                return err
            openapi_version = self.schema.get("openapi")
            ver_pattern_template = re.compile(r"(?P<major>\d+)\.(?P<minor>\d+)(\..*)?")
            ver_match = ver_pattern_template.match(openapi_version)
            if not ver_match:
                err.append(
                    {
                        "error_path": "openapi",
                        "error_message": "openapi版本格式不对",
                    }
                )
                span_context.add_error_event(json.dumps(err))
                return err
            ver = ver_match.group()
            if ver.split(".")[0] != "3":
                err.append(
                    {
                        "error_path": "openapi",
                        "error_message": "openapi版本仅支持3以上的",
                    }
                )
                span_context.add_error_event(json.dumps(err))
            return err


if __name__ == "__main__":
    import yaml

    a = {"a": "b"}
    # a = json.dumps(a)
    print(yaml.dump(a))
    # print(yaml.load(a, yaml.FullLoader))
    # import re
    # pa = re.compile(r"(?P<major>\d+)\.(?P<minor>\d+)(\..*)?")
    # print(pa.match("3.0.1").group().split(".")[0])
