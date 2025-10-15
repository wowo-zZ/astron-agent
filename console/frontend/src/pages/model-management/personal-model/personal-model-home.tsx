import React, { useRef } from 'react';
import ModelManagementHeader from '../components/model-management-header';
import ModelCardList from '../components/model-card-list';
import ModelModalComponents from '../components/model-modal-components';
import { ModelProvider, useModelContext } from '../context/model-context';
import { useModelInitializer } from '../hooks/use-model-initializer';
import { useModelOperations } from '../hooks/use-model-operations';
import { useModelFilters } from '../hooks/use-model-filters';
import { useScrollbar } from '@/hooks/use-scrollbar';

// 个人模型页面内容组件
const PersonalModelContent: React.FC = () => {
  const { state } = useModelContext();
  const mainRef = useRef<HTMLDivElement>(null);
  // 使用hooks
  useModelInitializer(2); // 2表示个人模型
  const operations = useModelOperations(2);
  const filters = useModelFilters();
  const hasScrollbar = useScrollbar(mainRef, [filters.filteredModels]);
  return (
    <div className="w-full h-screen flex flex-col page-container-inner-UI">
      <div className="pr-19">
        <div className="flex-none mb-5">
          <ModelManagementHeader
            activeTab="personalModel"
            shelfOffModel={state.shelfOffModels}
            searchInput={state.searchInput}
            setSearchInput={filters.handleSearchInputChange}
            refreshModels={operations.handleQuickFilter}
            filterType={state.filterType}
            setFilterType={filters.handleFilterTypeChange}
            setShowShelfOnly={operations.handleCloseQuickFilter}
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden"
        style={hasScrollbar ? { marginRight: '-16px' } : {}}
      >
        <div className="mx-auto h-full w-full flex flex-col lg:flex-row gap-6 lg:gap-8 ">
          {/* 右侧卡片 */}
          <main
            ref={mainRef}
            className="w-full col-span-4 rounded-lg overflow-y-auto scroll-bar-UI"
            style={hasScrollbar ? { paddingRight: '10px' } : {}}
          >
            <ModelCardList
              models={filters.filteredModels}
              showCreate
              keyword={state.searchInput}
              filterType={state.filterType}
              setModels={operations.setModels}
              refreshModels={operations.refreshModels}
              showShelfOnly={state.showShelfOnly}
            />
          </main>
        </div>
      </div>

      {/* 模态框 */}
      <ModelModalComponents modelType={2} />
    </div>
  );
};

// 个人模型页面主组件（带Provider）
function PersonalModel(): React.JSX.Element {
  return (
    <ModelProvider>
      <PersonalModelContent />
    </ModelProvider>
  );
}

export default PersonalModel;
