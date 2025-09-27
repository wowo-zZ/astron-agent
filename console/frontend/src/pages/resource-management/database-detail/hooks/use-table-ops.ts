import { useCallback } from 'react';
import { message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useDatabaseContext } from '../context/database-context';
import { tableList, deleteTable, copyTable } from '@/services/database';
import { DatabaseItem } from '@/types/database';

/**
 * 表格操作Hook
 */
export const useTableOps = (): {
  fetchTableList: () => Promise<void>;
  deleteTableById: (id: number) => Promise<void>;
  copyTableById: (id: number) => Promise<void>;
  handleSheetSelect: (sheet: DatabaseItem | null) => void;
} => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { state, actions } = useDatabaseContext();

  const fetchTableList = useCallback(async () => {
    if (!id) return;
    try {
      actions.setTables([], true);
      const list = await tableList({ dbId: Number(id) });
      actions.setTables(list, false);

      if (list?.length) {
        const activeItem = list.find(
          item => item.id === state.currentSheet?.id
        );
        actions.setCurrentSheet(activeItem || list[0] || null);
      }
    } catch (error) {
      actions.setTables([], false);
    }
  }, [id, actions.setTables, actions.setCurrentSheet, state.currentSheet?.id]);

  const deleteTableById = useCallback(
    async (tableId: number) => {
      Modal.confirm({
        title: t('database.confirmDeleteTable'),
        centered: true,
        onOk: async () => {
          try {
            actions.setTables(state.tables, true);
            await deleteTable({ id: tableId });
            actions.setCurrentSheet(null);
            fetchTableList();
            message.success(t('database.deleteSuccess'));
          } catch (error) {
            actions.setTables(state.tables, false);
          }
        },
      });
    },
    [
      actions.setTables,
      actions.setCurrentSheet,
      state.tables,
      fetchTableList,
      t,
    ]
  );

  const copyTableById = useCallback(
    async (tableId: number) => {
      try {
        await copyTable({ tbId: tableId });
        fetchTableList();
        message.success(t('database.copySuccess'));
      } catch (error) {
        // 复制表格失败
      }
    },
    [fetchTableList, t]
  );

  const handleSheetSelect = useCallback(
    (sheet: DatabaseItem | null) => {
      actions.setCurrentSheet(sheet);
    },
    [actions.setCurrentSheet]
  );

  return { fetchTableList, deleteTableById, copyTableById, handleSheetSelect };
};
