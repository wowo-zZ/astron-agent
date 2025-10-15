import React, { memo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteModal } from './components/modal-component';
import { useNavigate } from 'react-router-dom';
import { usePluginPage } from './hooks/use-plugin-page';
import CardItem from './components/card-item';
import ResourceEmpty from '../resource-empty';

const PluginPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    tools,
    getTools,
    getToolsDebounce,
    isHovered,
    setIsHovered,
    deleteModal,
    setDeleteModal,
    currentTool,
    setCurrentTool,
    searchValue,
    setSearchValue,
    handleCreatePlugin,
    handleCardClick,
    handleDeleteClick,
  } = usePluginPage();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden py-5">
      {deleteModal && (
        <DeleteModal
          currentTool={currentTool}
          setDeleteModal={setDeleteModal}
          getTools={() => {
            if (searchValue) {
              setSearchValue('');
            } else {
              getTools();
            }
          }}
        />
      )}

      <div className="w-full flex-1 overflow-scroll scroll-bar-UI">
        <div
          className="h-full mx-auto max-w-[1425px]"
          style={{
            width: '86%',
          }}
        >
          {tools.length === 0 ? (
            <ResourceEmpty
              description={
                searchValue
                  ? t('plugin.noSearchResults')
                  : t('plugin.emptyDescription')
              }
              buttonText={t('plugin.createPlugin')}
              onCreate={handleCreatePlugin}
            />
          ) : (
            <div className="grid lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-6">
              {tools.map((tool: any) => (
                <CardItem
                  key={tool.id}
                  tool={tool}
                  onCardClick={handleCardClick}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(PluginPage);
