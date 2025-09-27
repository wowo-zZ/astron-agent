import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlowTextArea,
  FlowSelect,
  FlowInputNumber,
  FlowUpload,
} from '@/components/workflow/ui';
import Ajv from 'ajv';
import {
  renderType,
  generateUploadType,
} from '@/components/workflow/utils/reactflowUtils';
import JsonMonacoEditor from '@/components/monaco-editor/JsonMonacoEditor';
import { typeList } from '@/constants';
import { cloneDeep } from 'lodash';

// 类型导入
import {
  ChatInputProps,
  StartNodeType,
  FileUploadResponse,
  FileUploadItem,
  AjvValidationError,
} from '@/components/workflow/types';

// 从统一的图标管理中导入
import { Icons } from '@/components/workflow/icons';

// 获取 Chat Input 模块的图标
const icons = Icons.chatDebugger.chatInput;

const fileTypeFor50 = ['pdf', 'excel', 'doc', 'txt', 'ppt', 'audio'];

function ChatInput({
  interruptChat,
  startNodeParams,
  setStartNodeParams,
  textareRef,
  handleEnterKey,
}: ChatInputProps): React.ReactElement {
  const { t } = useTranslation();

  const uploadComplete = useCallback(
    (
      event: ProgressEvent<EventTarget>,
      index: number,
      fileId: string
    ): void => {
      const target = event.currentTarget as XMLHttpRequest;
      const res: FileUploadResponse = JSON.parse(target.responseText);
      if (res.code === 0) {
        setStartNodeParams(oldNodeParams => {
          const defaultValue = oldNodeParams?.[index]?.default;
          if (Array.isArray(defaultValue)) {
            const file = (defaultValue as FileUploadItem[]).find(
              item => item.id === fileId
            );
            if (file) {
              file.loading = false;
              file.url = res?.data?.[0] || '';
            }
          }
          return cloneDeep(oldNodeParams);
        });
      }
    },
    [setStartNodeParams]
  );

  const handleFileUpload = useCallback(
    (file: File, index: number, multiple: boolean, fileId: string): void => {
      const fileUploadItem: FileUploadItem = {
        id: fileId,
        name: file.name,
        size: file.size,
        loading: true,
        url: '',
      };

      if (Array.isArray(startNodeParams[index]?.default) && multiple) {
        (startNodeParams[index].default as FileUploadItem[]).push(
          fileUploadItem
        );
      } else {
        startNodeParams[index].default = [fileUploadItem];
      }
      setStartNodeParams([...startNodeParams]);
    },
    [startNodeParams, setStartNodeParams]
  );

  const convertToKBMB = useCallback((bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(1) + 'KB';
    } else {
      return bytes + 'B';
    }
  }, []);

  const handleDeleteFile = useCallback(
    (index: number, fileId: string): void => {
      setStartNodeParams(oldStartNodeParams => {
        const defaultValue = oldStartNodeParams[index]?.default;
        if (Array.isArray(defaultValue)) {
          oldStartNodeParams[index].default = (
            defaultValue as FileUploadItem[]
          ).filter(file => fileId !== file?.id);
        }
        return cloneDeep(oldStartNodeParams);
      });
    },
    [setStartNodeParams]
  );

  const renderTypeInput = useCallback(
    (input: StartNodeType, index: number): React.ReactElement => {
      const type = input.type;
      if (input?.allowedFileType) {
        const multiple = type === 'array-string';
        return (
          <>
            <FlowUpload
              multiple={multiple}
              uploadType={generateUploadType(input?.allowedFileType || '')}
              {...({
                uploadComplete: (
                  event: ProgressEvent<EventTarget>,
                  fileId: string
                ) => {
                  uploadComplete(event, index, fileId);
                },
                handleFileUpload: (file: File, fileId: string) => {
                  handleFileUpload(file, index, multiple, fileId);
                },
              } as unknown)}
              maxSize={
                input?.allowedFileType === 'image'
                  ? 3
                  : fileTypeFor50.includes(input?.allowedFileType)
                    ? 50
                    : 20
              }
            />
            {Array.isArray(input?.default) &&
              input.default.length > 0 &&
              (input.default as FileUploadItem[]).map(file => (
                <div
                  key={file?.id}
                  className="bg-[#EBF4FD] rounded-lg p-1 pr-4 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center w-[28px] h-[28px] bg-[#fff] justify-center">
                      {file.loading ? (
                        <img
                          src={icons.chatLoading}
                          className="w-3 h-3 flow-rotate-center"
                          alt=""
                        />
                      ) : (
                        <img
                          src={typeList.get(input?.allowedFileType || '')}
                          className="w-[16px] h-[13px]"
                          alt=""
                        />
                      )}
                    </div>
                    <span>{file?.name}</span>
                    <span className="text-desc">
                      {convertToKBMB(file.size)}
                    </span>
                  </div>
                  <img
                    src={icons.remove}
                    className="w-[16px] h-[17px] mt-1.5 opacity-50 cursor-pointer"
                    onClick={() => handleDeleteFile(index, file?.id)}
                    alt=""
                  />
                </div>
              ))}
            <div></div>
          </>
        );
      } else if (type === 'string') {
        return (
          <FlowTextArea
            style={{
              height: 30,
              minHeight: 30,
            }}
            adaptiveHeight={true}
            placeholder={input?.description || t('common.inputPlaceholder')}
            value={typeof input?.default === 'string' ? input.default : ''}
            {...({
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange(index, e.target.value),
            } as unknown)}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const currentDefault = startNodeParams[index].default;
                handleInputChange(
                  index,
                  (typeof currentDefault === 'string' ? currentDefault : '') +
                    '\t'
                );
              }
            }}
          />
        );
      } else if (type === 'integer') {
        return (
          <FlowInputNumber
            className="w-full"
            placeholder={input?.description || t('common.inputPlaceholder')}
            step={1}
            precision={0}
            value={
              typeof input?.default === 'number' ? input.default : undefined
            }
            onChange={value => handleInputChange(index, value || 0)}
          />
        );
      } else if (type === 'number') {
        return (
          <FlowInputNumber
            className="w-full"
            placeholder={input?.description || t('common.inputPlaceholder')}
            value={
              typeof input?.default === 'number' ? input.default : undefined
            }
            onChange={value => handleInputChange(index, value || 0)}
          />
        );
      } else if (type === 'boolean') {
        return (
          <FlowSelect
            placeholder={input?.description || t('common.selectPlaceholder')}
            value={input?.default}
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
            onChange={value => handleInputChange(index, value)}
          />
        );
      } else if (type === 'object' || type.includes('array')) {
        return (
          <>
            <JsonMonacoEditor
              value={typeof input?.default === 'string' ? input.default : '{}'}
              onChange={value => handleInputChange(index, value)}
            />
            <div className="text-[#F74E43] text-xs">{input.errorMsg}</div>
          </>
        );
      }
    },
    [startNodeParams]
  );

  const validateInputJSON = useCallback(
    (newValue: string, schema: object): string => {
      try {
        const ajv = new Ajv();
        const jsonData = JSON.parse(newValue);
        const validate = ajv.compile(schema);
        const valid = validate(jsonData);
        if (!valid) {
          const errors = validate?.errors as
            | AjvValidationError[]
            | null
            | undefined;
          return (
            (errors?.[0]?.instancePath?.slice(1) ?? '') +
            ' ' +
            (errors?.[0]?.message ?? '')
          ).trim();
        } else {
          return '';
        }
      } catch {
        return t('workflow.nodes.validation.invalidJSONFormat');
      }
    },
    [t]
  );

  const handleInputChange = useCallback(
    (index: number, value: string | number | boolean): void => {
      const currentInput: StartNodeType | undefined = startNodeParams.find(
        (_, i) => index === i
      );
      if (currentInput) {
        currentInput.default = value;
        if (
          currentInput?.type === 'object' ||
          currentInput.type.includes('array')
        ) {
          if (currentInput?.validationSchema) {
            currentInput.errorMsg = validateInputJSON(
              value as string,
              currentInput.validationSchema
            );
          }
        }
      }
      setStartNodeParams([...startNodeParams]);
    },
    [startNodeParams, setStartNodeParams, validateInputJSON]
  );

  return (
    <div
      className="flex flex-col gap-1 mt-2"
      style={{
        maxHeight: '40vh',
        overflow: 'auto',
      }}
    >
      {startNodeParams?.length === 1 || interruptChat?.interrupt ? (
        <div className="relative mx-5">
          <textarea
            disabled={interruptChat?.type === 'option'}
            className="user-chat-input pr-3.5 w-full py-3"
            ref={textareRef}
            style={{
              resize: 'none',
            }}
            onChange={e => {
              e.stopPropagation();
              const value = e.target.value;
              if (startNodeParams[0]) {
                startNodeParams[0].default = value;
                setStartNodeParams([...startNodeParams]);
              }
            }}
            onKeyDown={handleEnterKey}
            placeholder={
              startNodeParams[0]?.description ||
              t('workflow.nodes.chatDebugger.tryFlow')
            }
          />
        </div>
      ) : (
        startNodeParams.map((params: StartNodeType, index) => {
          if (!params) return null;
          return (
            <div key={index} className="flex flex-col gap-2 px-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 text-sm font-medium text-second">
                  <span>{params.name}</span>
                  {params.required && <span className="text-[#F74E43]">*</span>}
                </div>
                <div className="bg-[#F0F0F0] px-2.5 py-1 rounded text-xs">
                  {renderType(
                    (params as unknown).fileType &&
                      params.type === 'array-string'
                      ? `Array<${
                          (params as unknown).allowedFileType
                            ?.slice(0, 1)
                            .toUpperCase() +
                          (params as unknown).allowedFileType?.slice(1)
                        }>`
                      : (params as unknown).allowedFileType || params.type
                  )}
                </div>
              </div>
              {renderTypeInput(params, index)}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ChatInput;
