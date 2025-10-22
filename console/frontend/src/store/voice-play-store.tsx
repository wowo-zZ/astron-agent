import { create } from 'zustand';

const useVoicePlayStore = create<{
  currentPlayingId: number | null; // 当前正在播放的消息ID
  activeVcn: {
    //当前激活的语音
    cn: string;
    en: string;
  };
  setCurrentPlayingId: (id: number | null) => void;
  setActiveVcn: (activeVcn: { cn: string; en: string }) => void;
}>(set => ({
  currentPlayingId: null,
  activeVcn: {
    cn: 'x4_lingxiaoqi',
    en: 'x4_EnUs_Luna',
  },
  setCurrentPlayingId: id => set({ currentPlayingId: id }),
  setActiveVcn: activeVcn => set({ activeVcn }),
}));

export default useVoicePlayStore;
