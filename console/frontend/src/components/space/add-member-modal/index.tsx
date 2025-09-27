import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  KeyboardEvent,
} from 'react';
import { Modal, message } from 'antd';
import styles from './index.module.scss';
import ButtonGroup from '@/components/button-group/button-group';
import type { ButtonConfig } from '@/components/button-group/types';

import SpaceSearch from '@/components/space/space-search';
import UserItem from './user-item';
import SelectedUserItem from './selected-user-item';
import CusCheckBox from './cus-check-box';

import emptyImg from '@/assets/imgs/space/empty.png';
import creatorImg from '@/assets/imgs/space/person-space-icon.svg';

import { searchInviteUsers, getUserLimit } from './config';
import { MEMBER_ROLE } from '@/pages/space/config';
import { patterns } from '@/utils/pattern';

interface User {
  uid: string;
  username: string;
  mobile: string;
  avatar?: string;
  status?: number; // 0：未加入，1：已加入，2：确认中 ,
  role?: string;
}

interface SelectedUser {
  uid: string;
  username: string;
  mobile: string;
  avatar?: string;
  role: string;
  status?: number;
}

interface AddMemberModalProps {
  title?: React.ReactNode;
  inviteType?: 'enterprise' | 'space';
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SelectedUser[]) => void;
  maxMembers?: number; // 最大成员数量
  initialUsers?: User[]; // 初始用户列表（用于批量导入）
}

// 验证手机号的函数
const isValidPhoneNumber = (phone: string): boolean => {
  return patterns.phoneNumber?.pattern.test(phone) ?? false;
};

// 用户信息转换函数
const transformUserInfo = (users: User[]): SelectedUser[] => {
  if (!users || users.length === 0) {
    return [];
  }

  return users.map(user => {
    const { uid, username, mobile, avatar, role, status } = user;
    return {
      uid,
      username,
      mobile,
      avatar,
      role: role || MEMBER_ROLE,
      status: status || 0,
    };
  });
};

// 搜索用户相关逻辑的 Hook
const useUserSearch = (inviteType: 'enterprise' | 'space') => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [lastSearchedValue, setLastSearchedValue] = useState<string>('');
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const searchUsers = useCallback(
    async (searchKeyword: string): Promise<void> => {
      setLoading(true);
      setLastSearchedValue(searchKeyword.trim());

      try {
        if (!searchKeyword.trim()) {
          setUserList([]);
          return;
        }

        // if (!isValidPhoneNumber(searchKeyword.trim())) {
        //   message.error(patterns.phoneNumber?.message ?? '请输入正确的手机号');
        //   return;
        // }

        const res = await searchInviteUsers(
          { username: searchKeyword },
          inviteType
        );
        const users = (res || []).map(user => ({
          ...user,
          avatar: user.avatar || creatorImg,
        }));
        setUserList(users);
      } catch (error: any) {
        message.error(error?.msg || error?.desc);
        setUserList([]);
      } finally {
        setLoading(false);
      }
    },
    [inviteType]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      const numericValue = value;
      // const numericValue = value.replace(/\D/g, '').slice(0, 11);
      setSearchValue(numericValue);

      if (numericValue === '') {
        searchUsers('');
        return;
      }

      searchUsers(numericValue);
      // if (numericValue.length === 11) {
      //   if (isValidPhoneNumber(numericValue)) {
      //   }
      // }
    },
    [searchUsers]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmedValue = searchValue.trim();
        if (!trimmedValue) {
          message.warning('请输入手机号');
          return;
        }
        searchUsers(trimmedValue);
      }
    },
    [searchValue, searchUsers]
  );

  const resetSearch = useCallback((): void => {
    setSearchValue('');
    setLastSearchedValue('');
    setUserList([]);
  }, []);

  return {
    searchValue,
    lastSearchedValue,
    userList,
    loading,
    handleSearch,
    handleKeyPress,
    resetSearch,
  };
};

// 用户选择相关逻辑的 Hook
const useUserSelection = (maxMembers: number, userList: User[]) => {
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [allChecked, setAllChecked] = useState<boolean>(false);

  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map(user => user.uid)),
    [selectedUsers]
  );

  const addableUsers = useMemo(
    () => userList.filter(user => user.status === 0),
    [userList]
  );

  const handleSelectUser = useCallback(
    (user: User, checked: boolean): void => {
      if (checked && selectedUsers.length >= maxMembers) {
        message.warning(`成员数量已达到最大值${maxMembers}`);
        return;
      }

      if (checked) {
        const transformedUsers = transformUserInfo([user]);
        const newUser = transformedUsers[0];
        if (newUser) {
          setSelectedUsers(prev => [...prev, newUser]);
        }
      } else {
        setSelectedUsers(prev => prev.filter(u => u.uid !== user.uid));
      }
    },
    [selectedUsers.length, maxMembers]
  );

  const handleSelectAll = useCallback(
    (checked: boolean): void => {
      if (checked && selectedUsers.length >= maxMembers) {
        message.warning(`成员数量已达到最大值${maxMembers}`);
        return;
      }

      if (checked) {
        const remainingSlots = maxMembers - selectedUsers.length;
        const usersToAdd = transformUserInfo(
          addableUsers.slice(0, remainingSlots)
        );

        setSelectedUsers(prev => {
          const existingIds = prev.map(u => u.uid);
          const newUsers = usersToAdd.filter(
            user => !existingIds.includes(user.uid)
          );
          return [...prev, ...newUsers];
        });
      } else {
        const addableUserIds = addableUsers.map(user => user.uid);
        setSelectedUsers(prev =>
          prev.filter(user => !addableUserIds.includes(user.uid))
        );
      }
    },
    [addableUsers, selectedUsers.length, maxMembers]
  );

  const handleRoleChange = useCallback((userId: string, role: string): void => {
    setSelectedUsers(prev =>
      prev.map(user => (user.uid === userId ? { ...user, role } : user))
    );
  }, []);

  const handleRemoveUser = useCallback((userId: string): void => {
    setSelectedUsers(prev => prev.filter(user => user.uid !== userId));
  }, []);

  const isUserSelected = useCallback(
    (userId: string): boolean => {
      const user = userList.find(u => u.uid === userId);
      return (user && user.status === 1) || selectedUserIds.has(userId);
    },
    [userList, selectedUserIds]
  );

  const isCheckboxDisabled = useCallback(
    (userId: string): boolean => {
      const isSelected = isUserSelected(userId);
      const user = userList.find(u => u.uid === userId);
      const isExisting = user && user.status !== 0;
      const reachedMaxMembers = selectedUsers.length >= maxMembers;

      return Boolean(isExisting || (!isSelected && reachedMaxMembers));
    },
    [selectedUsers.length, maxMembers, isUserSelected, userList]
  );

  const resetSelection = useCallback((): void => {
    setSelectedUsers([]);
    setAllChecked(false);
  }, []);

  // 更新全选状态
  useEffect(() => {
    const selectedIds = selectedUsers.map(user => user.uid);
    const allSelected =
      addableUsers.length > 0 &&
      addableUsers.every(user => selectedIds.includes(user.uid));
    setAllChecked(allSelected);
  }, [addableUsers, selectedUsers]);

  return {
    selectedUsers,
    allChecked,
    addableUsers,
    handleSelectUser,
    handleSelectAll,
    handleRoleChange,
    handleRemoveUser,
    isUserSelected,
    isCheckboxDisabled,
    resetSelection,
  };
};

const AddMemberModal: React.FC<AddMemberModalProps> = React.memo(
  ({
    title = '添加新成员',
    inviteType = 'enterprise',
    open,
    onClose,
    onSubmit,
    initialUsers = [],
  }) => {
    const [maxMembers, setMaxMembers] = useState<number>(48);

    const userSearch = useUserSearch(inviteType);
    const userSelection = useUserSelection(maxMembers, userSearch.userList);

    const updateMaxMembers = useCallback(async (): Promise<void> => {
      const maxNums: number = await getUserLimit(inviteType);
      setMaxMembers(maxNums);
    }, [inviteType]);

    useEffect(() => {
      if (open) {
        updateMaxMembers();
        userSearch.resetSearch();
      } else {
        userSearch.resetSearch();
        userSelection.resetSelection();
      }
    }, [open]);

    const handleSubmit = useCallback((): void => {
      if (userSelection.selectedUsers.length === 0) {
        message.warning('请至少选择一个用户');
        return;
      }
      onSubmit(userSelection.selectedUsers);
    }, [userSelection.selectedUsers, onSubmit]);

    const handleSelectAllChange = useCallback(
      (e: any): void => {
        userSelection.handleSelectAll(e);
      },
      [userSelection.handleSelectAll]
    );

    const emptyStateText = useMemo(() => {
      return !userSearch.lastSearchedValue
        ? '搜索手机号以添加新成员'
        : `未找到"${userSearch.lastSearchedValue}"相关用户`;
    }, [userSearch.lastSearchedValue]);

    const buttons: ButtonConfig[] = [
      {
        key: 'cancel',
        text: '取消',
        type: 'default',
        onClick: () => onClose(),
      },
      {
        key: 'submit',
        text: '确定',
        type: 'primary',
        disabled: userSelection.selectedUsers.length === 0,
        onClick: () => handleSubmit(),
      },
    ];

    return (
      <Modal
        title={title}
        open={open}
        onCancel={onClose}
        footer={null}
        width={820}
        className={styles.addMemberModal}
        destroyOnClose
        maskClosable={false}
        keyboard={false}
      >
        <div className={styles.modalContent}>
          {/* 左侧：用户搜索和选择 */}
          <div className={styles.leftPanel}>
            <div className={styles.searchSection}>
              <SpaceSearch
                placeholder="搜索手机号"
                value={userSearch.searchValue}
                onChange={userSearch.handleSearch}
                onKeyPress={userSearch.handleKeyPress}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.userListSection}>
              {userSearch.userList.length > 1 && (
                <div className={styles.selectAllRow}>
                  <CusCheckBox
                    checked={userSelection.allChecked}
                    onChange={handleSelectAllChange}
                    className={styles.selectAllCheckbox}
                    disabled={userSelection.addableUsers.length === 0}
                  >
                    全部
                  </CusCheckBox>
                </div>
              )}

              <div className={styles.userList}>
                {userSearch.loading ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyText}>搜索中...</span>
                  </div>
                ) : userSearch.userList.length > 0 ? (
                  userSearch.userList.map(user => (
                    <UserItem
                      key={user.uid}
                      user={user}
                      isUserSelected={userSelection.isUserSelected}
                      handleSelectUser={userSelection.handleSelectUser}
                      checkboxDisabled={userSelection.isCheckboxDisabled(
                        user.uid
                      )}
                    />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <img src={emptyImg} alt="" className={styles.emptyImage} />
                    <span className={styles.emptyText}>{emptyStateText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：已选用户和角色分配 */}
          <div className={styles.rightPanel}>
            <div className={styles.selectedInfo}>
              选定: {userSelection.selectedUsers.length}
              <span className={styles.maxValue}>（最大值{maxMembers}）</span>
            </div>

            <div className={styles.selectedUsers}>
              {userSelection.selectedUsers.map(user => (
                <SelectedUserItem
                  key={user.uid}
                  user={user}
                  handleRoleChange={userSelection.handleRoleChange}
                  handleRemoveUser={userSelection.handleRemoveUser}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <ButtonGroup buttons={buttons} size="large" />
        </div>
      </Modal>
    );
  }
);

export default AddMemberModal;
