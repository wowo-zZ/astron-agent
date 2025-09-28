import React, { useState } from 'react';
import { Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import styles from './upload-avatar.module.scss';

interface UploadAvatarProps {
  name: string;
  botDesc: string;
  coverUrl: string;
  setCoverUrl: (url: string) => void;
}

const UploadAvatar: React.FC<UploadAvatarProps> = ({
  name,
  botDesc,
  coverUrl,
  setCoverUrl,
}) => {
  const [fileList, setFileList] = useState<UploadFile<{ url: string }>[]>([]);

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const url = (newFileList[0] as UploadFile<{ url: string }>).response?.url;
      if (url) {
        setCoverUrl(url);
      }
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    return true;
  };

  return (
    <div className={styles.uploadContainer}>
      <Upload
        name="avatar"
        listType="picture-circle"
        className={styles.avatarUploader}
        showUploadList={false}
        action="/api/upload" // Mock upload endpoint
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="avatar" className={styles.avatar} />
        ) : (
          <div className={styles.uploadButton}>
            <div className={styles.uploadIcon}>+</div>
            <div className={styles.uploadText}>上传头像</div>
          </div>
        )}
      </Upload>
    </div>
  );
};

export default UploadAvatar;
