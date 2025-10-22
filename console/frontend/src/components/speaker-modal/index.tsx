import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import closeIcon from '@/assets/svgs/close-speaker.svg';
import listenImg from '@/assets/svgs/listen_play.svg';
import listenStopImg from '@/assets/svgs/listen_stop.svg';
import { Modal, Popover } from 'antd';
import { vcnCnJson, vcnCnJsonEn, vcnEnJson, vcnOther } from './vcn';
import { ReactSVG } from 'react-svg';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '@/store/spark-store/locale-store';

interface VoiceConfig {
  cn: string;
  en: string;
}

interface VcnItem {
  id: number;
  name: string;
  vcn: string;
  imgUrl: string;
  audioUrl: string;
  style?: string;
  wsUrl?: string;
  preText?: string;
  isDialect?: boolean;
  en_name?: string;
  mode?: number;
  type?: string;
}

interface SpeakerModalProps {
  changeSpeakerModal: (show: boolean) => void;
  botCreateCallback: (voice: VoiceConfig) => void;
  botCreateActiveV: VoiceConfig;
  setBotCreateActiveV: (voice: VoiceConfig) => void;
  showSpeakerModal: boolean;
}

const SpeakerModal: React.FC<SpeakerModalProps> = ({
  changeSpeakerModal,
  botCreateCallback,
  botCreateActiveV,
  setBotCreateActiveV,
  showSpeakerModal,
}) => {
  const { t } = useTranslation();
  const currentActiveV = botCreateActiveV;
  const [vcnDisplay, setVcnDisplay] = useState<VcnItem[]>([]);
  const [playActive, setPlayActive] = useState<string>(''); // 播放中的发音人
  const { locale: localeNow } = useLocaleStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (localeNow === 'en') {
      setVcnDisplay(vcnCnJsonEn);
    } else {
      setVcnDisplay(vcnCnJson);
    }
  }, [localeNow]);

  const setSpeaker = (): void => {
    botCreateCallback(botCreateActiveV);
    changeSpeakerModal(false);
  };

  /**
   * 试听音频
   * @param url - 音频URL
   * @param vcn - 发音人标识
   */
  const audition = (url: string, vcn: string): void => {
    if (playActive === vcn) {
      // 正在播放中，暂停当前的内容
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayActive('');
      return;
    }
    if (playActive) {
      // 先暂停当前播放
      setPlayActive('');
    }
    // 播放
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setTimeout(() => {
        setPlayActive(vcn);
      }, 100);
    }
  };

  // 关闭发音人时，播放暂停
  const closeSpeakerModal = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayActive('');
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
      <audio src="" ref={audioRef} onEnded={() => setPlayActive('')} />
      <div className="text-[#676773] text-sm mb-[15px] mt-4">
        {t('ChineseSpeaker')}
      </div>
      <div className="w-full flex flex-wrap justify-start h-auto gap-4 mb-3">
        {vcnDisplay.map((item: VcnItem) => (
          <div
            className={`w-[230px] h-[50px] rounded-[10px] bg-white flex items-center justify-between px-3 border cursor-pointer ${
              currentActiveV?.cn === item.vcn
                ? 'border-[#6356ea] bg-[url(@/assets/svgs/choose-voice-bg.svg)] bg-no-repeat bg-center bg-cover relative before:content-[""] before:absolute before:top-[5px] before:right-[5px] before:w-[19px] before:h-[18px] before:z-[1] before:bg-[url(@/assets/svgs/choose-voice-icon.svg)] before:bg-no-repeat'
                : 'border-[#dedede]'
            }`}
            key={item.vcn}
            onClick={() => {
              setBotCreateActiveV({
                ...botCreateActiveV,
                cn: item.vcn,
              });
            }}
          >
            <div className="flex items-center">
              <img
                className="w-[30px] h-[30px] mr-2 rounded-full"
                src={item.imgUrl}
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
                playActive === item.vcn ? 'text-[#6178FF]' : 'text-[#676773]'
              }`}
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                audition(item.audioUrl, item.vcn);
              }}
            >
              <img
                className="w-3 h-auto mr-1"
                src={playActive === item.vcn ? listenStopImg : listenImg}
                alt=""
              />
              {playActive === item.vcn ? t('playing') : t('voiceTry')}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[#676773] text-sm mb-[15px] mt-4">
        {t('EnglishSpeaker')}
      </div>
      <div className="w-full flex flex-wrap justify-start h-auto gap-4 mb-3">
        {vcnEnJson.map((item: VcnItem) => (
          <div
            key={item.vcn}
            className={`w-[230px] h-[50px] rounded-[10px] bg-white flex items-center justify-between px-3 border cursor-pointer ${
              currentActiveV?.en === item.vcn
                ? 'border-[#6356ea] bg-[url(@/assets/svgs/choose-voice-bg.svg)] bg-no-repeat bg-center bg-cover relative before:content-[""] before:absolute before:top-[5px] before:right-[5px] before:w-[19px] before:h-[18px] before:z-[1] before:bg-[url(@/assets/svgs/choose-voice-icon.svg)] before:bg-no-repeat'
                : 'border-[#dedede]'
            }`}
            onClick={() => {
              setBotCreateActiveV({
                ...botCreateActiveV,
                en: item.vcn,
              });
            }}
          >
            <div className="flex items-center">
              <img
                className="w-[30px] h-[30px] mr-2 rounded-full"
                src={item.imgUrl}
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
                playActive === item.vcn ? 'text-[#6178FF]' : 'text-[#676773]'
              }`}
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                audition(item.audioUrl, item.vcn);
              }}
            >
              <img
                className="w-3 h-auto mr-1"
                src={playActive === item.vcn ? listenStopImg : listenImg}
                alt=""
              />
              {playActive === item.vcn ? t('playing') : t('voiceTry')}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[#676773] text-sm mb-[15px] mt-4">
        {t('MultilingualSpeaker')}
        <Popover
          color="#626366"
          overlayClassName="spearker-modal-type-tip-pop"
          title={null}
          content={t('MultilingualTip')}
        >
          <div className="inline-block ml-2.5">
            <ReactSVG
              src="https://openres.xfyun.cn/xfyundoc/2024-07-10/e8398ed7-f019-419a-8004-41824306c41e/1720598757573/aaaaa.svg"
              wrapper="span"
              className="relative top-0.5 left-0 [&>span]:mr-0"
            />
          </div>
        </Popover>
      </div>

      <div className="w-full flex flex-wrap justify-start h-auto gap-4 mb-3">
        {vcnOther.map((item: VcnItem) => (
          <div
            key={item.vcn}
            className="w-[230px] h-[50px] rounded-[10px] bg-white flex items-center justify-between px-3 border border-[#dedede] cursor-pointer"
          >
            <div className="flex items-center">
              <img
                className="w-[30px] h-[30px] mr-2 rounded-full"
                src={item.imgUrl}
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
                playActive === item.vcn ? 'text-[#6178FF]' : 'text-[#676773]'
              }`}
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                audition(item.audioUrl, item.vcn);
              }}
            >
              <img
                className="w-3 h-auto mr-1"
                src={playActive === item.vcn ? listenStopImg : listenImg}
                alt=""
              />
              {playActive === item.vcn ? t('playing') : t('voiceTry')}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default SpeakerModal;
