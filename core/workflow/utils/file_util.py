"""
File utility functions for handling file operations, image processing,
and URL conversions.

This module provides utilities for generating unique filenames, extracting
image extensions,and converting image URLs to Base64 encoded strings.
"""

import base64
import random
import string
import time
from typing import Optional
from urllib.parse import urlparse

import requests  # type: ignore


def generate_unique_filename(extension: str = "txt") -> str:
    """
    Generate a unique filename with timestamp and random string.

    :param extension: File extension (default: 'txt')
    :return: Unique filename string
    """
    timestamp = int(time.time() * 1000)  # Current timestamp in milliseconds
    random_str = "".join(
        random.choices(string.ascii_letters + string.digits, k=8)
    )  # Random string
    return f"{timestamp}_{random_str}.{extension}"


def get_image_extension(
    url: str, response: Optional[requests.Response] = None
) -> Optional[str]:
    """
    Extract image extension from URL or HTTP response headers.

    :param url: Image URL
    :param response: HTTP response object (optional)
    :return: Image extension string or None
    """
    # Extract extension from URL
    parsed_url = urlparse(url)
    path = parsed_url.path
    extension = path.split(".")[-1] if "." in path else None

    # If extension cannot be extracted from URL, try HTTP response headers
    if not extension and response:
        content_type = response.headers.get("Content-Type")
        if content_type:
            extension = content_type.split("/")[-1]
            if extension:
                extension = extension.replace("jpeg", "jpg")  # Normalize jpeg to jpg

    return extension


def url_to_base64(url: str) -> str:
    """
    Convert an image URL to a Base64 encoded string.

    :param url: Image URL
    :return: Base64 encoded string
    """
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download image from {url}")
    return str(base64.b64encode(response.content).decode("utf-8"))
