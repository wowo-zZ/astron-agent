import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义收藏项类型
interface CollectItem {
  bot: {
    avatar: string;
    botTitle: string;
    botName: string;
    botDesc: string;
    creatorName: string;
    hotNum: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// 定义最近使用项类型
interface RecentItem {
  botAvatar: string;
  botTitle: string;
  botDesc: string;
  creatorName: string;
  hotNum: number;
  [key: string]: unknown;
}

// 定义用户信息类型
interface UserInfo {
  nickname: string;
  login: string;
  uid: string;
  avatar: string;
  authType?: number;
  [key: string]: unknown;
}

// 定义配置页面数据类型（基于名称推测）
interface ConfigPageData {
  [key: string]: unknown;
}

// 定义提示词节点类型（基于名称推测）
interface PromptNode {
  [key: string]: unknown;
}

// 定义提示词发布版本类型（基于名称推测）
interface PromptPublishVersion {
  [key: string]: unknown;
}

// 定义状态接口
interface SparkCommonState {
  // 背景图
  backgroundImg: string;
  backgroundImgApp: string;

  // 收藏和最近使用
  collectList: CollectItem[] | null;
  recentList: RecentItem[] | null;

  // 配置页面数据
  configPageData: ConfigPageData | null;

  // prompt工程相关
  promptNode: PromptNode | null;
  promptPublishVersion: PromptPublishVersion | null;

  // 侧边栏状态
  isCollapsed: boolean;

  // 示例相关
  inputExampleTip: string;
  inputExampleModel: string;

  // 用户信息
  userInfo: UserInfo | null;
  avatar: string | null;

  // 回答状态
  answerCompleted: boolean;
  answerLoad: boolean;

  // 发音人配置
  activeVcn: {
    cn: string;
    cnImg: string;
    en: string;
    enImg: string;
    speed: number;
    isDialect?: boolean;
  };
  vcnBgm: string;

  // 助手模式
  isBotMode: boolean;

  // 文档预览
  fileViewer: {
    fileUrl: string;
    fileName: string;
    visible: boolean;
    fileType: string;
  };

  // 弹窗状态
  myMessage: string;
  noticeModalVisible: boolean;

  // 设置状态的方法
  setBackgroundImg: (img: string) => void;
  setBackgroundImgApp: (img: string) => void;
  setCollectList: (list: CollectItem[] | null) => void;
  setRecentList: (list: RecentItem[] | null) => void;
  setConfigPageData: (data: ConfigPageData | null) => void;
  setPromptNode: (node: PromptNode | null) => void;
  setPromptPublishVersion: (version: PromptPublishVersion | null) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  setInputExampleTip: (tip: string) => void;
  setInputExampleModel: (model: string) => void;
  setUserInfo: (info: UserInfo | null) => void;
  setAvatar: (avatar: string | null) => void;
  setAnswerCompleted: (completed: boolean) => void;
  setAnswerLoad: (loading: boolean) => void;
  setActiveVcn: (vcn: SparkCommonState['activeVcn']) => void;
  setVcnBgm: (bgm: string) => void;
  setIsBotMode: (mode: boolean) => void;
  setFileViewer: (viewer: SparkCommonState['fileViewer']) => void;
  setMyMessage: (message: string) => void;
  setNoticeModalVisible: (visible: boolean) => void;
}

// 创建基础store
const createBaseStore = (): Partial<SparkCommonState> => ({
  // 背景图
  backgroundImg: '',
  backgroundImgApp: '',

  // 收藏和最近使用
  collectList: null,
  recentList: null,

  // 配置页面数据
  configPageData: null,

  // prompt工程相关
  promptNode: null,
  promptPublishVersion: null,

  // 侧边栏状态
  isCollapsed: false,

  // 示例相关
  inputExampleTip: '',
  inputExampleModel: '',

  // 用户信息
  userInfo: null,
  avatar: null,

  // 回答状态
  answerCompleted: true,
  answerLoad: false,

  // 发音人配置
  activeVcn: {
    cn: 'x4_lingxiaoqi',
    cnImg:
      'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16824985943709826%2Flxq.png',
    en: 'x4_EnUs_Luna',
    enImg:
      'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16824985943695009%2Fluna.png',
    speed: 50,
  },
  vcnBgm:
    'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16828512103618230%2Fqrshmusic5.mp3',

  // 助手模式
  isBotMode: false,

  // 文档预览
  fileViewer: {
    fileUrl: '',
    fileName: '',
    visible: false,
    fileType: '',
  },

  // 弹窗状态
  myMessage: '',
  noticeModalVisible: false,
});

// 创建带有持久化的store
export const useSparkCommonStore = create<SparkCommonState>()(
  persist(
    (set, get) => ({
      ...{
        backgroundImg: '',
        backgroundImgApp: '',
        collectList: null,
        recentList: null,
        configPageData: null,
        promptNode: null,
        promptPublishVersion: null,
        isCollapsed: false,
        inputExampleTip: '',
        inputExampleModel: '',
        userInfo: null,
        avatar: null,
        answerCompleted: true,
        answerLoad: false,
        activeVcn: {
          cn: 'x4_lingxiaoqi',
          cnImg:
            'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16824985943709826%2Flxq.png',
          en: 'x4_EnUs_Luna',
          enImg:
            'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16824985943695009%2Fluna.png',
          speed: 50,
        },
        vcnBgm:
          'https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16828512103618230%2Fqrshmusic5.mp3',
        isBotMode: false,
        fileViewer: {
          fileUrl: '',
          fileName: '',
          visible: false,
          fileType: '',
        },
        myMessage: '',
        noticeModalVisible: false,
      },
      ...createBaseStore(),

      // 设置状态的方法
      setBackgroundImg: (img: string): void => set({ backgroundImg: img }),
      setBackgroundImgApp: (img: string): void =>
        set({ backgroundImgApp: img }),
      setCollectList: (list: CollectItem[] | null): void =>
        set({ collectList: list }),
      setRecentList: (list: RecentItem[] | null): void =>
        set({ recentList: list }),
      setConfigPageData: (data: ConfigPageData | null): void =>
        set({ configPageData: data }),
      setPromptNode: (node: PromptNode | null): void =>
        set({ promptNode: node }),
      setPromptPublishVersion: (version: PromptPublishVersion | null): void =>
        set({ promptPublishVersion: version }),
      setIsCollapsed: (collapsed: boolean): void =>
        set({ isCollapsed: collapsed }),
      setInputExampleTip: (tip: string): void => set({ inputExampleTip: tip }),
      setInputExampleModel: (model: string): void =>
        set({ inputExampleModel: model }),
      setUserInfo: (info: UserInfo | null): void => set({ userInfo: info }),
      setAvatar: (avatar: string | null): void => set({ avatar: avatar }),
      setAnswerCompleted: (completed: boolean): void =>
        set({ answerCompleted: completed }),
      setAnswerLoad: (loading: boolean): void => set({ answerLoad: loading }),
      setActiveVcn: (vcn: SparkCommonState['activeVcn']): void =>
        set({ activeVcn: vcn }),
      setVcnBgm: (bgm: string): void => set({ vcnBgm: bgm }),
      setIsBotMode: (mode: boolean): void => set({ isBotMode: mode }),
      setFileViewer: (viewer: SparkCommonState['fileViewer']): void =>
        set({ fileViewer: viewer }),
      setMyMessage: (message: string): void => set({ myMessage: message }),
      setNoticeModalVisible: (visible: boolean): void =>
        set({ noticeModalVisible: visible }),
    }),
    {
      name: 'spark-common-storage', // 本地存储的键名
      // 只持久化需要的状态
      partialize: (state: SparkCommonState) => ({
        activeVcn: state.activeVcn,
        vcnBgm: state.vcnBgm,
      }),
    }
  )
);
