import React, { useState, useRef, useEffect } from 'react';
import closeIcon from '@/assets/svgs/close-speaker.svg';
import listenImg from '@/assets/svgs/listen_play.svg';
import listenStopImg from '@/assets/svgs/listen_stop.svg';
import createSpeakerIcon from '@/assets/svgs/create-speaker.svg';
import { Modal, Segmented, Popover, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '@/store/spark-store/locale-store';
import TtsModule from '../tts-module';
import VoiceTraining from './voice-training';
import { getV2CustomVCNList } from '@/services/spark-common';
const VOICE_TEXT_CN = '答你所言，懂你所问，我是你的智能体助手，很高兴认识你';
const VOICE_TEXT_EN =
  'I understand what you say and answer what you ask. I am your intelligent assistant, glad to meet you';

export interface VcnItem {
  id: number;
  name: string;
  modelManufacturer: string;
  voiceType: string;
  coverUrl: string;
  exquisite?: number; // 0: 普通, 1: 精品
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
  const [playActive, setPlayActive] = useState<any>({ vcn: '' }); // 播放中的发音人
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [currentVoiceName, setCurrentVoiceName] = useState<string>('');
  const { locale: localeNow } = useLocaleStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'official'>('official');
  const [mySpeaker, setMySpeaker] = useState<any[]>([]);
  const [editVCNId, setEditVCNId] = useState<string>(''); // 编辑的训练id
  const [editVCNName, setEditVCNName] = useState<string>(''); // 编辑的训练名称
  const [popoverVisible, setPopoverVisible] = useState<string | null>(null);
  const [showVoiceTraining, setShowVoiceTraining] = useState<boolean>(false);

  // 创建发音人点击
  const createMyVCN = () => {
    setShowVoiceTraining(true);
  };

  const updateVCNName = (e: any, item: any) => {
    console.log('Update VCN name', item);
    setEditVCNId('');
  };

  const audition = (url: string, vcnCode: string, status: string) => {
    console.log('Audition', url, vcnCode, status);
  };

  const editVCN = (e: any, item: any) => {
    setEditVCNId(item.vcnId);
    setEditVCNName(item.name);
  };

  const deleteMySpeaker = (item: any) => {
    console.log('Delete speaker', item);
  };

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

  const closeTrainModal = () => {
    setShowVoiceTraining(false);
    setIsAudioPlaying(false);
    // getMyVoicerList();
  };

  const getMyVoicerList = () => {
    getV2CustomVCNList()
      .then(res => {
        setMySpeaker(res);
      })
      .catch(err => {
        message.error(err.msg);
        console.log(err);
      });
  };

  // 精品音色
  const officialVoiceList = vcnList.filter(item => item.exquisite === 1);

  // 基础音色
  const basicVoiceList = vcnList.filter(item => item.exquisite === 0);

  // 初始化默认选中的发音人
  useEffect(() => {
    // 如果当前没有选中的发音人且vcnList有数据，自动选中第一个
    if (!botCreateActiveV.cn && vcnList.length > 0) {
      // 优先选择精品音色，如果没有精品音色则选择第一个音色
      const exquisiteList = vcnList.filter(item => item.exquisite === 1);
      const defaultVoice =
        exquisiteList.length > 0 ? exquisiteList[0] : vcnList[0];

      if (defaultVoice) {
        setBotCreateActiveV({
          cn: defaultVoice.voiceType,
        });
      }
    }
  }, [vcnList, botCreateActiveV.cn]);

  return (
    <>
      <VoiceTraining
        showVoiceTraining={showVoiceTraining}
        changeTrainModal={closeTrainModal}
      />
      <Modal
        open={showSpeakerModal && !showVoiceTraining}
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
        <Segmented
          value={activeTab}
          onChange={value => setActiveTab(value as 'basic' | 'official')}
          options={[
            { label: t('officialVoice'), value: 'official' },
            { label: t('basicVoice'), value: 'basic' },
          ]}
          block
          rootClassName="speaker-segment"
        />
        <div className="w-full flex flex-wrap justify-start h-auto gap-4 mb-3">
          {activeTab === 'official' && (
            <div className="w-full">
              <div className="w-full flex flex-wrap justify-start h-auto gap-4">
                {officialVoiceList.map((item: VcnItem) => (
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
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handlePlay(item);
                      }}
                    >
                      <img
                        className="w-3 h-auto mr-1"
                        src={
                          playActive === item.voiceType
                            ? listenStopImg
                            : listenImg
                        }
                        alt=""
                      />
                      {playActive === item.voiceType
                        ? t('playing')
                        : t('voiceTry')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="w-full">
              {/* <div className="rounded-[10px] mt-3.5 bg-[url(@/assets/svgs/my-speaker-bg.png)] bg-no-repeat bg-center bg-cover pt-[17px] pr-[17px] pb-3 pl-5">
                <div className="flex justify-between mb-3.5">
                  <span className="text-base font-bold text-[#222529]">
                    {t('mySpeaker')}
                  </span>
                  {!!mySpeaker.length && (
                    <div
                      className="flex items-center font-medium text-[#6356ea] text-sm cursor-pointer"
                      onClick={createMyVCN}
                    >
                      <img
                        src={createSpeakerIcon}
                        alt=""
                        className="w-3.5 h-3.5 mr-1"
                      />
                      {t('createSpeaker')}
                    </div>
                  )}
                </div>
                <div className="w-full flex flex-wrap justify-start h-auto gap-4 mb-3">
                  {!mySpeaker.length ? (
                    <div
                      className="-mt-3.5 -mb-3 w-full flex items-center justify-center"
                      onClick={createMyVCN}
                    >
                      <div className="w-[91px] h-[77px] mr-[5px] bg-[url(@/assets/imgs/voicetraining/no-speaker.svg)] bg-no-repeat bg-cover" />
                      <div>
                        <div className="text-sm font-medium text-[#676773] h-[27px] leading-[27px]">
                          {t('noSpeakerTip')}
                        </div>
                        <div className="flex items-center font-medium text-[#6356ea] text-sm cursor-pointer">
                          <img
                            className="w-3.5 h-3.5 mr-1"
                            src={createSpeakerIcon}
                            alt=""
                          />
                          <span>{t('createSpeaker')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    mySpeaker.map((item: any) => (
                      <div
                        className={`w-[216px] h-[50px] rounded-[10px] bg-white flex items-center justify-between px-[11px_11px_0_17px] border cursor-pointer ${
                          currentActiveV?.cn === item.vcnCode
                            ? 'border-[#6356ea] bg-[url(@/assets/svgs/choose-voice-bg.svg)] bg-no-repeat bg-center bg-cover relative before:content-[""] before:absolute before:top-[5px] before:right-[5px] before:w-[19px] before:h-[18px] before:z-[1] before:bg-[url(@/assets/svgs/choose-voice-icon.svg)] before:bg-no-repeat'
                            : 'border-[#dedede]'
                        }`}
                        key={item.vcnCode || 'unuse_' + item.vcnId}
                        onClick={() => {
                          setBotCreateActiveV({
                            cn: item.vcnCode,
                          });
                        }}
                      >
                        {editVCNId === item.vcnId ? (
                          <div className="h-[35px] w-[300px] mr-2">
                            <input
                              className="w-full h-full border border-[#5881ff] rounded-[5px] px-[5px] focus:outline-none"
                              onKeyDown={e => {
                                // 允许复制粘贴等快捷键
                                if (e.key === 'Escape') {
                                  setEditVCNId('');
                                  return;
                                }
                                // 阻止事件冒泡，防止被父组件拦截
                                e.stopPropagation();
                              }}
                              maxLength={20}
                              onChange={e => {
                                setEditVCNName(e.target.value);
                              }}
                              onClick={(e: any) => {
                                e.stopPropagation();
                              }}
                              value={editVCNName}
                            />
                          </div>
                        ) : (
                          <div
                            className="flex-1 w-0 flex items-center"
                            title={item.name}
                          >
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                              {item.name}
                            </span>
                          </div>
                        )}

                        <div className="flex">
                          {editVCNId === item.vcnId ? (
                            // 编辑模式：显示确认按钮
                            <div
                              className="text-[#597dff] text-xs select-none cursor-pointer flex items-center ml-2 hover:text-[#305af4]"
                              onClick={e => {
                                updateVCNName(e, item);
                              }}
                            >
                              <CheckOutlined />
                            </div>
                          ) : (
                            // 正常模式：显示播放、编辑、删除按钮
                            <>
                              <div
                                className="text-[#9a9dc4] text-xs select-none cursor-pointer flex items-center ml-2"
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                  audition(
                                    item.tryVCNUrl,
                                    item.vcnCode,
                                    item.status
                                  );
                                }}
                                style={{
                                  color:
                                    playActive.vcn === item?.vcnCode &&
                                    isAudioPlaying
                                      ? '#6178FF'
                                      : '#676773',
                                }}
                              >
                                <img
                                  className="w-3 h-auto mr-1"
                                  src={
                                    playActive.vcn === item?.vcnCode &&
                                    isAudioPlaying
                                      ? listenStopImg
                                      : listenImg
                                  }
                                  alt=""
                                />
                                {playActive.vcn === item?.vcnCode &&
                                isAudioPlaying
                                  ? t('playing')
                                  : t('voiceTry')}
                              </div>
                              <Popover
                                open={popoverVisible === item.vcnId}
                                onOpenChange={visible => {
                                  setPopoverVisible(
                                    visible ? item.vcnId : null
                                  );
                                }}
                                trigger="click"
                                placement="bottomRight"
                                content={
                                  <div className="flex flex-col">
                                    <div
                                      className="flex items-center cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-[#f5f5f5]"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        setPopoverVisible(null);
                                        editVCN(e, item);
                                      }}
                                    >
                                      <img
                                        className="w-3 h-3 mr-2"
                                        src="https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16906078695639865%2F%E7%BC%96%E8%BE%91%E5%A4%87%E4%BB%BD%202%402x.png"
                                        alt="edit"
                                      />
                                      <span className="text-xs text-[#676773] whitespace-nowrap">
                                        {t('edit')}
                                      </span>
                                    </div>
                                    <div
                                      className="flex items-center cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-[#f5f5f5]"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        setPopoverVisible(null);
                                        deleteMySpeaker(item);
                                      }}
                                    >
                                      <img
                                        className="w-3 h-3 mr-2"
                                        src="https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16906079081258227%2F%E5%88%A0%E9%99%A4%E5%A4%87%E4%BB%BD%202%402x.png"
                                        alt="delete"
                                      />
                                      <span className="text-xs text-[#676773] whitespace-nowrap">
                                        {t('delete')}
                                      </span>
                                    </div>
                                  </div>
                                }
                              >
                                <div
                                  className="text-[#9a9dc4] text-xs select-none cursor-pointer flex items-center ml-2"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <img
                                    className="w-3 h-auto mr-1"
                                    src="https://1024-cdn.xfyun.cn/2022_1024%2Fcms%2F16906079388745520%2F%E6%9B%B4%E5%A4%9A%E5%A4%87%E4%BB%BD%202%402x.png"
                                    alt="more"
                                  />
                                </div>
                              </Popover>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div> */}

              {/* 普通音色 */}
              {basicVoiceList.length > 0 && (
                <div className="mt-4">
                  <div className="text-base font-bold text-[#222529] mb-3.5">
                    {t('basicVoice')}
                  </div>
                  <div className="w-full flex flex-wrap justify-start h-auto gap-4">
                    {basicVoiceList.map((item: VcnItem) => (
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
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handlePlay(item);
                          }}
                        >
                          <img
                            className="w-3 h-auto mr-1"
                            src={
                              playActive === item.voiceType
                                ? listenStopImg
                                : listenImg
                            }
                            alt=""
                          />
                          {playActive === item.voiceType
                            ? t('playing')
                            : t('voiceTry')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
    </>
  );
};

export default SpeakerModal;
