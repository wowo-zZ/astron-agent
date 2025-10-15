import { RefObject, memo, JSX } from 'react';
import type React from 'react';
import { DatabaseItem } from '@/types/database';
import CardItem from './card-item';
import ResourceEmpty from '../../resource-empty';
import { useTranslation } from 'react-i18next';
interface DatabaseGridProps {
  // 数据
  dataSource: DatabaseItem[];
  hasMore: boolean;
  loader: RefObject<HTMLDivElement>;

  // 创建数据库相关
  onCreateDatabaseClick: () => void;

  // 数据库操作
  onDatabaseClick: (database: DatabaseItem) => void;
  onDeleteClick: (database: DatabaseItem, e: React.MouseEvent) => void;
}

const DatabaseGrid = ({
  dataSource,
  hasMore,
  loader,
  onDatabaseClick,
  onDeleteClick,
  onCreateDatabaseClick,
}: DatabaseGridProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full pb-6 overflow-hidden page-container-inner-UI">
      <div className="flex flex-col h-full gap-6 overflow-hidden">
        {/* 网格内容区域 */}
        <div className="relative flex-1 w-full overflow-auto scroll-bar-UI">
          {dataSource?.length === 0 ? (
            <ResourceEmpty
              description={t('database.emptyDescription')}
              buttonText={t('database.createDatabase')}
              onCreate={onCreateDatabaseClick}
            />
          ) : (
            <div className="grid items-end gap-6 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3">
              {/* 数据库列表卡片 */}
              {dataSource?.map((database: DatabaseItem) => (
                <CardItem
                  key={database.id}
                  database={database}
                  onClick={onDatabaseClick}
                  onDelete={onDeleteClick}
                />
              ))}
            </div>
          )}

          {/* 无限滚动加载器 */}
          {hasMore && <div ref={loader}></div>}
        </div>
      </div>
    </div>
  );
};

export default memo(DatabaseGrid);
