[![Astron_Readme](./docs/imgs/Astron_Readme.png)](https://agent.xfyun.cn)

<div align="center">

[![License](https://img.shields.io/badge/license-apache2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/iflytek/astron-agent)](https://github.com/iflytek/astron-agent/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/iflytek/astron-agent/ci.yml)](https://github.com/iflytek/astron-agent/actions)
[![Coverage](https://img.shields.io/codecov/c/github/iflytek/astron-agent)](https://codecov.io/gh/iflytek/astron-agent)
[![GitHub Stars](https://img.shields.io/github/stars/iflytek/astron-agent?style=social)](https://github.com/iflytek/astron-agent/stargazers)

[English](README.md) | 简体中文

</div>

## 📑 目录

- [🔭 星辰 Agent 是什么](#-星辰-agent-是什么)
- [🛠️ 技术栈](#%EF%B8%8F-技术栈)
- [🚀 快速开始](#-快速开始)
  - [方式一：Docker Compose](#方式一docker-compose推荐快速体验)
  - [方式二：Helm](#方式二helm适用于-kubernetes-环境)
- [📖 使用指南](#-使用指南)
- [📚 文档](#-文档)
- [🤝 参与贡献](#-参与贡献)
- [🌟 Star 历史](#-star-历史)
- [📞 支持](#-支持)
- [📄 开源协议](#-开源协议)

## 🔭 星辰 Agent 是什么

星辰Agent是一个**企业级、商业友好**的 Agentic Workflow开发平台，融合了 AI 工作流编排、模型管理、AI 与 MCP 工具集、RPA 自动化和团队空间等特性。
平台支持**高可用部署**，帮助企业快速构建**可规模化落地**的智能体应用，打造面向未来的 AI 基座。

### 为什么选择 星辰 Agent？
- **内外同源，稳定可信**：技术内核与[讯飞星辰Agent平台](https://agent.xfyun.cn)保持一致，继承其成熟的企业级稳定性。
- **思考 + 行动的闭环**：智能RPA深度融合，让Agent从“生成答案”走向“自动完成任务”。
- **面向开发者与企业的双重价值**：开发者能快速上手并扩展，企业能高效落地数字化流程。

### 关键特性
- **企业级高可用**：全链路能力覆盖开发、构建、优化与管控，支持高可用集群，一键部署，稳定可靠。
- **智能RPA融合**：跨系统流程自动化，让Agent具备高可控执行力，实现“从决策到动作”的完整闭环。
- **即用工具生态**：集成[讯飞开放平台](https://www.xfyun.cn)海量AI能力与工具，历经数百万开发者验证，免开发快速接入。
- **灵活模型支持**：多种接入方式，支持大模型API快速接入验证到企业级MaaS本地集群一键部署，满足不同规模需求。

### 开发支持
- **多语言后端**：支持 Java、Go、Python 等主流语言，前端适配 TypeScript + React 技术栈。
- **完整工具链**：提供 API 文档、部署指南、故障排查手册，降低学习与维护成本。
- **一键部署**：内置 Docker 化环境，开箱即用，快速启动项目。

## 🛠️ 技术栈

- **后端技术**: Java 21, Spring Boot 3, Go, Python 3.11
- **前端技术**: TypeScript 5, React 18
- **数据库**: MySQL 8
- **缓存**: Redis
- **消息队列**: Apache Kafka
- **基础设施**: Docker, MinIO
- **代码质量工具**: Checkstyle, PMD, SpotBugs, ESLint, gocyclo, staticcheck, golangci-lint, black, isort, flake8, mypy, pylint

## 架构概览

![Architecture Overview](./docs/imgs/structure-zh.png "Architecture Overview")

## 🚀 快速开始

我们提供两种部署方式，满足不同场景需求:

### 方式一：Docker Compose（推荐快速体验）

```bash
# 克隆项目
git clone https://github.com/iflytek/astron-agent.git

# 进入 astronAgent 目录
cd docker/astronAgent

# 复制环境变量配置
cp .env.example .env

# 编辑环境变量配置
vim .env
```

#### 配置 讯飞开放平台 相关 APP_ID API_KEY 等信息

获取文档详见：https://www.xfyun.cn/doc/platform/quickguide.html

创建应用完成后可能需要购买或领取相应能力的API授权服务量
- 星火大模型API: https://xinghuo.xfyun.cn/sparkapi
  (对于大模型API会有额外的SPARK_API_PASSWORD需要在页面上获取)
  (指令型助手对应的文本AI生成/优化功能需要开通Spark Ultra能力，页面地址为https://console.xfyun.cn/services/bm4)
- 实时语音转写API: https://console.xfyun.cn/services/rta
- 图片生成API: https://www.xfyun.cn/services/wtop

编辑 docker/astronAgent/.env 文件，更新相关环境变量：
```env
PLATFORM_APP_ID=your-app-id
PLATFORM_API_KEY=your-api-key
PLATFORM_API_SECRET=your-api-secret

SPARK_API_PASSWORD=your-api-password
SPARK_RTASR_API_KEY=your-rtasr-api-key
```

#### 配置服务主机地址

编辑 docker/astronAgent/.env 文件，配置 AstronAgent 服务的主机地址：

```env
HOST_BASE_ADDRESS=http://localhost
```

**说明：**
- 如果您使用域名访问，请将 `localhost` 替换为您的域名
- 确保 nginx 和 minio 的端口已正确开放

#### 启动项目

```bash
# 进入 astronAgent 目录
cd docker/astronAgent

# 启动所有服务（包含 Casdoor）
docker compose -f docker-compose-with-auth.yaml up -d

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f
```

#### 📊 服务访问地址

启动完成后，您可以通过以下地址访问各项服务：

**认证服务**
- **Casdoor 管理界面**：http://localhost:8000

**AstronAgent**
- **应用前端(nginx代理)**：http://localhost/

**说明**
- Casdoor默认的登录账户名：`admin`，密码：`123`

### 方式二：Helm（适用于 Kubernetes 环境）

> 🚧 **注意**：Helm charts 正在完善中，敬请期待！

```bash
# 即将推出
# helm repo add astron-agent https://iflytek.github.io/astron-agent
# helm install astron-agent astron-agent/astron-agent
```

---

> 📖 完整的部署说明和配置详情，请查看[部署指南](docs/DEPLOYMENT_GUIDE_zh.md)

## 📖 使用指南

详细使用说明请参考 [快速开始](https://www.xfyun.cn/doc/spark/Agent03-%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.html)

## 📚 文档

- [🚀 部署指南](docs/DEPLOYMENT_GUIDE_zh.md)
- [🔧 配置说明](docs/CONFIGURATION_zh.md)
- [🚀 快速开始](https://www.xfyun.cn/doc/spark/Agent02-%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B.html)
- [📘 开发指南](https://www.xfyun.cn/doc/spark/Agent03-%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.html#_1-%E6%8C%87%E4%BB%A4%E5%9E%8B%E6%99%BA%E8%83%BD%E4%BD%93%E5%BC%80%E5%8F%91)
- [💡 最佳实践](https://www.xfyun.cn/doc/spark/AgentNew-%E6%8A%80%E6%9C%AF%E5%AE%9E%E8%B7%B5%E6%A1%88%E4%BE%8B.html)
- [📱 应用案例](https://www.xfyun.cn/doc/spark/Agent05-%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B.html)
- [❓ FAQ](https://www.xfyun.cn/doc/spark/Agent06-FAQ.html)

## 🤝 参与贡献

我们欢迎任何形式的贡献！请查看 [贡献指南](CONTRIBUTING.md)

## 🌟 Star 历史

<div align="center">
  <img src="https://api.star-history.com/svg?repos=iflytek/astron-agent&type=Date" alt="Star 历史图表" width="600">
</div>

## 📞 支持

- 💬 社区讨论: [GitHub Discussions](https://github.com/iflytek/astron-agent/discussions)
- 🐛 问题反馈: [Issues](https://github.com/iflytek/astron-agent/issues)

## 📄 开源协议

本项目基于 [Apache 2.0 License](LICENSE) 协议开源。

---

<div align="center">

**由 iFLYTEK 开发维护**

[![Follow](https://img.shields.io/github/followers/iflytek?style=social&label=关注)](https://github.com/iflytek)
[![Star](https://img.shields.io/github/stars/iflytek/astron-agent?style=social&label=Star)](https://github.com/iflytek/astron-agent)
[![Fork](https://img.shields.io/github/forks/iflytek/astron-agent?style=social&label=Fork)](https://github.com/iflytek/astron-agent/fork)
[![Watch](https://img.shields.io/github/watchers/iflytek/astron-agent?style=social&label=Watch)](https://github.com/iflytek/astron-agent/watchers)

</div>
