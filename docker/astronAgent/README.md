# astronAgent Docker Deployment Guide

One-click Docker Compose deployment solution for astronAgent microservice architecture, including all core services and necessary middleware.

## 🏗️ Architecture Overview

### Infrastructure Services (Middleware)
- **PostgreSQL 14** - Primary database for tenant and memory services
- **MySQL 8.4** - Application database for console and Agent services
- **Redis 7** - Cache and session storage
- **Elasticsearch 7.16.2** - Search engine and knowledge base retrieval
- **Kafka 3.7.0** - Message queue and event streaming
- **MinIO** - Object storage service

### astronAgent Core Services
- **core-tenant** (5052) - Tenant management service
- **core-memory** (7990) - Memory database service
- **core-link** (18888) - Link plugin service
- **core-aitools** (18668) - AI tools plugin service
- **core-agent** (17870) - Agent core service
- **core-knowledge** (20010) - Knowledge base service
- **core-workflow** (7880) - Workflow engine service

### astronAgent Console Services
- **console-frontend** (1881) - Frontend web interface
- **console-hub** (8080) - Console core API

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 8GB available memory
- At least 20GB available disk space

### 1. Prepare Configuration Files

```bash
# Copy environment variable configuration template
cd docker/astronAgent
cp .env.example .env

# Modify configuration as needed
vim .env
```

### 2. Start All Services

```bash
# Start all services (run in background)
docker-compose up -d

# Check service status
docker-compose ps

# View service logs
docker-compose logs -f
```

### 3. Access Services

- **Console Frontend**: http://localhost:1881
- **Console Hub API**: http://localhost:8080
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

### Core Service Ports

- **Agent**: http://localhost:17870
- **Workflow**: http://localhost:7880
- **Knowledge**: http://localhost:20010
- **Link**: http://localhost:18888
- **AITools**: http://localhost:18668
- **Tenant**: http://localhost:5052
- **Memory**: http://localhost:7990

## 📋 Service Management

### Start Specific Services

```bash
# Start only middleware services
docker-compose up -d postgres mysql redis elasticsearch kafka minio
```

### Service Health Check

```bash
# View all service health status
docker-compose ps

# View specific service logs
docker-compose logs core-agent

# Enter container for debugging
docker-compose exec core-agent bash
```

### Data Management

```bash
# View data volumes
docker volume ls | grep astron-agent

# Backup databases
docker-compose exec postgres pg_dump -U spark sparkdb_manager > backup.sql
docker-compose exec mysql mysqladmin ping -h localhost > backup.sql

# Clean data (⚠️ Warning: This will delete all data)
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables

Main configuration items are in the `.env` file.

### Database Initialization
- PostgreSQL: Initialization scripts in `pgsql/` directory
- MySQL: Initialization scripts in `mysql/` directory

You can add custom initialization SQL scripts.

## 🌐 Network Configuration

All services run in the `astron-agent-network` network:
- Subnet: 172.40.0.0/16 (configurable via NETWORK_SUBNET)
- Inter-service communication via service names (e.g., postgres:5432)

## 💾 Data Persistence

The following data is persistently stored:
- `postgres_data` - PostgreSQL data
- `mysql_data` - MySQL data
- `redis_data` - Redis data
- `elasticsearch_data` - Elasticsearch indices
- `kafka_data` - Kafka messages
- `minio_data` - MinIO object storage

## 🔍 Troubleshooting

### Common Issues

#### 1. Service Startup Failure
```bash
# View detailed error information
docker-compose logs service-name

# Check resource usage
docker stats

# Check port usage
netstat -tlnp | grep :8080
```

#### 2. Database Connection Failure
```bash
# Check database service status
docker-compose exec postgres pg_isready -U spark
docker-compose exec mysql mysqladmin ping -h localhost

# Restart database services
docker-compose restart postgres mysql
```

#### 3. Insufficient Memory
```bash
# Reduce middleware memory configuration
# Edit docker-compose.yaml
ES_JAVA_OPTS: "-Xms256m -Xmx256m"

# Or start only essential services
docker-compose up -d postgres mysql redis console-hub console-frontend
```

#### 4. Image Pull Failure
```bash
# Check network connectivity
docker pull postgres:14

# Use domestic mirror sources
# Edit /etc/docker/daemon.json
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
```

### Performance Optimization

#### 1. Resource Allocation
```yaml
# Add resource limits for services in docker-compose.yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

#### 2. Database Optimization
```bash
# PostgreSQL
shared_buffers = 256MB
effective_cache_size = 1GB

# MySQL
innodb_buffer_pool_size = 512M
```

## 📚 Important Configuration Notes

### Environment Variable Configuration Guide

Based on the `.env.example` file, main environment variables to configure include:

#### 1. Database Configuration
```bash
# PostgreSQL configuration
POSTGRES_USER=spark
POSTGRES_PASSWORD=spark123

# MySQL configuration
MYSQL_ROOT_PASSWORD=root123
```

#### 2. Core Service Configuration
```bash
# Port configuration for each service
CORE_TENANT_PORT=5052
CORE_MEMORY_PORT=7990
CORE_LINK_PORT=18888
CORE_AITOOLS_PORT=18668
CORE_AGENT_PORT=17870
CORE_KNOWLEDGE_PORT=20010
CORE_WORKFLOW_PORT=7880
```

#### 3. External Service Integration Configuration
```bash
# AI tools service configuration
AI_APP_ID=your-ai-app-id
AI_API_KEY=your-ai-api-key
AI_API_SECRET=your-ai-api-secret

# Knowledge base service configuration (RAGFlow)
RAGFLOW_BASE_URL=http://your-ragflow-url/
RAGFLOW_API_TOKEN=your-ragflow-token
RAGFLOW_TIMEOUT=60
```

### Service Dependencies

All astronAgent core services depend on the health status of middleware services:
- PostgreSQL (for core-memory service)
- MySQL (for other core services)
- Redis (cache and sessions)
- Elasticsearch (search and indexing)
- Kafka (message queue)
- MinIO (object storage)

### Image Registry

All service images are hosted on GitHub Container Registry:
- `ghcr.io/lyj715824/astron-agent/core-tenant:latest`
- `ghcr.io/lyj715824/astron-agent/core-memory:latest`
- `ghcr.io/lyj715824/astron-agent/core-link:latest`
- `ghcr.io/lyj715824/astron-agent/core-aitools:latest`
- `ghcr.io/lyj715824/astron-agent/core-agent:latest`
- `ghcr.io/lyj715824/astron-agent/core-knowledge:latest`
- `ghcr.io/lyj715824/astron-agent/core-workflow:latest`
- `ghcr.io/lyj715824/astron-agent/console-frontend:latest`
- `ghcr.io/lyj715824/astron-agent/console-hub:latest`

## 📚 Additional Resources

- [astronAgent Official Documentation](https://github.com/lyj715824/astron-agent)
- [Docker Compose Official Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [Redis Official Documentation](https://redis.io/documentation)
- [Elasticsearch Official Documentation](https://www.elastic.co/guide/)
- [Apache Kafka Official Documentation](https://kafka.apache.org/documentation/)
- [MinIO Official Documentation](https://docs.min.io/)

## 🤝 Contributing

For issues or suggestions, please submit an Issue or Pull Request.