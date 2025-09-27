import React, { useState, useRef } from 'react';
import { Modal, message } from 'antd';
import Cropper from 'react-easy-crop';
import { uploadBotImg } from '@/services/spark-common';
import { useSparkCommonStore } from '@/store/spark-store/spark-common';

import styles from './index.module.scss';

interface UploadBackgroundModalProps {
  visible: boolean;
  onCancel: () => void;
}

const UploadBackgroundModal: React.FC<UploadBackgroundModalProps> = ({
  visible,
  onCancel,
}) => {
  const inputRef = useRef<any>(null);
  const setCoverUrlPC = useSparkCommonStore(state => state.setBackgroundImg);
  const setCoverUrlApp = useSparkCommonStore(
    state => state.setBackgroundImgApp
  );

  const [formData, setFormData] = useState<FormData>();
  const [formDataPC, setFormDataPc] = useState<FormData>();
  const [horizontalZoom, setHorizontalZoom] = useState(1);
  const [verticalZoom, setVerticalZoom] = useState(1);
  const [horizontalCrop, setHorizontalCrop] = useState({ x: 0, y: 0 });
  const [verticalCrop, setVerticalCrop] = useState({ x: 0, y: 0 });
  const [uploadedSrc, setUploadedSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const createCroppedImage = (
    croppedAreaPixels: any,
    setFormDataCallback: (data: FormData) => void
  ) => {
    const image = new Image();
    image.src = uploadedSrc || '';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');

      ctx &&
        ctx.drawImage(
          image,
          croppedAreaPixels.x * (image.width / image.naturalWidth),
          croppedAreaPixels.y * (image.height / image.naturalHeight),
          croppedAreaPixels.width * (image.width / image.naturalWidth),
          croppedAreaPixels.height * (image.height / image.naturalHeight),
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

      canvas.toBlob(
        blob => {
          const res = new FormData();
          blob && res.append('file', blob, 'cropped-image.jpeg');
          setFormDataCallback(res);
        },
        'image/jpeg',
        1
      );
    };
  };

  const onHorizontalCropComplete = (
    _croppedArea: any,
    croppedAreaPixels: any
  ) => {
    createCroppedImage(croppedAreaPixels, setFormDataPc);
  };

  const onVerticalCropComplete = (
    _croppedArea: any,
    croppedAreaPixels: any
  ) => {
    createCroppedImage(croppedAreaPixels, setFormData);
  };

  const processFile = (file: File) => {
    const supportedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if (!supportedTypes.includes(file.type)) {
      message.warning('文件格式不支持');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('文件大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const dataUrl = reader.result as string;
      setUploadedSrc(dataUrl);
    });
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        processFile(file);
      }
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item && item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            break; // 只处理第一个文件
          }
        }
      }
    }
  };

  const H_SIZE = { width: 533, height: 300 } as const;
  const V_SIZE = { width: 225, height: 300 } as const;
  return (
    <Modal
      width={uploadedSrc ? 820 : 520}
      centered
      zIndex={1001}
      wrapClassName={styles.peizhiUploadModel}
      footer={null}
      title="上传背景图"
      open={visible}
      onCancel={async () => {
        await setUploadedSrc('');
        onCancel();
      }}
    >
      <div>
        <input
          accept="image/png,image/jpg,image/jpeg"
          ref={inputRef}
          style={{ display: 'none' }}
          type="file"
          onChange={handleChange}
        />
        {!uploadedSrc && (
          <div
            className={styles.shangchuangBg}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          />
        )}
        {uploadedSrc && (
          <>
            <div className={styles.cropperBox}>
              <div className={styles.cropperBoxItem}>
                <div className={styles.hengTip}>横屏展示</div>
                <Cropper
                  image={uploadedSrc}
                  crop={horizontalCrop}
                  zoom={horizontalZoom}
                  aspect={H_SIZE.width / H_SIZE.height}
                  onCropChange={setHorizontalCrop}
                  onCropComplete={onHorizontalCropComplete}
                  onZoomChange={setHorizontalZoom}
                  showGrid={false}
                />
              </div>
              <div className={styles.shupingHezi}>
                <div className={styles.shuTip}>竖屏展示</div>
                <Cropper
                  image={uploadedSrc}
                  crop={verticalCrop}
                  zoom={verticalZoom}
                  aspect={V_SIZE.width / V_SIZE.height}
                  onCropChange={setVerticalCrop}
                  onCropComplete={onVerticalCropComplete}
                  onZoomChange={setVerticalZoom}
                  showGrid={false}
                />
              </div>
            </div>
            <div className={styles.flexBoxTip}>
              拖动图片调整位置 / 滚动缩放图片
            </div>
          </>
        )}
      </div>
      <div>
        <div className={styles.peizhiBotton}>
          {uploadedSrc && (
            <div
              className={styles.peizhiReset}
              onClick={() => setUploadedSrc('')}
            >
              重新上传
            </div>
          )}
          <div
            onClick={async () => {
              await setUploadedSrc('');
              onCancel();
            }}
            className={styles.peizhiCancel}
          >
            取消
          </div>
          <div
            className={
              uploadedSrc && !loading
                ? styles.peizhiQueren
                : styles.disabledButton
            }
            onClick={async () => {
              if (!uploadedSrc || !formData || !formDataPC || loading) return;
              setLoading(true);
              try {
                const res = await uploadBotImg(formData as FormData);
                setTimeout(async () => {
                  const resp = await uploadBotImg(formDataPC as FormData);
                  setCoverUrlPC(resp);
                  setCoverUrlApp(res);
                  onCancel();
                  setLoading(false);
                }, 300);
              } catch (error) {
                message.error('上传失败，请重试');
              }
            }}
          >
            {loading ? '上传中...' : '确认'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default UploadBackgroundModal;
