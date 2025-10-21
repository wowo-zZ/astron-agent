import React, { useRef } from 'react';
import ModelManagementHeader from '../components/model-management-header';
import ModelCardList from '../components/model-card-list';
import ModelModalComponents from '../components/model-modal-components';
import { ModelProvider, useModelContext } from '../context/model-context';
import { useModelInitializer } from '../hooks/use-model-initializer';
import { useModelOperations } from '../hooks/use-model-operations';
import { useModelFilters } from '../hooks/use-model-filters';
import SiderContainer from '@/components/sider-container';

// 个人模型页面内容组件
const PersonalModelContent: React.FC = () => {
  const { state } = useModelContext();
  const mainRef = useRef<HTMLDivElement>(null);
  // 使用hooks
  useModelInitializer(2); // 2表示个人模型
  const operations = useModelOperations(2);
  const filters = useModelFilters();

  return (
    <div className="w-full h-screen flex flex-col">
      <SiderContainer
        topBar={
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
        }
        rightContent={
          <div className="mx-auto h-full w-full flex flex-col lg:flex-row gap-6 lg:gap-8 ">
            <main ref={mainRef} className="w-full col-span-4">
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
        }
      />

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
