import { FC, useState } from 'react';
import { Input, message, Modal } from 'antd';
import styles from './index.module.scss';
// import UploadAvatar from '@/components/upload-avatar';
import useUserStore from '@/store/user-store';
import user from '@/assets/imgs/personal-center/user.svg';
import copy from '@/assets/imgs/personal-center/copy.svg';
import edit from '@/assets/imgs/personal-center/edit.svg';
import yes from '@/assets/imgs/personal-center/yes.svg';
import no from '@/assets/imgs/personal-center/no.svg';
import act from '@/assets/imgs/personal-center/act.png';
import fire from '@/assets/imgs/personal-center/fire.png';
import { copyText } from '@/utils/spark-utils';
import { uploadUserProfile } from '@/services/spark-common';
import UploadAvatar from '@/components/upload-avatar';

interface PersonalCenterProps {
  open: boolean;
  onCancel: () => void;
}

const PersonalCenterHeader: FC<{
  showInput: boolean;
  setShowInput: (showInput: boolean) => void;
}> = ({ showInput, setShowInput }) => {
  const userInfo = useUserStore((state: any) => state.user);
  const [infoName, setInfoName] = useState(userInfo.nickname || userInfo.login);
  return (
    <div className={styles.header}>
      <div>
        <UploadAvatar coverUrl={userInfo.avatar} flag={true} />
      </div>
      <div>
        <div className={styles.flexTitle}>
          {showInput ? (
            <>
              <Input
                value={infoName}
                placeholder="请输入昵称"
                showCount
                maxLength={20}
                onChange={e => {
                  setInfoName(e.target.value);
                }}
              />
              <img
                onClick={() => {
                  setShowInput(false);
                }}
                className={styles.noBotton}
                src={no}
                alt=""
              />
              <img
                onClick={() => {
                  const formData = new FormData();
                  formData.append('nickname', infoName);
                  uploadUserProfile(formData)
                    // uploadUserProfile({
                    //   nickname: infoName,
                    //   avatar: userInfo.avatar,
                    // })
                    .then(res => {
                      message.success('修改成功');
                      // 更新用户信息
                      useUserStore.setState({
                        user: {
                          ...userInfo,
                          nickname: infoName,
                        },
                      });
                      setShowInput(false);
                    })
                    .catch(err => {
                      message.error(err.msg);
                    });
                }}
                className={styles.yesBotton}
                src={yes}
                alt=""
              />
            </>
          ) : (
            <>
              <div
                title={userInfo.nickname || userInfo.login}
                className={styles.header_name}
              >
                {userInfo.nickname || userInfo.login}
              </div>
              <img
                onClick={() => {
                  setShowInput(true);
                  setInfoName(userInfo.nickname || userInfo.login);
                }}
                className={styles.editBotton}
                src={edit}
                alt=""
              />
            </>
          )}
        </div>
        <div className={styles.flexInfo}>
          <img src={user} alt="" />
          <div className={styles.uid}>UID：{userInfo?.uid}</div>
          <img
            onClick={() => {
              copyText({
                text: `${userInfo?.uid}`,
                successText: '复制成功',
              });
            }}
            className={styles.copy}
            src={copy}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

const PersonalCenter: FC<PersonalCenterProps> = ({ open, onCancel }) => {
  const [showInput, setShowInput] = useState(false);

  return (
    <Modal
      wrapClassName={styles.open_source_modal}
      width={837}
      open={open}
      centered
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      <div className={styles.modal_content}>
        <PersonalCenterHeader
          showInput={showInput}
          setShowInput={setShowInput}
        />
        {/* <div className={styles.content}>
          <div className={styles.tabs}>
            {tabs.map((item, index) => {
              return (
                <div
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                  }}
                  className={
                    activeIndex === index ? styles.tabActive : styles.tab
                  }
                >
                  {item.tab}
                </div>
              );
            })}
          </div>
          <div className={styles.contentBox}>
            <Modal
              open={deleteOpen}
              onCancel={() => setDeleteOpen(false)}
              closeIcon={null}
              wrapClassName={styles.delete_mode}
              centered
              width={352}
              maskClosable={false}
              onOk={handleDeleteChatConfirm}
            >
              <div className={styles.delete_mode_title}>
                <img
                  src={require('@/assets/imgs/sidebar/warning.svg')}
                  alt=""
                />
                <span>
                  {activeIndex === 0
                    ? '确定移除该智能体对话？'
                    : '确定移除该收藏？'}
                </span>
              </div>
            </Modal>
            {activeIndex === 0 && recentList?.length === 0 && (
              <div className={styles.emptyBox}>
                <img src={empty} alt="" />
              </div>
            )}
            {activeIndex === 0 &&
              recentList?.length > 0 &&
              recentList.map((item, index) => {
                return (
                  <div
                    onClick={() => {
                      handleToChat(item);
                    }}
                    key={index}
                    className={styles.itemBox}
                  >
                    <div className={styles.itemHead}>
                      <img
                        className={styles.headImg}
                        src={item.botAvatar}
                        alt=""
                      />
                      <div title={item.botTitle} className={styles.headTitle}>
                        {item.botTitle}
                      </div>
                    </div>
                    <div title={item.botDesc} className={styles.headDesc}>
                      {item.botDesc}
                    </div>
                    <div className={styles.itemInfo}>
                      <img className={styles.actImg} src={act} alt="" />
                      <div className={styles.actText}>
                        {item.creatorName || '@讯飞星火'}
                      </div>
                      <img className={styles.fireImg} src={fire} alt="" />
                      <div className={styles.fireText}>{item.hotNum || 0}</div>
                    </div>
                    <div
                      onClick={e => {
                        handleDeleteChat(item, e, true);
                      }}
                      className={styles.delete}
                    />
                  </div>
                );
              })}
            {activeIndex === 1 &&
              collectList?.length > 0 &&
              collectList.map((item, index) => {
                return (
                  <div
                    onClick={() => {
                      handleToChat(item.bot);
                    }}
                    key={index}
                    className={styles.itemBox}
                  >
                    <div className={styles.itemHead}>
                      <img
                        className={styles.headImg}
                        src={item.bot.avatar}
                        alt=""
                      />
                      <div
                        title={item.bot.botTitle}
                        className={styles.headTitle}
                      >
                        {item.bot.botName}
                      </div>
                    </div>
                    <div title={item.bot.botDesc} className={styles.headDesc}>
                      {item.bot.botDesc}
                    </div>
                    <div className={styles.itemInfo}>
                      <img className={styles.actImg} src={act} alt="" />
                      <div className={styles.actText}>
                        {item.bot.creatorName || '@讯飞星火'}
                      </div>
                      <img className={styles.fireImg} src={fire} alt="" />
                      <div className={styles.fireText}>
                        {item.bot.hotNum || 0}
                      </div>
                    </div>
                    <div
                      onClick={e => {
                        handleDeleteChat(item, e, false);
                      }}
                      className={styles.delete}
                    />
                  </div>
                );
              })}
            {activeIndex === 1 && collectList?.length === 0 && (
              <div className={styles.emptyBox}>
                <img src={empty} alt="" />
              </div>
            )}
          </div>
        </div> */}
      </div>
    </Modal>
  );
};

export default PersonalCenter;
