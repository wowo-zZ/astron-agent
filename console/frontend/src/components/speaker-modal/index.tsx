import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import closeIcon from '@/assets/svgs/close-speaker.svg';
import listenImg from '@/assets/svgs/listen_play.svg';
import listenStopImg from '@/assets/svgs/listen_stop.svg';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '@/store/spark-store/locale-store';
import TtsModule from '../tts-module';
const VOICE_TEXT_CN = '答你所言，懂你所问，我是你的智能体助手，很高兴认识你';
const VOICE_TEXT_EN =
  'I understand what you say and answer what you ask. I am your intelligent assistant, glad to meet you';

export interface VcnItem {
  id: number;
  name: string;
  modelManufacturer: string;
  voiceType: string;
  coverUrl: string;
}

interface SpeakerModalProps {
  vcnList: VcnItem[];
  changeSpeakerModal: (show: boolean) => void;
  botCreateCallback: (voice: { cn: string }) => void;
  botCreateActiveV: {
    cn: string;
  };
  setBotCreateActiveV: (voice: { cn: string }) => void;
  showSpeakerModal: boolean;
}

const SpeakerModal: React.FC<SpeakerModalProps> = ({
  vcnList,
  changeSpeakerModal,
  botCreateCallback,
  botCreateActiveV,
  setBotCreateActiveV,
  showSpeakerModal,
}) => {
  const { t } = useTranslation();
  const currentActiveV = botCreateActiveV;
  const [playActive, setPlayActive] = useState<string>(''); // 播放中的发音人
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVoiceName, setCurrentVoiceName] = useState<string>('');
  const { locale: localeNow } = useLocaleStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const setSpeaker = (): void => {
    botCreateCallback(botCreateActiveV);
    changeSpeakerModal(false);
  };

  /**
   * 试听音频
   * @param vcn - 发音人标识
   */
  const handlePlay = (vcn: VcnItem): void => {
    // 如果点击的是正在播放的，则停止播放
    if (playActive === vcn.voiceType && isPlaying) {
      setIsPlaying(false);
      setPlayActive('');
      setCurrentVoiceName('');
    } else {
      // 切换到新的语音：先停止当前播放
      if (isPlaying) {
        setIsPlaying(false);
      }

      // 使用 setTimeout 确保状态更新完成后再开始新的播放
      setTimeout(() => {
        setPlayActive(vcn.voiceType);
        setCurrentVoiceName(vcn.voiceType);
        setIsPlaying(true);
      }, 50);
    }
  };

  // 关闭发音人时，播放暂停
  const closeSpeakerModal = (): void => {
    // 停止播放
    setIsPlaying(false);
    setPlayActive('');
    setCurrentVoiceName('');

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setTimeout(() => {
      changeSpeakerModal(false);
    });
  };
  return (
    <Modal
      open={showSpeakerModal}
      title={t('characterVoice')}
      onCancel={closeSpeakerModal}
      width={769}
      centered
      maskClosable={false}
      closeIcon={<img src={closeIcon} alt="close" />}
      className="[&_.ant-modal-close]:rounded-full [&_.ant-modal-close]:w-[22px] [&_.ant-modal-close]:h-[22px] [&_.ant-modal-close]:mt-2 [&_.ant-modal-close]:mr-2 [&_.ant-modal-close:hover]:opacity-80 [&_.ant-modal-close:hover]:transition-opacity [&_.ant-modal-close:hover]:duration-300 [&_.ant-modal-content]:p-5 [&_.ant-modal-title]:text-black/80 [&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:items-center [&_.ant-modal-footer]:p-4"
      footer={
        <div className="flex items-center gap-3">
          <div
            className="w-20 h-9 rounded-lg bg-white text-center border border-[#e7e7f0] leading-9 text-[#676773] select-none cursor-pointer hover:opacity-90"
            onClick={closeSpeakerModal}
          >
            {t('btnCancel')}
          </div>
          <div
            className="w-20 h-9 rounded-lg bg-[#6356ea] text-center leading-9 text-white select-none cursor-pointer hover:opacity-90"
            onClick={setSpeaker}
          >
            {t('btnChoose')}
          </div>
        </div>
      }
    >
      <div className="text-[#676773] text-sm mb-[15px] mt-4">
        {t('ChineseSpeaker')}
      </div>
      <div className="w-full flex flex-wrap justify-start h-auto gap-4 mb-3">
        {vcnList.map((item: VcnItem) => (
          <div
            className={`w-[230px] h-[50px] rounded-[10px] bg-white flex items-center justify-between px-3 border cursor-pointer ${
              currentActiveV?.cn === item.voiceType
                ? 'border-[#6356ea] bg-[url(@/assets/svgs/choose-voice-bg.svg)] bg-no-repeat bg-center bg-cover relative before:content-[""] before:absolute before:top-[5px] before:right-[5px] before:w-[19px] before:h-[18px] before:z-[1] before:bg-[url(@/assets/svgs/choose-voice-icon.svg)] before:bg-no-repeat'
                : 'border-[#dedede]'
            }`}
            key={item.voiceType}
            onClick={() => {
              setBotCreateActiveV({
                cn: item.voiceType,
              });
            }}
          >
            <div className="flex items-center">
              <img
                className="w-[30px] h-[30px] mr-2 rounded-full"
                src={item.coverUrl}
                alt=""
              />
              <span
                className="inline-block w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={item.name}
              >
                {item.name}
              </span>
            </div>
            <div
              className={`text-xs select-none cursor-pointer flex items-center ${
                playActive === item.voiceType
                  ? 'text-[#6178FF]'
                  : 'text-[#676773]'
              }`}
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                handlePlay(item);
              }}
            >
              <img
                className="w-3 h-auto mr-1"
                src={playActive === item.voiceType ? listenStopImg : listenImg}
                alt=""
              />
              {playActive === item.voiceType ? t('playing') : t('voiceTry')}
            </div>
          </div>
        ))}
      </div>
      <TtsModule
        text={localeNow === 'en' ? VOICE_TEXT_EN : VOICE_TEXT_CN}
        voiceName={currentVoiceName}
        isPlaying={isPlaying}
        setIsPlaying={playing => {
          setIsPlaying(playing);
          if (!playing) {
            setPlayActive('');
            setCurrentVoiceName('');
          }
        }}
      />
    </Modal>
  );
};

export default SpeakerModal;
