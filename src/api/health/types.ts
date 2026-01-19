export interface HealthInfoQuery {
  name?: string;
}

export interface HealthInfoItem {
  id?: number | string;
  categoryId?: number | string;
  categoryName?: string;
  name?: string;
  [key: string]: any;
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
  fiber?: number;
}

export interface HealthInfoListResponse {
  total?: number;
  rows?: HealthInfoItem[];
  code?: number;
  msg?: string;
}

export interface UserWeightGoals {
  id?: string;
  userId?: number;
  startWeight?: number;
  targetWeight?: number;
  targetDate?: string;
  currentStatus?: number;
  remark?: string;
  createTime?: string;
}

export interface UserHealthStats {
  id?: string;
  userId?: number;
  height?: number;
  weight?: number;
  bloodType?: string;
  recordDate?: string;
  remark?: string;
}

export interface HealthUserProfiles {
  id?: string;
  userId?: number;
  userName?: string;
  nickname?: string;
  avatarUrl?: string;
  gender?: number;
  birthday?: string;
  region?: string;
  bio?: string;
  remark?: string;
  userWeightGoals?: UserWeightGoals;
  userHealthStats?: UserHealthStats;
}

export interface HealthProfileResponse {
  userProfiles?: HealthUserProfiles;
}
