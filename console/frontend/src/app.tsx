import { useCallback, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import LoginModal from '@/components/login-modal';
import useUserStore, { UserState } from '@/store/user-store';
import { useEnterprise } from './hooks/use-enterprise';
import { useSpaceType } from './hooks/use-space-type';

export default function App() {
  const getUserInfo = useUserStore((state: UserState) => state.getUserInfo);
  const { getJoinedEnterpriseList, getEnterpriseSpaceCount, visitEnterprise } =
    useEnterprise();
  const { getLastVisitSpace, enterpriseId, switchToPersonal, isTeamSpace } =
    useSpaceType();
  const [initDone, setInitDone] = useState<boolean>(false);

  const initSpaceInfo = useCallback(async () => {
    try {
      const pathname = window.location.pathname.replace(/\/+$/, '');
      if (pathname === '/space' && isTeamSpace()) {
        switchToPersonal({ isJump: false });
        return;
      }

      if (!sessionStorage.getItem('lastVisitSpaceDone')) {
        await getLastVisitSpace();
        sessionStorage.setItem('lastVisitSpaceDone', 'true');
      }
    } finally {
      setInitDone(true);
    }
  }, [getLastVisitSpace, isTeamSpace, switchToPersonal]);

  useEffect(() => {
    getUserInfo();
    initSpaceInfo();
    getJoinedEnterpriseList();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <LoginModal />
    </>
  );
}
