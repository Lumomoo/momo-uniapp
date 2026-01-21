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

const HEALTH_INFO_CACHE_KEY_PREFIX = 'health_info_list_cache';
const HEALTH_CATEGORY_CACHE_KEY = 'health_category_list_cache';

/**
 * 生成食物信息列表的缓存键
 */
const buildHealthInfoCacheKey = (params: HealthInfoQuery) => {
  const query = params || ({} as HealthInfoQuery);
  const normalized = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      const value = (query as Record<string, unknown>)[key];
      if (value !== undefined)
        acc[key] = value;
      return acc;
    }, {} as Record<string, unknown>);
  return `${HEALTH_INFO_CACHE_KEY_PREFIX}:${JSON.stringify(normalized)}`;
};

/**
 * 读取缓存的JSON数据
 */
const getCacheJSON = <T>(key: string) => {
  const raw = uni.getStorageSync(key);
  if (!raw)
    return null;

  try {
    return JSON.parse(raw) as T;
  }
  catch {
    return null;
  }
};

/**
 * 写入缓存的JSON数据
 */
const setCacheJSON = (key: string, value: unknown) => {
  uni.setStorageSync(key, JSON.stringify(value));
};

/**
 * 获取食物信息列表
 */
export const getHealthInfoList = async (params: HealthInfoQuery) => {
  const cacheKey = buildHealthInfoCacheKey(params);
  const cachedList = getCacheJSON<HealthInfoItem[]>(cacheKey);
  if (Array.isArray(cachedList))
    return cachedList;

  const res = await get<HealthInfoListResponse | HealthInfoItem[]>({ url: URL.list, params });
  const list = Array.isArray(res) ? res : res.rows || [];
  setCacheJSON(cacheKey, list);
  return list;
};

/**
 * 获取食物分类列表
 */
export const getHealthCategoryList = async () => {
  const cachedList = getCacheJSON<HealthCategoryItem[]>(HEALTH_CATEGORY_CACHE_KEY);
  if (Array.isArray(cachedList))
    return cachedList;

  const res = await get<HealthCategoryListResponse | HealthCategoryItem[]>({ url: URL.categoryList });
  const list = Array.isArray(res) ? res : res.rows || [];
  setCacheJSON(HEALTH_CATEGORY_CACHE_KEY, list);
  return list;
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
