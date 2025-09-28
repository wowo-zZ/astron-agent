/* eslint-disable no-debugger */
import React, { useState, useEffect } from 'react';
import {
  getAllMessage,
  getAllMessageType,
  changeMessageStatus,
  readAllMessage,
} from '@/services/notification';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Modal, Button, message, Popconfirm } from 'antd';
import { CloseIcon } from '@/components/svg-icons';
import styles from './index.module.scss';
import { useSparkCommonStore } from '@/store/spark-store/spark-common';
import BotCard from './bot-card';
import { useTranslation } from 'react-i18next';
import messageSpace from '@/assets/imgs/share-page/message_space.svg';
interface NoticeModalProps {
  open: boolean;
  onClose: () => void;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ open, onClose }) => {
  const [selectType, setSelectType] = useState<string>('0');
  const myMessage = useSparkCommonStore(state => state.myMessage);
  const setMyMessage = useSparkCommonStore(state => state.setMyMessage);
  const [messageType, setMessageType] = useState<any[]>([]);
  const [messageDetail, setMessageDetail] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number>(0);
  const changeType = (item: any) => {
    setSelectType(item.key);
    getMessages(item.key);
  };
  const [selectMessageObj, setSelectMsgObj] = useState<any>({});
  const { t } = useTranslation();
  const initCoverImg = (messageItem: any): string => {
    const systemCover = [
      '',
      'https://openres.xfyun.cn/xfyundoc/2023-12-20/d2285839-d0c5-481c-860a-f65e1dce63ee/1703071130174/picon-bell.png',
      'https://openres.xfyun.cn/xfyundoc/2023-12-20/9a15bf49-175c-42f0-ab53-7bce59249750/1703073213967/picon-notice.png',
    ];
    return parseInt(messageItem.messageType) <= 2
      ? systemCover[messageItem.messageType] || ''
      : messageItem.coverImage || '';
  };

  //获取消息/通知等
  const getMessages = async (queryMessageType: string) => {
    const queryParam = {
      typeId: queryMessageType || 0,
      page: 1,
      pageSize: 100,
    };
    const messageResult = await getAllMessage(queryParam);
    setMyMessage(messageResult);
  };

  const getMessageType = async () => {
    const mtResult = await getAllMessageType();
    setMessageType(mtResult);
    if (mtResult.length) {
      setSelectType(mtResult[0].id);
      getMessages(mtResult[0].id);
    }
  };

  const readMessage = async (messageItem: any) => {
    const readStatus = await changeMessageStatus({
      messageId: messageItem.id,
      operateType: 1,
    });
    setSelectMsgObj(messageItem);
    switch (messageItem.jumpType) {
      case 2:
        setMessageDetail('');
        setSelectedId(0);
        window.location.href = '/desk?botId=' + messageItem.baseId;
        break;
      case 4:
        setMessageDetail('');
        setSelectedId(0);
        window.location.href = `/desk?personalityId=${messageItem.baseId}`;
        break;
      case 5:
        setMessageDetail(messageItem.outLink ?? '');
        setSelectedId(messageItem.id);
        break;
      default:
        setMessageDetail('');
        setSelectedId(0);
        break;
    }
    switch (messageItem.messageType) {
      case 2:
        setSelectedId(messageItem.id);
        setMessageDetail(messageItem?.summary ?? '');
        break;
      case 3:
      case 5:
        setSelectedId(messageItem.id);
        break;
    }
    getMessages(selectType);
  };

  const delMessage = async (messageItem: any, e: any) => {
    changeMessageStatus({
      messageId: messageItem.id,
      operateType: 2,
    })
      .then(res => {
        message.success(t('systemMessage.deleteSuccess'));
        getMessages(selectType);
      })
      .catch(() => {
        message.error(t('systemMessage.deleteFail'));
      });
  };

  const readAll = () => {
    readAllMessage({ typeId: selectType })
      .then(res => {
        getMessages(selectType);
      })
      .catch(e => {
        message.error(t('systemMessage.historyAudioLoading'));
      });
  };

  /** 渲染特殊的信息 */
  const renderSpecialMsg = () => {
    switch (selectMessageObj?.messageType) {
      case 3:
      case 5: {
        return <BotCard messageInfo={selectMessageObj} />;
      }
      default:
        return null;
    }
  };

  useEffect(() => {
    getMessageType();
  }, []);

  return (
    <div>
      <Modal
        title={false}
        centered
        open={open}
        className={styles.notice_modal}
        footer={false}
        width={785}
        onCancel={() => {
          onClose();
        }}
      >
        <div className={styles.notice_wrap}>
          <div className={styles.notice_list_wrap}>
            {messageType.length > 0 && (
              <Dropdown
                overlay={
                  <Menu
                    className={styles.notice_type_menu}
                    selectedKeys={[selectType]}
                    onClick={changeType}
                  >
                    {messageType?.map((item: any) => (
                      <Menu.Item key={item.id}>{item.typeInfo}</Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={['click']}
                placement="bottomCenter"
                getPopupContainer={(trigger: HTMLElement) =>
                  trigger.parentNode as HTMLElement
                }
              >
                <div className={styles.notice_types_trigger}>
                  <span>
                    {messageType?.length &&
                      messageType.filter(
                        item => item.id === parseInt(selectType)
                      )[0].typeInfo}
                  </span>
                  <CaretDownOutlined />
                </div>
              </Dropdown>
            )}
            {messageType.length > 0 && (
              <Button
                className={styles.read_all}
                size="small"
                onClick={readAll}
              >
                {t('systemMessage.allRead')}
              </Button>
            )}
            <ul className={styles.notice_list}>
              {(!myMessage?.total || myMessage?.total <= 0) && (
                <li className={styles.empty_list}>
                  <div className={styles.empty_list_icon} />
                  <span>{t('systemMessage.noMoreMessage')}</span>
                </li>
              )}
              {myMessage?.total > 0 &&
                myMessage?.messages?.map((item: any) => (
                  <li
                    className={`${
                      selectedId === item?.messageCenter?.id
                        ? styles.selected
                        : ''
                    }`}
                    key={item?.messageCenter?.id}
                    onClick={() => {
                      readMessage(item?.messageCenter);
                    }}
                  >
                    {item.messageCenter?.messageType !== 6 && (
                      <div
                        className={`${styles.ni_avatar} ${
                          item.isRead === 0 && styles.n_unread
                        }`}
                        style={{
                          backgroundImage:
                            'url(' + initCoverImg(item.messageCenter) + ')',
                        }}
                      />
                    )}
                    {item.messageCenter?.messageType == 6 && (
                      <div
                        className={`${styles.spaceBox} ${item.isRead === 0 && styles.n_unread}`}
                      >
                        <img
                          className={styles.spaceImg}
                          src={messageSpace}
                          alt=""
                        />
                      </div>
                    )}
                    <div className={styles.ni_content}>
                      <div className={styles.ni_info}>
                        <h3 className={styles.ni_title}>
                          {item.messageCenter.title}
                        </h3>
                        <span>
                          {item.messageCenter?.updateTime.split('T')[0]}
                        </span>
                      </div>
                      <p>{item.messageCenter.summary}</p>
                    </div>
                    <span
                      className={styles.del}
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      <Popconfirm
                        title={t('systemMessage.isConfirmDelete')}
                        onConfirm={e => {
                          delMessage(item?.messageCenter, e);
                        }}
                        okText={t('systemMessage.delete')}
                        cancelText={t('systemMessage.cancel')}
                      >
                        <CloseIcon />
                      </Popconfirm>
                    </span>
                  </li>
                ))}
            </ul>
          </div>
          <div className={`${styles.notice_detail_wrap}`}>
            {![3, 5].includes(selectMessageObj?.messageType) && (
              <div
                className={`${styles.notice_detail} ${
                  !messageDetail || messageDetail === '' ? styles.nd_empty : ''
                }`}
                dangerouslySetInnerHTML={{ __html: messageDetail }}
              />
            )}
            {renderSpecialMsg()}
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default NoticeModal;
