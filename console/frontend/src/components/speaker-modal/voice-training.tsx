import React, { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import '@/utils/record/recorder-core';
import '@/utils/record/pcm'; // 加载 pcm 编码器
import { createOnceTrainTask } from '@/services/spark-common';
import { useTranslation } from 'react-i18next';

interface VoiceTrainingProps {
  showVoiceTraining: boolean;
  changeTrainModal: () => void;
}

const VoiceTraining: React.FC<VoiceTrainingProps> = ({
  showVoiceTraining,
  changeTrainModal,
}) => {
  const [recordStatus, setRecordStatus] = useState(0);
  const [recObj, setRecObj] = useState<any>();
  const [sex, setSex] = useState<0 | 1 | 2>(2); // 0: 男生, 1: 女生, 2: 未选择
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [sampleIndex, setSampleIndex] = useState<number>(0);
  const { t } = useTranslation();

  const trainingText = [
    '雨后，空气变得格外清新，满地的水珠在阳光下闪着光，连匆匆赶路的人也慢了脚步，不自觉地深吸一口清新的空气。',
    '夜幕降临之后，城市的喧嚣渐渐平息，坐在窗前，点上一盏小灯，独自享受这份宁静，思绪也随之飘远。',
    '在市场上，各种新鲜的蔬菜和水果摆成了一排排，五彩斑斓，散发着自然的香气，吸引着过往的人们驻足选购，让人感受到生活的热闹和丰富。',
    '每当冬天来临，雪花悄然飘落，整个世界好像被披上了一层洁白的纱裙，即使寒冷，也阻挡不了人们对这冬日奇景的欣赏和喜爱。',
    '晚上，坐在窗前，听着窗外轻柔的风声，手中的茶杯散发出温暖的热气，这样的时刻，让人感到无比的平静和满足。',
    '深夜，一轮明月悬挂在天空，洒下温柔的银光，静静照亮着小镇的每个角落。人们在月光下散步，感受着夜的凉爽与宁静。',
    '在金色的阳光下，公园里的老人悠闲地喂着鸽子，孩子们在草地上追逐着风筝。每个人的脸上都洋溢着温暖的笑容，这一刻，时间仿佛放慢了脚步。',
    '金星是太阳系中最热的行星，虽然它不是离太阳最近的行星，但其大气层的密度极高，导致了严重的温室效应，使金星表面的温度能达到460摄氏度。',
    '在水下，泡泡的形状并不总是完美的圆形。由于水流和周围环境的影响，泡泡可能会变成各种形状。但在没有风和流的静水中，它们通常是圆的。',
    '火焰山脉并不是真的在燃烧，其得名是因为红色的岩石在阳光照射下显得格外鲜艳，就像是熊熊燃烧的火焰。这种自然景观展示了地球表面多样化的地质结构。',
  ];

  const switchrecordStatus = () => {
    if (recordStatus === 3) {
      message.info('音频上传中，请稍后');
      return;
    }
    if (recordStatus === 0) {
      setRecordStatus(1);
      recOpen();
    } else {
      recStop(() => {
        setRecordStatus(0);
        recObj && recObj.close();
      });
    }
  };

  const recOpen = (success?: any) => {
    recObj.open(
      function () {
        recObj.start();
        success && success();
      },
      function (msg: string, isUserNotAllow: any) {
        message.error(msg);
        console.log((isUserNotAllow ? 'UserNotAllow，' : '') + msg);
      }
    );
  };

  function recStop(callback?: any) {
    recObj.stop(
      function (
        blob: any,
        duration: any,
        originBUffers: any,
        originSampleRate: number
      ) {
        callback && callback();
        setRecordStatus(3);
        const cloneFile = new File([blob], `clone_audio.pcm`, {
          type: 'application/json',
          lastModified: Date.now(),
        });
        const formData = new FormData();
        formData.append('file', cloneFile);
        createOnceTrainTask({ sex, sampleIndex, formData })
          .then(() => {
            setRecordStatus(0);
            message.success('您已完成声音采集');
            changeTrainModal();
          })
          .catch(err => {
            setRecordStatus(0);
            console.log(err);
            message.error(err?.msg);
          });
      },
      function (msg: string) {
        setRecordStatus(0);
        message.error(msg);
        recObj.close();
      }
    );
  }

  useEffect(() => {
    const rec = (window as any).Recorder({
      type: 'pcm',
      sampleRate: 24000,
      bitRate: 16,
    });
    setRecObj(rec);
  }, []);

  const completeSexSelect = () => {
    if (sex === 2) {
      message.warning('请选择性别');
      return;
    }
    setCreateStep(2);
    setSampleIndex(Math.floor(Math.random() * 9) + 1);
  };

  //关闭弹窗
  const closeModal = () => {
    recObj?.close();
    setCreateStep(1);
    setSex(2);
    changeTrainModal();
  };

  return (
    <Modal
      open={showVoiceTraining}
      onCancel={() => {
        recObj?.close();
        changeTrainModal();
      }}
      footer={null}
      width={createStep === 1 ? 528 : 678}
      centered
      maskClosable={false}
      closeIcon={null}
      className="[&_.ant-modal-content]:p-0 [&_.ant-modal-body]:p-0"
    >
      {createStep === 1 && (
        <div className="bg-white rounded-[10px] pt-2.5">
          <div
            className="font-semibold pt-5 h-[50px] leading-[10px] text-xl text-[#43436b] bg-[url(@/assets/imgs/voicetraining/v-arrow-left.svg)] bg-[length:auto] bg-[25px_center] bg-no-repeat pl-[55px] cursor-pointer"
            onClick={closeModal}
          >
            一句话创建
          </div>
          <div className="h-auto w-full flex flex-col justify-start items-center">
            <div className="my-5 mx-auto text-xl font-medium h-[50px] text-center text-[#1b211f] leading-[50px]">
              选择性别
            </div>
            <div className="my-[30px] mx-auto h-[100px] w-[260px] flex justify-between">
              <div
                className={`w-[100px] h-[100px] rounded-full bg-[#f5f6f9] border-2 bg-center bg-[length:40%_auto] bg-no-repeat text-center leading-[250px] text-sm font-medium cursor-pointer transition-all ${
                  sex === 0
                    ? 'border-[#2a6ee9] text-[#2a6ee9] bg-[#eff4fd] bg-[url(@/assets/imgs/voicetraining/hover-m.png)]'
                    : 'border-[#f5f6f9] text-[#8691a1] bg-[url(@/assets/imgs/voicetraining/normal-m.png)] hover:border-[#2a6ee9] hover:text-[#2a6ee9] hover:bg-[#eff4fd] hover:bg-[url(@/assets/imgs/voicetraining/hover-m.png)]'
                } bg-center bg-[length:40%_auto] bg-no-repeat`}
                onClick={() => {
                  setSex(0);
                }}
              >
                男生
              </div>
              <div
                className={`w-[100px] h-[100px] rounded-full bg-[#f5f6f9] border-2 bg-center bg-[length:40%_auto] bg-no-repeat text-center leading-[250px] text-sm font-medium cursor-pointer transition-all ${
                  sex === 1
                    ? 'border-[#2a6ee9] text-[#2a6ee9] bg-[#eff4fd] bg-[url(@/assets/imgs/voicetraining/hover-f.png)]'
                    : 'border-[#f5f6f9] text-[#8691a1] bg-[url(@/assets/imgs/voicetraining/normal-f.png)] hover:border-[#2a6ee9] hover:text-[#2a6ee9] hover:bg-[#eff4fd] hover:bg-[url(@/assets/imgs/voicetraining/hover-f.png)]'
                } bg-center bg-[length:40%_auto] bg-no-repeat`}
                onClick={() => {
                  setSex(1);
                }}
              >
                女生
              </div>
            </div>
            <div
              className="mt-[60px] mb-8 bg-[#2a6ee9] w-[338px] h-[42px] rounded-[20px] text-center leading-[42px] text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
              onClick={completeSexSelect}
            >
              开始录制
            </div>
          </div>
        </div>
      )}
      {createStep === 2 && (
        <div className="bg-[url(@/assets/imgs/voicetraining/pop-bg.png)] bg-left-bottom bg-no-repeat bg-cover rounded-[10px] pt-2.5">
          <div
            className="font-semibold pt-5 h-[50px] leading-[10px] text-xl text-[#43436b] bg-[url(@/assets/imgs/voicetraining/v-arrow-left.svg)] bg-[length:auto] bg-[25px_center] bg-no-repeat pl-[55px] cursor-pointer"
            onClick={closeModal}
          >
            一句话创建
          </div>
          <div className="mt-5 w-full text-center text-lg text-[#1b211f] font-bold leading-[30px]">
            {recordStatus === 0
              ? '请朗读'
              : recordStatus === 1
                ? '录音中，请朗读'
                : recordStatus === 3
                  ? '录音质量检测中…'
                  : '请朗读'}
          </div>
          <div className="mt-2.5 py-[30px] px-[65px] w-full h-[165px] bg-white/50 font-medium text-xl text-[#28274b] leading-9">
            {trainingText[sampleIndex]}
          </div>
          <p className="mt-5 w-full leading-[30px] text-center text-[#747f8f] text-xs">
            请在安静的环境下 自然流畅地读完这段文本
          </p>
          <div className="mt-5 w-full h-[80px] flex items-center justify-center">
            <div
              className={`relative h-[60px] w-[60px] rounded-full flex items-center justify-center cursor-pointer ${
                recordStatus === 0 || recordStatus === 2
                  ? 'bg-[#597dff]'
                  : recordStatus === 1
                    ? 'bg-[#e99372]'
                    : 'bg-[#ccc] cursor-not-allowed'
              }`}
              onClick={switchrecordStatus}
            >
              {recordStatus === 1 && (
                <>
                  <div className="wave-item absolute rounded-[1000px] opacity-0 bg-[#e99372] animate-wave-1" />
                  <div className="wave-item absolute rounded-[1000px] opacity-0 bg-[#e99372] animate-wave-2" />
                  <div className="wave-item absolute rounded-[1000px] opacity-0 bg-[#e99372] animate-wave-3" />
                </>
              )}
              <div className="relative z-[100] cursor-pointer w-full h-full bg-[url(@/assets/imgs/voicetraining/mic.svg)] bg-center bg-no-repeat" />
            </div>
          </div>
          <div className="mt-2.5 pb-5 text-xs w-full text-center">
            {recordStatus === 0
              ? '点击开始录音，念出文字'
              : recordStatus === 1
                ? '点击停止录音'
                : recordStatus === 3
                  ? '录音处理中'
                  : '重新开始录制'}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VoiceTraining;
