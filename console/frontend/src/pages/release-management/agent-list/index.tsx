import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Table, message, Popover, Modal, Select } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAgentList } from '@/services/agent';
import {
  getAgentDetail,
  handleAgentStatus,
  getMCPServiceDetail,
  getAgentInputParams,
  getAgentTimeSeriesData,
  getAgentSummaryData,
} from '@/services/release-management';
import {
  getBotInfo,
  cancelBindWx,
  publish,
  getChainInfo,
  getInputsType,
} from '@/services/spark-common';
import WxModal from '@/components/wx-modal';
import { useBotStateStore } from '@/store/spark-store/bot-state';
import RetractableInput from '@/components/ui/global/retract-table-input';

import useToggle from '@/hooks/use-toggle';
import { debounce } from 'lodash';

import weixinghaoImg from '@/assets/imgs/release/weixin-release.svg';
import apiImg from '@/assets/imgs/release/api-release.svg';
import sparkImg from '@/assets/imgs/release/spark-release.svg';
import mcpImg from '@/assets/imgs/release/mcp-release.svg';
import formSelect from '@/assets/imgs/main/icon_nav_dropdown.svg';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

interface AgentListProps {
  AgentType?: 'agent' | 'workflow';
}

const AgentList: React.FC<AgentListProps> = ({ AgentType }) => {
  const botInfo = useBotStateStore(state => state.botDetailInfo);
  const setBotDetailInfo = useBotStateStore(state => state.setBotDetailInfo);
  const [botMultiFileParam, setBotMultiFileParam] = useState<any>(false);
  const [moreParams, setMoreParams] = useState(false);
  const [editV2Visible, { setLeft: hide, setRight: show }] = useToggle();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpenapi, setIsOpenapi]: any = useState(false);
  const [fabuFlag, setFabuFlag]: any = useState(false);
  const [openWxmol, setOpenWxmol] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [botList, setBotList] = useState([]);
  const { t } = useTranslation();

  const [total, setTotal] = useState<number>();
  const reasonRef = useRef<any>(null);
  const [pageInfo, setPageInfo] = useState({
    pageIndex: 1,
    pageSize: 10,
    botStatus: 0,
  });
  type MsgType = {
    version: string | number;
    searchValue: string | number;
  };
  const [msg, setMsg] = useState<MsgType>({
    version: AgentType === 'agent' ? '1' : '3',
    searchValue: '',
  });
  // tab状态赋值
  useEffect(() => {
    const selectedTab = localStorage.getItem('selectedTab');
    if (selectedTab) {
      setPageInfo(prev => ({
        ...prev,
        botStatus: parseInt(selectedTab, 10),
      }));
      localStorage.removeItem('selectedTab');
    }
  }, []);

  useEffect(() => {
    setMsg(prev => ({
      ...prev,
      version: AgentType === 'agent' ? '1' : '3',
    }));

    setPageInfo(prev => ({
      ...prev,
      pageIndex: 1,
    }));
  }, [AgentType]);

  const cancelUploadBot = (botId?: number, releaseType?: any) => {
    Modal.info({
      wrapClassName: 'bot-center-confirm-modal set_bot-center-confirm-modal',
      title: t('releaseManagement.applyTakeDownAgent'),
      closable: true,
      closeIcon: <span className="close-icon" />,
      okType: 'primary',
      width: '461px',
      content: (
        <div className={styles.cancelUploadModal}>
          <div className={styles.cancelTip}>
            <ExclamationCircleOutlined
              style={{ marginRight: '5px', color: '#f2aa58' }}
            />
            下架申请提交后无法撤回，请谨慎提交！
          </div>
        </div>
      ),
      okText: t('releaseManagement.submitApplication'),
      onCancel: (close: any) => {
        reasonRef.current = undefined;
        close && close();
      },
      onOk: (close: any) => {
        if (releaseType == 1 && botId) {
          handleAgentStatus(botId!, { action: 'OFFLINE', reason: '' })
            .then(() => {
              reasonRef.current = undefined;
              close && close();
              message.success('提交申请成功！');
              setPageInfo(pre => ({ ...pre, pageIndex: 1 }));
            })
            .catch(err => {
              console.error(err);
              err?.msg && message.error(err.msg);
            });
        } else {
          if (botInfo?.botId) {
            cancelBindWx({ appid: botInfo?.wechatAppid, botId: botInfo.botId })
              .then(res => {
                getBotInfo({ botId: botInfo.botId }).then((res: any) => {
                  setBotDetailInfo(res);
                  message.success('解绑成功');
                });
              })
              .catch(error => {
                message.error(error.msg);
              });
          }
        }
      },
    });
  };

  //记录状态
  const localBotTab = () => {
    // 如果当前是发布中状态(1)，则存储为已发布状态(2) -09.01改动
    const statusToSave = pageInfo.botStatus === 1 ? 2 : pageInfo.botStatus;
    localStorage.setItem('selectedTab', statusToSave.toString());
  };

  /** ## 前往详情页 */
  const handleRowClick = (record: any) => {
    navigate(`/management/release/detail/${record.botId}`, {
      state: { record },
    });
    localBotTab();
  };

  /** ## 查看智能体 */
  const checkAgent = (bot: any) => {
    if (AgentType === 'agent') {
      navigate(`/space/config/overview?botId=${bot.botId}&flag=true`);
    } else {
      navigate(`/work_flow/${bot?.maasId}/overview`);
    }
    localBotTab();
  };

  /** ## 编辑智能体 */
  const updateAgent = (bot: any) => {
    if (AgentType === 'agent') {
      navigate(`/space/config/base?botId=${bot?.botId}`);
      // 记录选择状态
    } else {
      navigate(`/work_flow/${bot?.maasId}/arrange`);
    }
    localBotTab();
  };

  // 创建统一的动态columns
  const unifiedColumns = useMemo(() => {
    const cols: any = [
      {
        dataIndex: 'botId',
        title: t('releaseManagement.agentId'),
        align: 'left',
        width: 120,
        render: (text: string) => {
          return <div style={{ marginLeft: '8px' }}>{text}</div>;
        },
      },
      {
        dataIndex: 'botName',
        title: t('releaseManagement.agentName'),
        align: 'left',
        render: (text: string) => (
          <div
            title={text}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px',
            }}
          >
            {text}
          </div>
        ),
      },
      {
        dataIndex: 'botDesc',
        title: t('releaseManagement.functionDesc'),
        align: 'center',
        ellipsis: true,
      },
      {
        dataIndex: 'releaseType',
        title: t('releaseManagement.platform'),
        align: 'center',
        render: (data: number | number[]) => {
          if (typeof data === 'number') {
            data = [data];
          }
          return (
            <div
              style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              {data?.length > 0 ? (
                data.map(item => {
                  if (item == 1) {
                    return (
                      <img
                        style={{ width: '20px', height: '20px' }}
                        src={sparkImg}
                        alt="讯飞星火"
                      />
                    );
                  } else if (item == 2) {
                    return (
                      <img
                        style={{ width: '20px', height: '20px' }}
                        src={apiImg}
                        alt="API"
                      />
                    );
                  } else if (item == 3) {
                    return (
                      <img
                        style={{ width: '20px', height: '20px' }}
                        src={weixinghaoImg}
                        alt="微信"
                      />
                    );
                  } else if (item == 4) {
                    return (
                      <img
                        style={{ width: '20px', height: '20px' }}
                        src={mcpImg}
                        alt="MCP Server"
                      />
                    );
                  }
                  return null;
                })
              ) : (
                <span>-</span>
              )}
            </div>
          );
        },
      },
    ];

    // 动态添加时间列或未通过原因列
    if (pageInfo.botStatus === 3) {
      // 审核未通过状态显示未通过原因
      cols.push({
        dataIndex: 'blockReason',
        title: t('releaseManagement.rejectionReason'),
        align: 'center',
        ellipsis: true,
        render: (reason: string) => (
          <Popover content={reason}>
            <span className={styles.reason}>{reason}</span>
          </Popover>
        ),
      });
    } else {
      // 其他状态显示时间列
      cols.push({
        dataIndex: pageInfo.botStatus === 2 ? 'applyTime' : 'createTime',
        title:
          pageInfo.botStatus === 2
            ? t('releaseManagement.releaseTime')
            : pageInfo.botStatus === 0
              ? t('releaseManagement.createTime')
              : t('releaseManagement.applyTime'),
        align: 'center',
        render: (time: string) => (
          <span className={styles.timeColor}>
            {time?.replace(/T/g, ' ').slice(0, 16)}
          </span>
        ),
      });
    }

    // 添加操作列
    cols.push({
      dataIndex: 'action',
      title: t('releaseManagement.operation'),
      align: 'center',
      render: (bot: any) => (
        <span className={styles.historyAct}>
          {/* 发布按钮 - 未发布状态显示 */}
          {(pageInfo.botStatus === 0 || pageInfo.botStatus === -9) && (
            <span
              onClick={() => {
                /* 工作流：input -- chain 即工作流详情（获取多参数） -- 发布 -- baseInfo 即详情 
                TODO: 工作流智能体的返回数据不满足，等后端完成
                */
                if (bot.version === 3) {
                  console.log(bot, 'bot---------');
                  getAgentInputParams(bot.botId).then((res: any) => {
                    if (
                      (res.length === 2 &&
                        res[1].fileType === 'file' &&
                        res[1].schema.type === 'array-string') ||
                      (res.length === 2 && res[1].fileType !== 'file') ||
                      res.length > 2
                    ) {
                      setMoreParams(true);
                    } else {
                      setMoreParams(false);
                    }
                  });

                  /** ## 获取工作流智能体信息 */
                  getChainInfo(bot?.botId).then(res => {
                    setBotMultiFileParam(res.botMultiFileParam);
                    publish({
                      id: res.massId,
                      botId: `${bot?.botId}`,
                      flowId: res.flowId,
                      name: bot?.botName || '',
                      description: bot?.botDesc || '',
                      data: { nodes: [] },
                    })
                      .then(() => {
                        getBotBaseInfo(bot?.botId);
                        setFabuFlag(true);
                        setOpenWxmol(true);
                      })
                      .catch(err => {
                        console.log(err, 'err');
                        message.error(err?.msg);
                      });
                  });
                } else {
                  getBotBaseInfo(bot?.botId);
                  setFabuFlag(true);
                  setOpenWxmol(true);
                }
              }}
            >
              {t('releaseManagement.release')}
            </span>
          )}

          {/* 编辑按钮 - 所有状态都显示 */}
          <span onClick={() => updateAgent(bot)}>
            {t('releaseManagement.edit')}
          </span>

          {/* 详情按钮 - 工作流类型显示 -- 改为分析 */}
          {AgentType === 'workflow' && (
            <span onClick={() => handleRowClick(bot)}>
              {t('releaseManagement.detail')}
            </span>
          )}

          {/* 查看按钮 - 已发布状态显示 -- 都改为分析 */}
          {bot.botStatus === 2 && (
            <span onClick={() => checkAgent(bot)}>
              {t('releaseManagement.analyze')}
            </span>
          )}

          {/* 下架按钮 - 已发布状态显示 */}
          {bot.botStatus === 2 &&
            !bot.releaseType.includes(2) &&
            !bot.releaseType.includes(4) && (
              <span
                style={{ marginRight: '10px' }}
                onClick={() => cancelUploadBot(bot?.botId, bot?.releaseType)}
              >
                {t('releaseManagement.takeDown')}
              </span>
            )}

          {/* 删除按钮 - 审核未通过状态显示  -- NOTE: 不需要显示，如果需要使用，则添加AgentPage中的删除逻辑*/}
          {/* {bot.botStatus === 3 && (
            <span>
              {t('releaseManagement.delete')}
            </span>
          )} */}
        </span>
      ),
    });

    return cols;
  }, [pageInfo.botStatus, AgentType, t, styles]);

  const updateBotList = (info: {
    pageIndex: number;
    pageSize: number;
    botStatus?: number;
  }) => {
    setLoading(true);
    const params: any = {
      ...msg,
      pageIndex: info.pageIndex,
      pageSize: info.pageSize,
    };
    if (
      info?.botStatus === -9 ||
      info?.botStatus === 1 ||
      info?.botStatus === 2 ||
      info?.botStatus === 3
    ) {
      // 已发布包含发布中状态-- 09.01改动
      params.botStatus = info?.botStatus === 2 ? [1, 2, 4] : [info?.botStatus];
    }
    getAgentList(params)
      .then((data: any) => {
        const dataNow = data?.pageData?.map((itm: any) => ({
          ...itm,
          action: itm,
        }));
        console.log(
          '🚀 ~ updateBotList ~ dataNow:',
          dataNow,
          'data-------',
          data
        );
        setBotList(dataNow ?? []);
        setTotal(data?.total ?? 0);
      })
      .catch(err => {
        console.error(err);
        err?.msg && message.error(err.msg);
      })
      .finally(() => {
        setLoading(false);
      });
    localStorage.removeItem('selectedTab');
  };

  useEffect(() => {
    if (msg.version === '1') {
      setBotMultiFileParam(false);
      setMoreParams(false);
    }
    updateBotList(pageInfo);
  }, [
    pageInfo.pageIndex,
    pageInfo.pageSize,
    pageInfo.botStatus,
    msg.version,
    msg.searchValue,
  ]);

  // 获取助手基本信息
  const getBotBaseInfo = (newBotId?: any) => {
    const botId = newBotId || searchParams.get('botId');
    getAgentDetail(botId)
      .then((data: any) => {
        setBotDetailInfo({
          ...data,
          name: data?.botName,
        });
      })
      .catch(err => {
        console.error(err);
        return err?.msg && message.error(err.msg);
      });
  };

  const onChangeTypeSelect = (e: number | null) => {
    setPageInfo(pre => ({
      ...pre,
      botStatus: e === null ? 0 : e,
      pageIndex: e !== pageInfo?.botStatus ? 1 : pageInfo.pageIndex,
    }));
  };

  const [searchInput, setSearchInput] = useState(''); // 搜索框绑定值

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setMsg(pre => ({
          ...pre,
          searchValue: value,
        }));
      }, 500),
    []
  );

  const getRobotsDebounce = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className={styles.apply}>
      <div className={styles.applyTop}>
        <div className={styles.content}>
          <div className={styles.boxSeach}>
            <span></span>
            <div className={styles.seach}>
              <div className={styles.seachInput}>
                <Select
                  suffixIcon={<img src={formSelect} className="w-4 h-4 " />}
                  showSearch
                  placeholder={t('releaseManagement.select')}
                  optionFilterProp="label"
                  style={{ width: 160 }}
                  className={styles.ant_input}
                  notFoundContent={null}
                  onChange={onChangeTypeSelect}
                  filterOption={false}
                  defaultValue={0}
                  value={pageInfo?.botStatus}
                  // NOTE: 将发布中并入已发布状态 -- 09.01
                  options={[
                    { label: t('releaseManagement.all'), value: 0 },
                    { label: t('releaseManagement.unreleased'), value: -9 },
                    // { label: t('releaseManagement.releasing'), value: 1 },
                    { label: t('releaseManagement.released'), value: 2 },
                    { label: t('releaseManagement.auditFailed'), value: 3 },
                  ]}
                />
              </div>
              <RetractableInput
                value={searchInput}
                restrictFirstChar={true}
                onChange={getRobotsDebounce}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.tableArea}>
        <WxModal
          botMultiFileParam={botMultiFileParam}
          moreParams={moreParams}
          showInfoModel={show}
          setPageInfo={setPageInfo}
          disjump={true}
          setIsOpenapi={setIsOpenapi}
          fabuFlag={fabuFlag}
          isV1={false}
          show={openWxmol}
          onCancel={() => {
            setOpenWxmol(false);
          }}
          agentType={AgentType}
        />
        <Table
          className={botList?.length === 0 ? styles.noData : ''}
          loading={loading}
          dataSource={botList}
          columns={unifiedColumns}
          rowKey={(record: { createTime: number }) => record.createTime}
          pagination={{
            position: ['bottomCenter'],
            total: total,
            showTotal: total =>
              `${t('releaseManagement.total')} ${total} ${t(
                'releaseManagement.totalData'
              )}`,
            showSizeChanger: true,
            current: pageInfo.pageIndex,
            pageSize: pageInfo.pageSize,
            // pageSizeOptions: [10, 20, 50],
            onChange: (pageIndex, pageSize) => {
              setPageInfo(pre => ({
                ...pre,
                pageIndex: pageSize !== pre?.pageSize ? 1 : pageIndex,
                pageSize,
              }));
            },
          }}
          scroll={{
            scrollToFirstRowOnChange: true,
            y: 'max(200px ,calc(100vh - 350px))',
          }}
        />
      </div>
    </div>
  );
};

export default AgentList;
