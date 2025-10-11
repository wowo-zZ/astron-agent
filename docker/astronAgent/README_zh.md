# astronAgent Docker 部署指南

astronAgent 微服务架构的 Docker Compose 一键部署方案，包含所有核心服务和必要的中间件。

## 🏗️ 架构概览

### 中间件服务 (Infrastructure)
- **PostgreSQL 14** - 主数据库，用于租户和内存服务
- **MySQL 8.4** - 应用数据库，用于控制台和Agent服务
- **Redis 7** - 缓存和会话存储
- **Elasticsearch 7.16.2** - 搜索引擎和知识库检索
- **Kafka 3.7.0** - 消息队列和事件流
- **MinIO** - 对象存储服务

### astronAgent 核心服务 (Core Services)
- **core-tenant** (5052) - 租户管理服务
- **core-memory** (7990) - 内存数据库服务
- **core-link** (18888) - 链接插件服务
- **core-aitools** (18668) - AI工具插件服务
- **core-agent** (17870) - Agent核心服务
- **core-knowledge** (20010) - 知识库服务
- **core-workflow** (7880) - 工作流引擎服务

### astronAgent 控制台服务 (Console Services)
- **console-frontend** (1881) - 前端Web界面
- **console-hub** (8080) - 控制台核心API

## 🚀 快速开始

### 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 8GB 可用内存
- 至少 20GB 可用磁盘空间

### 1. 准备配置文件

```bash
# 复制环境变量配置模板
cd docker/astronAgent
cp .env.example .env

# 根据需要修改配置
vim .env
```

### 2. 启动所有服务

```bash
# 启动所有服务 (后台运行)
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 3. 访问服务

- **控制台前端(nginx代理)**：http://localhost:80
- **MinIO 控制台**: http://localhost:9001 (minioadmin/minioadmin123)

### 核心服务端口

- **Agent**: http://localhost:17870
- **Workflow**: http://localhost:7880
- **Knowledge**: http://localhost:20010
- **Link**: http://localhost:18888
- **AITools**: http://localhost:18668
- **Tenant**: http://localhost:5052
- **Memory**: http://localhost:7990

## 📋 服务管理

### 启动特定服务

```bash
# 只启动中间件
docker-compose up -d postgres mysql redis elasticsearch kafka minio
```

### 服务健康检查

```bash
# 查看所有服务健康状态
docker-compose ps

# 查看特定服务日志
docker-compose logs core-agent

# 进入容器调试
docker-compose exec core-agent bash
```

### 数据管理

```bash
# 查看数据卷
docker volume ls | grep astron-agent

# 备份数据库
docker-compose exec postgres pg_dump -U spark sparkdb_manager > backup.sql
docker-compose exec mysql mysqldump -u root -p > backup.sql

# 清理数据 (⚠️ 注意：会删除所有数据)
docker-compose down -v
```

## 🔧 配置说明

### 环境变量

主要配置项在 `.env` 文件中。

### 数据库初始化
- PostgreSQL: `pgsql/` 目录下的初始化脚本
- MySQL: `mysql/` 目录下的初始化脚本

可以添加自定义的初始化SQL脚本。

## 🌐 网络配置

所有服务运行在 `astron-agent-network` 网络中：
- 网段: 172.20.0.0/16 (可通过 NETWORK_SUBNET 配置)
- 服务间通过服务名通信 (如: postgres:5432)

## 💾 数据持久化

以下数据会持久化存储：
- `postgres_data` - PostgreSQL 数据
- `mysql_data` - MySQL 数据
- `redis_data` - Redis 数据
- `elasticsearch_data` - Elasticsearch 索引
- `kafka_data` - Kafka 消息
- `minio_data` - MinIO 对象存储

## 📚 重要配置说明

### 环境变量配置指南

根据 `.env.example` 文件，主要需要配置的环境变量包括：

#### 1. 数据库配置
```bash
# PostgreSQL 配置
POSTGRES_USER=spark
POSTGRES_PASSWORD=spark123

# MySQL 配置
MYSQL_ROOT_PASSWORD=root123
```

#### 2. 外部服务集成配置
```bash
# AI 工具服务配置
AI_APP_ID=your-ai-app-id
AI_API_KEY=your-ai-api-key
AI_API_SECRET=your-ai-api-secret

# 知识库服务配置 (RAGFlow)
RAGFLOW_BASE_URL=http://your-ragflow-url/
RAGFLOW_API_TOKEN=your-ragflow-token
RAGFLOW_TIMEOUT=60
```

### 服务依赖说明

所有 astronAgent 核心服务都依赖于中间件服务的健康状态：
- PostgreSQL (用于 core-memory 服务)
- MySQL (用于其他核心服务)
- Redis (缓存和会话)
- Elasticsearch (搜索和索引)
- Kafka (消息队列)
- MinIO (对象存储)

### 镜像仓库

所有服务镜像托管在 GitHub Container Registry:
- `ghcr.io/iflytek/astron-agent/core-tenant:latest`
- `ghcr.io/iflytek/astron-agent/core-memory:latest`
- `ghcr.io/iflytek/astron-agent/core-link:latest`
- `ghcr.io/iflytek/astron-agent/core-aitools:latest`
- `ghcr.io/iflytek/astron-agent/core-agent:latest`
- `ghcr.io/iflytek/astron-agent/core-knowledge:latest`
- `ghcr.io/iflytek/astron-agent/core-workflow:latest`
- `ghcr.io/iflytek/astron-agent/console-frontend:latest`
- `ghcr.io/iflytek/astron-agent/console-hub:latest`

## 📚 其他资源

- [astronAgent 官方文档](https://github.com/iflytek/astron-agent)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Redis 官方文档](https://redis.io/documentation)
- [Elasticsearch 官方文档](https://www.elastic.co/guide/)
- [Apache Kafka 官方文档](https://kafka.apache.org/documentation/)
- [MinIO 官方文档](https://docs.min.io/)

## 🤝 贡献

如有问题或建议，请提交 Issue 或 Pull Request。