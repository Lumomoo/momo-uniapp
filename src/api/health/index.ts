/**
 * 健康相关接口
 */
import type { HealthInfoItem, HealthInfoListResponse, HealthInfoQuery, HealthProfileResponse, HealthUserProfiles } from './types';
import { get } from '@/utils/request';

enum URL {
  list = '/health/info/list',
  profileByUser = '/health/profiles/user',
}

/**
 * 获取食物信息列表
 */
export const getHealthInfoList = async (params: HealthInfoQuery) => {
  const res = await get<HealthInfoListResponse | HealthInfoItem[]>({ url: URL.list, params });
  if (Array.isArray(res))
    return res;
  return res.rows || [];
};

/**
 * 获取用户健康档案
 */
export const getHealthProfileByUserId = async (userId: string | number) => {
  const res = await get<HealthProfileResponse | HealthUserProfiles>({ url: `${URL.profileByUser}/${userId}` });
  if (res && 'userWeightGoals' in res)
    return res as HealthUserProfiles;
  return (res as HealthProfileResponse)?.userProfiles || null;
};
