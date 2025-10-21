import { memo, FC, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { jumpToLogin } from '@/utils/http';
import { useRpaPage } from './hooks/use-rpa-page';
import useUserStore, { User } from '@/store/user-store';
import { ModalForm } from './components/modal-form';
import { RpaDetailFormInfo, RpaInfo } from '@/types/rpa';
import ResourceEmpty from '../resource-empty';
import SiderContainer from '@/components/sider-container';
import CardItem from './components/card-item';

// const mockRpaList: RpaInfo[] = [
//   {
//     id: 1,
//     category: 'RPA 1',
//     name: 'RPA 1',
//     assistantName: 'assistantName 1',
//     userName: '用户名1',
//     remarks:
//       'RPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarksRPA 1 remarks',
//     robotCount: 1,
//     icon: 'http://172.31.205.72:17900/astron-project/icon/user/sparkBot_7505b85b8c62449bb989e24652410792.png',
//     status: 1,
//     createTime: new Date().toISOString(),
//     updateTime: new Date().toISOString(),
//     value: '1',
//     isDeleted: 0,
//   },
//   {
//     id: 2,
//     name: 'RPA 2',
//     category: 'RPA 2',
//     assistantName: 'assistantName 2',
//     userName: '用户名1',
//     remarks: 'RPA 2 remarks',
//     robotCount: 2,
//     icon: 'http://172.31.205.72:17900/astron-project/icon/user/sparkBot_7505b85b8c62449bb989e24652410792.png',
//     status: 1,
//     createTime: new Date().toISOString(),
//     updateTime: new Date().toISOString(),
//     value: '2',
//     isDeleted: 1,
//   },
// ];

const RpaPage: FC = () => {
  const { t } = useTranslation();
  const modalFormRef = useRef<{
    showModal: (values?: RpaDetailFormInfo) => void;
  }>(null);
  const { rpas, refresh, searchValue } = useRpaPage(modalFormRef);
  const user = useUserStore(state => state.user);

  const rightContent = useMemo(
    () => (
      <div className="h-full w-full">
        {rpas.length === 0 ? (
          <ResourceEmpty
            description={
              searchValue ? t('rpa.noSearchResults') : t('rpa.emptyDescription')
            }
            buttonText={t('rpa.createRpa')}
            onCreate={() => {
              if (!user?.login && !user?.uid) {
                return jumpToLogin();
              }
              modalFormRef.current?.showModal();
            }}
          />
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-6">
            {rpas.map(rpa => (
              <CardItem
                rpa={rpa}
                key={rpa.id}
                user={user}
                refresh={refresh}
                showModal={values => modalFormRef.current?.showModal(values)}
              />
            ))}
          </div>
        )}
      </div>
    ),
    [rpas, user, searchValue, refresh, modalFormRef, t]
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <SiderContainer rightContent={rightContent} />
      <ModalForm ref={modalFormRef} refresh={refresh} />
    </div>
  );
};

export default memo(RpaPage);
