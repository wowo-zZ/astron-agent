import os
from typing import Any, Optional

from workflow.extensions.middleware.factory import ServiceFactory
from workflow.extensions.middleware.kafka.manager import KafkaProducerService


class KafkaProducerServiceFactory(ServiceFactory):
    """
    Factory class for creating KafkaProducerService instances.
    Provides a standardized way to instantiate Kafka producer services with proper configuration.
    """

    def __init__(self) -> None:
        """
        Initialize the KafkaProducerServiceFactory.
        Sets up the factory to create KafkaProducerService instances.
        """
        super().__init__(KafkaProducerService)

    def create(
        self, servers: Optional[str] = None, **kwargs: Any
    ) -> KafkaProducerService:
        """
        Create a KafkaProducerService instance with the specified configuration.

        :param servers: Kafka bootstrap servers configuration string
        :param kwargs: Additional Kafka configuration parameters
        :return: Configured KafkaProducerService instance
        :raises ValueError: If KAFKA_SERVERS environment variable is not configured
        """
        # Use provided servers or fall back to environment variable
        servers = servers or os.getenv("KAFKA_SERVERS")
        if not servers:
            raise ValueError("KAFKA_SERVERS environment variable is not configured")

        # Build configuration dictionary with bootstrap servers and additional parameters
        config = {"bootstrap.servers": servers, **kwargs}
        protocol = os.getenv("KAFKA_SECURITY_PROTOCOL", "SASL_PLAINTEXT").upper()
        mechanism = os.getenv("KAFKA_SASL_MECHANISM", "PLAIN").upper()
        username = os.getenv("KAFKA_SASL_USERNAME", "")
        password = os.getenv("KAFKA_SASL_PASSWORD", "")
        if username and password:
            config.update(
                security_protocol=protocol,
                sasl_mechanism=mechanism,
                sasl_plain_username=username,
                sasl_plain_password=password,
            )
        return KafkaProducerService(config)
