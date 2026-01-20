export interface HealthInfoQuery {
  name?: string;
  categoryId?: number | string;
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

export interface HealthCategoryItem {
  id?: number | string;
  name?: string;
  sortOrder?: number;
}

export interface HealthCategoryListResponse {
  total?: number;
  rows?: HealthCategoryItem[];
  code?: number;
  msg?: string;
}

export interface HealthMetItem {
  id?: number | string;
  name?: string;
  met?: number;
  calories?: number;
  [key: string]: any;
}

export interface HealthMetListResponse {
  total?: number;
  rows?: HealthMetItem[];
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

export interface UserActiveLog {
  id?: number | string;
  userId?: number | string;
  foodId?: number | string;
  foodName?: string;
  exerciseId?: number | string;
  activeType?: number;
  mealType?: number;
  foodAmount?: number;
  exerciseAmount?: number;
  totalCalories?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
  fiber?: number;
  remark?: string;
}

export interface HealthStatsCreatePayload {
  recordDate: string;
  weight: number;
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

export interface HealthActiveLogSummary {
  userProfiles?: HealthUserProfiles;
  userHealthStats?: UserHealthStats;
  userActiveLogs?: UserActiveLog[];
}

export interface ActiveLogCreatePayload {
  id?: number | string;
  foodId?: number;
  exerciseId?: number;
  activeType: number;
  mealType?: number;
  foodAmount?: number;
  exerciseAmount?: number;
  totalCalories?: number;
}
