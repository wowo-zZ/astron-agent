import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { message } from 'antd';

export default function Select({ lastSelection }) {
  const copyNodes = async () => {
    const cloneLastSelection = cloneDeep(lastSelection);
    cloneLastSelection.nodes = cloneLastSelection.nodes?.filter(
      node => node.type !== '开始节点' && node.type !== '结束节点'
    );
    try {
      await navigator.clipboard.writeText(JSON.stringify(cloneLastSelection));
      message.success('复制成功');
    } catch (err) {
      console.error('[Clipboard] 复制失败', err);
    }
  };

  return (
    <div className="fixed top-[100px] left-[50%] translate-x-[-50%] z-50 flex items-center gap-2">
      <div className="border-[#275EFF] px-4 py-2 rounded-md bg-[#fff]">
        {`已选中${lastSelection?.nodes?.length}个节点`}
      </div>
      <div
        className="px-4 py-2 rounded-md bg-[#275EFF] text-white cursor-pointer"
        onClick={() => copyNodes()}
      >
        复制
      </div>
    </div>
  );
}
