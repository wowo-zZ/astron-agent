import React, { useMemo, useState, useEffect } from 'react';
import { Input, Button, InputNumber, Select, message } from 'antd';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import {
  getServerToolDetailAPI,
  debugServerToolAPI,
  // workflowGetEnvKey,
  workflowPushEnvKey,
} from '@/services/plugin';
import MarkdownRender from '@/components/markdown-render';
import JsonMonacoEditor from '@/components/monaco-editor/JsonMonacoEditor';
import { useTranslation } from 'react-i18next';
import { MCPToolDetail, InputSchema, ToolArg } from '@/types/plugin-store';

import toolArrowLeft from '@/assets/imgs/workflow/tool-arrow-left.png';
import publishIcon from '@/assets/imgs/workflow/publish-icon.png';
import trialRunIcon from '@/assets/imgs/workflow/trial-run-icon.png';
import mcpArrowDown from '@/assets/imgs/mcp/mcp-arrow-down.svg';
import mcpArrowUp from '@/assets/imgs/mcp/mcp-arrow-up.svg';
// import mcpEnvKeyVisible from '@/assets/imgs/mcp/mcp-envKey-visible.svg';
// import mcpEnvKeyHidden from '@/assets/imgs/mcp/mcp-envKey-hidden.svg';

function MCPDetailWrapper({
  currentToolId,
  handleClearMCPToolDetail,
}: {
  currentToolId: string;
  handleClearMCPToolDetail: () => void;
}): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden bg-[#fff] gap-9"
      style={{
        padding: '65px 0px 43px',
      }}
    >
      <div
        className="flex mx-auto"
        style={{
          width: '90%',
        }}
      >
        <div
          className="inline-flex items-center gap-2 cursor-pointer"
          onClick={() => handleClearMCPToolDetail()}
        >
          <img
            src={toolArrowLeft}
            className="w-[14px] h-[12px] cursor-pointer"
            alt=""
          />
          <span className="font-medium">{t('workflow.nodes.common.back')}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div
          className="mx-auto"
          style={{
            width: '90%',
          }}
        >
          <MCPDetail currentToolId={currentToolId} />
        </div>
      </div>
    </div>
  );
}

export function MCPDetail({
  currentToolId,
}: {
  currentToolId: string;
}): React.ReactElement {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState('content');
  const [currentMcp, setCurrentMcp] = useState<MCPToolDetail>(
    {} as MCPToolDetail
  );
  // const [envKeyParameters, setEnvKeyParameters] = useState<ToolArg[]>([]);
  // const [envKeyDescription, setEnvKeyDescription] = useState('');
  // const [loading, setLoading] = useState(false);
  const [testDisabled, setTestDisabled] = useState(false);

  const generateDefaultInputValue = (type: string): unknown => {
    if (type === 'string') {
      return '';
    } else if (type === 'number') {
      return 0;
    } else if (type === 'boolean') {
      return false;
    } else if (type === 'int' || type === 'integer') {
      return 0;
    } else if (type === 'array') {
      return '[]';
    } else if (type === 'object') {
      return '{}';
    }
  };

  function transformSchemaToArray(schema: InputSchema): ToolArg[] {
    const requiredFields = schema.required || [];

    return Object.entries(schema.properties).map(([name, property]) => {
      return {
        name,
        type: property.type,
        description: property.description,
        required: requiredFields.includes(name),
        enum: property.enum,
        value: property?.default || generateDefaultInputValue(property.type),
      };
    });
  }

  // const handleNoInputParams = (currentMcp: MCPToolDetail): void => {
  //   const params = {
  //     recordId: currentMcp.recordId,
  //     mcpId: currentMcp.id,
  //     serverName: currentMcp.name,
  //     serverDesc: currentMcp.brief,
  //     env: null,
  //     customize: false,
  //   };
  //   workflowPushEnvKey(params, false).then(data => {
  //     setCurrentMcp(mcp => {
  //       mcp.sparkId = data as string;
  //       return cloneDeep(mcp);
  //     });
  //   });
  // };

  // const handleAddEnvKey = (currentMcp: MCPToolDetail): void => {
  //   workflowGetEnvKey(currentMcp?.id, currentMcp?.recordId).then(data => {
  //     if (
  //       data?.parameters?.filter(item => item?.hasDefault === false)?.length > 0
  //     ) {
  //       setEnvKeyParameters(
  //         data?.parameters?.map(item => ({
  //           ...item,
  //           default:
  //             data?.oldParameters?.[item.name] !== undefined
  //               ? data?.oldParameters?.[item.name]
  //               : item.default,
  //         }))
  //       );
  //       setEnvKeyDescription(data?.['user_guide'] as string);
  //       if (!Object.hasOwn(data, 'oldParameters')) {
  //         setTestDisabled(true);
  //       }
  //     } else {
  //       handleNoInputParams(currentMcp);
  //     }
  //   });
  // };

  useEffect(() => {
    if (currentToolId) {
      getServerToolDetailAPI(currentToolId).then((data: MCPToolDetail) => {
        data.tools = data.tools?.map(item => ({
          ...item,
          args: item.inputSchema
            ? transformSchemaToArray(item.inputSchema)
            : [],
        }));
        setCurrentMcp(data);
        if (data?.mcpType !== 'flow') {
          // handleAddEnvKey(data);
        }
      });
    }
  }, [currentToolId]);

  const tools = useMemo(() => {
    return currentMcp?.tools || [];
  }, [currentMcp]);

  const handleInputParamsChange = (
    toolIndex: number,
    argIndex: number,
    value: unknown
  ): void => {
    setCurrentMcp(mcp => {
      const tool = mcp?.tools?.find((item, index) => index === toolIndex);
      if (tool) {
        const arg = tool.args?.find((item, index) => index === argIndex);
        if (arg) {
          arg.value = value as string | unknown[] | Record<string, unknown>;
        }
      }
      return cloneDeep(mcp);
    });
  };

  const handleDebugServerMCP = (
    e: React.MouseEvent<HTMLButtonElement>,
    toolIndex: number
  ): void => {
    e.stopPropagation();
    const tool = tools?.find((_, index) => index === toolIndex);
    if (!tool) return;

    const toolArgs: Record<string, unknown> = {};
    for (const item of tool.args || []) {
      toolArgs[item.name] =
        item.type === 'array' || item.type === 'object'
          ? JSON.parse(item.value as string)
          : item.value;
    }
    const params = {
      mcpServerId: '',
      mcpServerUrl: currentMcp.serverUrl,
      toolName: tool.name,
      toolId: currentToolId,
      toolArgs,
    };
    setCurrentMcp(mcp => {
      const tool = mcp?.tools?.find((item, index) => index === toolIndex);
      if (tool) {
        tool.loading = true;
      }
      return cloneDeep(mcp);
    });
    debugServerToolAPI(params)
      .then(data => {
        setCurrentMcp(mcp => {
          const tool = mcp?.tools?.find((item, index) => index === toolIndex);
          if (tool && (data as { content: { text: string }[] })?.content) {
            tool.textResult = (
              data as { content: { text: string }[] }
            )?.content?.[0]?.text;
          }
          return cloneDeep(mcp);
        });
      })
      .catch(error => {
        message.error(error?.message);
      })
      .finally(() => {
        setCurrentMcp(mcp => {
          const tool = mcp?.tools?.find((item, index) => index === toolIndex);
          if (tool) {
            tool.loading = false;
          }
          return cloneDeep(mcp);
        });
      });
  };

  const renderInput = (
    arg: ToolArg,
    toolIndex: number,
    index: number
  ): React.ReactNode => {
    if (arg.enum?.length && arg.enum?.length > 0) {
      return (
        <Select
          className="h-10 global-select"
          placeholder={t('workflow.nodes.common.selectPlaceholder')}
          options={arg?.enum?.map((item: string) => ({
            label: item,
            value: item,
          }))}
          style={{ height: 40 }}
          value={arg?.value}
          onChange={value => handleInputParamsChange(toolIndex, index, value)}
        />
      );
    } else if (arg.type === 'string') {
      return (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 6 }}
          className="w-full global-input search-input mcp-input"
          placeholder={t('workflow.nodes.common.inputPlaceholder')}
          style={{
            borderRadius: 8,
            background: '#fff !important',
            resize: 'none',
          }}
          value={arg?.value as string}
          onChange={e =>
            handleInputParamsChange(toolIndex, index, e.target.value)
          }
        />
      );
    } else if (arg.type === 'boolean') {
      return (
        <Select
          style={{ height: 40 }}
          className="global-select"
          placeholder={t('workflow.nodes.common.selectPlaceholder')}
          options={[
            {
              label: 'true',
              value: true,
            },
            {
              label: 'false',
              value: false,
            },
          ]}
          value={arg?.value}
          onChange={value => handleInputParamsChange(toolIndex, index, value)}
        />
      );
    } else if (arg.type === 'integer') {
      return (
        <InputNumber
          step={1}
          precision={0}
          className="w-full global-input search-input"
          placeholder={t('workflow.nodes.common.inputPlaceholder')}
          style={{ borderRadius: 8, height: 40, background: '#fff !important' }}
          value={arg?.value as number}
          onChange={value => handleInputParamsChange(toolIndex, index, value)}
        />
      );
    } else if (arg.type === 'number') {
      return (
        <InputNumber
          className="w-full global-input search-input"
          placeholder={t('workflow.nodes.common.inputPlaceholder')}
          style={{ borderRadius: 8, height: 40, background: '#fff !important' }}
          value={arg?.value as number}
          onChange={value => handleInputParamsChange(toolIndex, index, value)}
        />
      );
    } else if (arg.type === 'array' || arg.type === 'object') {
      return (
        <JsonMonacoEditor
          value={arg?.value as string}
          onChange={value => handleInputParamsChange(toolIndex, index, value)}
        />
      );
    }
  };

  // const handleEnvKeyInputParamsChange = (argIndex: number, value: unknown): void => {
  //   setEnvKeyParameters(parameters => {
  //     const parameter = parameters?.find((item, index) => index === argIndex);
  //     parameter.default = value;
  //     return cloneDeep(parameters);
  //   });
  // };

  // const renderEnvKeyInput = (arg, index): React.ReactElement => {
  //   if (arg.enum?.length > 0) {
  //     return (
  //       <Select
  //         className="global-select"
  //         placeholder={t('workflow.nodes.common.selectPlaceholder')}
  //         options={arg?.enum?.map(item => ({
  //           label: item,
  //           value: item,
  //         }))}
  //         value={arg?.default}
  //         onChange={value => handleEnvKeyInputParamsChange(index, value)}
  //       />
  //     );
  //   }
  //   if (arg.type === 'string') {
  //     return (
  //       <Input.Password
  //         className="w-full global-input"
  //         placeholder={t('workflow.nodes.common.inputPlaceholder')}
  //         value={arg?.default}
  //         style={{ borderRadius: 8 }}
  //         onChange={e => handleEnvKeyInputParamsChange(index, e.target.value)}
  //         iconRender={visible => {
  //           return (
  //             <img
  //               src={visible ? mcpEnvKeyVisible : mcpEnvKeyHidden}
  //               className="w-5 h-5"
  //               alt=""
  //               style={{
  //                 cursor: 'pointer',
  //               }}
  //             />
  //           );
  //         }}
  //       />
  //     );
  //   } else if (arg.type === 'boolean') {
  //     return (
  //       <Select
  //         className="global-select"
  //         placeholder={t('workflow.nodes.common.selectPlaceholder')}
  //         options={[
  //           {
  //             label: 'true',
  //             value: true,
  //           },
  //           {
  //             label: 'false',
  //             value: false,
  //           },
  //         ]}
  //         value={arg?.default}
  //         onChange={value => handleEnvKeyInputParamsChange(index, value)}
  //       />
  //     );
  //   } else if (arg.type === 'int' || arg.type === 'integer') {
  //     return (
  //       <InputNumber
  //         className="w-full pt-1 global-input"
  //         placeholder={t('workflow.nodes.common.inputPlaceholder')}
  //         value={arg?.default}
  //         onChange={value => handleEnvKeyInputParamsChange(index, value)}
  //       />
  //     );
  //   }
  // };

  // const handlePublishEnvKey = (): void => {
  //   const env: Record<string, unknown> = {};
  //   for (const item of envKeyParameters) {
  //     env[item.name] = item.default;
  //   }
  //   const params = {
  //     mcpId: currentMcp.id,
  //     serverName: currentMcp.name,
  //     serverDesc: currentMcp.brief,
  //     recordId: currentMcp['recordId'],
  //     env,
  //     customize: true,
  //   };
  //   setLoading(true);
  //   // workflowPushEnvKey(params)
  //   //   .then((data) => {
  //   //     setCurrentMcp(mcp => {
  //   //       mcp.sparkId = data as string;
  //   //       return cloneDeep(mcp);
  //   //     });
  //   //     setTestDisabled(false);
  //   //   })
  //   //   .finally(() => setLoading(false));
  // };

  const handleOpenTool = (toolIndex: number): void => {
    setCurrentMcp(mcp => {
      const tool = mcp?.tools?.find((item, index) => index === toolIndex);
      if (tool) {
        tool.open = !tool?.open;
      }
      return cloneDeep(mcp);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img
            src={currentMcp?.['logoUrl']}
            className="w-[48px] h-[48px]"
            alt=""
          />
          <div className="flex flex-col gap-2">
            <div>{currentMcp?.name}</div>
            <p className="text-desc">{currentMcp?.brief}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <img src={publishIcon} className="w-3 h-3" alt="" />
          <p className="text-[#757575] text-xs">
            {t('workflow.nodes.toolNode.publishedAt')}{' '}
            {dayjs(currentMcp['createTime'])?.format('YYYY-MM-DD HH:mm:ss')}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-6 mt-9">
        <div className="flex flex-col w-full">
          <div className="bg-[#F6F9FF] rounded-lg p-1 inline-flex items-center gap-4 mb-3 w-fit">
            {/* <div className='px-5 py-2 text-[#7F7F7F] rounded-lg cursor-pointer hover:bg-[#fff] hover:text-[#275EFF]'
              style={{
                background: currentTab === 'overview' ? '#fff' : '',
                color: currentTab === 'overview' ? '#275EFF' : ''
              }}
              onClick={() => setCurrentTab('overview')}
            >
              Overview
            </div> */}
            <div
              className="px-5 py-2 text-[#7F7F7F] rounded-lg cursor-pointer hover:bg-[#fff] hover:text-[#275EFF]"
              style={{
                background: currentTab === 'content' ? '#fff' : '',
                color: currentTab === 'content' ? '#275EFF' : '',
              }}
              onClick={() => setCurrentTab('content')}
            >
              Content
            </div>
            <div
              className="px-5 py-2 text-[#7F7F7F] rounded-lg cursor-pointer hover:bg-[#fff] hover:text-[#275EFF]"
              style={{
                background: currentTab === 'tools' ? '#fff' : '',
                color: currentTab === 'tools' ? '#275EFF' : '',
              }}
              onClick={() => setCurrentTab('tools')}
            >
              Tools
            </div>
          </div>
          {currentTab === 'overview' && (
            <div className="w-full rounded-lg border border-[#E4EAFF] bg-[#fcfdff] px-4 py-3">
              <MarkdownRender
                content={currentMcp?.overview}
                isSending={false}
              />
            </div>
          )}
          {currentTab === 'content' && (
            <div className="rounded-lg border border-[#E4EAFF] bg-[#fcfdff] px-4 py-3">
              <MarkdownRender content={currentMcp?.content} isSending={false} />
            </div>
          )}
          {currentTab === 'tools' && (
            <div className="">
              {/* {envKeyParameters?.length > 0 && (
                <div className="mb-8 border border-[#F2F5FE] rounded-lg pb-6">
                  <div
                    className="text-desc envKeyMarkdown flex flex-col gap-3 bg-[#F6F9FF] p-4 pr-8"
                    style={{
                      borderRadius: '8px 8px 0 0',
                    }}
                  >
                    <div className="text-base text-[#3D3D3D] font-semibold">
                      {t('workflow.nodes.mcpDetail.activateMcpServiceToTest')}
                    </div>
                    <MarkdownRender
                      content={envKeyDescription}
                      isSending={false}
                    />
                  </div>
                  <div className="flex flex-col gap-4 px-4 mt-6">
                    {envKeyParameters?.map((item, index) => (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {item?.require && (
                            <span className="text-[#F74E43]">*</span>
                          )}
                          <div className="ml-1">{item?.name}：</div>
                        </div>
                        {renderEnvKeyInput(item, index)}
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        loading={loading}
                        disabled={envKeyParameters?.some(
                          arg =>
                            arg.require &&
                            typeof arg.default === 'string' &&
                            !arg.default?.trim()
                        )}
                        type="primary"
                        className="w-[78px] flex items-center gap-2"
                        onClick={() => handlePublishEnvKey()}
                      >
                        {t('workflow.nodes.toolNode.save')}
                      </Button>
                    </div>
                  </div>
                </div>
              )} */}
              <div className="font-semibold">
                {t('workflow.nodes.toolNode.tool')}
              </div>
              <div className="flex flex-col gap-4 mt-4">
                {tools.map((tool, toolIndex) => (
                  <div
                    key={toolIndex}
                    className="w-full border border-[#F2F5FE] rounded-lg p-4 flex flex-col"
                  >
                    <div
                      className="flex items-start justify-between w-full gap-6 cursor-pointer"
                      onClick={() => handleOpenTool(toolIndex)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-[#275EFF] font-medium">
                          {tool?.name}
                        </div>
                        <p className="text-desc">{tool?.description}</p>
                      </div>
                      <div className="flex items-center flex-shrink-0 gap-10">
                        <img
                          src={tool?.open ? mcpArrowUp : mcpArrowDown}
                          className="w-5 h-5"
                          alt=""
                        />
                        <Button
                          loading={tool?.loading}
                          disabled={
                            tool?.args?.some(
                              arg =>
                                arg.required &&
                                typeof arg?.value === 'string' &&
                                !arg.value?.trim()
                            ) || testDisabled
                          }
                          type="primary"
                          className="flex items-center gap-2"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                            handleDebugServerMCP(e, toolIndex)
                          }
                        >
                          <img src={trialRunIcon} className="w-3 h-3" alt="" />
                          <span>{t('workflow.nodes.toolNode.test')}</span>
                        </Button>
                      </div>
                    </div>
                    {tool?.open && (
                      <div className="flex gap-2 mt-6 overflow-hidden">
                        <div className="flex flex-col gap-6 bg-[#F2F5FE] rounded-lg p-4 flex-1 min-h-[100px] flex-shrink-0">
                          <div className="text-base text-[#275EFF] font-medium">
                            {t('workflow.nodes.codeIDEA.inputTest')}
                          </div>
                          {tool?.args?.map((arg, index) => (
                            <div key={index} className="flex flex-col gap-1">
                              <div className="flex items-center">
                                {arg.required && (
                                  <span className="text-[#F74E43] text-lg font-medium h-5">
                                    *
                                  </span>
                                )}
                                <span className="ml-0.5">{arg?.name}</span>
                              </div>
                              <p className="text-desc my-1 ml-2.5">
                                {arg?.description}
                              </p>
                              {renderInput(arg, toolIndex, index)}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-6 bg-[#F2F5FE] rounded-lg p-4 flex-1 min-h-[100px] flex-shrink-0">
                          <div className="text-base text-[#275EFF] font-medium">
                            {t('workflow.nodes.codeIDEA.outputResult')}
                          </div>
                          {tool.textResult !== undefined && (
                            <pre className="break-all whitespace-pre-wrap">
                              {tool.textResult}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MCPDetailWrapper;
