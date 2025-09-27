import React, { ReactElement } from 'react';
import { Form, Input } from 'antd';

interface AccountLoginFormProps {
  disabled?: boolean;
}

const AccountLoginForm = ({
  disabled = false,
}: AccountLoginFormProps): ReactElement => {
  return (
    <>
      <Form.Item
        name="username"
        label="账号"
        rules={[{ required: true, message: '请输入账号' }]}
        className="mb-4"
      >
        <Input
          placeholder="请输入账号"
          size="large"
          disabled={disabled}
          className="h-10 rounded-lg border-gray-300 focus:border-[#275EFF] focus:ring-2 focus:ring-[#275EFF]/20"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码' }]}
        className="mb-4"
      >
        <Input.Password
          placeholder="请输入密码"
          size="large"
          disabled={disabled}
          className="h-10 rounded-lg border-gray-300 focus:border-[#275EFF] focus:ring-2 focus:ring-[#275EFF]/20"
        />
      </Form.Item>
    </>
  );
};

export default AccountLoginForm;
