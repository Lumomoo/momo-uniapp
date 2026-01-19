import { defineStore } from 'pinia';
import type { UserState, providerType } from './types';
import { UserApi } from '@/api';
import type { LoginParams, RegisterParams } from '@/api/user/types';
import { clearToken, setToken } from '@/utils/auth';

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user_id: '',
    user_name: '',
    avatar: '',
    token: '',
    user: null,
    profile: null,
  }),
  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
  },
  actions: {
    // 设置用户的信息
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },
    // 重置用户信息
    resetInfo() {
      this.$reset();
    },
    // 获取用户信息
    async info() {
      const result = await UserApi.getUserProfile();
      const profile = result.userProfiles || null;
      const user = result.user || null;
      this.setInfo({
        user,
        profile,
        user_id: user?.userId ? String(user.userId) : this.user_id,
        user_name: profile?.nickname || user?.nickName || user?.userName || this.user_name || '',
        avatar: profile?.avatarUrl || user?.avatar || this.avatar || '',
      });
    },
    // 异步登录并存储token
    login(loginForm: LoginParams) {
      return new Promise((resolve, reject) => {
        UserApi.login(loginForm).then((res) => {
          const token = res.access_token;
          if (token) {
            setToken(token);
          }
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      });
    },
    // 异步注册账号
    register(registerForm: RegisterParams) {
      return new Promise((resolve, reject) => {
        UserApi.register(registerForm).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      });
    },
    // Logout
    async logout() {
      await UserApi.logout();
      this.resetInfo();
      clearToken();
    },
    // 小程序授权登录
    authLogin(provider: providerType = 'weixin') {
      return new Promise((resolve, reject) => {
        uni.login({
          provider,
          success: async (result: UniApp.LoginRes) => {
            if (result.code) {
              const res = await UserApi.loginByCode({ code: result.code });
              resolve(res);
            }
            else {
              reject(new Error(result.errMsg));
            }
          },
          fail: (err: any) => {
            console.error(`登录失败: ${err}`);
            reject(err);
          },
        });
      });
    },
  },
});

export default useUserStore;
