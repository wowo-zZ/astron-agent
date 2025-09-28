import React, { useMemo, useState, memo, useEffect } from 'react';
import {
  FlowSelect,
  FlowTemplateEditor,
  FLowCollapse,
} from '@/components/workflow/ui';
import { Cascader } from 'antd';
import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import { useTranslation } from 'react-i18next';
import useFlowsManager from '@/components/workflow/store/useFlowsManager';
import Inputs from '@/components/workflow/nodes/components/inputs';
import AddDataInputs from './components/AddDataInputs';
import QueryField from './components/QueryField';
import QueryLimit from './components/QueryLimit';
import OutputDatabase from './components/OutputDatabase';
import CasesInputs from './components/CasesInputs';
import ExceptionHandling from '../components/exception-handling';
import { useNodeCommon } from '@/components/workflow/hooks/useNodeCommon';

import formSelect from '@/assets/imgs/main/icon_nav_dropdown.svg';

import styles from './index.module.scss';
import { allTableList, fieldList } from '@/services/database';

export const DatabaseDetail = memo(props => {
  const { id, data } = props;
  const { handleChangeNodeParam } = useNodeCommon({ id, data });
  const { t } = useTranslation();
  const getCurrentStore = useFlowsManager(state => state.getCurrentStore);
  const currentStore = getCurrentStore();
  const canvasesDisabled = useFlowsManager(state => state.canvasesDisabled);
  const autoSaveCurrentFlow = useFlowsManager(
    state => state.autoSaveCurrentFlow
  );
  const delayCheckNode = currentStore(state => state.delayCheckNode);
  const historyVersion = useFlowsManager(state => state.historyVersion);
  const setNode = currentStore(state => state.setNode);
  const updateNodeNameStatus = currentStore(
    state => state.updateNodeNameStatus
  );
  const canPublishSetNot = useFlowsManager(state => state.canPublishSetNot);
  const updateNodeRef = currentStore(state => state.updateNodeRef);
  const [allFields, setAllFields] = useState([]);
  const [tab, setTab] = useState(1);
  const [handleMode, setHandleMode] = useState(0);
  const [fields, setFields] = useState([]);
  const [allTable, setAllTable] = useState<unknown>([]);

  useEffect(() => {
    allTableList().then(list => {
      const arr = list.map(item => {
        item.children = item.children
          ? item.children.map(inner => {
              inner.id = inner.value;
              inner.value = inner.label;
              return inner;
            })
          : null;
        return item;
      });
      setAllTable(arr);
      if (data?.nodeParam?.dbId && data?.nodeParam?.tableName) {
        getFields(arr, data.nodeParam.dbId, data.nodeParam.tableName);
      }
    });
  }, []);

  useEffect(() => {
    setTab(data?.nodeParam?.mode > 0 ? 2 : 1);
    setHandleMode(data?.nodeParam?.mode || 0);
  }, [data]);

  const getFields = (list, dbId, tableName): void => {
    const currentTable = list.filter(item => item.value === dbId);
    if (!currentTable.length) {
      setFields([]);
      return;
    }
    const currentSheet = currentTable[0].children.find(
      item => item.value === tableName
    );
    if (!currentSheet) {
      setFields([]);
      return;
    }
    fieldList({
      tbId: currentSheet.id,
      pageNum: 1,
      pageSize: 200,
    })
      .then(res => {
        const filterFields = res.records.filter(field => !field.isSystem);
        const fields = filterFields.map(item => {
          return {
            id: item.id,
            name: item.name,
            required: item.isRequired,
            type: item.type.toLowerCase(),
            description: item.description,
          };
        });
        setAllFields(
          res.records.map(item => ({
            ...item,
            type: item.type.toLowerCase(),
          }))
        );
        setFields(fields);
        if (
          data.nodeParam.mode === 1 &&
          data.inputs.length === 0 &&
          !historyVersion
        ) {
          const initInputs = fields
            .map(item => {
              if (item.required) {
                return {
                  ...item,
                  schema: {
                    type: item.type,
                    value: {
                      type: 'ref',
                      content: {},
                    },
                  },
                };
              }
            })
            .filter(Boolean);
          handleChangeNodeParam(
            (data, value) => (data.inputs = value),
            initInputs
          );
        }
      })
      .catch(() => {
        setFields([]);
      });
  };

  const handleCustomSQL = (): void => {
    if (tab === 1) return;
    modeChange(0);
    setTab(1);
  };

  const handleformdata = (): void => {
    if (tab === 2) return;
    delayCheckNode(id);
    modeChange(1);
    setTab(2);
    if (data?.nodeParam?.dbId && data?.nodeParam?.tableName) {
      getFields(allTable, data.nodeParam.dbId, data.nodeParam.tableName);
    }
  };

  const handleDbChange = (dbId): void => {
    handleChangeNodeParam((data, value) => (data.nodeParam.dbId = value), dbId);
    handleChangeNodeParam(
      (data, value) => (data.nodeParam.tableName = value),
      null
    );
    setFields([]);
    setAllFields([]);
  };

  const modeChange = (value): void => {
    setHandleMode(value);
    setNode(id, old => {
      old.data.nodeParam.mode = value;
      old.data.nodeParam.assignmentList = [];
      old.data.nodeParam.orderData = [];
      old.data.nodeParam.cases = [];
      if (value === 0) {
        old.data.inputs = [
          {
            id: uuid(),
            name: 'input',
            schema: {
              type: 'string',
              value: {
                content: {},
                type: 'ref',
              },
            },
          },
        ];
      } else if (value === 1) {
        old.data.inputs = fields
          .filter((field: unknown) => field.required)
          .map((it: object) => {
            return {
              ...it,
              schema: {
                type: it?.type || 'string',
                value: {
                  content: {},
                  type: 'ref',
                },
              },
            };
          });
      } else {
        old.data.inputs = [];
      }
      if (value === 4) {
        old.data.outputs = old.data.outputs.slice(0, 2);
      } else {
        old.data.outputs[2] = {
          id: uuid(),
          name: 'outputList',
          nameErrMsg: '',
          schema: {
            default: t('workflow.nodes.databaseNode.executionResult'),
            properties: [],
            type: 'array-object',
          },
        };
      }
      if (value === 3) {
        delete old.data.outputs[2].schema.properties;
        old.data.nodeParam.limit = 50;
      } else {
        delete old.data.nodeParam.limit;
      }
      delete old.data.nodeParam.sql;
      return {
        ...cloneDeep(old),
      };
    });
    autoSaveCurrentFlow();
    canPublishSetNot();
    updateNodeRef(id);
  };

  const nodeParam = useMemo(() => {
    return data?.nodeParam || {};
  }, [data]);

  const handleSheetChange = (valArray): void => {
    setNode(id, old => {
      old.data.nodeParam.dbId = valArray[0];
      old.data.nodeParam.tableName = valArray[1];
      const mode = old.data.nodeParam.mode;
      if (mode === 0) {
        old.data.inputs = [
          {
            id: uuid(),
            name: 'input',
            schema: {
              type: 'string',
              value: {
                content: {},
                type: 'ref',
              },
            },
          },
        ];
      } else {
        old.data.inputs = [];
      }
      if (mode === 4) {
        old.data.outputs = old.data.outputs.slice(0, 2);
      } else {
        old.data.outputs[2] = {
          id: uuid(),
          name: 'outputList',
          nameErrMsg: '',
          schema: {
            default: t('workflow.nodes.databaseNode.executionResult'),
            properties: [],
            type: 'array-object',
          },
        };
      }
      if (mode === 3) {
        delete old.data.outputs[2].schema.properties;
        old.data.nodeParam.limit = 50;
      }
      old.data.nodeParam.assignmentList = [];
      old.data.nodeParam.orderData = [];
      old.data.nodeParam.cases = [];
      return {
        ...cloneDeep(old),
      };
    });
    autoSaveCurrentFlow();
    canPublishSetNot();
    getFields(allTable, valArray[0], valArray[1]);
  };

  return (
    <div className={styles.database}>
      <div className="p-[14px] pb-[6px]">
        <FLowCollapse
          id={id}
          activeKey={data?.shrink ? '' : '1'}
          className="flow-collapse-node-container"
          label={
            <div className="w-full">
              <h2
                className="text-base font-medium"
                onDoubleClick={() => updateNodeNameStatus(id)}
              >
                选择数据库
              </h2>
              <>
                <div className="flex justify-between items-center gap-2 bg-[#E9EDF6] p-[3px] rounded-[8px] mt-[8px] mb-[12px]">
                  <div
                    className={`${styles.tabItem} ${
                      tab === 1 ? styles.activeItem : ''
                    }`}
                    style={{
                      pointerEvents: canvasesDisabled ? 'none' : 'auto',
                    }}
                    onClick={handleCustomSQL}
                  >
                    {t('workflow.nodes.databaseNode.customSQL')}
                  </div>
                  <div
                    className={`${styles.tabItem} ${
                      tab === 2 ? styles.activeItem : ''
                    }`}
                    style={{
                      pointerEvents: canvasesDisabled ? 'none' : 'auto',
                    }}
                    onClick={handleformdata}
                  >
                    {t('workflow.nodes.databaseNode.formDataProcessing')}
                  </div>
                </div>

                {tab == 1 && (
                  <div
                    className="flex items-baseline gap-2"
                    onClick={e => e.stopPropagation()}
                    style={{
                      pointerEvents: canvasesDisabled ? 'none' : 'auto',
                    }}
                  >
                    <span>
                      {t('workflow.nodes.databaseNode.selectDatabase')}
                    </span>
                    <div className="flex-1 w-0">
                      <FlowSelect
                        value={nodeParam?.dbId}
                        onBlur={() => delayCheckNode(id)}
                        options={allTable}
                        popupClassName="overscroll-contain flow-model-select-dropdown"
                        onChange={handleDbChange}
                      />
                      <div className="text-xs text-[#F74E43]">
                        {nodeParam.dbErrMsg}
                      </div>
                    </div>
                  </div>
                )}

                {tab == 2 && (
                  <>
                    <div
                      className="flex items-baseline gap-2 mb-[12px]"
                      onClick={e => e.stopPropagation()}
                      style={{
                        pointerEvents: canvasesDisabled ? 'none' : 'auto',
                      }}
                    >
                      <span>
                        {t('workflow.nodes.databaseNode.selectDataTable')}
                      </span>
                      <div className="flex-1 w-0">
                        <Cascader
                          value={
                            nodeParam?.dbId && nodeParam?.tableName
                              ? [nodeParam?.dbId, nodeParam?.tableName]
                              : []
                          }
                          options={allTable}
                          allowClear={false}
                          suffixIcon={
                            <img src={formSelect} className="w-4 h-4" />
                          }
                          placeholder={t(
                            'workflow.nodes.databaseNode.pleaseSelect'
                          )}
                          // fieldNames={{ label: "name", value: "id", children: "children" }}
                          className={'flow-select nodrag w-full'}
                          // showCheckedStrategy={Cascader.SHOW_CHILD}
                          // dropdownAlign={{ offset: [0, 0] }}
                          // popupClassName="custom-cascader-popup"
                          onChange={handleSheetChange}
                          dropdownRender={menu => (
                            <div
                              onWheel={e => {
                                e.stopPropagation();
                              }}
                            >
                              {menu}
                            </div>
                          )}
                          getPopupContainer={triggerNode =>
                            triggerNode.parentNode
                          }
                          onBlur={() => delayCheckNode(id)}
                        />
                        <div className="text-xs text-[#F74E43]">
                          {nodeParam.tableNameErrMsg}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      onClick={e => e.stopPropagation()}
                      style={{
                        pointerEvents: canvasesDisabled ? 'none' : 'auto',
                      }}
                    >
                      <span>
                        {t('workflow.nodes.databaseNode.processingMode')}
                      </span>
                      <div className="flex-1">
                        <FlowSelect
                          value={handleMode}
                          onBlur={() => delayCheckNode(id)}
                          options={[
                            {
                              label: t('workflow.nodes.databaseNode.addData'),
                              value: 1,
                            },
                            {
                              label: t(
                                'workflow.nodes.databaseNode.updateData'
                              ),
                              value: 2,
                            },
                            {
                              label: t('workflow.nodes.databaseNode.queryData'),
                              value: 3,
                            },
                            {
                              label: t(
                                'workflow.nodes.databaseNode.deleteData'
                              ),
                              value: 4,
                            },
                          ]}
                          onChange={modeChange}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            </div>
          }
          content={
            <div className="bg-[#fff] rounded-lg w-full flex flex-col gap-2.5">
              {tab == 1 && (
                <>
                  <Inputs id={id} data={data}>
                    <div className="flex items-center justify-between flex-1 text-base font-medium">
                      <div>{t('workflow.nodes.databaseNode.input')}</div>
                    </div>
                  </Inputs>
                  <FLowCollapse
                    label={
                      <div className="flex items-center justify-between text-base font-medium">
                        <div>{t('workflow.nodes.databaseNode.sql')}</div>
                        {/* <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAiModalOpen(!aiModalOpen)}>
                              <img src={aiCreateIcon} className="w-[14px] h-[14px]" alt="" />
                              <div className={styles.ai_text}>AI生成</div>
                            </div> */}
                      </div>
                    }
                    content={
                      <div className="px-[18px]">
                        <FlowTemplateEditor
                          data={data}
                          onBlur={() => delayCheckNode(id)}
                          value={nodeParam?.sql}
                          onChange={value =>
                            handleChangeNodeParam(
                              (data, value) => (data.nodeParam.sql = value),
                              value
                            )
                          }
                          placeholder={
                            <div className="leading-[18px] whitespace-pre-wrap font-normal">
                              {t('workflow.nodes.databaseNode.sqlPlaceholder')}
                            </div>
                          }
                          minHeight="154px"
                        />
                        <p className="text-xs text-[#F74E43]">
                          {data.nodeParam.sqlErrMsg}
                        </p>
                      </div>
                    }
                  />
                </>
              )}
              {tab == 2 && (
                <>
                  {/* 新增 */}
                  {handleMode == 1 && (
                    <>
                      <AddDataInputs id={id} data={data} fields={fields}>
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.setAddData')}
                          </div>
                        </div>
                      </AddDataInputs>
                    </>
                  )}
                  {/* 更新 */}
                  {handleMode == 2 && (
                    <>
                      <CasesInputs
                        id={id}
                        data={data}
                        fields={fields}
                        allFields={allFields}
                        key={handleMode}
                      >
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.setDataRange')}
                          </div>
                        </div>
                      </CasesInputs>

                      <AddDataInputs id={id} data={data} fields={fields}>
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.setUpdateData')}
                          </div>
                        </div>
                      </AddDataInputs>
                    </>
                  )}
                  {/* 查询 */}
                  {handleMode == 3 && (
                    <>
                      <CasesInputs
                        id={id}
                        data={data}
                        fields={fields}
                        allFields={allFields}
                        key={handleMode}
                      >
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.setDataRange')}
                          </div>
                        </div>
                      </CasesInputs>

                      <QueryField
                        id={id}
                        data={data}
                        allFields={allFields}
                        from={'query'}
                        key={'query'}
                      >
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.queryResultFields')}
                          </div>
                        </div>
                      </QueryField>

                      <QueryField
                        id={id}
                        data={data}
                        allFields={allFields}
                        from={'sort'}
                        key={'sort'}
                      >
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>{t('workflow.nodes.databaseNode.sort')}</div>
                        </div>
                      </QueryField>

                      <QueryLimit id={id} data={data}>
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.queryLimit')}
                          </div>
                        </div>
                      </QueryLimit>
                    </>
                  )}
                  {/* 删除 */}
                  {handleMode == 4 && (
                    <>
                      <CasesInputs
                        id={id}
                        data={data}
                        fields={fields}
                        allFields={allFields}
                        key={handleMode}
                      >
                        <div className="flex items-center justify-between flex-1 text-base font-medium">
                          <div>
                            {t('workflow.nodes.databaseNode.setDataRange')}
                          </div>
                        </div>
                      </CasesInputs>
                    </>
                  )}
                </>
              )}

              <OutputDatabase id={id} data={data} key={handleMode}>
                <div className="text-base font-medium">
                  {t('workflow.nodes.databaseNode.output')}
                </div>
              </OutputDatabase>
              <ExceptionHandling id={id} data={data} />
            </div>
          }
        />
      </div>
    </div>
  );
});
