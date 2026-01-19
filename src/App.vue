<script setup lang="ts">
import { mpUpdate } from '@/utils/index';
import { getToken } from '@/utils/auth';

const loginPage = '/pages/common/login/index';
const maxLoginCheckRetry = 6;
let loginCheckRetry = 0;

/**
 * 获取当前页面路径
 */
function getCurrentPagePath() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  if (!current || !current.route)
    return '';
  return current.route.startsWith('/') ? current.route : `/${current.route}`;
}

/**
 * 校验登录状态并跳转登录页
 */
function redirectToLoginIfNeeded() {
  if (getToken())
    return;
  const currentPath = getCurrentPagePath();
  if (!currentPath && loginCheckRetry < maxLoginCheckRetry) {
    loginCheckRetry += 1;
    setTimeout(() => {
      redirectToLoginIfNeeded();
    }, 50);
    return;
  }
  loginCheckRetry = 0;
  if (!currentPath || currentPath === loginPage)
    return;
  uni.reLaunch({ url: loginPage });
}

onLaunch(() => {
  console.log('应用启动');
  // #ifdef MP-WEIXIN
  mpUpdate();
  // #endif
});
onShow(() => {
  console.log('应用显示');
  redirectToLoginIfNeeded();
});
onHide(() => {
  console.log('应用隐藏');
});
</script>

<style lang="scss">
@import '../tuniao-ui/index.scss';
@import '../tuniao-ui/iconfont.css';
@import 'uview-plus/index.scss';
@import '@/static/styles/common.scss';
/* 每个页面公共css */
</style>
