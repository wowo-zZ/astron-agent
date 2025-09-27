import { Modal } from 'antd';
import { ReactElement } from 'react';
import warningIcon from '@/assets/imgs/sidebar/warning.svg';
import { useTranslation } from 'react-i18next';

const DeleteModal = (props: {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}): ReactElement => {
  const { open, onCancel, onOk } = props;
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      closeIcon={null}
      wrapClassName="delete_mode"
      centered
      width={352}
      maskClosable={false}
      onOk={onOk}
      okText={t('chatPage.chatWindow.confirm')}
      cancelText={t('chatPage.chatWindow.cancel')}
    >
      <div className="text-black flex tems-center font-medium text-base">
        <img src={warningIcon} alt="" className="w-[22px] h-[22px] mr-2" />
        <span>{t('chatPage.chatWindow.confirmDeleteChat')}</span>
      </div>
    </Modal>
  );
};

export default DeleteModal;
