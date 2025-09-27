import { create } from 'zustand';

/** 模型对比显示模式 - 枚举类型 */
export enum ModelPkDisplayMode {
  /** 不显示模型对比 */
  NONE = 0,
  /** 显示2个模型对比 */
  TWO_MODELS = 2,
  /** 显示3个模型对比 */
  THREE_MODELS = 3,
  /** 显示4个模型对比 */
  FOUR_MODELS = 4,
}

/** 是否显示提示对比页面 */
export interface TipPkStore {
  showTipPk: boolean;
  setShowTipPk: (showTipPk: boolean) => void;
}

/** 是否显示模型对比页面 */
export interface ModelPkStore {
  /** 0: 不显示, 2: 显示2个模型, 3: 显示3个模型, 4: 显示4个模型 */
  showModelPk: ModelPkDisplayMode;
  setShowModelPk: (showModelPk: ModelPkDisplayMode) => void;
}

/** 创建提示对比状态存储 */
export const useTipPkStore = create<TipPkStore>(set => ({
  showTipPk: false,
  setShowTipPk: (showTipPk: boolean): void => set({ showTipPk }),
}));

/** 创建模型对比状态存储 */
export const useModelPkStore = create<ModelPkStore>(set => ({
  showModelPk: ModelPkDisplayMode.NONE,
  setShowModelPk: (showModelPk: ModelPkDisplayMode): void =>
    set({ showModelPk }),
}));
