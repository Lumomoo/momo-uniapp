export type RoleType = '' | '*' | 'user';
import type { UserInfo, UserProfiles } from '@/api/user/types';

export interface UserState {
  user_id?: string;
  user_name?: string;
  avatar?: string;
  token?: string;
  user?: UserInfo | null;
  profile?: UserProfiles | null;
}

export type providerType =
  | 'weixin'
  | 'qq'
  | 'sinaweibo'
  | 'xiaomi'
  | 'apple'
  | 'univerify'
  | undefined;
