import { ReactElement } from 'react';
import { Form, Button, Input, FormInstance, Alert, Spin } from 'antd';

interface RegisterFormContainerProps {
  onRegister: (userData: {
    username: string;
    password: string;
    nickname: string;
    avatar: string;
  }) => Promise<void>;
  form: FormInstance;
  loading?: boolean;
  error?: string | null;
  onSwitchToLogin: () => void;
}

const RegisterFormContainer = ({
  onRegister,
  form,
  loading = false,
  error = null,
  onSwitchToLogin,
}: RegisterFormContainerProps): ReactElement => {
  const handleRegister = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
    nickname: string;
  }): Promise<void> => {
    const userData = {
      username: values.username,
      password: values.password,
      nickname: values.nickname,
      avatar: '', // 默认为空，可以后续扩展头像上传功能
    };
    await onRegister(userData);
  };

  return (
    <Spin spinning={loading}>
      <div className="w-[380px] h-[540px] bg-white p-[20px_32px_48px] rounded-[10px] shadow-lg">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">注册</h2>
          <p className="text-gray-600">创建您的新账户</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
            closable
          />
        )}

        {/* 注册表单 */}
        <Form
          form={form}
          onFinish={handleRegister}
          layout="vertical"
          className="space-y-4"
        >
          {/* 用户名 */}
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>

          {/* 昵称 */}
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, message: '昵称至少2个字符' },
              { max: 50, message: '昵称最多50个字符' },
            ]}
          >
            <Input size="large" placeholder="请输入昵称" />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { max: 50, message: '密码最多50个字符' },
            ]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>

          {/* 确认密码 */}
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({
                getFieldValue,
              }): {
                validator: (_: unknown, value: string) => Promise<void>;
              } => ({
                validator(_: unknown, value: string): Promise<void> {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="请再次输入密码" />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              disabled={loading}
              className="h-12 bg-gradient-to-r from-[#275EFF] to-[#C927FF] border-none rounded-lg font-medium text-base hover:opacity-90 transition-opacity"
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        {/* 切换到登录 */}
        <div className="text-center">
          <span className="text-gray-600">已有账户？</span>
          <Button
            type="link"
            onClick={onSwitchToLogin}
            disabled={loading}
            className="p-0 h-auto font-normal text-[#275EFF] hover:underline"
          >
            立即登录
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default RegisterFormContainer;
