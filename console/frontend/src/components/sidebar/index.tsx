import { ReactElement, useState, useEffect } from 'react';
import collapseGrayIcon from '@/assets/imgs/sidebar/collapseGray.svg';
import SidebarLogo from './sidebar-logo';
import CreateButton from './create-button';
import BottomLogin from './bottom-login';
import PersonalCenter from './personal-center';
import MenuList from './menu-list';
import IconEntry from './icon-entry';
import NoticeModal from './notice-modal';
import useUserStore from '@/store/user-store';
import { postChatList } from '@/services/chat';
import { getFavoriteList } from '@/services/agent-square';
import { PostChatItem, FavoriteEntry } from '@/types/chat';
import eventBus from '@/utils/event-bus';

interface User {
  nickname?: string;
  login?: string;
  avatar?: string;
  uid?: string;
}

interface SidebarProps {
  className?: string;

  // Logo props
  isEnterprise?: boolean;
  enterpriseLogo?: string;
  languageCode?: string;

  // Create button props
  isLogin?: boolean;
  onCreateClick?: () => void;
  onCreateAnalytics?: () => void;
  onNotLogin?: () => void;

  // Bottom login props
  user?: User;
  OrderTypeComponent?: ReactElement;

  // Icon entry props
  myMessage?: {
    total?: number;
    messages?: Array<{
      messageCenter: {
        id: number;
        title: string;
        summary: string;
        updateTime: string;
        messageType: number;
        baseId?: string;
        outLink?: string;
        coverImage?: string;
        jumpType?: number;
      };
      isRead: number;
    }>;
  };
  onDocumentClick?: () => void;
}

const Sidebar = ({
  className = '',

  // Logo props
  isEnterprise = false,
  enterpriseLogo,
  languageCode = 'zh',

  // Create button props
  onCreateClick,
  onCreateAnalytics,
  onNotLogin,

  // Bottom login props
  user,
  OrderTypeComponent,

  // Icon entry props
  myMessage,
  onDocumentClick,
}: SidebarProps): ReactElement => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPersonCenterOpen, setIsPersonCenterOpen] = useState(false);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);

  // Shared chat data state
  const [mixedChatList, setMixedChatList] = useState<PostChatItem[]>([]);
  const [favoriteBotList, setFavoriteBotList] = useState<FavoriteEntry[]>([]);

  const getIsLogin = useUserStore.getState().getIsLogin;

  // Page info for favorites
  const PAGE_SIZE = 45;
  const pageInfo = {
    searchValue: '',
    pageIndex: 1,
    pageSize: PAGE_SIZE,
    botType: '',
  };

  // Fetch chat list
  const getChatList = async () => {
    try {
      const res = await postChatList();
      setMixedChatList(res);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch favorite bot list
  const getFavoriteBotListLocal = async () => {
    try {
      const res = await getFavoriteList(pageInfo);
      setFavoriteBotList(res.pageList);
    } catch (error) {
      console.log(error);
    }
  };

  // Effect to fetch data on mount and setup event listeners
  useEffect(() => {
    getChatList();
    getFavoriteBotListLocal();

    // Setup event bus listeners for data changes
    eventBus.on('chatListChange', getChatList);
    eventBus.on('favoriteChange', getFavoriteBotListLocal);

    return () => {
      eventBus.off('chatListChange', getChatList);
      eventBus.off('favoriteChange', getFavoriteBotListLocal);
    };
  }, []);

  return (
    <div
      className={`
        relative bg-white flex flex-col flex-shrink-0 p-4 h-full
        ${
          isCollapsed
            ? 'w-[76px] items-center justify-between'
            : 'w-[232px] rounded-r-3xl'
        }
        ${className}
      `}
    >
      {/* Collapse Icon */}
      <div
        className="
          absolute -right-4 top-1/2 -translate-y-1/2 z-[997] 
          flex items-center justify-center
          w-8 h-8 bg-white rounded-full cursor-pointer
          shadow-[0px_0px_20px_0px_rgba(0,18,70,0.08)]
          hover:bg-[#275EFF] transition-colors duration-300
          group
        "
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <img
          src={collapseGrayIcon}
          alt="collapse"
          className={`
            transform rotate-180 transition-all duration-300 cursor-pointer z-[998]
            group-hover:brightness-0 group-hover:saturate-100 group-hover:invert
            ${isCollapsed ? 'rotate-[360deg]' : 'rotate-180'}
          `}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Logo Section */}
        <SidebarLogo
          isCollapsed={isCollapsed}
          isEnterprise={isEnterprise}
          enterpriseLogo={enterpriseLogo}
          languageCode={languageCode}
        />

        {/* Create Button */}
        <CreateButton
          isCollapsed={isCollapsed}
          isLogin={getIsLogin()}
          onClick={onCreateClick}
          onAnalytics={onCreateAnalytics}
          onNotLogin={onNotLogin}
        />

        <MenuList
          mixedChatList={mixedChatList}
          favoriteBotList={favoriteBotList}
          onRefreshData={() => {
            getChatList();
            getFavoriteBotListLocal();
          }}
        />

        {/* Icon Entry */}
        <IconEntry
          myMessage={myMessage}
          onDocumentClick={onDocumentClick}
          onMessageClick={() => {
            setNoticeModalVisible(true);
          }}
          onNotLogin={onNotLogin}
        />

        {/* Bottom Login */}
        <BottomLogin
          isCollapsed={isCollapsed}
          user={user}
          OrderTypeComponent={OrderTypeComponent}
          isPersonCenterOpen={isPersonCenterOpen}
          setIsPersonCenterOpen={setIsPersonCenterOpen}
        />

        <PersonalCenter
          open={isPersonCenterOpen}
          onCancel={() => {
            setIsPersonCenterOpen(false);
          }}
          mixedChatList={mixedChatList}
          favoriteBotList={favoriteBotList}
          onRefreshData={() => {
            getChatList();
            getFavoriteBotListLocal();
          }}
          onRefreshRecentData={getChatList}
          onRefreshFavoriteData={getFavoriteBotListLocal}
        />

        {/* Notice Modal */}
        <NoticeModal
          open={noticeModalVisible}
          onClose={() => {
            setNoticeModalVisible(false);
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
