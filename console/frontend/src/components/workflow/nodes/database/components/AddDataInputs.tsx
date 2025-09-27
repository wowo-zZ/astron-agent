import React, { useMemo, useCallback, useState, memo, useEffect } from 'react';
import { cloneDeep, isEqual } from 'lodash';
import { v4 as uuid } from 'uuid';
import { useTranslation } from 'react-i18next';
import {
  FlowNodeInput,
  FlowSelect,
  FlowCascader,
  FLowCollapse,
} from '@/components/workflow/ui';
import useFlowsManager from '@/components/workflow/store/useFlowsManager';

import inputAddIcon from '@/assets/imgs/workflow/input-add-icon.png';
import remove from '@/assets/imgs/workflow/input-remove-icon.png';

import desciptionIcon from '@/assets/imgs/workflow/desciption-icon.png';
import { capitalizeFirstLetter } from '@/components/workflow/utils/reactflowUtils';
import { Tooltip, Select } from 'antd';
import { cn } from '@/utils';

function index({ id, data, fields, children }): React.ReactElement {
  const { t } = useTranslation();
  const getCurrentStore = useFlowsManager(state => state.getCurrentStore);
  const currentStore = getCurrentStore();
  const canPublishSetNot = useFlowsManager(state => state.canPublishSetNot);
  const autoSaveCurrentFlow = useFlowsManager(
    state => state.autoSaveCurrentFlow
  );
  const historyVersion = useFlowsManager(state => state.historyVersion);
  const nodes = currentStore(state => state.nodes);
  const setNode = currentStore(state => state.setNode);
  const checkNode = currentStore(state => state.checkNode);
  const delayCheckNode = currentStore(state => state.delayCheckNode);
  const takeSnapshot = currentStore(state => state.takeSnapshot);
  const [showParams, setShowParams] = useState(true);
  const [addDataOptions, setAddDataOptions] = useState<unknown[]>([]);

  const imageUnderstandingModel = useMemo(() => {
    return (
      data?.nodeParam?.serviceId === 'image_understanding' ||
      data?.nodeParam?.multiMode
    );
  }, [data]);

  const handleChangeParam = useCallback(
    (inputId, key, fn, value): void => {
      setNode(id, old => {
        const currentInput = old.data[key].find(item => item.id === inputId);
        fn(currentInput, value);
        return {
          ...cloneDeep(old),
        };
      });
      autoSaveCurrentFlow();
      canPublishSetNot();
    },
    [setNode, canPublishSetNot, nodes, autoSaveCurrentFlow]
  );

  const handleChangeNodeParam = useCallback(
    (field, value): void => {
      setNode(id, old => {
        old.data.nodeParam[field] = value;
        return {
          ...cloneDeep(old),
        };
      });
      autoSaveCurrentFlow();
      canPublishSetNot();
    },
    [setNode, canPublishSetNot, nodes, autoSaveCurrentFlow]
  );

  const handleAddLine = useCallback(
    (it): void => {
      takeSnapshot();
      setNode(id, old => {
        old.data.inputs.push({
          id: uuid(),
          name: it.name || '',
          required: it.required,
          description: it.description,
          schema: {
            type: it.type,
            value: {
              type: 'ref',
              content: {},
            },
          },
        });
        return {
          ...cloneDeep(old),
        };
      });
      canPublishSetNot();
    },
    [setNode, canPublishSetNot, takeSnapshot]
  );

  const handleRemoveLine = useCallback(
    (inputId): void => {
      takeSnapshot();
      setNode(id, old => {
        const index = old.data.inputs?.findIndex(item => item.id === inputId);
        old.data.inputs.splice(index, 1);

        return {
          ...cloneDeep(old),
        };
      });
      canPublishSetNot();
      delayCheckNode(id);
    },
    [setNode, canPublishSetNot, takeSnapshot]
  );

  const references = useMemo(() => {
    if (imageUnderstandingModel) {
      return (
        data?.references?.map(node => ({
          ...node,
          children: node.children.map(child => ({
            ...child,
            references: child.references.filter(
              ref => ref.fileType !== 'image'
            ),
          })),
        })) || []
      );
    }
    return data?.references || [];
  }, [data, imageUnderstandingModel]);

  const imageReferences = useMemo(() => {
    return (
      data?.references?.map(node => ({
        ...node,
        children: node.children.map(child => ({
          ...child,
          references: child.references.filter(
            ref => ref.fileType === 'image' && ref?.type === 'string'
          ),
        })),
      })) || []
    );
  }, [data]);

  const mode = useMemo(() => {
    return data?.nodeParam?.mode;
  }, []);
  /** 
  const fieldOptions = useMemo(() => {
    setNode(id, (old) => {
      if (mode == 1) {
        let temp = [];
        let tempAdd = [];
        fields.forEach((it) => {
          it.required &&
            temp.push({
              id: uuid(),
              name: it.name,
              required: it.required,
              description: it.description,
              schema: {
                type: it.type,
                value: {
                  type: "ref",
                  content: {},
                },
              },
            });
          if (!it.required) {
            tempAdd.push({
              value: uuid(),
              name: it.name,
              label: `${it.name}(${it.type})`,
            });
          }
        });
        old.data.inputs = temp;
        setAddDataOptions([...tempAdd]);
      } else if (mode == 2) {
        // old.data.inputs = [];
        let tempAdd = fields.map((it) => {
          return {
            value: uuid(),
            name: it.name,
            required: it.required,
            label: `${it.name}(${it.type})`,
          };
        });
        setAddDataOptions([...tempAdd]);
      }
      return {
        ...cloneDeep(old),
      };
    });
    return [];
  }, [setNode, fields]);
*/

  const inputs = useMemo(() => {
    const inputList = [];
    if (data.inputs.length) {
      return data.inputs.filter(item => {
        return !isUUIDv4(item.name);
      });
    }
    return inputList;
  }, [data]);

  useEffect(() => {
    if (mode === 1) {
      const tempAdd = fields
        .filter(field => {
          const isExit = inputs.some(input => input.name === field.name);
          return !isExit;
        })
        .map(it => {
          if (!it.required) {
            return {
              value: uuid(),
              name: it.name,
              label: `${it.name}(${it.type})`,
              description: it.description,
              type: it.type,
            };
          }
        })
        .filter(Boolean);
      setAddDataOptions([...tempAdd]);
    }
    if (mode === 2) {
      const tempAdd = fields
        .filter(field => {
          const isExit = inputs.some(input => input.name === field.name);
          return !isExit;
        })
        .map(it => {
          return {
            value: uuid(),
            name: it.name,
            required: it.required,
            label: `${it.name}(${it.type})`,
            description: it.description,
            type: it.type,
          };
        });
      setAddDataOptions([...tempAdd]);
    }
  }, [fields, inputs]);

  function isUUIDv4(id): boolean {
    const uuidV4Pattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Pattern.test(id);
  }

  const handleAddSelect = (value): void => {
    handleAddLine(addDataOptions.find(it => it.value == value));
    addDataOptions.splice(
      addDataOptions.findIndex(it => it.value == value),
      1
    );
    setAddDataOptions([...addDataOptions]);
    delayCheckNode(id);
  };

  useEffect(() => {
    const prevList = data.nodeParam.assignmentList;
    const list = data.inputs
      .filter(it => !isUUIDv4(it.name))
      .map(it => it.name);
    const isRefresh = isEqual(list, prevList);
    if (data?.nodeParam?.mode == 2 && !isRefresh && !historyVersion) {
      handleChangeNodeParam('assignmentList', list);
    }
  }, [addDataOptions]);

  return (
    <FLowCollapse
      label={
        <div
          className="flex items-center w-full gap-2 cursor-pointer"
          onClick={() => setShowParams(!showParams)}
        >
          {children}
        </div>
      }
      content={
        <div className="px-[18px] rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 text-desc">
            <h4 className="w-1/3">
              {t('workflow.nodes.databaseNode.parameterName')}
            </h4>
            <h4 className="w-1/4">
              {t('workflow.nodes.databaseNode.fieldType')}
            </h4>
            <h4 className="flex-1">
              {t('workflow.nodes.databaseNode.fieldValue')}
            </h4>
            <span className="w-5 h-5"></span>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {inputs.map(item => {
              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="flex flex-col flex-shrink-0 w-1/3">
                      <div className="flex items-center w-[204px] relative gap-2.5 overflow-hidden">
                        <span className="relative flex items-center gap-1.5 max-w-[130px]">
                          <span
                            className="flex-1 text-overflow"
                            title={item?.name}
                          >
                            {item.name}
                          </span>
                          {item?.required && (
                            <span className="text-[#F74E43] flex-shrink-0">
                              *
                            </span>
                          )}
                          {item?.description && (
                            <Tooltip
                              title={item?.description}
                              overlayClassName="white-tooltip"
                            >
                              <img
                                src={desciptionIcon}
                                className="w-[10px] h-[10px]"
                                alt=""
                              />
                            </Tooltip>
                          )}
                        </span>
                        <div className="bg-[#F0F0F0] py-1 px-2.5 rounded text-xs ml-1 flex-shrink-0">
                          {capitalizeFirstLetter(item?.schema?.type)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col flex-shrink-0 w-1/4">
                      <FlowSelect
                        value={item?.schema?.value?.type}
                        options={[
                          {
                            label: t('workflow.nodes.databaseNode.literal'),
                            value: 'literal',
                          },
                          {
                            label: t('workflow.nodes.databaseNode.reference'),
                            value: 'ref',
                          },
                        ]}
                        onChange={value =>
                          handleChangeParam(
                            item.id,
                            'inputs',
                            (data, value) => {
                              data.schema.value.type = value;
                              if (value === 'literal') {
                                data.schema.value.content = '';
                              } else {
                                data.schema.value.content = {};
                              }
                            },
                            value
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      {item?.schema?.value?.type === 'literal' ? (
                        <FlowNodeInput
                          nodeId={id}
                          value={item?.schema?.value?.content}
                          onChange={value =>
                            handleChangeParam(
                              item.id,
                              'inputs',
                              (data, value) =>
                                (data.schema.value.content = value),
                              value
                            )
                          }
                        />
                      ) : (
                        <FlowCascader
                          value={
                            item?.schema?.value?.content?.nodeId
                              ? [
                                  item?.schema?.value?.content?.nodeId,
                                  item?.schema?.value?.content?.name,
                                ]
                              : []
                          }
                          options={
                            item?.customParameterType === 'image_understanding'
                              ? imageReferences
                              : references
                          }
                          handleTreeSelect={node =>
                            handleChangeParam(
                              item.id,
                              'inputs',
                              (data, value) => {
                                data.schema.value.content = value.content;
                                // data.schema.type = value.type;
                                data.fileType = value.fileType;
                              },
                              {
                                content: {
                                  id: node.id,
                                  nodeId: node.originId,
                                  name: node.value,
                                },
                                type:
                                  node?.parentType === 'array-object'
                                    ? `array-${node.type}`
                                    : node.type,
                                fileType: node?.fileType,
                              }
                            )
                          }
                          onBlur={() => {
                            checkNode(id);
                            autoSaveCurrentFlow();
                          }}
                        />
                      )}
                    </div>
                    {(mode == 2 || (mode == 1 && !item.required)) && (
                      <img
                        src={remove}
                        className="w-[16px] h-[17px] flex-shrink-0 mt-1.5"
                        style={{
                          cursor:
                            item?.customParameterType === 'image_understanding'
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            item?.customParameterType === 'image_understanding'
                              ? 0.5
                              : 1,
                        }}
                        onClick={() => {
                          setAddDataOptions([
                            ...addDataOptions,
                            {
                              value: uuid(),
                              name: item.name,
                              label: `${item.name}(${item?.schema?.type})`,
                            },
                          ]);
                          handleRemoveLine(item.id, item);
                        }}
                        alt=""
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#F74E43]">
                    <div className="flex flex-col w-1/3">
                      {item?.nameErrMsg}
                    </div>
                    <div className="flex flex-col w-1/4"></div>
                    <div className="flex flex-col flex-1">
                      {item?.schema?.value?.contentErrMsg}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Select
            disabled={!addDataOptions.length}
            style={{ width: 220 }}
            className={cn('flow-select nodrag w-full')}
            dropdownAlign={{ offset: [0, 0] }}
            placeholder={
              <div className="text-[#275EFF] text-xs font-medium mt-1 inline-flex items-center cursor-pointer gap-1.5">
                <img src={inputAddIcon} className="w-3 h-3" alt="" />
                <span>{t('workflow.nodes.databaseNode.add')}</span>
              </div>
            }
            options={addDataOptions}
            onChange={value => handleAddSelect(value)}
          />
          {mode === 2 && (
            <div className="flex items-center mt-1 text-xs text-[#F74E43]">
              {data?.nodeParam?.fieldNameErrMsg}
            </div>
          )}
        </div>
      }
    />
  );
}

export default memo(index);
