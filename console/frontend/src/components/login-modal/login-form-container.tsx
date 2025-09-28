import { ReactElement } from 'react';
import { Form, Button, Checkbox, FormInstance, Alert, Spin } from 'antd';
import AccountLoginForm from './account-login-form';
interface LoginRequest {
  username: string;
  password: string;
}
interface LoginFormContainerProps {
  onLogin: (credentials: LoginRequest) => Promise<void>;
  form: FormInstance;
  loading?: boolean;
  error?: string | null;
  onSwitchToRegister: () => void;
}

const LoginFormContainer = ({
  onLogin,
  form,
  loading = false,
  error = null,
  onSwitchToRegister,
}: LoginFormContainerProps): ReactElement => {
  const handleLogin = async (values: {
    username: string;
    password: string;
  }): Promise<void> => {
    const credentials: LoginRequest = {
      username: values.username,
      password: values.password,
    };
    await onLogin(credentials);
  };

  return (
    <Spin spinning={loading}>
      <div className="w-[380px] h-[540px] bg-white p-[20px_32px_48px] rounded-[10px] shadow-lg">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">登录</h2>
          <p className="text-gray-600">请输入您的登录信息</p>
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

        {/* 登录表单 */}
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          className="space-y-4"
        >
          {/* 账号登录表单 */}
          <AccountLoginForm />

          {/* 协议勾选 */}
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('请同意服务协议')),
              },
            ]}
            className="mb-6"
          >
            <Checkbox className="text-sm text-gray-600">
              我已阅读并同意
              <a href="#" className="text-[#275EFF] hover:underline mx-1">
                服务协议
              </a>
              和
              <a href="#" className="text-[#275EFF] hover:underline ml-1">
                隐私政策
              </a>
            </Checkbox>
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              disabled={loading}
              className="h-12 bg-gradient-to-r from-[#275EFF] to-[#C927FF] border-none rounded-lg font-medium text-base hover:opacity-90 transition-opacity"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {/* 切换到注册 */}
        <div className="text-center mt-4">
          <span className="text-gray-600">没有账户？</span>
          <Button
            type="link"
            onClick={onSwitchToRegister}
            disabled={loading}
            className="p-0 h-auto font-normal text-[#275EFF] hover:underline"
          >
            立即注册
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default LoginFormContainer;
