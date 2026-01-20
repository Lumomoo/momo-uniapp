<template>
  <view class="template-login">
    <!--<tn-nav-bar fixed alpha customBack>-->
    <!--  <view slot="back" class="tn-custom-nav-bar__back" @tap="goBack">-->
    <!--    <text class="icon tn-icon-left" />-->
    <!--    <text class="icon tn-icon-home-capsule-fill" />-->
    <!--  </view>-->
    <!--</tn-nav-bar>-->

    <view class="login">
      <view class="login__bg login__bg--top">
        <image class="bg" src="@/static/images/tuniao/login-top2.png" mode="widthFix" />
      </view>

      <view class="login__wrapper">
        <view class="tn-margin-left tn-margin-right tn-text-bold" style="font-size: 60rpx;">
          {{ isRegister ? '注册账号' : '欢迎回来' }}
        </view>
        <view class="tn-margin tn-color-gray--disabled tn-text-lg">
          {{ isRegister ? '请完善注册信息' : '请使用账号密码登录' }}
        </view>

        <view class="login__info tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center">
          <view class="login__info__item__input tn-flex tn-flex-direction-row tn-flex-nowrap tn-flex-col-center tn-flex-row-left">
            <view class="login__info__item__input__left-icon">
              <view class="tn-icon-my" />
            </view>
            <view class="login__info__item__input__content">
              <input v-model="username" maxlength="20" placeholder-class="input-placeholder" placeholder="请输入用户名" />
            </view>
          </view>

          <view class="login__info__item__input tn-flex tn-flex-direction-row tn-flex-nowrap tn-flex-col-center tn-flex-row-left">
            <view class="login__info__item__input__left-icon">
              <view class="tn-icon-lock" />
            </view>
            <view class="login__info__item__input__content">
              <input v-model="password" type="password" placeholder-class="input-placeholder" placeholder="请输入密码" />
            </view>
          </view>

          <view
            v-if="captchaEnabled"
            class="login__info__item__input tn-flex tn-flex-direction-row tn-flex-nowrap tn-flex-col-center tn-flex-row-left"
          >
            <view class="login__info__item__input__left-icon">
              <view class="tn-icon-safe" />
            </view>
            <view class="login__info__item__input__content login__info__item__input__content--verify-code">
              <input v-model="captchaCode" placeholder-class="input-placeholder" placeholder="请输入验证码" />
            </view>
            <view class="login__info__item__input__right-captcha" @tap.stop="refreshCaptcha">
              <image class="captcha-img" :src="captchaImage" mode="heightFix" />
            </view>
          </view>

          <view
            class="login__info__item__button tn-bg-blue tn-color-white"
            hover-class="tn-hover"
            :hover-stay-time="150"
            :style="[inputStyle]"
            @tap="isRegister ? handleRegister() : handleLogin()"
          >
            {{ isRegister ? '注册' : '登录' }}
          </view>

          <view v-if="isRegister" class="login__info__item__tips">
            <view class="tn-flex tn-flex-row-between tn-padding">
              <view @tap.stop="switchMode(0)">前往登录</view>
            </view>
          </view>
          <view v-else class="login__info__item__tips">
            <view class="tn-flex tn-flex-row-between tn-padding">
              <view class="tn-padding-right" @tap.stop="switchMode(1)">账号注册</view>
              <view class="tn-padding-left tn-color-gray">忘记密码</view>
            </view>
          </view>
        </view>

        <view class="login__way tn-flex tn-flex-col-center tn-flex-row-center">
          <view class="tn-padding-sm tn-margin-xs">
            <view class="login__way__item--icon tn-flex tn-flex-row-center tn-flex-col-center tn-color-teal--dark">
              <view class="tn-icon-wechat-fill" />
            </view>
          </view>
          <view class="tn-padding-sm tn-margin-xs">
            <view class="login__way__item--icon tn-flex tn-flex-row-center tn-flex-col-center tn-color-red">
              <view class="tn-icon-sina" />
            </view>
          </view>
          <view class="tn-padding-sm tn-margin-xs">
            <view class="login__way__item--icon tn-flex tn-flex-row-center tn-flex-col-center tn-color-blue">
              <view class="tn-icon-qq" />
            </view>
          </view>
        </view>
      </view>

      <view class="login__bg login__bg--bottom">
        <image src="@/static/images/tuniao/login-bottom2.png" mode="widthFix" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { LoginParams, RegisterParams } from '@/api/user/types';
import { UserApi } from '@/api';
import { useUserStore } from '@/store';

const userStore = useUserStore();
const isRegister = ref<boolean>(false);
const username = ref<string>('');
const password = ref<string>('');
const captchaCode = ref<string>('');
const captchaUuid = ref<string>('');
const captchaImg = ref<string>('');
const captchaEnabled = ref<boolean>(true);
const clientId = '428a8310cd442757ae699df5d894f051';
const loginType = 'app';
const grantType = 'password';
const tenantId = '000000';

const inputStyle = computed<CSSProperties>(() => {
  const style = {} as CSSProperties;
  const hasCaptcha = !captchaEnabled.value || captchaCode.value;
  if (username.value && password.value && hasCaptcha) {
    style.color = '#FFFFFF';
    style.backgroundColor = '#01BEFF';
  }
  return style;
});

const captchaImage = computed<string>(() => normalizeCaptchaImage(captchaImg.value));

/**
 * 返回上一页
 */
function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.reLaunch({ url: '/pages/tab/home/index' });
}

/**
 * 切换登录/注册模式
 */
function switchMode(index: number) {
  isRegister.value = index === 1;
  captchaCode.value = '';
  refreshCaptcha();
}

/**
 * 规范化验证码图片数据
 */
function normalizeCaptchaImage(img: string) {
  if (!img)
    return '';
  if (img.startsWith('data:image'))
    return img;
  return `data:image/png;base64,${img}`;
}

/**
 * 获取图形验证码
 */
async function refreshCaptcha() {
  const res = await UserApi.getCaptcha().catch(() => {
    uni.$u.toast('获取验证码失败');
    return null;
  });
  if (!res)
    return;
  captchaEnabled.value = res.captchaEnabled;
  captchaUuid.value = res.uuid || '';
  captchaImg.value = res.img || '';
  captchaCode.value = '';
}

/**
 * 提交登录请求
 */
async function handleLogin() {
  if (!username.value) {
    uni.$u.toast('请输入用户名');
    return;
  }
  if (!password.value) {
    uni.$u.toast('请输入密码');
    return;
  }
  if (captchaEnabled.value && !captchaCode.value) {
    uni.$u.toast('请输入验证码');
    return;
  }
  const payload: LoginParams = {
    clientId,
    loginType,
    grantType,
    tenantId,
    username: username.value,
    password: password.value,
    code: captchaCode.value,
    uuid: captchaUuid.value,
  };
  const res = await userStore.login(payload).catch(() => {
    uni.$u.toast('登录失败');
    return null;
  });
  if (!res) {
    await refreshCaptcha();
    return;
  }
  await userStore.info().catch(() => {
    uni.$u.toast('获取个人信息失败');
  });
  uni.reLaunch({ url: '/pages/tab/home/index' });
}

/**
 * 提交注册请求
 */
async function handleRegister() {
  if (!username.value) {
    uni.$u.toast('请输入用户名');
    return;
  }
  if (!password.value) {
    uni.$u.toast('请输入密码');
    return;
  }
  if (captchaEnabled.value && !captchaCode.value) {
    uni.$u.toast('请输入验证码');
    return;
  }
  const payload: RegisterParams = {
    clientId,
    loginType,
    grantType,
    tenantId,
    username: username.value,
    password: password.value,
    code: captchaCode.value,
    uuid: captchaUuid.value,
  };
  const ok = await userStore.register(payload).then(() => true).catch(() => {
    uni.$u.toast('注册失败');
    return false;
  });
  if (!ok) {
    await refreshCaptcha();
    return;
  }
  uni.$u.toast('注册成功，请登录');
  isRegister.value = false;
  captchaCode.value = '';
  await refreshCaptcha();
}

onLoad(() => {
  refreshCaptcha();
});
</script>

<style lang="scss" scoped>
.template-login {
  min-height: 100vh;
}

.tn-custom-nav-bar__back {
  display: flex;
  align-items: center;
  padding-left: 20rpx;

  .icon {
    font-size: 36rpx;
    color: #303133;
  }

  .icon + .icon {
    margin-left: 12rpx;
  }
}

.login {
  position: relative;
  height: 100%;
  z-index: 1;

  &__bg {
    z-index: -1;
    position: fixed;

    &--top {
      top: 0;
      left: 0;
      right: 0;
      width: 100%;

      .bg {
        width: 750rpx;
        will-change: transform;
      }
    }

    &--bottom {
      bottom: -10rpx;
      left: 0;
      right: 0;
      width: 100%;
      margin-bottom: env(safe-area-inset-bottom);

      image {
        width: 750rpx;
        will-change: transform;
      }
    }
  }

  &__wrapper {
    margin-top: 300rpx;
    width: 100%;
  }

  &__info {
    margin: 80rpx 30rpx 10rpx 30rpx;
    padding-bottom: 0;
    border-radius: 20rpx;

    &__item {
      &__input {
        margin-top: 59rpx;
        width: 100%;
        height: 77rpx;
        border: 1rpx solid #e6e6e6;
        border-radius: 39rpx;

        &__left-icon {
          width: 10%;
          font-size: 44rpx;
          margin-left: 20rpx;
          color: #838383;
        }

        &__content {
          width: 80%;
          padding-left: 10rpx;

          &--verify-code {
            width: 56%;
          }

          input {
            font-size: 24rpx;
          }
        }

        &__right-captcha {
          width: 34%;
          margin-right: 20rpx;
          display: flex;
          justify-content: flex-end;
        }
      }

      &__button {
        margin-top: 75rpx;
        margin-bottom: 39rpx;
        width: 100%;
        height: 77rpx;
        text-align: center;
        font-size: 31rpx;
        font-weight: bold;
        line-height: 77rpx;
        letter-spacing: 1em;
        text-indent: 1em;
        border-radius: 39rpx;
        box-shadow: 1rpx 10rpx 24rpx 0rpx rgba(60, 129, 254, 0.35);
      }

      &__tips {
        margin: 30rpx 0;
        color: #aaaaaa;
      }
    }
  }

  &__way {
    margin: 0 auto;
    margin-top: 110rpx;

    &__item {
      &--icon {
        width: 85rpx;
        height: 85rpx;
        font-size: 80rpx;
        margin-bottom: 18rpx;
        position: relative;
        z-index: 1;
      }
    }
  }
}

.captcha-img {
  height: 60rpx;
  width: 160rpx;
}

::v-deep .input-placeholder {
  font-size: 24rpx;
  color: #838383;
}
</style>
