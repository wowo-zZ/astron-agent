import { ReactElement, useEffect, useState } from 'react';
import { Modal, Form, message } from 'antd';
import { useLoginStore } from '@/store/login-store';
import useLogin from '@/hooks/use-login';
import LoginFormContainer from './login-form-container';
import RegisterFormContainer from './register-form-container';
import styles from './index.module.scss';

interface LoginModalProps {
  onLogin?: (_credentials: { username: string; password: string }) => void;
  onCancel?: () => void;
}

const LoginModal = ({ onLogin, onCancel }: LoginModalProps): ReactElement => {
  const { isLoginModalVisible, hideLoginModal } = useLoginStore();
  const { loading, error, login } = useLogin();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [form] = Form.useForm();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
  }, []);

  // 当弹窗显示时重置表单
  useEffect(() => {
    if (isLoginModalVisible) {
      form.resetFields();

      // 检查并添加bd_vid到URL参数
      const bdVid = sessionStorage.getItem('bd_vid');
      if (bdVid) {
        const searchParams: URLSearchParams = new URLSearchParams(
          window.location.search
        );
        if (!searchParams.has('bd_vid')) {
          searchParams.set('bd_vid', bdVid);
          const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
          window.history.pushState({}, '', newUrl);
        }
      }
    }
  }, [isLoginModalVisible, form]);
  const handleRegister = async (userData: {
    username: string;
    password: string;
    nickname: string;
    avatar: string;
  }): Promise<void> => {
    try {
      // TODO: 改成和RPA相同的用户体系
      // const response = await register(userData);
      // if (response.code === 0) {
      //   // 注册成功
      //   message.success('注册成功，请登录');
      //   // 注册成功后切换到登录模式
      //   setIsRegisterMode(false);
      //   form.resetFields();
      // } else {
      //   message.error(response.message || '注册失败');
      // }
    } catch (err) {
      message.error('注册失败，请检查网络连接');
    }
  };

  const toggleMode = (): void => {
    setIsRegisterMode(!isRegisterMode);
    form.resetFields();
  };

  const handleCancel = (): void => {
    hideLoginModal?.();
    form.resetFields();
    setIsRegisterMode(false);
    onCancel?.();
  };

  const handleLogin = async (_credentials: {
    username: string;
    password: string;
  }): Promise<void> => {
    try {
      // TODO: 改成和RPA相同的用户体系
      // const response = await login(_credentials);
      // if (response.code === 0) {
      //   // 登录成功
      //   message.success('登录成功');
      //   // 由于 useLogin 已经自动存储了 token，这里不需要手动存储
      //   // 调用父组件的 onLogin 回调
      //   onLogin?.(_credentials);
      //   hideLoginModal();
      //   form.resetFields();
      // } else {
      //   message.error(response.message || '登录失败');
      // }
    } catch (error) {
      message.error('登录失败，请检查网络连接');
    }
  };

  if (!isLoginModalVisible) {
    return <></>;
  }

  return (
    <Modal
      open={isLoginModalVisible}
      width={isMobile ? 340 : 1120}
      centered
      footer={null}
      maskClosable={false}
      onCancel={handleCancel}
      className={`${styles.loginModal} [&_.ant-modal-content]:!rounded-[18px]`}
      styles={{
        body: { padding: 0 },
      }}
    >
      {/* 主容器 */}
      <div
        className={`
        relative flex
        ${isMobile ? 'justify-center mx-4 mt-3' : 'flex-row-reverse'}
      `}
      >
        {/* 登录/注册表单容器 */}
        {isRegisterMode ? (
          <RegisterFormContainer
            onRegister={handleRegister}
            form={form}
            loading={loading}
            error={error}
            onSwitchToLogin={toggleMode}
          />
        ) : (
          <LoginFormContainer
            onLogin={handleLogin}
            form={form}
            loading={loading}
            error={error}
            onSwitchToRegister={toggleMode}
          />
        )}
      </div>
    </Modal>
  );
};

export default LoginModal;
