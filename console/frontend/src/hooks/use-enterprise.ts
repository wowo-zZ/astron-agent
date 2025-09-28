import useEnterpriseStore from '@/store/enterprise-store';
import useSpaceStore from '@/store/space-store';
import { getEnterpriseJoinList } from '@/services/enterprise';
import { defaultEnterpriseAvatar } from '@/constants/config';
import { useCallback, useMemo } from 'react';
import {
  checkNeedCreateTeam,
  visitEnterprise as visitEnterpriseApi,
} from '@/services/enterprise';
import { getCorporateCount } from '@/services/space';

export const useEnterprise = (navigate?: any) => {
  const {
    joinedEnterpriseList,
    setJoinedEnterpriseList,
    setSpaceStatistics,
    spaceStatistics,
  } = useEnterpriseStore();
  const { spaceType } = useSpaceStore();

  const isTeamSpaceEmpty = useMemo(() => {
    return spaceType === 'team' && !spaceStatistics?.joined;
  }, [spaceType, spaceStatistics]);

  const checkNeedCreateTeamFn = useCallback(async () => {
    try {
      const res: any = await checkNeedCreateTeam();
      if (res > 0) {
        window.location.href = `/team/create/${res}`;
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getJoinedEnterpriseList = useCallback(
    async (cb?: any) => {
      try {
        const res = await getEnterpriseJoinList();
        const joinedList =
          res instanceof Array
            ? res.map(item => ({
                ...item,
                avatarUrl: item?.avatarUrl || defaultEnterpriseAvatar,
              }))
            : [];
        setJoinedEnterpriseList(joinedList);
        cb?.(joinedList);
      } catch (err: any) {
        cb?.([]);
        // message.error(err?.msg || err?.desc);
      }
    },
    [setJoinedEnterpriseList]
  );

  const getEnterpriseSpaceCount = useCallback(async () => {
    try {
      const res: any = await getCorporateCount();
      setSpaceStatistics(res);
    } catch (err) {
      console.log(err, 'getEnterpriseSpaceCount err');
      setSpaceStatistics({
        total: 0,
        joined: 0,
      });
    }
  }, [setSpaceStatistics]);

  const visitEnterprise = useCallback(async (enterpriseId: string) => {
    try {
      const res: any = await visitEnterpriseApi(enterpriseId);
    } catch (err) {
      console.log(err, 'visitEnterprise err');
    }
  }, []);

  const returnValues = useMemo(
    () => ({
      joinedEnterpriseList,
      getJoinedEnterpriseList,
      checkNeedCreateTeamFn,
      getEnterpriseSpaceCount,
      visitEnterprise,
      isTeamSpaceEmpty,
    }),
    [
      joinedEnterpriseList,
      getJoinedEnterpriseList,
      checkNeedCreateTeamFn,
      getEnterpriseSpaceCount,
      visitEnterprise,
      isTeamSpaceEmpty,
    ]
  );

  return returnValues;
};
