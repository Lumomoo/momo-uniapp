export interface ProfileParams {
  user_id?: string;
}

export interface LoginParams {
  clientId: string;
  loginType?: string;
  grantType: string;
  tenantId: string;
  username: string;
  password: string;
  code?: string;
  uuid?: string;
}

export interface LoginByCodeParams {
  code: string;
}

export interface LoginByCodeResult {
  [key: string]: any;
}

export interface LoginResult {
  access_token: string;
  refresh_token?: string;
  expire_in: number;
  refresh_expire_in?: number;
  client_id: string;
  scope?: string;
  openid?: string;
}

export interface UserInfo {
  userId?: number;
  userName?: string;
  nickName?: string;
  avatar?: string | null;
}

export interface UserProfiles {
  nickname?: string;
  avatarUrl?: string;
}

export interface UserProfileResult {
  user?: UserInfo;
  roleGroup?: string;
  postGroup?: string;
  userProfiles?: UserProfiles;
}

export interface RegisterParams {
  clientId: string;
  loginType?: string;
  grantType: string;
  tenantId: string;
  username: string;
  password: string;
  userType?: string;
  code?: string;
  uuid?: string;
}

export interface CaptchaResult {
  captchaEnabled: boolean;
  img?: string;
  uuid?: string;
}
