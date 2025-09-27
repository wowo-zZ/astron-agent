import React, { useCallback, useState, useEffect } from 'react';
import { Table, Tooltip, Input, Select, InputNumber } from 'antd';
import { cloneDeep } from 'lodash';
import { v4 as uuid } from 'uuid';
import { useTranslation } from 'react-i18next';

import expand from '@/assets/imgs/plugin/icon_fold.png';
import shrink from '@/assets/imgs/plugin/icon_shrink.png';
import addItemIcon from '@/assets/imgs/workflow/add-item-icon.png';
import remove from '@/assets/imgs/workflow/input-remove-icon.png';
import inputErrorMsg from '@/assets/imgs/plugin/input_error_msg.svg';
import formSelect from '@/assets/imgs/workflow/icon_form_select.png';

function DebuggerTable({
  debuggerParamsData,
  setDebuggerParamsData,
}): React.ReactElement {
  const { t } = useTranslation();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    const allKeys = [];
    debuggerParamsData.forEach(item => {
      if (item.children) {
        allKeys.push(item.id);
      }
    });
    setExpandedRowKeys(allKeys);
  }, []);

  const handleExpand = useCallback((record: unknown): void => {
    setExpandedRowKeys(expandedRowKeys => [...expandedRowKeys, record.id]);
  }, []);

  const handleCollapse = useCallback((record: unknown): void => {
    setExpandedRowKeys(expandedRowKeys =>
      expandedRowKeys.filter(id => id !== record.id)
    );
  }, []);

  const updateIds = useCallback((obj): unknown => {
    const newObj = { ...obj, id: uuid(), default: '' };

    if (newObj.children && Array.isArray(newObj.children)) {
      newObj.children = newObj.children.map(child => updateIds(child));
    }

    return newObj;
  }, []);

  const handleAddItem = useCallback(
    (record: unknown): void => {
      const newData = updateIds(record?.children?.[0]);
      const currentNode = findNodeById(debuggerParamsData, record?.id);
      currentNode.children.push(newData);
      setDebuggerParamsData(cloneDeep(debuggerParamsData));
    },
    [debuggerParamsData, setDebuggerParamsData]
  );

  const deleteNodeFromTree = useCallback((tree, id): unknown => {
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

  const customExpandIcon = useCallback(
    ({ expanded, onExpand, record }): React.ReactElement => {
      if (record.children) {
        return expanded ? (
          <img
            src={shrink}
            className="w-4 h-4 inline-block mb-1 mr-1"
            onClick={e => {
              e.stopPropagation();
              handleCollapse(record);
            }}
          />
        ) : (
          <img
            src={expand}
            className="w-4 h-4 inline-block mb-1 mr-1"
            onClick={e => {
              e.stopPropagation();
              handleExpand(record);
            }}
          />
        );
      }
      return null;
    },
    []
  );

  const findNodeById = (tree, id): unknown => {
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
    (id, value) => {
      const currentNode = findNodeById(debuggerParamsData, id);
      currentNode.default = value;
      setDebuggerParamsData(cloneDeep(debuggerParamsData));
    },
    [debuggerParamsData, setDebuggerParamsData, setExpandedRowKeys]
  );

  const checkParmas = useCallback((params, id, key) => {
    let passFlag = true;
    const errEsg = t('workflow.nodes.toolNode.pleaseEnterParameterValue');
    const currentNode = findNodeById(params, id);
    if (!currentNode[key]) {
      currentNode[`${key}ErrMsg`] = errEsg;
      passFlag = false;
    } else {
      currentNode[`${key}ErrMsg`] = '';
    }
    return passFlag;
  }, []);

  const handleCheckInput = useCallback(
    (record, key) => {
      checkParmas(debuggerParamsData, record?.id, key);
      setDebuggerParamsData(cloneDeep(debuggerParamsData));
    },
    [debuggerParamsData, setDebuggerParamsData]
  );

  const renderInput = (record): React.ReactElement => {
    const type = record?.type;
    if (type === 'string') {
      return (
        <Input
          disabled={record?.defalutDisabled}
          placeholder={t('common.pleaseEnterDefaultValue')}
          className="global-input params-input"
          value={record?.default}
          onChange={e => {
            handleInputParamsChange(record?.id, e.target.value);
            handleCheckInput(record, 'default');
          }}
          onBlur={() => handleCheckInput(record, 'default')}
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
          onChange={value => {
            handleInputParamsChange(record?.id, value);
            handleCheckInput(record, 'default');
          }}
          onBlur={() => handleCheckInput(record, 'default')}
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
          className="global-input params-input w-full"
          value={record?.default}
          onChange={value => {
            handleInputParamsChange(record?.id, value);
            handleCheckInput(record, 'default');
          }}
          onBlur={() => handleCheckInput(record, 'default')}
        />
      );
    } else if (type === 'number') {
      return (
        <InputNumber
          disabled={record?.defalutDisabled}
          placeholder={t('common.pleaseEnterDefaultValue')}
          className="global-input params-input w-full"
          controls={false}
          style={{
            lineHeight: '40px',
          }}
          value={record?.default}
          onChange={value => {
            handleInputParamsChange(record?.id, value);
            handleCheckInput(record, 'default');
          }}
          onBlur={() => handleCheckInput(record, 'default')}
        />
      );
    }
  };

  const columns = [
    {
      title: t('workflow.nodes.common.parameterName'),
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (name, record): React.ReactElement => (
        <Tooltip
          title={record?.description}
          overlayClassName="black-tooltip config-secret"
        >
          {name}
        </Tooltip>
      ),
    },
    {
      title: t('workflow.nodes.common.variableType'),
      dataIndex: 'type',
      key: 'type',
      width: '10%',
    },
    {
      title: t('workflow.nodes.toolNode.isRequired'),
      dataIndex: 'required',
      key: 'required',
      width: '10%',
      render: (required): React.ReactElement => (
        <div
          style={{
            color: required ? '#275EFF' : '#F74E43',
          }}
        >
          {required
            ? t('workflow.nodes.toolNode.yes')
            : t('workflow.nodes.toolNode.no')}
        </div>
      ),
    },
    {
      title: t('workflow.nodes.toolNode.parameterValue'),
      dataIndex: 'default',
      key: 'default',
      width: '40%',
      render: (_, record): React.ReactElement => (
        <div className="w-full flex flex-col gap-1">
          {record?.type === 'object' || record?.type === 'array'
            ? null
            : renderInput(record)}
          {record?.defaultErrMsg && (
            <div className="flex items-center gap-1">
              <img src={inputErrorMsg} className="w-[14px] h-[14px]" alt="" />
              <p className="text-[#F74E43] text-sm">{record?.defaultErrMsg}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('workflow.nodes.toolNode.operation'),
      key: 'operation',
      width: '5%',
      render: (_, record): React.ReactElement => (
        <div className=" flex items-center gap-2">
          {record?.type === 'array' && (
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
          {record?.fatherType === 'array' && (
            <Tooltip title="" overlayClassName="black-tooltip config-secret">
              <img
                className="w-4 h-4 cursor-pointer"
                src={remove}
                onClick={() => {
                  setDebuggerParamsData(
                    cloneDeep(deleteNodeFromTree(debuggerParamsData, record.id))
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

  return (
    <div>
      <div className="w-full flex items-center gap-1 justify-between">
        <span className="text-base font-medium">
          {t('workflow.nodes.toolNode.parameterConfiguration')}
        </span>
      </div>
      <Table
        className="tool-params-table tool-debugger-table mt-6"
        pagination={false}
        columns={columns}
        dataSource={debuggerParamsData}
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
    </div>
  );
}

export default DebuggerTable;
