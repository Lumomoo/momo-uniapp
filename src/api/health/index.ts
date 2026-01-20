/**
 * 健康相关接口
 */
import type { ActiveLogCreatePayload, HealthActiveLogSummary, HealthCategoryItem, HealthCategoryListResponse, HealthInfoItem, HealthInfoListResponse, HealthInfoQuery, HealthMetItem, HealthMetListResponse, HealthProfileResponse, HealthStatsCreatePayload, HealthUserProfiles, UserHealthStats } from './types';
import { get, post, request } from '@/utils/request';

enum URL {
  list = '/health/info/list',
  profileByUser = '/health/profiles/user',
  healthStats = '/health/healthStats',
  activeLogSummary = '/health/activeLogs/user',
  activeLogs = '/health/activeLogs',
  metList = '/health/met/list',
  categoryList = '/health/category/list',
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
 * 获取食物分类列表
 */
export const getHealthCategoryList = async () => {
  const res = await get<HealthCategoryListResponse | HealthCategoryItem[]>({ url: URL.categoryList });
  if (Array.isArray(res))
    return res;
  return res.rows || [];
};

/**
 * 获取运动项目列表
 */
export const getHealthMetList = async () => {
  const res = await get<HealthMetListResponse | HealthMetItem[]>({ url: URL.metList });
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

/**
 * 获取用户近七天体重记录
 */
export const getLatest7DaysHealthStats = async (userId: string | number) => {
  const res = await get<UserHealthStats[] | { rows?: UserHealthStats[] }>({ url: `${URL.profileByUser}/${userId}/health-stats/latest-7-days` });
  if (Array.isArray(res))
    return res;
  return res?.rows || [];
};

/**
 * 新增体重记录
 */
export const createHealthStats = async (payload: HealthStatsCreatePayload) => {
  return post({ url: URL.healthStats, data: payload });
};

/**
 * 获取用户活动记录汇总
 */
export const getActiveLogSummary = async (userId: string | number, date: string) => {
  return get<HealthActiveLogSummary>({ url: `${URL.activeLogSummary}/${userId}/summary`, params: { date } });
};

/**
 * 新增活动记录
 */
export const createActiveLog = async (payload: ActiveLogCreatePayload) => {
  return post({ url: URL.activeLogs, data: payload });
};

/**
 * 更新活动记录
 */
export const updateActiveLog = async (payload: ActiveLogCreatePayload) => {
  return request({ url: URL.activeLogs, method: 'PUT', data: payload });
};
