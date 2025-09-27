import React, { useState } from 'react';
import { Input, Button, Select, InputNumber } from 'antd';
import { cloneDeep } from 'lodash';
import { workflowPushEnvKey } from '@/services/plugin';
import MarkdownRender from '@/components/markdown-render';
import { useTranslation } from 'react-i18next';

import close from '@/assets/imgs/workflow/modal-close.png';
import mcpEnvKeyVisible from '@/assets/imgs/mcp/mcp-envKey-visible.svg';
import mcpEnvKeyHidden from '@/assets/imgs/mcp/mcp-envKey-hidden.svg';

export function ActivateMCPModal({
  mcpDetail,
  envKeyParameters,
  setEnvKeyParameters,
  setActiveMcpModal,
  handleMcpModalParamsOk,
  envKeyDescription,
}): React.ReactElement {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleOk = (): void => {
    const env = {};
    for (const item of envKeyParameters) {
      env[item.name] = item.default;
    }
    const params = {
      mcpId: mcpDetail.id,
      serverName: mcpDetail.name,
      serverDesc: mcpDetail.brief,
      recordId: mcpDetail['record_id'],
      env,
      customize: true,
    };
    setLoading(true);
    workflowPushEnvKey(params, true)
      .then(data => {
        handleMcpModalParamsOk(data);
        setActiveMcpModal(false);
      })
      .finally(() => setLoading(false));
  };

  const handleInputParamsChange = (argIndex, value): void => {
    setEnvKeyParameters(parameters => {
      const parameter = parameters?.find((item, index) => index === argIndex);
      parameter.default = value;
      return cloneDeep(parameters);
    });
  };

  const renderInput = (arg, index): React.ReactElement => {
    if (arg.enum?.length > 0) {
      return (
        <Select
          className="global-select"
          placeholder={t('workflow.nodes.common.selectPlaceholder')}
          options={arg?.enum?.map(item => ({
            label: item,
            value: item,
          }))}
          value={arg?.default}
          onChange={(value): void => handleInputParamsChange(index, value)}
        />
      );
    }
    if (arg.type === 'string') {
      return (
        <Input.Password
          className="global-input w-full"
          placeholder={t('workflow.nodes.common.inputPlaceholder')}
          value={arg?.default}
          onChange={(e): void => handleInputParamsChange(index, e.target.value)}
          iconRender={visible => {
            return (
              <img
                src={visible ? mcpEnvKeyVisible : mcpEnvKeyHidden}
                className="w-5 h-5"
                alt=""
                style={{
                  cursor: 'pointer',
                }}
              />
            );
          }}
        />
      );
    } else if (arg.type === 'boolean') {
      return (
        <Select
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
          value={arg?.default}
          onChange={(value): void => handleInputParamsChange(index, value)}
        />
      );
    } else if (arg.type === 'int') {
      return (
        <InputNumber
          className="global-input pt-1 w-full"
          placeholder={t('workflow.nodes.common.inputPlaceholder')}
          value={arg?.default}
          onChange={(value): void => handleInputParamsChange(index, value)}
        />
      );
    }
  };

  return (
    <div className="mask">
      <div className="modal-container w-[640px] pr-0">
        <div className="w-full flex items-center justify-between pr-6">
          <div className="modal-h1-title">
            {t('workflow.nodes.mcpDetail.activateMcpService')}
          </div>
          <img
            src={close}
            className="w-[14px] h-[14px] cursor-pointer"
            alt=""
            onClick={(): void => setActiveMcpModal(false)}
          />
        </div>
        <div className="mt-6 flex flex-col gap-4 max-h-[50vh] overflow-auto pr-6">
          <div className="text-desc mt-3 pr-6 envKeyMarkdown">
            <MarkdownRender content={envKeyDescription} isSending={false} />
          </div>
          {envKeyParameters?.map((item, index) => (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {item?.require && <span className="text-[#F74E43]">*</span>}
                <div
                  className="ml-1 max-w-[140px] text-overflow"
                  title={item?.name}
                >
                  {item?.name}：
                </div>
              </div>
              {renderInput(item, index)}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-10 pr-6">
          <Button
            type="text"
            className="origin-btn w-[104px]"
            onClick={(): void => setActiveMcpModal(false)}
          >
            {t('workflow.nodes.common.cancel')}
          </Button>
          <Button
            loading={loading}
            disabled={envKeyParameters?.some(
              arg =>
                arg.require &&
                typeof arg.default === 'string' &&
                !arg.default?.trim()
            )}
            type="primary"
            className="w-[104px]"
            onClick={handleOk}
          >
            {t('workflow.nodes.mcpDetail.confirmActivate')}
          </Button>
        </div>
      </div>
    </div>
  );
}
