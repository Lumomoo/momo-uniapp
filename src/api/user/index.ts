/**
 * 用户信息相关接口
 */
import type {
  CaptchaResult,
  LoginByCodeParams,
  LoginByCodeResult,
  LoginParams,
  LoginResult,
  ProfileParams,
  RegisterParams,
  UserProfileResult,
} from './types';
import { get, post, postEncrypt } from '@/utils/request';
import type { CommonResult } from '@/api/common/types';

enum URL {
  login = '/auth/login',
  register = '/auth/register',
  logout = '/auth/logout',
  captcha = '/auth/code',
  loginByCode = '/user/loginByCode',
  profile = '/system/user/profile',
}

export const getUserProfile = (params?: ProfileParams) => get<UserProfileResult>({ url: URL.profile, params });
/**
 * 密码登录
 */
export const login = (data: LoginParams) => postEncrypt<LoginResult>({ url: URL.login, data, custom: { auth: false } });
/**
 * 用户注册
 */
export const register = (data: RegisterParams) =>
  postEncrypt<void>({ url: URL.register, data, custom: { auth: false } });
/**
 * 获取图形验证码
 */
export const getCaptcha = () => get<CaptchaResult>({ url: URL.captcha, custom: { auth: false } });
export const loginByCode = (data: LoginByCodeParams) => post<LoginByCodeResult>({ url: URL.loginByCode, data });
export const logout = () => post<CommonResult>({ url: URL.logout });
