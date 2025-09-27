import { Form, Checkbox, Input, message, Button } from 'antd';
import React, { useState } from 'react';
import { feedback } from '@/services/common';

import dialogLike from '@/assets/imgs/chat/icon_dialog_like.png';
import dialogDislike from '@/assets/imgs/chat/icon_dialog_dislike.png';

export type feedbackType = {
  appId: string;
  botId?: string;
  flowId?: string;
  sid: string;
  reason: Array<unknown>;
  remark?: string;
  action: string;
};

const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;
//点赞的选择项
const goodOptions = ['回答准确且专业', '回答易于理解', '回答速度快'];
//点踩的选择项
const badOptions = [
  '存在涉政风险',
  '存在不安全或违法信息',
  '存在错误信息',
  '回复内容没什么帮助',
];

const Index = ({
  modalType,
  setModalVisible,
  handleActiveStyle,
  sid,
  appid,
  botId,
  isFlow = false,
}): React.ReactElement => {
  //绑定表单
  const [form] = Form.useForm();
  const [desc, setDesc] = useState('');

  //点击不同按钮展示不同的弹窗
  const showDifferentModal = (): React.ReactElement | undefined => {
    switch (modalType) {
      case 'good':
        return (
          <Form form={form}>
            <Form.Item
              name="reason"
              rules={[{ required: true, message: '至少选择一项' }]}
            >
              <CheckboxGroup options={goodOptions} />
            </Form.Item>
            <div className="mb-1.5">您为什么喜欢这条回复？不超过200字符</div>
            <Form.Item name="remark">
              <div className="relative">
                <TextArea
                  className="global-textarea"
                  style={{ height: 104 }}
                  placeholder="您为什么喜欢这条回复？不超过200字符"
                  maxLength={200}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 ant-input-limit ">
                  {desc?.length} / 200
                </div>
              </div>
            </Form.Item>
          </Form>
        );
      case 'bad':
        return (
          <Form form={form}>
            <Form.Item
              name="reason"
              rules={[{ required: true, message: '至少选择一项' }]}
            >
              <CheckboxGroup options={badOptions} />
            </Form.Item>
            <div className="mb-1.5">您认为这条回复哪里不对？不超过200字符</div>
            <Form.Item name="remark">
              <div className="relative">
                <TextArea
                  className="global-textarea"
                  style={{ height: 104 }}
                  placeholder="您认为这条回复哪里不对？不超过200字符"
                  maxLength={200}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 ant-input-limit ">
                  {desc?.length} / 200
                </div>
              </div>
            </Form.Item>
          </Form>
        );
      default:
        return;
    }
  };

  //提交表单
  const handleOk = (): void => {
    form.validateFields().then(async values => {
      let msg = '';
      const params: feedbackType = {
        appId: appid,
        [isFlow ? 'flowId' : 'botId']: botId,
        sid: sid,
        reason: values.reason,
        remark: values.remark || '',
        action: '',
      };
      if (modalType === 'good') {
        msg = '点赞成功';
        params.action = '赞';
      } else if (modalType === 'bad') {
        msg = '点踩成功';
        params.action = '踩';
      } else if (modalType === 'feedback') {
        msg = '意见反馈提交成功';
        params.action = '一般';
      }
      feedback(params).then(data => {
        setModalVisible(false);
        handleActiveStyle();
        message.success({
          content: msg,
        });
        form.resetFields();
      });
    });
  };

  return (
    <div className="mask chat-feedback text-second text-sm font-medium">
      <div className="p-6 absolute bg-[#fff] rounded-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-second font-medium text-md w-[448px]">
        <div className="flex items-center mb-7">
          <img
            src={modalType === 'good' ? dialogLike : dialogDislike}
            className="w-10 h-10"
            alt=""
          />
          <span className="ml-2.5 text-second text-lg font-medium">
            {modalType === 'good'
              ? '点赞-您的反馈将帮助我们持续进步'
              : '点踩-您的反馈将帮助我们持续进步'}
          </span>
        </div>
        <div>{showDifferentModal()}</div>
        <div className="flex flex-row-reverse gap-3 mt-7">
          <Button type="primary" className="px-6" onClick={handleOk}>
            确认
          </Button>
          <Button
            type="text"
            className="origin-btn px-6"
            onClick={() => setModalVisible(false)}
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
