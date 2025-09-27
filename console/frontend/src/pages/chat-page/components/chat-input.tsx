import useChatStore from '@/store/chat-store';
import { type BotInfoType, type MessageListType } from '@/types/chat';
import TextArea from 'antd/es/input/TextArea';
import { ReactElement, useRef, useState } from 'react';
import newChatIcon from '@/assets/imgs/chat/new-chat.svg';
import stopIcon from '@/assets/imgs/chat/stop-icon.svg';
import delIcon from '@/assets/imgs/chat/delete-history.svg';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { clearChatList, postNewChat } from '@/services/chat';
import { message } from 'antd';
import DeleteModal from './delete-modal';
import RecorderCom, { type RecorderRef } from './recorder-com';

const ChatInput = (props: {
  handleSendMessage: (msg: string, callback?: () => void) => void;
  botInfo: BotInfoType;
  stopAnswer: () => void;
}): ReactElement => {
  const { handleSendMessage, botInfo, stopAnswer } = props;
  const { t } = useTranslation();
  const messageList = useChatStore(state => state.messageList); //  消息列表
  const streamId = useChatStore(state => state.streamId); //  流式id
  const isLoading = useChatStore(state => state.isLoading); //  是否正在加载
  const currentChatId = useChatStore(state => state.currentChatId); //  当前聊天id
  const addMessage = useChatStore(state => state.addMessage); //  添加消息
  const setMessageList = useChatStore(state => state.setMessageList); //  设置消息列表
  const setCurrentChatId = useChatStore(state => state.setCurrentChatId); //  设置当前聊天id
  const workflowOperation = useChatStore(state => state.workflowOperation); //  工作流操作
  const isWorkflowOption = useChatStore(state => state.isWorkflowOption); //  是否有工作流选项
  const workflowOption = useChatStore(state => state.workflowOption); //  工作流选项数据
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false); //  是否显示删除对话框
  const [isComposing, setIsComposing] = useState<boolean>(false); //  是否正在输入
  const [inputValue, setInputValue] = useState<string>(''); //  输入框值
  const textAreaRef = useRef<HTMLTextAreaElement>(null); //  输入框ref
  const $record = useRef<RecorderRef>(null); //  录音ref

  // 检查是否有待选择的工作流选项
  const hasWorkflowOptionsToSelect = (): boolean => {
    if (!isWorkflowOption || !workflowOperation.length) return false;

    // 检查最后一条消息是否有未选择的选项
    const lastMessage = messageList[messageList.length - 1];
    if (
      lastMessage?.reqId === 'BOT' &&
      lastMessage?.workflowEventData?.option &&
      lastMessage.workflowEventData.option.length > 0
    ) {
      // 检查是否有选项没被选中
      const hasUnselectedOptions = lastMessage.workflowEventData.option.some(
        (option: any) => !option.selected
      );
      return hasUnselectedOptions;
    }
    return false;
  };

  //全新对话
  const handleNewChat = async () => {
    if (streamId) {
      message.warning(t('chatPage.chatWindow.answering'));
      return;
    }
    if (messageList.pop()?.reqId === 'START') {
      return;
    }
    try {
      await postNewChat(currentChatId);
      const startMessage: MessageListType = {
        id: new Date().getTime(),
        reqId: 'START',
        message: '全新的开始',
        updateTime: new Date().toISOString(),
      };
      addMessage(startMessage);
    } catch (error) {
      console.error('创建新对话失败:', error);
    }
  };

  //清除对话历史点击
  const handleClearChatList = () => {
    if (isLoading || streamId) {
      message.warning(t('chatPage.chatWindow.answeringInProgress'));
      return;
    }
    setDeleteModalOpen(true);
  };

  //清除对话历史确认
  const handleClearChatListConfirm = () => {
    clearChatList(currentChatId, botInfo.botId)
      .then(res => {
        setCurrentChatId(res.id);
        setMessageList([]);
        setDeleteModalOpen(false);
      })
      .catch(() => {
        message.error(t('chatPage.chatWindow.clearChatHistoryFailed'));
      });
  };

  //发送消息
  const handleSend = () => {
    if (!inputValue.trim()) {
      return;
    }

    handleSendMessage(inputValue, () => {
      setInputValue('');
    });
  };

  //按下回车键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="pl-2.5 pr-[388px] py-6">
      <div className="w-full mx-auto max-w-[960px]">
        <div className="flex items-center relative">
          {messageList.length > 0 && (
            <div
              className="flex items-center justify-center w-auto h-8 px-2.5 border border-[#d3dbf8] rounded-2xl mb-3 cursor-pointer mr-3 bg-white text-[#333333] hover:border-[#5895f0]"
              onClick={handleNewChat}
            >
              <img src={newChatIcon} alt="" className="w-4 h-4" />
              <span className="text-sm  ml-2">
                {t('chatPage.chatWindow.newChat')}
              </span>
            </div>
          )}
          <div
            className="flex items-center justify-center w-auto h-8 px-2.5 border border-[#d3dbf8] rounded-2xl mb-3 cursor-pointer mr-3 bg-white text-[#333333] hover:border-[#5895f0]"
            onClick={handleClearChatList}
          >
            <img src={delIcon} alt="" className="w-3.5 h-3.5" />
            <span className="text-sm ml-2">
              {t('chatPage.chatWindow.clearChatHistory')}
            </span>
          </div>

          {streamId && (
            <div
              className="absolute right-2.5 flex items-center justify-center px-2 h-8 border border-[#d3dbf8] rounded-2xl mb-3 cursor-pointer bg-white text-[#333333] hover:border-[#5895f0]"
              onClick={stopAnswer}
            >
              <img src={stopIcon} alt="" className="w-4 h-4" />
              <span className="text-sm ml-2 ">
                {t('chatPage.chatWindow.stopOutput')}
              </span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'rounded-2xl min-h-[140px] bg-white border border-[#d3dbf8] pb-2.5 focus-within:border-[1.5px] focus-within:border-[#275eff]',
            {
              'opacity-50 cursor-not-allowed': hasWorkflowOptionsToSelect(),
            }
          )}
        >
          <TextArea
            placeholder={
              hasWorkflowOptionsToSelect()
                ? t('chatPage.chatWindow.selectOptionFirst')
                : t('chatPage.chatWindow.defaultPlaceholder')
            }
            autoSize={{ minRows: 3, maxRows: 3 }}
            value={inputValue}
            onKeyDown={handleKeyDown}
            onChange={e => {
              setInputValue(e.target.value);
            }}
            className="chat-input-textarea"
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            ref={textAreaRef}
            readOnly={hasWorkflowOptionsToSelect()}
            disabled={hasWorkflowOptionsToSelect()}
          />
          <div className="flex items-center justify-end">
            <RecorderCom
              ref={$record}
              disabled={hasWorkflowOptionsToSelect()}
              send={result => {
                textAreaRef?.current?.focus();
                setInputValue(prev => prev + result);
              }}
            />
            <div
              onClick={handleSend}
              className={clsx(
                'w-10 h-10 bg-no-repeat bg-center mx-4',
                inputValue.trim() !== '' && !hasWorkflowOptionsToSelect()
                  ? "!bg-[url('@/assets/imgs/chat/send-hover.svg')] cursor-pointer"
                  : "bg-[url('@/assets/imgs/chat/send.svg')] cursor-not-allowed"
              )}
            />
          </div>
        </div>
      </div>
      <DeleteModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleClearChatListConfirm}
      />
    </div>
  );
};

export default ChatInput;
