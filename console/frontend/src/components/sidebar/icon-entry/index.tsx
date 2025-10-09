import React, { useEffect, useState } from 'react';
import { Tooltip, Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import documentationCenter from '@/assets/imgs/sidebar/documentation_center.svg';
import messageCenter from '@/assets/imgs/sidebar/message_center.svg';
import weChatShare from '@/assets/imgs/sidebar/we_chat_share.svg';
import joinChatGroup from '@/assets/imgs/sidebar/join-chat-group.png';
import styles from './index.module.scss';
import useUserStore from '@/store/user-store';
import { getMessageCountApi } from '@/services/notification';

interface IconEntryProps {
  onMessageClick?: () => void;
  onNotLogin?: () => void;
}

const IconEntry: React.FC<IconEntryProps> = ({
  onMessageClick,
  onNotLogin,
}) => {
  const { t } = useTranslation();
  const isLogin = useUserStore(state => state.getIsLogin());
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const getMessageCount = async () => {
    const res = await getMessageCountApi();
    setUnreadCount(res);
  };

  const handleDocumentClick = () => {
    window.open(
      'https://www.xfyun.cn/doc/spark/Agent01-%E5%B9%B3%E5%8F%B0%E4%BB%8B%E7%BB%8D.html'
    );
  };

  const handleMessageClick = () => {
    if (isLogin) {
      onMessageClick?.();
    } else {
      onNotLogin?.();
    }
  };

  // const weChatPopoverContent = (
  //   <div style={{ textAlign: 'center' }}>
  //     <img src={joinChatGroup} style={{ width: '110px' }} alt="" />
  //   </div>
  // );

  useEffect(() => {
    getMessageCount();
  }, []);

  return (
    <div
      className={`flex items-center justify-center gap-8 mt-4 ${styles.toolsIcon}`}
    >
      <Tooltip
        title={t('sidebar.documentCenter')}
        overlayClassName="black-tooltip"
      >
        <img
          onClick={handleDocumentClick}
          src={documentationCenter}
          className="w-[18px] h-[18px] cursor-pointer"
          alt=""
        />
      </Tooltip>

      <Tooltip
        title={t('sidebar.messageCenter')}
        overlayClassName="black-tooltip"
      >
        <div className="relative">
          <img
            onClick={handleMessageClick}
            src={messageCenter}
            className="w-[18px] h-[18px] cursor-pointer"
            alt=""
          />
          {unreadCount > 0 && (
            <div
              className="absolute top-[-13px] right-[-13px] w-[20px] h-[20px] bg-[#F74E43] rounded-full text-[#fff] text-xs text-center"
              style={{
                lineHeight: '20px',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </Tooltip>

      {/* <Tooltip
        title={t('sidebar.addCommunity')}
        overlayClassName="black-tooltip"
      >
        <Popover
          content={weChatPopoverContent}
          placement="right"
          title={null}
          trigger="click"
          forceRender={true}
        >
          <img
            src={weChatShare}
            className="cursor-pointer w-[18px] h-[18px]"
            alt=""
          />
        </Popover>
      </Tooltip> */}
    </div>
  );
};

export default IconEntry;
