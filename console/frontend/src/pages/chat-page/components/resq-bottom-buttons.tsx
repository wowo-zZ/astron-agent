import { MessageListType } from '@/types/chat';
import { ReactElement, useEffect, useState } from 'react';
import { copyText } from '@/utils';
import copyIcon from '@/assets/imgs/chat/copy.svg';
import { ReactSVG } from 'react-svg';
import { Tooltip } from 'antd';
import AudioAnimate from './audio-animate';
import { useTranslation } from 'react-i18next';
import TtsModule from '@/components/tts-module';
import useChat from '@/hooks/use-chat';
import useVoicePlayStore from '@/store/voice-play-store';
import useBotInfoStore from '@/store/bot-info-store';

/**
 * 每个回复内容下面的按钮
 */
const ResqBottomButtons = ({
  message,
  isLastMessage,
}: {
  message: MessageListType;
  isLastMessage: boolean;
}): ReactElement => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 是否正在播放音频
  const { handleReAnswer } = useChat();
  const currentPlayingId = useVoicePlayStore(state => state.currentPlayingId);
  const setCurrentPlayingId = useVoicePlayStore(
    state => state.setCurrentPlayingId
  );
  const botInfo = useBotInfoStore(state => state.botInfo); //  智能体信息

  const getVoiceName = () => {
    if (botInfo?.vcnCn) {
      return botInfo?.vcnCn;
    } else {
      if (botInfo?.advancedConfig) {
        try {
          const advancedConfig = JSON.parse(botInfo?.advancedConfig);
          return advancedConfig?.textToSpeech?.vcn_cn;
        } catch (error) {
          return '';
        }
      }
    }
    return '';
  };
  // 播放按钮点击
  const handlePlayAudio = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    } else {
      setIsPlaying(true);
      setCurrentPlayingId(message.id || 0);
    }
  };

  // 监听全局播放ID，更新本地播放状态
  useEffect(() => {
    setIsPlaying(currentPlayingId === message?.id);
  }, [currentPlayingId, message?.id]);

  return (
    <div className="flex items-center ml-14 w-fit px-2 py-1 h-7">
      <TtsModule
        text={message?.reasoning + message?.message}
        language="cn"
        voiceName={getVoiceName()}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
      <Tooltip title={t('chatPage.chatBottom.reAnswer')} placement="top">
        {isLastMessage && (
          <div
            onClick={() => handleReAnswer({ requestId: message.reqId || 0 })}
            className="text-sm cursor-pointer mr-3 copy-icon"
          >
            <ReactSVG
              wrapper="span"
              src={
                'https://openres.xfyun.cn/xfyundoc/2025-08-28/ead19985-ae09-4fd0-9c05-d993ec65d7a2/1756369724570/rotate-cw.svg'
              }
            />
          </div>
        )}
      </Tooltip>
      <Tooltip title={t('chatPage.chatBottom.copy')} placement="top">
        <div
          onClick={() => copyText({ text: message.message })}
          className="text-sm cursor-pointer mr-3 copy-icon"
        >
          <ReactSVG wrapper="span" src={copyIcon} />
        </div>
      </Tooltip>
      <Tooltip
        title={
          isPlaying
            ? t('chatPage.chatBottom.stopReading')
            : t('chatPage.chatBottom.read')
        }
        placement="top"
      >
        <div
          onClick={() => handlePlayAudio()}
          className="text-sm cursor-pointer mr-3 copy-icon"
        >
          <AudioAnimate isPlaying={isPlaying} />
        </div>
      </Tooltip>
    </div>
  );
};

export default ResqBottomButtons;
