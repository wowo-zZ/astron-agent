"""
HMAC Authentication utility unit tests.

This module contains comprehensive unit tests for HMAC authentication functions
including URL signing, parameter generation, and header creation.
"""

import base64

import pytest

from workflow.utils.hmac_auth import HMACAuth


class TestHMACAuth:
    """Test cases for HMACAuth class."""

    def test_build_auth_params_basic(self) -> None:
        """Test basic authentication parameter building functionality."""
        request_url = "https://api.example.com/v1/test"
        method = "GET"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        params = HMACAuth.build_auth_params(request_url, method, api_key, api_secret)

        # Verify returned parameters contain necessary fields
        assert "host" in params
        assert "date" in params
        assert "authorization" in params

        # Verify host field
        assert params["host"] == "api.example.com"

        # Verify date field format
        assert isinstance(params["date"], str)
        assert len(params["date"]) > 0

        # Verify authorization field
        assert isinstance(params["authorization"], str)
        assert len(params["authorization"]) > 0

    def test_build_auth_params_different_methods(self) -> None:
        """Test authentication parameter building for different HTTP methods."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]

        for method in methods:
            params = HMACAuth.build_auth_params(
                request_url, method, api_key, api_secret
            )

            assert "host" in params
            assert "date" in params
            assert "authorization" in params

    def test_build_auth_params_different_urls(self) -> None:
        """Test authentication parameter building for different URLs."""
        urls = [
            "https://api.example.com/v1/test",
            "https://api.example.com/v2/users",
            "https://api.example.com/v1/data/123",
            "https://subdomain.example.com/api/test",
        ]

        api_key = "test_api_key"
        api_secret = "test_api_secret"

        for url in urls:
            params = HMACAuth.build_auth_params(url, "GET", api_key, api_secret)

            assert "host" in params
            assert "date" in params
            assert "authorization" in params

    def test_build_auth_params_empty_credentials(self) -> None:
        """Test authentication parameter building with empty credentials."""
        request_url = "https://api.example.com/v1/test"

        params = HMACAuth.build_auth_params(request_url, "GET", "", "")

        assert "host" in params
        assert "date" in params
        assert "authorization" in params

    def test_build_auth_params_special_characters_in_credentials(self) -> None:
        """Test authentication parameter building with special characters in credentials."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key!@#$%^&*()"
        api_secret = "test_api_secret!@#$%^&*()"

        params = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)

        assert "host" in params
        assert "date" in params
        assert "authorization" in params

    def test_build_auth_params_unicode_credentials(self) -> None:
        """Test authentication parameter building with Unicode characters in credentials."""
        request_url = "https://api.example.com/v1/test"
        api_key = "测试_api_key_中文"
        api_secret = "测试_api_secret_中文"

        params = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)

        assert "host" in params
        assert "date" in params
        assert "authorization" in params

    def test_build_auth_request_url_basic(self) -> None:
        """Test basic authentication request URL building functionality."""
        request_url = "https://api.example.com/v1/test"
        method = "GET"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        auth_url = HMACAuth.build_auth_request_url(
            request_url, method, api_key, api_secret
        )

        # Verify returned URL contains query parameters
        assert "?" in auth_url
        assert "host=" in auth_url
        assert "date=" in auth_url
        assert "authorization=" in auth_url

    def test_build_auth_request_url_with_existing_params(self) -> None:
        """Test URL building with existing query parameters."""
        request_url = "https://api.example.com/v1/test?existing=param"
        method = "GET"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        auth_url = HMACAuth.build_auth_request_url(
            request_url, method, api_key, api_secret
        )

        # Verify returned URL contains existing query parameters
        assert "existing=param" in auth_url
        assert "host=" in auth_url
        assert "date=" in auth_url
        assert "authorization=" in auth_url

    def test_build_auth_request_url_different_methods(self) -> None:
        """Test authentication request URL building for different HTTP methods."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]

        for method in methods:
            auth_url = HMACAuth.build_auth_request_url(
                request_url, method, api_key, api_secret
            )

            assert "?" in auth_url
            assert "host=" in auth_url
            assert "date=" in auth_url
            assert "authorization=" in auth_url

    def test_build_auth_header_basic(self) -> None:
        """Test basic authentication header building functionality."""
        request_url = "https://api.example.com/v1/test"
        method = "GET"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, method, api_key, api_secret)

        # Verify returned headers contain necessary fields
        assert "Method" in headers
        assert "Host" in headers
        assert "Date" in headers
        assert "Digest" in headers
        assert "Authorization" in headers

        # Verify Method field
        assert headers["Method"] == "GET"

        # Verify Host field
        assert headers["Host"] == "api.example.com"

        # Verify Date field format
        assert isinstance(headers["Date"], str)
        assert len(headers["Date"]) > 0

        # Verify Digest field
        assert headers["Digest"].startswith("SHA256=")

        # Verify Authorization field
        assert isinstance(headers["Authorization"], str)
        assert len(headers["Authorization"]) > 0

    def test_build_auth_header_different_methods(self) -> None:
        """Test authentication header building for different HTTP methods."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]

        for method in methods:
            headers = HMACAuth.build_auth_header(
                request_url, method, api_key, api_secret
            )

            assert "Method" in headers
            assert "Host" in headers
            assert "Date" in headers
            assert "Digest" in headers
            assert "Authorization" in headers

            assert headers["Method"] == method

    def test_build_auth_header_different_urls(self) -> None:
        """Test authentication header building for different URLs."""
        urls = [
            "https://api.example.com/v1/test",
            "https://api.example.com/v2/users",
            "https://api.example.com/v1/data/123",
            "https://subdomain.example.com/api/test",
        ]

        api_key = "test_api_key"
        api_secret = "test_api_secret"

        for url in urls:
            headers = HMACAuth.build_auth_header(url, "GET", api_key, api_secret)

            assert "Method" in headers
            assert "Host" in headers
            assert "Date" in headers
            assert "Digest" in headers
            assert "Authorization" in headers

    def test_build_auth_header_empty_credentials(self) -> None:
        """Test authentication header building with empty credentials."""
        request_url = "https://api.example.com/v1/test"

        headers = HMACAuth.build_auth_header(request_url, "GET", "", "")

        assert "Method" in headers
        assert "Host" in headers
        assert "Date" in headers
        assert "Digest" in headers
        assert "Authorization" in headers

    def test_build_auth_header_special_characters_in_credentials(self) -> None:
        """Test authentication header building with special characters in credentials."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key!@#$%^&*()"
        api_secret = "test_api_secret!@#$%^&*()"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        assert "Method" in headers
        assert "Host" in headers
        assert "Date" in headers
        assert "Digest" in headers
        assert "Authorization" in headers

    def test_build_auth_header_unicode_credentials(self) -> None:
        """Test authentication header building with Unicode characters in credentials."""
        request_url = "https://api.example.com/v1/test"
        api_key = "Test_api_key_中文"
        api_secret = "Test_api_secret_中文"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        assert "Method" in headers
        assert "Host" in headers
        assert "Date" in headers
        assert "Digest" in headers
        assert "Authorization" in headers

    def test_build_auth_header_digest_format(self) -> None:
        """Test Digest field format."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        digest = headers["Digest"]
        assert digest.startswith("SHA256=")

        # Verify Base64 encoding format
        digest_value = digest[7:]  # Remove "SHA256=" prefix
        try:
            base64.b64decode(digest_value)
        except Exception:
            pytest.fail("Digest value is not valid Base64")

    def test_build_auth_header_authorization_format(self) -> None:
        """Test Authorization field format."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        auth = headers["Authorization"]

        # Verify Authorization field contains necessary components
        assert "api_key=" in auth
        assert "algorithm=" in auth
        assert "headers=" in auth
        assert "signature=" in auth

        # Verify API key is included
        assert api_key in auth

    def test_build_auth_header_consistency(self) -> None:
        """Test authentication header building consistency."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        # Multiple calls should produce consistent results (except for timestamp)
        headers1 = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)
        headers2 = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        # Except for Date field, other fields should be consistent
        assert headers1["Method"] == headers2["Method"]
        assert headers1["Host"] == headers2["Host"]
        assert headers1["Digest"] == headers2["Digest"]
        # Date field may differ, but format should be consistent
        assert isinstance(headers1["Date"], str)
        assert isinstance(headers2["Date"], str)

    def test_build_auth_params_consistency(self) -> None:
        """Test authentication parameter building consistency."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        # Multiple calls should produce consistent results (except for timestamp)
        params1 = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)
        params2 = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)

        # Except for date field, other fields should be consistent
        assert params1["host"] == params2["host"]
        # date field may differ, but format should be consistent
        assert isinstance(params1["date"], str)
        assert isinstance(params2["date"], str)

    def test_build_auth_params_with_port(self) -> None:
        """Test URL with port."""
        request_url = "https://api.example.com:8080/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        params = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)

        assert params["host"] == "api.example.com"

    def test_build_auth_header_with_port(self) -> None:
        """Test authentication header building for URL with port."""
        request_url = "https://api.example.com:8080/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        assert headers["Host"] == "api.example.com"

    def test_build_auth_params_with_path_parameters(self) -> None:
        """Test URL with path parameters."""
        request_url = "https://api.example.com/v1/users/123/profile"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        params = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)

        assert "host" in params
        assert "date" in params
        assert "authorization" in params

    def test_build_auth_header_with_path_parameters(self) -> None:
        """Test authentication header building for URL with path parameters."""
        request_url = "https://api.example.com/v1/users/123/profile"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        assert "Method" in headers
        assert "Host" in headers
        assert "Date" in headers
        assert "Digest" in headers
        assert "Authorization" in headers

    @pytest.mark.parametrize(
        "url,expected_host",
        [
            ("https://api.example.com/v1/test", "api.example.com"),
            ("https://subdomain.example.com/api", "subdomain.example.com"),
            ("https://example.com", "example.com"),
            ("https://api.example.com:8080/v1/test", "api.example.com"),
        ],
    )
    def test_build_auth_params_host_extraction(
        self, url: str, expected_host: str
    ) -> None:
        """Test hostname extraction from URL."""
        params = HMACAuth.build_auth_params(url, "GET", "key", "secret")
        assert params["host"] == expected_host

    @pytest.mark.parametrize(
        "url,expected_host",
        [
            ("https://api.example.com/v1/test", "api.example.com"),
            ("https://subdomain.example.com/api", "subdomain.example.com"),
            ("https://example.com", "example.com"),
            ("https://api.example.com:8080/v1/test", "api.example.com"),
        ],
    )
    def test_build_auth_header_host_extraction(
        self, url: str, expected_host: str
    ) -> None:
        """Test hostname extraction from URL for authentication headers."""
        headers = HMACAuth.build_auth_header(url, "GET", "key", "secret")
        assert headers["Host"] == expected_host

    def test_build_auth_header_signature_algorithm(self) -> None:
        """Test signature algorithm correctness in authentication headers."""
        request_url = "https://api.example.com/v1/test"
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        # Verify authorization field contains correct algorithm
        auth = headers["Authorization"]
        assert "hmac-sha256" in auth

    def test_build_auth_params_with_none_hostname(self) -> None:
        """Test case with None hostname."""
        # This scenario is unlikely in actual use, but boundary testing is needed
        request_url = "https:///v1/test"  # Invalid URL
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        params = HMACAuth.build_auth_params(request_url, "GET", api_key, api_secret)

        # Should handle None hostname case
        assert "host" in params
        assert params["host"] == ""  # Empty string as default value

    def test_build_auth_header_with_none_hostname(self) -> None:
        """Test authentication header with None hostname."""
        request_url = "https:///v1/test"  # Invalid URL
        api_key = "test_api_key"
        api_secret = "test_api_secret"

        headers = HMACAuth.build_auth_header(request_url, "GET", api_key, api_secret)

        # Should handle None hostname case
        assert "Host" in headers
        assert headers["Host"] == ""  # Empty string as default value
