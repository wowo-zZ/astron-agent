# astronAgent 项目完整部署指南

本指南将帮助您按照正确的顺序启动 astronAgent 项目的所有组件，包括身份认证、知识库和核心服务。

## 📋 项目架构概述

astronAgent 项目包含以下三个主要组件：

1. **Casdoor** - 身份认证和单点登录服务(必要部署组件,提供单点登录功能)
2. **RagFlow** - 知识库和文档检索服务(非必要部署组件,根据需要部署)
3. **astronAgent** - 核心业务服务集群(必要部署组件)

## 🚀 部署步骤

### 前置要求

**Agent系统配置要求**
- CPU >= 2 Core
- RAM >= 4 GiB
- Disk >= 50 GB

**RAGFlow配置要求**
- CPU >= 4 Core
- RAM >= 16 GB
- Disk >= 50 GB

### 第一步：启动 Casdoor 身份认证服务

Casdoor 是一个开源的身份和访问管理平台，提供OAuth 2.0、OIDC、SAML等多种认证协议支持。

```bash
# 进入 Casdoor 目录
cd docker/casdoor

# 修改环境变量配置
vim conf/app.conf

# 启动 Casdoor 服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

**服务信息：**
- 访问地址：http://localhost:8000
- 容器名称：casdoor
- 默认配置：生产模式 (GIN_MODE=release)

**配置目录：**
- 配置文件：`./conf` 目录
- 日志文件：`./logs` 目录

### 第二步：启动 RagFlow 知识库服务（根据需要部署）

RagFlow 是一个开源的RAG（检索增强生成）引擎，使用深度文档理解技术提供准确的问答服务。

```bash
# 进入 RagFlow 目录
cd docker/ragflow

# 启动 RagFlow 服务（包含所有依赖）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f ragflow
```

**RagFlow 服务组件：**
- **ragflow-server**：主服务 (端口 9380)
- **ragflow-mysql**：MySQL数据库 (端口 3306)
- **ragflow-redis**：Redis缓存 (端口 6379)
- **ragflow-minio**：对象存储 (端口 9000, 控制台 9001)
- **ragflow-es-01** 或 **ragflow-opensearch-01**：搜索引擎 (端口 9200/9201)
- **ragflow-infinity**：向量数据库 (可选)

**访问地址：**
- RagFlow Web界面：http://localhost:9380

**重要配置说明：**
- 默认使用 Elasticsearch，如需使用 opensearch、infinity，请修改 .env 中的 DOC_ENGINE 配置
- 支持GPU加速，使用 `docker-compose-gpu.yml` 启动

### 第三步：集成配置 Casdoor、RagFlow 服务（根据需要配置相关信息）

在启动 astronAgent 服务之前，根据需要配置相关的连接信息以集成 Casdoor 和 RagFlow。

#### 3.1 配置知识库服务连接

编辑 `docker/astronAgent/.env` 文件，配置 RagFlow 连接信息：

**关键配置项：**

```env
# RAGFlow配置
RAGFLOW_BASE_URL=http://localhost:9380
RAGFLOW_API_TOKEN=ragflow-your-api-token-here
RAGFLOW_TIMEOUT=60
RAGFLOW_DEFAULT_GROUP=星辰知识库
```

**获取 RagFlow API Token：**
1. 访问 RagFlow Web界面：http://localhost:9380
2. 登录并进入用户设置
3. 生成 API Token
4. 将 Token 更新到配置文件中

#### 3.2 配置 Casdoor 认证集成

编辑 `docker/astronAgent/.env` 文件，配置 Casdoor 连接信息：

**关键配置项：**

```env
# Casdoor配置
CONSOLE_CASDOOR_URL=http://your-casdoor-server:8000
CONSOLE_CASDOOR_ID=your-casdoor-client-id
CONSOLE_CASDOOR_APP=your-casdoor-app-name
CONSOLE_CASDOOR_ORG=your-casdoor-org-name
```

**根据您的需求配置 Casdoor 认证集成，主要包括：**
1. **OAuth 应用注册**：在 Casdoor 中注册 astronAgent 应用
2. **回调地址配置**：设置正确的回调URL
3. **权限配置**：配置用户角色和权限
4. **配置文件更新**

### 第四步：启动 astronAgent 核心服务（必要部署步骤）

```bash
# 进入 astronAgent 目录
cd docker/astronAgent

# 复制环境变量配置
cp .env.example .env

# 根据需要修改配置
vim .env

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

## 📊 服务访问地址

启动完成后，您可以通过以下地址访问各项服务：

### 认证服务
- **Casdoor 管理界面**：http://localhost:8000

### 知识库服务
- **RagFlow Web界面**：http://localhost:9380

### AstronAgent 核心服务
- **控制台前端(nginx代理)**：http://localhost:80

### 中间件服务
- **PostgreSQL**：localhost:5432
- **MySQL**：localhost:3306
- **Redis**：localhost:6379
- **Elasticsearch**：localhost:9200
- **Kafka**：localhost:9092
- **MinIO**：localhost:9000

## 📚 更多资源

- [AstronAgent 官方文档](https://docs.astronAgent.cn)
- [Casdoor 官方文档](https://casdoor.org/docs/overview)
- [RagFlow 官方文档](https://ragflow.io/docs)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)

## 🤝 技术支持

如遇到问题，请：

1. 查看相关服务的日志文件
2. 检查官方文档和故障排除指南
3. 在项目 GitHub 仓库提交 Issue
4. 联系技术支持团队

---

**注意**：首次部署建议在测试环境中验证所有功能后再部署到生产环境。