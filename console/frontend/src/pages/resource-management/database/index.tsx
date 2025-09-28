import { useState, useEffect, memo, useCallback, JSX } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/store/user-store';
import databaseStore from '@/store/database-store';
import CreateDatabase from './components/create-database';
import DeleteModal from './components/delete-database';
import DatabaseGrid from './components/database-grid';
import { jumpTologin } from '@/utils/http';
import { DatabaseItem, CreateDbParams } from '@/types/database';
import { useDatabaseList } from './hooks/use-database-list';

// 数据库管理页面
const DataBase = (): JSX.Element => {
  const setDatabase = databaseStore(state => state.setDatabase); // 当前数据库
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();
  const [botDetail, setBotDetail] = useState<DatabaseItem | null>(null); // 正在删除的数据库
  const [deleteModal, setDeleteModal] = useState(false); // 删除弹窗
  const [createDatabaseOpen, setCreateDatabaseOpen] = useState(false); // 创建数据库弹窗

  // 数据库列表 hook
  const {
    dataSource,
    hasMore,
    searchValue,
    pagination,
    getList,
    createDatabaseOk,
    setSearchValue,
    setPagination,
    loader,
  } = useDatabaseList();

  // 分页或搜索值变化时调用 getList（getList 内部已经依赖了 searchValue）
  useEffect(() => {
    getList();
  }, [pagination, getList]);

  // 搜索处理函数
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchValue(e?.target?.value || '');
      setPagination({
        pageNum: 1,
        pageSize: 20,
      });
    },
    [setSearchValue, setPagination]
  );

  // 创建数据库点击处理
  const handleCreateDatabaseClick = useCallback((): void => {
    if (!user?.uid) {
      return jumpTologin();
    }
    setCreateDatabaseOpen(!createDatabaseOpen);
  }, [user?.uid, createDatabaseOpen]);

  // 数据库卡片点击处理
  const handleDatabaseClick = useCallback(
    (database: DatabaseItem): void => {
      setDatabase(database);
      navigate(`/resource/database/${database?.id}`);
    },
    [setDatabase, navigate]
  );

  // 删除点击处理
  const handleDeleteClick = useCallback(
    (database: DatabaseItem, e: React.MouseEvent): void => {
      e.stopPropagation();
      setBotDetail(database);
      setDeleteModal(true);
    },
    []
  );

  // 创建数据库成功处理
  const handleCreateDatabaseOk = useCallback(
    async (values: DatabaseItem): Promise<void> => {
      const params: CreateDbParams = {
        name: values.name,
        description: values.description,
      };
      await createDatabaseOk(params);
    },
    [createDatabaseOk]
  );

  // 删除后刷新列表
  const handleAfterDelete = useCallback((): void => {
    if (searchValue) {
      setSearchValue('');
    } else {
      getList();
    }
  }, [searchValue, setSearchValue, getList]);

  return (
    <>
      <DatabaseGrid
        dataSource={dataSource}
        hasMore={hasMore}
        loader={loader}
        onSearchChange={handleSearchChange}
        onCreateDatabaseClick={handleCreateDatabaseClick}
        onDatabaseClick={handleDatabaseClick}
        onDeleteClick={handleDeleteClick}
      />
      {createDatabaseOpen && (
        <CreateDatabase
          open={createDatabaseOpen}
          type={'add'}
          handleCancel={(): void => {
            setCreateDatabaseOpen(false);
          }}
          handleOk={handleCreateDatabaseOk}
        />
      )}
      {deleteModal && botDetail && (
        <DeleteModal
          setDeleteModal={setDeleteModal}
          currentData={botDetail}
          getDataBase={handleAfterDelete}
        />
      )}
    </>
  );
};

export default memo(DataBase);
