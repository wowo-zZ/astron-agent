import { useState, memo, useEffect } from 'react';
import { message } from 'antd';
import { DeleteIcon } from '@/components/svg-icons';
import { useTranslation } from 'react-i18next';

import useChatStore from '@/store/chat-store';
import useChat from '@/hooks/use-chat';
import MessageList from './message-list';
import { MessageListType } from '@/types/chat';

const PromptTry = ({
  newModel,
  newPrompt,
  baseinfo,
  inputExample,
  coverUrl,
  selectSource,
  prompt,
  model,
  supportContext,
  choosedAlltool,
  showModelPk,
  showTipPk,
}: {
  newModel?: string;
  newPrompt?: string;
  baseinfo?: any;
  inputExample?: string[];
  coverUrl?: string;
  selectSource?: any;
  prompt?: string;
  model?: string;
  supportContext?: number;
  promptText?: string;
  choosedAlltool?: {
    [key: string]: boolean;
  };
  showModelPk?: number;
  showTipPk?: number;
}) => {
  const { t } = useTranslation();
  const [askValue, setAskValue] = useState(''); // 输入框值
  const isLoading = useChatStore(state => state.isLoading); //  是否正在加载
  const streamId = useChatStore(state => state.streamId); // 流式回复id
  const messageList = useChatStore(state => state.messageList); //  消息列表
  const controllerRef = useChatStore(state => state.controllerRef); //sse请求ref
  const setStreamId = useChatStore(state => state.setStreamId); // 设置流式回复id
  const setIsLoading = useChatStore(state => state.setIsLoading); // 设置是否正在加载
  const initChatStore = useChatStore(state => state.initChatStore); // 初始化聊天状态
  const [isComposing, setIsComposing] = useState<boolean>(false); // 是否正在输入

  const { fetchSSE } = useChat();

  useEffect(() => {
    stopAnswer();
    removeAll();
  }, []);

  //清除聊天记录
  const removeAll = () => {
    initChatStore();
  };

  // 按下回车键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendBtnClick();
    }
  };

  // 点击发送按钮
  const handleSendBtnClick = (text?: string) => {
    if (isLoading || streamId) {
      message.warning(t('configBase.promptTry.answerPleaseTryAgainLater'));
      return;
    }

    if (!text && askValue.trim() === '') {
      message.info(t('configBase.promptTry.pleaseEnterQuestion'));
      return;
    }

    getAnswer(text || askValue);
    setAskValue('');
  };

  // 获取答案
  const getAnswer = (question: string) => {
    let esURL = `/xingchen-api/chat-message/bot-debug`;
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      esURL = `/xingchen-api/chat-message/bot-debug`;
    } else {
      const mode = import.meta.env.VITE_MODE;
      if (mode === 'development') {
        esURL = `http://172.29.202.54:8080/chat-message/bot-debug`;
      } else {
        esURL = `http://172.29.201.92:8080/chat-message/bot-debug`;
      }
    }
    const form = new FormData();
    if (model) {
      form.append('model', newModel ? newModel : model);
    } else {
      form.append('model', newModel ? newModel : 'spark');
    }

    form.append('text', question);
    const datasetList: string[] = [];
    (selectSource || []).forEach((item: any) => {
      datasetList.push(item.id);
    });
    if (datasetList.join(',') !== '') {
      if (selectSource[0]?.tag == 'SparkDesk-RAG') {
        form.append('datasetList', JSON.stringify(datasetList.join(',')));
      } else {
        form.append('maasDatasetList', JSON.stringify(datasetList.join(',')));
      }
    }
    form.append('prompt', newPrompt ? newPrompt : prompt || '');
    form.append('multiTurn', `${supportContext}`); //是否开启多轮对话
    const arr = messageList.map((item: MessageListType) => item.message);
    if (supportContext === 1) form.append('arr', JSON.stringify(arr));

    if (choosedAlltool) {
      form.append(
        'openedTool',
        Object.keys(choosedAlltool)
          .filter((key: string) => choosedAlltool[key])
          .join(',')
      );
    }
    fetchSSE(esURL, form);
  };

  // 停止回答
  const stopAnswer = () => {
    controllerRef.abort();
    setStreamId('');
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full mx-auto flex flex-col flex-1 min-h-0 h-full overflow-hidden">
        <MessageList
          messageList={messageList}
          botInfo={baseinfo}
          coverUrl={coverUrl || ''}
          inputExample={inputExample || []}
          handleSendMessage={handleSendBtnClick}
          stopAnswer={stopAnswer}
        />

        {!showModelPk && !showTipPk && (
          <div className="relative w-full rounded-md h-[95px] flex">
            {!isLoading && !streamId && (
              <div
                className="w-[107px] h-[26px] absolute -top-[34px] left-0 bg-white border border-[#e4ebf9] rounded-[13px] flex items-center justify-center text-[12px] text-[#535875] z-[40] cursor-pointer hover:text-[#6b89ff]"
                onClick={() => {
                  removeAll();
                }}
              >
                <DeleteIcon
                  style={{ pointerEvents: 'none', marginRight: '6px' }}
                />
                {t('configBase.promptTry.clearHistory')}
              </div>
            )}
            <textarea
              className="rounded-[8px] absolute left-[2px] bottom-[2px] w-[calc(100%-4px)] leading-[25px] min-h-[95px] max-h-[180px] resize-none outline-none border border-[#d2dbe7] text-[14px] py-[10px] pr-[100px] pl-[16px] text-[#07133e] z-[32] placeholder:text-[#d0d0da]"
              placeholder={t('chatPage.chatWindow.defaultPlaceholder')}
              onKeyDown={handleKeyDown}
              value={askValue}
              onChange={e => {
                setAskValue(e.target.value);
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
            <div
              className="absolute bottom-[10px] right-[10px] w-[70px] h-[38px] rounded-[8px] text-white text-center leading-[38px] text-[14px] cursor-pointer transition-all duration-300 z-[35] hover:bg-[#257eff] hover:opacity-100"
              style={{
                background: askValue ? '#257eff' : '#8aa5e6',
                opacity: askValue ? 1 : 0.7,
              }}
              onClick={() => {
                handleSendBtnClick();
              }}
            >
              {t('configBase.promptTry.send')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PromptTry);
