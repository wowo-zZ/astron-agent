import React, { useCallback, useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Switch,
  Form,
  Tooltip,
  InputNumber,
  Dropdown,
} from 'antd';
import { cloneDeep, uniq } from 'lodash';
import { v4 as uuid } from 'uuid';
import { useTranslation } from 'react-i18next';
import ArrayDefault from '@/components/modal/plugin/array-default';
import {
  generateTypeDefault,
  transformJsonToArray,
  extractAllIdsOptimized,
} from '@/utils';
import JsonEditorModal from '@/components/modal/json-modal';

import formSelect from '@/assets/imgs/workflow/icon_form_select.png';
import toolModalChecked from '@/assets/imgs/workflow/tool-modal-checked.png';
import remove from '@/assets/imgs/workflow/input-remove-icon.png';
import inputAddIcon from '@/assets/imgs/workflow/input-add-icon.png';
import expand from '@/assets/imgs/plugin/icon_fold.png';
import shrink from '@/assets/imgs/plugin/icon_shrink.png';
import addItemIcon from '@/assets/imgs/workflow/add-item-icon.png';
import questionCircle from '@/assets/imgs/workflow/question-circle.png';
import arrayDefaultEdit from '@/assets/imgs/workflow/array-default-edit.png';
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

const methodsOptions = [
  {
    label: 'Body',
    value: 'body',
  },
  {
    label: 'Path',
    value: 'path',
  },
  {
    label: 'Query',
    value: 'query',
  },
  {
    label: 'Header',
    value: 'header',
  },
];

function ToolInputParameters({
  inputParamsData,
  setInputParamsData,
  checkParmas,
  selectedCard = {},
}): React.ReactElement {
  const { t } = useTranslation();
  const [arrayDefaultModal, setArrayDefaultModal] = useState(false);
  const [currentArrayDefaultId, setCurrentArrayDefaultId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const allKeys = [];
    inputParamsData.forEach(item => {
      if (item.children) {
        allKeys.push(item.id);
      }
    });
    setExpandedRowKeys(allKeys);
  }, []);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const handleAddData = useCallback(() => {
    const newData = {
      id: uuid(),
      name: '',
      description: '',
      type: 'string',
      location: 'query',
      required: true,
      default: '',
      open: true,
      from: 2,
      startDisabled: true,
    };
    setInputParamsData(inputParamsData => [...inputParamsData, newData]);
  }, []);

  const handleAddItem = useCallback(
    record => {
      const newData = {
        id: uuid(),
        name: '',
        description: '',
        type: 'string',
        location: 'query',
        required: true,
        default: '',
        open: true,
        from: 2,
        startDisabled: true,
      };
      newData.fatherType = record.type;
      const currentNode = findNodeById(inputParamsData, record?.id);
      currentNode.children.push(newData);
      if (currentNode?.arraySon) {
        newData.arraySon = true;
      }
      setInputParamsData(cloneDeep(inputParamsData));
      if (!expandedRowKeys?.includes(record?.id)) {
        setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, record?.id]);
      }
    },
    [expandedRowKeys, setExpandedRowKeys, inputParamsData, setExpandedRowKeys]
  );

  const findTopAncestorById = useCallback((nodes, id) => {
    function recursiveSearch(node: unknown): unknown {
      if (node?.id === id) {
        return node;
      }
      if (node?.children && Array.isArray(node?.children)) {
        for (const childNode of node.children) {
          const resultNode = recursiveSearch(childNode);
          if (resultNode) return resultNode;
        }
      }
    }

    for (const node of nodes) {
      const result = recursiveSearch(node);
      if (result) return node;
    }
    return null;
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
      const currentNode = findNodeById(inputParamsData, id);
      currentNode[key] = value;
      if (key === 'type' && ['array', 'object'].includes(value)) {
        const newData = {
          id: uuid(),
          name: '',
          description: '',
          type: 'string',
          location: 'query',
          required: true,
          default: '',
          open: true,
          from: 2,
        };
        newData.fatherType = value;
        if (currentNode.type === 'array') {
          newData.name = '[Array Item]';
          currentNode.default = [];
        } else if (currentNode.type === 'object') {
          delete currentNode.default;
        }
        if (currentNode?.type === 'array' || currentNode?.arraySon) {
          newData.arraySon = true;
        }
        currentNode.children = [newData];
        setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, id]);
      } else if (key === 'type') {
        currentNode.default = generateTypeDefault(value);
        delete currentNode.children;
      }
      if (key === 'required' && value && !currentNode?.default) {
        currentNode.open = true;
        currentNode.startDisabled = true;
        currentNode.defalutDisabled = false;
      } else if (key === 'required' && value && currentNode?.default) {
        currentNode.defalutDisabled = true;
      } else if (key === 'required') {
        currentNode.startDisabled = false;
        currentNode.defalutDisabled = false;
      }
      if (key === 'open' && !value) {
        currentNode.defalutDisabled = true;
      } else if (key === 'open') {
        currentNode.defalutDisabled = false;
      }
      if (key === 'default' && !value) {
        currentNode.startDisabled = true;
      } else if (key === 'default') {
        currentNode.startDisabled = false;
      }
      if (key === 'from') {
        if (value === 2) {
          if (currentNode.type === 'array') {
            currentNode.default = [];
          } else if (currentNode.type === 'object') {
            delete currentNode.default;
          } else {
            currentNode.default = '';
          }
        } else {
          delete currentNode.default;
        }
        currentNode.default = '';
      }
      if (key === 'type' && currentNode.arraySon) {
        const topLevelNode = findTopAncestorById(inputParamsData, id);
        if (topLevelNode.from === 2) {
          topLevelNode.default = [];
        }
      }
      setInputParamsData(cloneDeep(inputParamsData));
    },
    [inputParamsData, setInputParamsData, setExpandedRowKeys]
  );

  const deleteNodeFromTree = useCallback(
    (tree: unknown, id: string): unknown => {
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
    },
    []
  );

  const handleExpand = useCallback(record => {
    setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, record.id]);
  }, []);

  const handleCollapse = useCallback(record => {
    setExpandedRowKeys(expandedRowKeys =>
      expandedRowKeys.filter(id => id !== record.id)
    );
  }, []);

  const handleCheckInput = useCallback(
    (record: unknown, key: string): void => {
      checkParmas(inputParamsData, record?.id, key);
      setInputParamsData(cloneDeep(inputParamsData));
    },
    [inputParamsData, setInputParamsData]
  );

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

  const renderInput = (record: unknown): React.ReactElement => {
    const type = record?.type;
    if (type === 'string') {
      return (
        <Input
          disabled={record?.defalutDisabled}
          placeholder={t('common.pleaseEnterDefaultValue')}
          className="global-input params-input"
          value={record?.default}
          onChange={e =>
            handleInputParamsChange(record?.id, 'default', e.target.value)
          }
        />
      );
    } else if (type === 'boolean') {
      return (
        <Select
          placeholder={t('common.pleaseSelect')}
          suffixIcon={<img src={formSelect} className="w-4 h-4 " />}
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
          style={{
            lineHeight: '40px',
            height: '40px',
          }}
          value={record?.default}
          onChange={value =>
            handleInputParamsChange(record?.id, 'default', value)
          }
        />
      );
    } else if (type === 'integer') {
      return (
        <InputNumber
          disabled={record?.defalutDisabled}
          placeholder={t('common.pleaseEnterDefaultValue')}
          step={1}
          precision={0}
          controls={false}
          style={{
            lineHeight: '40px',
            height: '40px',
          }}
          className="w-full global-input params-input"
          value={record?.default}
          onChange={value =>
            handleInputParamsChange(record?.id, 'default', value)
          }
        />
      );
    } else if (type === 'number') {
      return (
        <InputNumber
          disabled={record?.defalutDisabled}
          placeholder={t('common.pleaseEnterDefaultValue')}
          className="w-full global-input params-input"
          controls={false}
          style={{
            lineHeight: '40px',
          }}
          value={record?.default}
          onChange={value =>
            handleInputParamsChange(record?.id, 'default', value)
          }
        />
      );
    }
  };

  const handleJsonSubmit = (jsonData: string): void => {
    try {
      const jsonDataArray = transformJsonToArray(JSON.parse(jsonData));
      setInputParamsData(inputParamsData => [
        ...inputParamsData,
        ...jsonDataArray,
      ]);
      setModalVisible(false);
      const ids = extractAllIdsOptimized(jsonDataArray);
      setExpandedRowKeys(expandedRowKeys => uniq([...expandedRowKeys, ...ids]));
    } catch (error) {
      console.error('JSON parsing Error:', error);
    }
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <span>
            <span className="text-[#F74E43] text-sm">* </span>
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
      width: '15%',
      render: (name: string, record: unknown): React.ReactElement => (
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
            <span className="text-[#F74E43] text-sm">* </span>
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
      width: '15%',
      render: (description: string, record: unknown): React.ReactElement => (
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
            <span className="text-[#F74E43] text-sm">* </span>
            {t('workflow.nodes.common.variableType')}
          </span>
        </div>
      ),
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      render: (type: string, record: unknown): React.ReactElement => (
        <div>
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
            onChange={value =>
              handleInputParamsChange(record?.id, 'type', value)
            }
          />
        </div>
      ),
    },
    {
      title: t('workflow.nodes.toolNode.requestMethod'),
      dataIndex: 'location',
      key: 'location',
      width: '10%',
      render: (location: string, record: unknown): React.ReactElement =>
        record?.fatherType ? null : (
          <Select
            suffixIcon={<img src={formSelect} className="w-4 h-4" />}
            placeholder={t('workflow.nodes.toolNode.pleaseSelectRequestMethod')}
            className="global-select params-select"
            options={methodsOptions}
            value={location}
            onChange={value =>
              handleInputParamsChange(record?.id, 'location', value)
            }
          />
        ),
    },
    {
      title: t('workflow.nodes.toolNode.isRequired'),
      dataIndex: 'required',
      key: 'required',
      width: '10%',
      render: (required, record: unknown): React.ReactElement => (
        <div className="min-w-[50px] h-[40px] flex items-center">
          {record?.fatherType !== 'array' ? (
            <div
              className="w-[18px] h-[18px] rounded-full bg-[#fff] flex items-center justify-center cursor-pointer"
              style={{
                border: required ? '1px solid #275EFF' : '1px solid #CACEE0',
              }}
              onClick={() =>
                handleInputParamsChange(record?.id, 'required', !required)
              }
            >
              {required && (
                <img
                  src={toolModalChecked}
                  className="w-[14px] h-[14px]"
                  alt=""
                />
              )}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('workflow.nodes.questionAnswerNode.defaultValue'),
      dataIndex: 'default',
      key: 'default',
      width: '10%',
      render: (_, record: unknown): React.ReactElement =>
        record.type === 'array' && record?.from === 2 && !record?.arraySon ? (
          <div
            className="w-full h-[40px] flex items-center justify-center gap-2 border border-[#D9E0E9] rounded-lg text-[#275EFF] cursor-pointer"
            onClick={() => {
              setArrayDefaultModal(true);
              setCurrentArrayDefaultId(record?.id);
            }}
          >
            <img src={arrayDefaultEdit} className="w-[14px] h-[14px]" alt="" />
            <span>{t('workflow.nodes.toolNode.edit')}</span>
          </div>
        ) : !record?.arraySon &&
          record.type !== 'object' &&
          record?.from === 2 ? (
          renderInput(record)
        ) : null,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <span>{t('workflow.nodes.toolNode.enable')}</span>
          <Tooltip
            title={t('workflow.nodes.toolNode.enableDescription')}
            overlayClassName="black-tooltip config-secret"
          >
            <img src={questionCircle} className="w-3 h-3" alt="" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'open',
      key: 'open',
      width: '5%',
      render: (open, record: unknown): React.ReactElement =>
        !record?.arraySon && record.type !== 'object' ? (
          <div className="h-[40px] flex items-center">
            <Tooltip
              title={
                record?.startDisabled
                  ? t(
                      'workflow.nodes.toolNode.requiredParameterDefaultValueSwitch'
                    )
                  : ''
              }
              overlayClassName="black-tooltip config-secret"
            >
              <Switch
                disabled={record?.type !== 'array' && record?.startDisabled}
                className="list-switch"
                checked={open}
                onChange={checked =>
                  handleInputParamsChange(record?.id, 'open', checked)
                }
              />
            </Tooltip>
          </div>
        ) : null,
    },
    {
      title: t('workflow.nodes.toolNode.operation'),
      key: 'operation',
      width: '5%',
      render: (_, record): React.ReactElement => (
        <div className=" flex items-center gap-2 h-[40px]">
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
                  setInputParamsData(
                    cloneDeep(deleteNodeFromTree(inputParamsData, record.id))
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

  return (
    <>
      {arrayDefaultModal && (
        <ArrayDefault
          currentArrayDefaultId={currentArrayDefaultId}
          inputParamsData={inputParamsData}
          setInputParamsData={setInputParamsData}
          setArrayDefaultModal={setArrayDefaultModal}
        />
      )}
      <Form.Item
        name="aa"
        className="label-full"
        label={
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-base font-medium">
              {t('workflow.nodes.toolNode.configureInputParameters')}
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
          dataSource={inputParamsData}
          expandable={{
            expandIconColumnIndex: 0,
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

export default ToolInputParameters;
