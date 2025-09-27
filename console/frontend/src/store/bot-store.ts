import { create } from 'zustand';
import { BotInfo } from '@/types/chat';

//指令型智能体
interface BotStore {
  detailInfo: Partial<BotInfo>;
}

interface BotActions {
  setDetailInfo: (botInfo: Partial<BotInfo>) => void;
}

const useBotStore = create<BotStore & BotActions>(set => ({
  detailInfo: {},
  setDetailInfo: (detailInfo: Partial<BotInfo>) => set({ detailInfo }),
}));

export default useBotStore;
