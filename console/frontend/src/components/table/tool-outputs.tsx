import React, { useState, useCallback, useEffect } from 'react';
import { Form, Table, Input, Select, Tooltip, Switch, Dropdown } from 'antd';
import { v4 as uuid } from 'uuid';
import { cloneDeep, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';
import JsonEditorModal from '@/components/modal/json-modal';
import { convertToDesiredFormat, extractAllIdsOptimized } from '@/utils';

import inputAddIcon from '@/assets/imgs/workflow/input-add-icon.png';
import formSelect from '@/assets/imgs/workflow/icon_form_select.png';
import addItemIcon from '@/assets/imgs/workflow/add-item-icon.png';
import remove from '@/assets/imgs/workflow/input-remove-icon.png';
import expand from '@/assets/imgs/plugin/icon_fold.png';
import shrink from '@/assets/imgs/plugin/icon_shrink.png';
import questionCircle from '@/assets/imgs/workflow/question-circle.png';
import inputErrorMsg from '@/assets/imgs/plugin/input_error_msg.svg';

const typeOptions = [
  {
    label: 'String',
    value: 'string',
  },
  {
    label: 'Number',
    value: 'number',
  },
  {
    label: 'Integer',
    value: 'integer',
  },
  {
    label: 'Boolean',
    value: 'boolean',
  },
  {
    label: 'Array',
    value: 'array',
  },
  {
    label: 'Object',
    value: 'object',
  },
];

function ToolOutputParameters({
  outputParamsData,
  setOutputParamsData,
  checkParmas,
  selectedCard = {},
}): React.ReactElement {
  const { t } = useTranslation();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    const allKeys = [];
    outputParamsData.forEach(item => {
      if (item.children) {
        allKeys.push(item.id);
      }
    });
    setExpandedRowKeys(allKeys);
  }, []);

  const handleAddData = useCallback(() => {
    const newData = {
      id: uuid(),
      name: '',
      description: '',
      type: 'string',
      open: true,
    };
    setOutputParamsData(outputParamsData => [...outputParamsData, newData]);
  }, []);

  const findNodeById = (tree: unknown, id: string): unknown => {
    for (const node of tree) {
      if (node.id === id) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const result = findNodeById(node.children, id);
        if (result) {
          return result;
        }
      }
    }

    return null;
  };

  const handleInputParamsChange = useCallback(
    (id: string, key: string, value: unknown): void => {
      const currentNode = findNodeById(outputParamsData, id);
      currentNode[key] = value;
      if (key === 'type' && ['array', 'object'].includes(value)) {
        const newData = {
          id: uuid(),
          name: '',
          description: '',
          type: 'string',
          open: true,
        };
        newData.fatherType = value;
        if (currentNode.type === 'array') {
          newData.name = '[Array Item]';
        }
        if (currentNode?.type === 'array' || currentNode?.arraySon) {
          newData.arraySon = true;
        }
        currentNode.children = [newData];
        setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, id]);
      } else if (key === 'type') {
        delete currentNode.children;
      }
      setOutputParamsData(cloneDeep(outputParamsData));
    },
    [outputParamsData, setOutputParamsData, setExpandedRowKeys]
  );

  const handleAddItem = useCallback(
    (record: unknown): void => {
      const newData = {
        id: uuid(),
        name: '',
        description: '',
        type: 'string',
        open: true,
      };
      newData.fatherType = record.type;
      const currentNode = findNodeById(outputParamsData, record?.id);
      currentNode.children.push(newData);
      setOutputParamsData(cloneDeep(outputParamsData));
      if (!expandedRowKeys?.includes(record?.id)) {
        setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, record?.id]);
      }
    },
    [expandedRowKeys, setExpandedRowKeys, outputParamsData, setOutputParamsData]
  );

  const deleteNodeFromTree = useCallback((tree, id) => {
    return tree.reduce((acc, node) => {
      if (node.id === id) {
        return acc;
      }

      if (node.children) {
        node.children = deleteNodeFromTree(node.children, id);
      }

      acc.push(node);
      return acc;
    }, []);
  }, []);

  const handleExpand = useCallback(record => {
    setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, record.id]);
  }, []);

  const handleCollapse = useCallback(record => {
    setExpandedRowKeys(expandedRowKeys =>
      expandedRowKeys.filter(id => id !== record.id)
    );
  }, []);

  const customExpandIcon = useCallback(({ expanded, onExpand, record }) => {
    if (record.children) {
      return expanded ? (
        <img
          src={shrink}
          className="inline-block w-4 h-4 mb-1 mr-1"
          onClick={e => {
            e.stopPropagation();
            handleCollapse(record);
          }}
        />
      ) : (
        <img
          src={expand}
          className="inline-block w-4 h-4 mb-1 mr-1"
          onClick={e => {
            e.stopPropagation();
            handleExpand(record);
          }}
        />
      );
    }
    return null;
  }, []);

  const handleCheckInput = useCallback(
    (record, key) => {
      checkParmas(outputParamsData, record?.id, key);
      setOutputParamsData(cloneDeep(outputParamsData));
    },
    [outputParamsData, setOutputParamsData]
  );

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <span>
            <span className="text-[#F74E43] text-xs">* </span>
            {t('workflow.nodes.common.parameterName')}
          </span>
          <Tooltip
            title={t('workflow.nodes.toolNode.parameterNameDescription')}
            overlayClassName="black-tooltip config-secret"
          >
            <img src={questionCircle} className="w-3 h-3" alt="" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (name, record): React.ReactElement => (
        <div className="flex flex-col w-full gap-1">
          <Input
            disabled={record?.fatherType === 'array'}
            placeholder={t('workflow.nodes.toolNode.pleaseEnterParameterName')}
            className="global-input params-input inline-input"
            value={name}
            onChange={e => {
              handleInputParamsChange(record?.id, 'name', e.target.value);
              handleCheckInput(record, 'name');
            }}
            onBlur={() => handleCheckInput(record, 'name')}
          />
          {record?.nameErrMsg && (
            <div className="flex items-center gap-1">
              <img src={inputErrorMsg} className="w-[14px] h-[14px]" alt="" />
              <p className="text-[#F74E43] text-sm">{record?.nameErrMsg}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <span>
            <span className="text-[#F74E43] text-xs">* </span>
            {t('workflow.nodes.common.description')}
          </span>
          <Tooltip
            title={t('workflow.nodes.toolNode.pleaseEnterParameterDescription')}
            overlayClassName="black-tooltip config-secret"
          >
            <img src={questionCircle} className="w-3 h-3" alt="" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (description, record): React.ReactElement => (
        <div className="flex flex-col gap-1">
          <Input
            placeholder={t(
              'workflow.nodes.toolNode.pleaseEnterParameterDescription'
            )}
            className="global-input params-input"
            value={description}
            onChange={e => {
              handleInputParamsChange(
                record?.id,
                'description',
                e.target.value
              );
              handleCheckInput(record, 'description');
            }}
            onBlur={() => handleCheckInput(record, 'description')}
          />
          {record?.descriptionErrMsg && (
            <div className="flex items-center gap-1">
              <img src={inputErrorMsg} className="w-[14px] h-[14px]" alt="" />
              <p className="text-[#F74E43] text-sm">
                {record?.descriptionErrMsg}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <span>
            <span className="text-[#F74E43] text-xs">* </span>
            {t('workflow.nodes.common.variableType')}
          </span>
        </div>
      ),
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type, record): React.ReactElement => (
        <Select
          suffixIcon={<img src={formSelect} className="w-4 h-4" />}
          placeholder={t('workflow.nodes.toolNode.pleaseSelect')}
          className="global-select params-select"
          options={
            record?.fatherType === 'array'
              ? typeOptions?.filter(option => option.value !== 'array')
              : typeOptions
          }
          value={type}
          onChange={value => handleInputParamsChange(record?.id, 'type', value)}
        />
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <span>{t('workflow.nodes.toolNode.enable')}</span>
          <Tooltip
            title={t(
              'workflow.nodes.toolNode.outputParameterEnableDescription'
            )}
            overlayClassName="black-tooltip config-secret"
          >
            <img src={questionCircle} className="w-3 h-3" alt="" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'open',
      key: 'open',
      width: '10%',
      render: (open, record): React.ReactElement => (
        <div className="h-[40px] flex items-center">
          <Switch
            disabled={record?.startDisabled}
            className="list-switch"
            checked={open}
            onChange={checked =>
              handleInputParamsChange(record?.id, 'open', checked)
            }
          />
        </div>
      ),
    },
    {
      title: t('workflow.nodes.toolNode.operation'),
      key: 'operation',
      width: '10%',
      render: (_, record): React.ReactElement => (
        <div className="h-[40px] flex items-center gap-2">
          {record?.type === 'object' && (
            <Tooltip
              title={t('workflow.nodes.toolNode.addSubItem')}
              overlayClassName="black-tooltip config-secret"
            >
              <img
                src={addItemIcon}
                className="w-4 h-4 mt-1.5 cursor-pointer"
                onClick={() => handleAddItem(record)}
              />
            </Tooltip>
          )}
          {record?.fatherType !== 'array' && (
            <Tooltip title="" overlayClassName="black-tooltip config-secret">
              <img
                className="w-4 h-4 cursor-pointer"
                src={remove}
                onClick={() => {
                  setOutputParamsData(
                    cloneDeep(deleteNodeFromTree(outputParamsData, record.id))
                  );
                }}
                alt=""
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const items = [
    {
      key: '1',
      label: (
        <span className="hover:text-[#275EFF]">
          {t('workflow.nodes.common.manuallyAdd')}
        </span>
      ),
      onClick: handleAddData,
    },
    {
      key: '2',
      label: (
        <span className="hover:text-[#275EFF]">
          {t('workflow.nodes.common.jsonExtract')}
        </span>
      ),
      onClick: (): void => {
        setModalVisible(true);
      },
    },
  ];

  const handleJsonSubmit = (jsonData): void => {
    try {
      const jsonDataArray = convertToDesiredFormat(JSON.parse(jsonData));
      setOutputParamsData(outputParamsData => [
        ...outputParamsData,
        ...jsonDataArray,
      ]);
      setModalVisible(false);
      const ids = extractAllIdsOptimized(jsonDataArray);
      setExpandedRowKeys(expandedRowKeys => uniq([...expandedRowKeys, ...ids]));
    } catch (error) {
      console.error('JSON parsing Error:', error);
    }
  };

  return (
    <>
      <Form.Item
        name="aa"
        className="label-full"
        label={
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-base font-medium">
              {t('workflow.nodes.toolNode.configureOutputParameters')}
            </span>
            {/* {!selectedCard?.id && <div
              className='flex items-center gap-1.5 text-[#275eff] cursor-pointer'
              onClick={handleAddData}
            >
              <img src={inputAddIcon} className='w-2.5 h-2.5' alt="" />
              <span>{t('workflow.nodes.common.add')}</span>
            </div>} */}
            {!selectedCard?.id && (
              <Dropdown
                menu={{
                  items,
                }}
                placement="bottomLeft"
              >
                <div className="flex items-center gap-1.5 text-[#275eff] cursor-pointer">
                  <img src={inputAddIcon} className="w-2.5 h-2.5" alt="" />
                  <span>{t('workflow.nodes.common.add')}</span>
                </div>
              </Dropdown>
            )}
          </div>
        }
      >
        <Table
          className="mt-4 tool-params-table"
          pagination={false}
          columns={columns}
          dataSource={outputParamsData}
          expandable={{
            expandIcon: customExpandIcon,
            expandedRowKeys,
          }}
          rowKey={record => record?.id}
          locale={{
            emptyText: (
              <div style={{ padding: '20px' }}>
                <p className="text-[#333333]">
                  {t('workflow.nodes.toolNode.noData')}
                </p>
              </div>
            ),
          }}
        />
      </Form.Item>
      <JsonEditorModal
        visible={modalVisible}
        onConfirm={handleJsonSubmit}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
}

export default ToolOutputParameters;
