"""
File utility functions unit tests.

This module contains comprehensive unit tests for file utility functions
including filename generation, image processing, and URL conversions.
"""

import base64
import os
import tempfile
from unittest.mock import Mock, patch

import pytest
import requests  # type: ignore[import]

from workflow.utils.file_util import (
    generate_unique_filename,
    get_image_extension,
    url_to_base64,
)


class TestGenerateUniqueFilename:
    """Test cases for generate_unique_filename function."""

    def test_generate_unique_filename_with_default_extension(self) -> None:
        """Test filename generation with default extension."""
        filename = generate_unique_filename()
        assert filename.endswith(".txt")
        assert "_" in filename
        assert len(filename.split("_")) == 2

    def test_generate_unique_filename_with_custom_extension(self) -> None:
        """Test filename generation with custom extension."""
        filename = generate_unique_filename("jpg")
        assert filename.endswith(".jpg")
        assert "_" in filename

    @pytest.mark.parametrize("extension", ["png", "jpeg", "gif", "pdf", "docx"])
    def test_generate_unique_filename_with_various_extensions(
        self, extension: str
    ) -> None:
        """Test filename generation with various extensions."""
        filename = generate_unique_filename(extension)
        assert filename.endswith(f".{extension}")

    def test_generate_unique_filename_uniqueness(self) -> None:
        """Test uniqueness of generated filenames."""
        filenames = [generate_unique_filename() for _ in range(10)]
        assert len(set(filenames)) == 10  # All filenames should be unique

    def test_generate_unique_filename_timestamp_format(self) -> None:
        """Test timestamp format in generated filenames."""
        filename = generate_unique_filename()
        timestamp_part = filename.split("_")[0]
        # Verify timestamp is numeric
        assert timestamp_part.isdigit()
        # Verify timestamp length is reasonable (millisecond timestamp)
        assert len(timestamp_part) >= 10

    def test_generate_unique_filename_random_part(self) -> None:
        """Test random part in generated filenames."""
        filename = generate_unique_filename()
        random_part = filename.split("_")[1].split(".")[0]
        # Verify random part length
        assert len(random_part) == 8
        # Verify random part contains only alphanumeric characters
        assert random_part.isalnum()


class TestGetImageExtension:
    """Test cases for get_image_extension function."""

    def test_get_image_extension_from_url_with_extension(self) -> None:
        """Test extracting image extension from URL."""
        url = "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen"
        extension = get_image_extension(url)
        assert extension == "jpg"

    def test_get_image_extension_from_url_without_extension(self) -> None:
        """Test extracting image extension from URL without extension."""
        url = "https://example.com/image"
        extension = get_image_extension(url)
        assert extension is None

    def test_get_image_extension_from_url_with_query_params(self) -> None:
        """Test extracting image extension from URL with query parameters."""
        url = "https://example.com/image.png?v=123&size=large"
        extension = get_image_extension(url)
        assert extension == "png"

    def test_get_image_extension_from_response_headers(self) -> None:
        """Test extracting image extension from HTTP response headers."""
        url = "https://example.com/image"
        mock_response = Mock()
        mock_response.headers = {"Content-Type": "image/jpeg"}

        extension = get_image_extension(url, mock_response)
        assert extension == "jpg"

    def test_get_image_extension_from_response_headers_jpeg_normalization(self) -> None:
        """Test JPEG to JPG normalization."""
        url = "https://example.com/image"
        mock_response = Mock()
        mock_response.headers = {"Content-Type": "image/jpeg"}

        extension = get_image_extension(url, mock_response)
        assert extension == "jpg"

    def test_get_image_extension_from_response_headers_png(self) -> None:
        """Test PNG format extension extraction."""
        url = "https://example.com/image"
        mock_response = Mock()
        mock_response.headers = {"Content-Type": "image/png"}

        extension = get_image_extension(url, mock_response)
        assert extension == "png"

    def test_get_image_extension_from_response_headers_gif(self) -> None:
        """Test GIF format extension extraction."""
        url = "https://example.com/image"
        mock_response = Mock()
        mock_response.headers = {"Content-Type": "image/gif"}

        extension = get_image_extension(url, mock_response)
        assert extension == "gif"

    def test_get_image_extension_from_response_headers_no_content_type(self) -> None:
        """Test case with no Content-Type header."""
        url = "https://example.com/image"
        mock_response = Mock()
        mock_response.headers = {}

        extension = get_image_extension(url, mock_response)
        assert extension is None

    def test_get_image_extension_priority_url_over_headers(self) -> None:
        """Test URL extension priority over response headers."""
        url = "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen"
        mock_response = Mock()
        mock_response.headers = {"Content-Type": "image/png"}

        extension = get_image_extension(url, mock_response)
        assert extension == "jpg"

    @pytest.mark.parametrize(
        "url,expected",
        [
            (
                "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen",
                "jpg",
            ),
            ("https://example.com/image.png", "png"),
            ("https://example.com/image.gif", "gif"),
            ("https://example.com/image.webp", "webp"),
            ("https://example.com/image", None),
        ],
    )
    def test_get_image_extension_various_urls(self, url: str, expected: str) -> None:
        """Test extension extraction from various URL formats."""
        extension = get_image_extension(url)
        assert extension == expected


class TestUrlToBase64:
    """Test cases for url_to_base64 function."""

    def test_url_to_base64_success(self) -> None:
        """Test successful URL to Base64 conversion."""
        # Create temporary image file
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            temp_file.write(b"fake_image_data")
            temp_file_path = temp_file.name

        try:
            # Mock requests.get to return successful response
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.content = b"fake_image_data"
            mock_response.headers = {"Content-Type": "image/jpeg"}

            with patch("requests.get", return_value=mock_response):
                result = url_to_base64(
                    "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen"
                )

                # Verify returned value is Base64 encoded string
                assert isinstance(result, str)
                # Verify it can be decoded
                decoded = base64.b64decode(result)
                assert decoded == b"fake_image_data"

        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    def test_url_to_base64_download_failure(self) -> None:
        """Test URL download failure scenario."""
        mock_response = Mock()
        mock_response.status_code = 404

        with patch("requests.get", return_value=mock_response):
            with pytest.raises(Exception, match="Failed to download image from"):
                url_to_base64("https://example.com/nonexistent.jpg")

    def test_url_to_base64_with_default_extension(self) -> None:
        """Test using default extension."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = b"fake_image_data"
        mock_response.headers = {}

        with patch("requests.get", return_value=mock_response):
            result = url_to_base64("https://example.com/image")

            assert isinstance(result, str)
            # Verify it can be decoded
            decoded = base64.b64decode(result)
            assert decoded == b"fake_image_data"

    def test_url_to_base64_network_error(self) -> None:
        """Test network error scenario."""
        with patch(
            "requests.get", side_effect=requests.RequestException("Network error")
        ):
            with pytest.raises(requests.RequestException):
                url_to_base64(
                    "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen"
                )

    def test_url_to_base64_different_image_formats(self) -> None:
        """Test conversion of different image formats."""
        test_cases = [
            (
                "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen",
                "image/jpeg",
            ),
            ("https://example.com/image.png", "image/png"),
            ("https://example.com/image.gif", "image/gif"),
        ]

        for url, content_type in test_cases:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.content = b"fake_image_data"
            mock_response.headers = {"Content-Type": content_type}

            with patch("requests.get", return_value=mock_response):
                result = url_to_base64(url)
                assert isinstance(result, str)
                # Verify it can be decoded
                decoded = base64.b64decode(result)
                assert decoded == b"fake_image_data"

    def test_url_to_base64_empty_image(self) -> None:
        """Test conversion of empty image."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = b""
        mock_response.headers = {"Content-Type": "image/jpeg"}

        with patch("requests.get", return_value=mock_response):
            result = url_to_base64("https://example.com/empty.jpg")

            assert isinstance(result, str)
            # Verify it can be decoded
            decoded = base64.b64decode(result)
            assert decoded == b""

    @pytest.mark.parametrize("status_code", [400, 401, 403, 500, 502, 503])
    def test_url_to_base64_various_error_status_codes(self, status_code: int) -> None:
        """Test various HTTP error status codes."""
        mock_response = Mock()
        mock_response.status_code = status_code

        with patch("requests.get", return_value=mock_response):
            with pytest.raises(Exception, match="Failed to download image from"):
                url_to_base64(
                    "http://sgw-dx.xf-yun.com/api/v1/spkdesk2/42e4e5af-597c-4092-bc0a-b732d0e5f7f9.jpg?authorization=c2ltcGxlLWp3dCBhaz1zcGtkZXNrMmQ0YzM1YjBjO2V4cD0xOTE2ODM5MzY0O2FsZ289aG1hYy1zaGEyNTY7c2lnPVJlNEtaTk9iKzNiWjQvbVVBZ2pWTGQ2dGxFOHZHckQxNHJ4ak55TVBjRWc9&x_location=7YfQJjZB7uKtx2GYyYUlfYen"
                )
