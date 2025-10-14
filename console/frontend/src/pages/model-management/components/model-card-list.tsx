import { useState, useEffect, useMemo, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import ModelCard from './model-card';
import { CreateModal } from './modal-component';
import { getCategoryTree } from '@/services/model';
import { ModelInfo, CategoryNode } from '@/types/model';

interface Props {
  models: ModelInfo[];
  /* 是否展示「新建模型」卡片，默认 false */
  showCreate?: boolean;
  keyword: string;
  filterType?: number;
  setModels?: (value: ModelInfo[]) => void;
  refreshModels: () => void;
  showShelfOnly: boolean;
}

const mockData = [
  {
      "id": 10000013,
      "name": "gpt-oss-20b",
      "serviceId": "xopgptoss20b",
      "serverId": "",
      "domain": "xopgptoss20b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xopgptoss20b",
      "llmSource": 1,
      "llmId": 10000013,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/openai.png",
      "tag": [],
      "modelId": 10000013,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": true,
      "multiMode": false,
      "address": null,
      "desc": "gpt-oss-20b 是 OpenAI gpt-oss 系列开源模型，含 21B 参数（3.6B 活跃），适用于低延迟、本地或专用场景，支持推理调节、消费级硬件微调及工具调用，需配合 harmony 格式。",
      "createTime": "2025-08-06T13:49:16.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 280,
                      "key": "contextLengthTag",
                      "name": "128k",
                      "sortOrder": 2,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 185,
              "key": "",
              "name": "默认",
              "sortOrder": 0,
              "children": [],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 183,
                      "key": "modelProvider",
                      "name": "openai",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 109,
                      "key": "modelScenario",
                      "name": "MoE",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 65,
                      "key": "modelScenario",
                      "name": "深度思考",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "OpenAI",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 10000014,
      "name": "gpt-oss-120b",
      "serviceId": "xopgptoss120b",
      "serverId": "",
      "domain": "xopgptoss120b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xopgptoss120b",
      "llmSource": 1,
      "llmId": 10000014,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/openai.png",
      "tag": [],
      "modelId": 10000014,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": true,
      "multiMode": false,
      "address": null,
      "desc": "gpt-oss-120b 是 OpenAI gpt-oss 系列的开源模型，含 117B 参数（5.1B 活跃参数），采用 Apache 2.0 许可，支持推理强度调节、完整思维链、微调及工具调用，需配合 harmony 格式使用。",
      "createTime": "2025-08-06T13:48:56.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 280,
                      "key": "contextLengthTag",
                      "name": "128k",
                      "sortOrder": 2,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 185,
              "key": "",
              "name": "默认",
              "sortOrder": 0,
              "children": [],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 183,
                      "key": "modelProvider",
                      "name": "openai",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 109,
                      "key": "modelScenario",
                      "name": "MoE",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 65,
                      "key": "modelScenario",
                      "name": "深度思考",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "OpenAI",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 225,
      "name": "Qwen3-235B-A22B-Instruct-2507",
      "serviceId": "xop3qwen235b2507",
      "serverId": "lmt4do9o6",
      "domain": "xop3qwen235b2507",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xop3qwen235b2507",
      "llmSource": 1,
      "llmId": 225,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/aicloud/llm/logo/03ee07dc3b7a16136ec925ca4ed0278e.png",
      "tag": [],
      "modelId": 225,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Qwen3-235B-A22B-Instruct-2507：235B 参数，64K 长上下文，通用能力、多语言长尾覆盖及用户偏好对齐显著提升，仅支持非思考模式。",
      "createTime": "2025-07-25T17:56:41.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 181,
                      "key": "contextLengthTag",
                      "name": "64k",
                      "sortOrder": 3,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 165,
              "key": "indexMarker",
              "name": "角标",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 167,
                      "key": "indexMarker",
                      "name": "最新发布",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 109,
                      "key": "modelScenario",
                      "name": "MoE",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 10000010,
      "name": "Qwen3-14B",
      "serviceId": "xop3qwen14b",
      "serverId": "xop3qwen14b",
      "domain": "xop3qwen14b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xop3qwen14b",
      "llmSource": 1,
      "llmId": 10000010,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_Qwen_96.png",
      "tag": [],
      "modelId": 10000010,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Qwen3-14B 是 Qwen 系列中大型因果语言模型，经预训练与后期优化，具备 148 亿参数规模，采用 40 层 Transformer 架构，原生支持 32K tokens 长上下文（通过 YaRN 技术可扩展至 131K tokens），兼顾模型性能与长文本处理能力，适用于企业级推理、多轮对话及长文档分析等任务。",
      "createTime": "2025-04-30T14:19:06.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 179,
                      "key": "contextLengthTag",
                      "name": "16k",
                      "sortOrder": 4,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 10000009,
      "name": "Qwen3-8B",
      "serviceId": "xop3qwen8b",
      "serverId": "xop3qwen8b",
      "domain": "xop3qwen8b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xop3qwen8b",
      "llmSource": 1,
      "llmId": 10000009,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_Qwen_96.png",
      "tag": [],
      "modelId": 10000009,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Qwen3-8B 是 Qwen 系列中大型因果语言模型，经预训练与后期优化，具备 82 亿参数规模，采用 36 层 Transformer 架构，原生支持 32K tokens 长上下文（通过 YaRN 技术可扩展至 131K tokens），兼顾模型效率与长文本处理能力，适用于企业级推理、多轮对话及长文档分析等任务。",
      "createTime": "2025-04-30T14:14:59.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 179,
                      "key": "contextLengthTag",
                      "name": "16k",
                      "sortOrder": 4,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 221,
      "name": "Qwen3-235B-A22B",
      "serviceId": "xop3qwen235b",
      "serverId": "lmt4do9o5",
      "domain": "xop3qwen235b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xop3qwen235b",
      "llmSource": 1,
      "llmId": 221,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_Qwen_96.png",
      "tag": [],
      "modelId": 221,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Qwen3-235B-A22B是Qwen系列新一代因果语言模型，基于混合专家（MoE）架构构建，通过预训练与后期优化，在推理能力、指令遵循、代理工具整合及多语言支持上实现前沿突破。技术层面，该模型总参数量达235B，依托MoE架构动态激活22B参数（128个专家中每次激活8个），采用94层Transformer结构，原生支持32K tokens上下文长度（通过YaRN技术可扩展至131K tokens），是兼顾大规模知识容量与高效计算的旗舰级AI模型，适用于复杂企业级任务与全球化场景。",
      "createTime": "2025-04-29T06:38:02.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 161,
                      "key": "contextLengthTag",
                      "name": "32k",
                      "sortOrder": 5,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 109,
                      "key": "modelScenario",
                      "name": "MoE",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 223,
      "name": "Qwen3-30B-A3B",
      "serviceId": "xop3qwen30b",
      "serverId": "lmt4do9o4",
      "domain": "xop3qwen30b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xop3qwen30b",
      "llmSource": 1,
      "llmId": 223,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/aicloud/llm/logo/03ee07dc3b7a16136ec925ca4ed0278e.png",
      "tag": [],
      "modelId": 223,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Qwen3-30B-A3B 是 Qwen 系列新一代因果语言模型，基于混合专家（MoE）架构，通过预训练与后期优化，实现推理能力、任务适配与多语言支持的全面突破。在推理精度上超越前代 Qwen2.5 系列，在创意写作、多轮交互中带来更自然的体验，还具备强大的外部工具整合能力与超 100 种语言的支持。该模型拥有 30.5B 总参数量（激活 3.3B），48 层 Transformer 架构，原生支持 32K tokens 上下文长度（经扩展可达 131K tokens），是兼顾性能与应用灵活性的前沿 AI 解决方案。",
      "createTime": "2025-04-29T06:36:53.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 161,
                      "key": "contextLengthTag",
                      "name": "32k",
                      "sortOrder": 5,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 109,
                      "key": "modelScenario",
                      "name": "MoE",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 219,
      "name": "Spark X1",
      "serviceId": "x1",
      "serverId": "lm0dy3kv1",
      "domain": "x1",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://spark-api.xf-yun.com/v1/x1",
      "appId": null,
      "licChannel": "bmx1",
      "llmSource": 1,
      "llmId": 219,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_iflyspark_96.png",
      "tag": [],
      "modelId": 219,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": true,
      "multiMode": false,
      "address": null,
      "desc": "星火 X1 大模型在多个关键能力上实现升级。代码能力方面，显著提升代码生成准确率，高难度代码逻辑处理能力也得到强化。数理逻辑上，中英文数理逻辑能力大幅跃升，答题风格向 “深度推理 X1 数学” 模型看齐。指令跟随能力优化，更尊重用户对输出格式等指令，在推荐建议、同理共情、方法建议等实用场景中，回复质量显著提高。功能上，多轮交互式文本生成与改写、聊天能力增强，翻译水平提升，中长篇内容生成的质量和专业性大幅提升。",
      "createTime": "2025-04-15T10:56:44.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 103,
                      "key": "modelScenario",
                      "name": "翻译",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 15,
                      "key": "modelScenario",
                      "name": "代码",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 150,
      "name": "QwQ-32B",
      "serviceId": "xopqwenqwq32b",
      "serverId": "lmy3b394l",
      "domain": "xopqwenqwq32b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xopqwenqwq32b",
      "llmSource": 1,
      "llmId": 150,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_Qwen_96.png",
      "tag": [],
      "modelId": 150,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "QwQ是Qwen系列的推理模型。与传统的指令调优模型相比，具备思考和推理能力的QwQ能够在下游任务中实现显著增强的性能表现，尤其是在解决复杂难题方面。开源协议详情见：https://huggingface.co/Qwen/QwQ-32B",
      "createTime": "2025-03-06T11:01:27.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 31,
                      "key": "languageSupport",
                      "name": "英文",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 161,
                      "key": "contextLengthTag",
                      "name": "32k",
                      "sortOrder": 5,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 141,
      "name": "DeepSeek-V3",
      "serviceId": "xdeepseekv3",
      "serverId": "lmbXtIcNp",
      "domain": "xdeepseekv3",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 8192,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 16384\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 8192,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        },\n        {\n            \"constraintType\": \"switch\",\n            \"default\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": \"关\",\n                    \"label\": \"关\",\n                    \"value\": true,\n                    \"desc\": \"关\"\n                },\n                {\n                    \"name\": \"开\",\n                    \"label\": \"开\",\n                    \"value\": false,\n                    \"desc\": \"开\"\n                }\n            ],\n            \"name\": \"联网搜索\",      \n            \"fieldType\": \"boolean\",\n            \"initialValue\": true,\n            \"key\": \"search_disable\",\n            \"required\": false,\n            \"desc\": \"开启联网搜索，默认关闭。\"\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xdeepseekv3",
      "llmSource": 1,
      "llmId": 141,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_deepseek_96.png",
      "tag": [],
      "modelId": 141,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "DeepSeek-V3 是一款由深度求索公司自研的MoE模型。DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B 等其他开源模型，并在性能上和世界顶尖的闭源模型 GPT-4o 以及 Claude-3.5-Sonnet 不分伯仲。",
      "createTime": "2025-02-07T14:44:41.000+08:00",
      "updateTime": "2025-08-29T15:01:03.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 161,
                      "key": "contextLengthTag",
                      "name": "32k",
                      "sortOrder": 5,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 69,
                      "key": "modelProvider",
                      "name": "深度求索",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "深度求索",
      "apiKey": null,
      "shelfStatus": 1,
      "shelfOffTime": "2025-09-15 09:36:18"
  },
  {
      "id": 142,
      "name": "DeepSeek-R1",
      "serviceId": "xdeepseekr1",
      "serverId": "lm27ebHkj",
      "domain": "xdeepseekr1",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 8192,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 16384\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 8192,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        },\n        {\n            \"constraintType\": \"switch\",\n            \"default\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": \"关\",\n                    \"label\": \"关\",\n                    \"value\": true,\n                    \"desc\": \"关\"\n                },\n                {\n                    \"name\": \"开\",\n                    \"label\": \"开\",\n                    \"value\": false,\n                    \"desc\": \"开\"\n                }\n            ],\n            \"name\": \"联网搜索\",      \n            \"fieldType\": \"boolean\",\n            \"initialValue\": true,\n            \"key\": \"search_disable\",\n            \"required\": false,\n            \"desc\": \"开启联网搜索，默认关闭。\"\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xdeepseekr1",
      "llmSource": 1,
      "llmId": 142,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_deepseek_96.png",
      "tag": [],
      "modelId": 142,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": true,
      "multiMode": false,
      "address": null,
      "desc": "DeepSeek-R1 是由深度求索推出的推理大模型。DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能比肩 OpenAI o1 正式版。",
      "createTime": "2025-02-07T14:43:20.000+08:00",
      "updateTime": "2025-08-29T15:01:03.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 161,
                      "key": "contextLengthTag",
                      "name": "32k",
                      "sortOrder": 5,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 69,
                      "key": "modelProvider",
                      "name": "深度求索",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 65,
                      "key": "modelScenario",
                      "name": "深度思考",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "深度求索",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 140,
      "name": "Spark Character",
      "serviceId": "xaipersonality",
      "serverId": "lme693475",
      "domain": "xaipersonality",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xaipersonality",
      "llmSource": 1,
      "llmId": 140,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/Spark%20Character.png",
      "tag": [],
      "modelId": 140,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Spark Character基于定制的讯飞星火模型架构，经过海量具有合法来源的对话数据专门训练，具备了拟真度更高的对话生成能力，能够精准模拟人类语言交互的细微特征。\nSpark Character能模拟各种各样栩栩如生的虚拟角色，为每一位用户带来沉浸逼真的对话体验。无论是知性的伴侣、热情的冒险家，还是神秘的魔法师，古今中外，或经典或虚构，这些角色在语言、性格和行为反应层面都能与设定保持高度一致。",
      "createTime": "2025-01-16T16:33:19.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 10000008,
      "name": "Qwen_v2.5_7b_Instruct",
      "serviceId": "xqwen257bchat",
      "serverId": "xqwen257bchat",
      "domain": "xqwen257bchat",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xqwen257bchat",
      "llmSource": 1,
      "llmId": 10000008,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_Qwen_96.png",
      "tag": [],
      "modelId": 10000008,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "【可商用】Qwen_v2.5_7b_Instruct是由阿里巴巴集团Qwen团队研发的大型语言模型系列中的新成员。该模型拥有76.1亿参数，通过大规模多语言数据的预训练和高质量数据的后期微调，提高了其在自然语言理解和生成方面的能力。该模型在编程和数学领域表现出较强的知识和能力，能够处理复杂的编程任务和数学问题。Qwen_v2.5_7b_Instruct支持超过29种语言，支持长达128K token的输入，并能生成最多8K token的文本，适合处理复杂的对话或长篇幅文本。此外，Qwen_v2.5_7b_Instruct具备角色扮演、条件设定等高级功能，适用于智能客服、个人助理和教育辅助工具等场合。",
      "createTime": "2024-09-23T17:02:49.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 161,
                      "key": "contextLengthTag",
                      "name": "32k",
                      "sortOrder": 5,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 155,
                      "key": "contextLength",
                      "name": ">=16k",
                      "sortOrder": 710,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 15,
                      "key": "modelScenario",
                      "name": "代码",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 13,
                      "key": "modelScenario",
                      "name": "数学",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 135,
      "name": "Qwen_v2.5_3b_Instruct",
      "serviceId": "xsqwen2d53b",
      "serverId": "lm4rar7p2",
      "domain": "xsqwen2d53b",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xsqwen2d53b",
      "llmSource": 1,
      "llmId": 135,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_Qwen_96.png",
      "tag": [],
      "modelId": 135,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "【可商用】Qwen_v2.5_3b_Instruct是由阿里巴巴集团Qwen团队研发的Qwen2.5系列大型语言模型中的一个版本。该模型支持超过29种语言，支持长达32,768 token的输入，并能生成最多8,192 token的文本。相比于前代模型，Qwen_v2.5_3b_Instruct在自然语言理解、代码编写、数学解题以及多语言处理等多个方面都有显著增强，在指令执行、生成长文本、理解结构化数据（例如表格）以及生成结构化输出特别是JSON方面取得了显著改进，增强了聊天机器人的角色扮演实现和条件设置功能。Qwen_v2.5_3b_Instruct模型在基准评估中取得了显著的性能，成为了一个高效性能力的典型例子。\n",
      "createTime": "2024-09-20T10:40:23.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 153,
                      "key": "contextLength",
                      "name": "4k-16k",
                      "sortOrder": 750,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 85,
                      "key": "modelProvider",
                      "name": "阿里巴巴",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 15,
                      "key": "modelScenario",
                      "name": "代码",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 13,
                      "key": "modelScenario",
                      "name": "数学",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "阿里巴巴",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 121,
      "name": "gemma2_9b_it",
      "serviceId": "xgemma29bit",
      "serverId": "lm479a5b8",
      "domain": "xgemma29bit",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
      "appId": null,
      "licChannel": "xgemma29bit",
      "llmSource": 1,
      "llmId": 121,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/icon_google_96.png",
      "tag": [],
      "modelId": 121,
      "pretrainedModel": null,
      "modelType": 2,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Gemma 是谷歌推出的轻量级先进开源模型家族，其构建所采用的研究和技术与创造 Gemini 模型相同。这些模型为仅解码器的文本到文本大型语言模型，有英文版，预训练变体和指令微调变体均开放权重。Gemma 模型适用于多种文本生成任务，如问答、摘要和推理。由于其相对较小的尺寸，可以部署在资源有限的环境中，如笔记本电脑、台式机或个人云基础设施，让每个人都能更便捷地使用最先进的人工智能模型，促进创新发展。",
      "createTime": "2024-09-09T19:32:31.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 31,
                      "key": "languageSupport",
                      "name": "英文",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 147,
              "key": "contextLength",
              "name": "上下文长度",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 153,
                      "key": "contextLength",
                      "name": "4k-16k",
                      "sortOrder": 750,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 75,
                      "key": "modelProvider",
                      "name": "谷歌",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 61,
                      "key": "modelScenario",
                      "name": "知识问答",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "google",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 110,
      "name": "Spark4.0 Ultra",
      "serviceId": "bm4",
      "serverId": "lm0dy3kv0",
      "domain": "4.0Ultra",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://spark-api.xf-yun.com/v4.0/chat",
      "appId": null,
      "licChannel": "bm4",
      "llmSource": 1,
      "llmId": 110,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
      "tag": [],
      "modelId": 110,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Spark4.0 Ultra是最强大的星火大模型版本，全方位提升效果，优化联网搜索链路，提供精准回答，强化文本总结能力，提升办公生产力。",
      "createTime": "2024-06-27T10:54:08.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 73,
                      "key": "modelScenario",
                      "name": "语义分析",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 61,
                      "key": "modelScenario",
                      "name": "知识问答",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 13,
                      "key": "modelScenario",
                      "name": "数学",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 111,
      "name": "Spark Pro-128k",
      "serviceId": "pro-128k",
      "serverId": "lme990528",
      "domain": "pro-128k",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://spark-api.xf-yun.com/chat/pro-128k",
      "appId": null,
      "licChannel": "pro-128k",
      "llmSource": 1,
      "llmId": 111,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
      "tag": [],
      "modelId": 111,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Spark Pro-128k是支持128K长文本的专业级大语言模型，在七项关键技术上进行了升级，涵盖文本生成和语言理解等领域。该版本提升了代码理解和执行的能力，扩展了应用范围并提高了工作效率。模型能够自主发掘数学规律，并在执行指令与表达细节上取得显著进步。",
      "createTime": "2024-06-26T10:54:08.000+08:00",
      "updateTime": "2025-08-29T15:00:23.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 23,
                      "key": "modelScenario",
                      "name": "对话",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 19,
                      "key": "modelScenario",
                      "name": "教育",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 3,
      "name": "Spark Pro",
      "serviceId": "bm3",
      "serverId": "lmg5gtbs0",
      "domain": "generalv3",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://spark-api.xf-yun.com/v3.1/chat",
      "appId": null,
      "licChannel": "bm3",
      "llmSource": 1,
      "llmId": 3,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
      "tag": [],
      "modelId": 3,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Spark Pro在七项关键技术上进行了升级，涵盖文本生成和语言理解等领域。该版本提升了代码理解和执行的能力，扩展了应用范围并提高了工作效率。模型能够自主发掘数学规律，并在执行指令与表达细节上取得显著进步。",
      "createTime": "2024-04-15T16:29:05.000+08:00",
      "updateTime": "2025-08-29T15:00:22.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 23,
                      "key": "modelScenario",
                      "name": "对话",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 19,
                      "key": "modelScenario",
                      "name": "教育",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 17,
                      "key": "modelScenario",
                      "name": "医疗",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 15,
                      "key": "modelScenario",
                      "name": "代码",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 5,
      "name": "Spark3.5 Max",
      "serviceId": "bm3.5",
      "serverId": "lmyvosz36",
      "domain": "generalv3.5",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://spark-api.xf-yun.com/v3.5/chat",
      "appId": null,
      "licChannel": "bm3.5",
      "llmSource": 1,
      "llmId": 5,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
      "tag": [
          "性能好",
          "速度快",
          "准确度高"
      ],
      "modelId": 5,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": false,
      "multiMode": false,
      "address": null,
      "desc": "Spark3.5 Max是讯飞自研的专业级大语言模型，在内容创作和知识处理相关场景中表现卓越。在大型新闻机构的新闻创作、学术机构的知识总结等场景中，能够提供高质量的回答，适用于对内容质量和知识专业性要求高的业务场景，如高端内容创作、专业知识服务等。",
      "createTime": "2024-04-15T16:29:05.000+08:00",
      "updateTime": "2025-08-29T15:00:22.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 5,
                      "key": "modelCategory",
                      "name": "文本生成",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 2,
              "key": "modelScenario",
              "name": "模型场景",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 55,
                      "key": "modelScenario",
                      "name": "内容创作",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  },
                  {
                      "id": 53,
                      "key": "modelScenario",
                      "name": "逻辑推理",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 0,
      "shelfOffTime": null
  },
  {
      "id": 13,
      "name": "图像理解",
      "serviceId": "image_understanding",
      "serverId": "lm9ze3hwc",
      "domain": "image",
      "patchId": "0",
      "type": 0,
      "config": "[\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 2048,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 8192\n                }\n            ],\n            \"name\": \"最大回复长度\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 2048,\n            \"key\": \"maxTokens\",\n            \"required\": true\n        },\n        {\n            \"standard\": true,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 0\n                },\n                {\n                    \"name\": 1\n                }\n            ],\n            \"precision\": 0.1,\n            \"required\": true,\n            \"constraintType\": \"range\",\n            \"default\": 0.5,\n            \"name\": \"核采样阈值\",\n            \"fieldType\": \"float\",\n            \"initialValue\": 0.5,\n            \"key\": \"temperature\"\n        },\n        {\n            \"standard\": true,\n            \"constraintType\": \"range\",\n            \"default\": 4,\n            \"constraintContent\":\n            [\n                {\n                    \"name\": 1\n                },\n                {\n                    \"name\": 6\n                }\n            ],\n            \"name\": \"生成多样性\",\n            \"fieldType\": \"int\",\n            \"initialValue\": 4,\n            \"key\": \"topK\",\n            \"required\": true\n        }\n    ]",
      "source": 0,
      "url": "wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image",
      "appId": null,
      "licChannel": "image",
      "llmSource": 1,
      "llmId": 13,
      "status": 1,
      "info": null,
      "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
      "tag": [],
      "modelId": 13,
      "pretrainedModel": null,
      "modelType": 1,
      "color": null,
      "isThink": false,
      "multiMode": true,
      "address": null,
      "desc": "图片理解能够在复杂的视觉信息中识别和解析出关键信息，如场景、物体和人物表情，进而洞悉图像的整体意义和文化背景，在图像内容分析、情感识别和视觉数据挖掘等领域具有极高的应用价值，为不同行业提供了更加智能和精准的图像理解解决方案。",
      "createTime": "2024-04-15T16:29:05.000+08:00",
      "updateTime": "2025-08-29T15:00:22.000+08:00",
      "categoryTree": [
          {
              "id": 1,
              "key": "modelCategory",
              "name": "模型类别",
              "sortOrder": 1000,
              "children": [
                  {
                      "id": 9,
                      "key": "modelCategory",
                      "name": "图像理解",
                      "sortOrder": 1000,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 3,
              "key": "languageSupport",
              "name": "语言支持",
              "sortOrder": 900,
              "children": [
                  {
                      "id": 57,
                      "key": "languageSupport",
                      "name": "多语言",
                      "sortOrder": 900,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 149,
              "key": "contextLengthTag",
              "name": "上下文长度卡片",
              "sortOrder": 800,
              "children": [
                  {
                      "id": 157,
                      "key": "contextLengthTag",
                      "name": "8k",
                      "sortOrder": 6,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          },
          {
              "id": 67,
              "key": "modelProvider",
              "name": "模型提供方",
              "sortOrder": 0,
              "children": [
                  {
                      "id": 81,
                      "key": "modelProvider",
                      "name": "科大讯飞",
                      "sortOrder": 0,
                      "children": [],
                      "source": "SYSTEM"
                  }
              ],
              "source": "SYSTEM"
          }
      ],
      "enabled": true,
      "userName": "科大讯飞",
      "apiKey": null,
      "shelfStatus": 1,
      "shelfOffTime": "2025-09-15 09:36:18"
  }
]


function ModelCardList({
  models,
  showCreate = false,
  keyword,
  filterType,
  setModels,
  refreshModels,
  showShelfOnly,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<boolean | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [modelId, setModelId] = useState<number | undefined>();
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]); // 个人模型新建时，需要展示的分类标签

  useEffect(() => {
    getCategoryTree()
      .then(data => {
        // 全部模型
        setCategoryTree(data);
      })
      .catch(error => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('model.getCategoryTreeFailed');
        message.error(errorMessage);
      });
  }, []);

  const renderList = useMemo(() => {
    // const list = [...models];
    const list = [...mockData];
    if (!keyword) return list;
    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      return list.filter(m => m.name.toLowerCase().includes(lower));
    }
    return list;
  }, [keyword, models]);

  return (
    <div>
      {/* 卡片网格 */}
      <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3`}>
        {/* 新建模型卡片 */}
        {showCreate && (
          <div
            className={`plugin-card-add-container relative ${
              isHovered === null
                ? ''
                : isHovered
                  ? 'plugin-no-hover'
                  : ' plugin-hover'
            } min-w-[220px]`}
            onMouseLeave={() => {
              setIsHovered(true);
            }}
            onMouseEnter={() => {
              setIsHovered(false);
            }}
            onClick={() => {
              setCreateModal(true);
              setModelId(undefined);
            }}
          >
            <div className="color-mask"></div>
            <div className="plugin-card-add flex flex-col">
              <div className="flex justify-between w-full">
                <span className="model-icon"></span>
                <span className="add-icon"></span>
              </div>
              <div
                className="mt-3 font-semibold add-name"
                style={{ fontSize: 22 }}
              >
                {t('model.createModel')}
              </div>
            </div>
          </div>
        )}

        {/* 普通模型卡片 */}
        {renderList.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            filterType={filterType}
            categoryTree={categoryTree}
            getModels={refreshModels}
            showShelfOnly={showShelfOnly}
          />
        ))}
      </div>

      {createModal && (
        <CreateModal
          setCreateModal={setCreateModal}
          getModels={refreshModels}
          modelId={modelId?.toString() || ''}
          categoryTree={categoryTree}
          setModels={setModels}
          filterType={filterType}
        />
      )}
    </div>
  );
}

export default ModelCardList;
