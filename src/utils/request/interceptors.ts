import type {
  HttpError,
  HttpRequestAbstract,
  HttpRequestConfig,
  HttpResponse,
} from 'uview-plus/libs/luch-request/index';
import { showMessage } from './status';
import { TokenPrefix, clearToken, getToken } from '@/utils/auth';
import storage from '@/utils/storage';
import useUserStore from '@/store/modules/user';

// 是否正在刷新token的标记
let isRefreshing: boolean = false;

const LOGIN_TYPE = 'app';
const CLIENT_ID = '428a8310cd442757ae699df5d894f051';
const TENANT_ID = '000000';

function requestInterceptors(http: HttpRequestAbstract) {
  /**
   * 请求拦截
   * @param {object} http
   */
  http.interceptors.request.use(
    (config: HttpRequestConfig) => {
      // 可使用async await 做异步操作
      // 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
      config.data = config.data || {};
      config.header = config.header || {};

      config.header['Login-Type'] = config.header['Login-Type'] || LOGIN_TYPE;
      config.header.loginType = config.header.loginType || LOGIN_TYPE;

      config.header['client-id'] = config.header['client-id'] || CLIENT_ID;
      config.header.clientId = config.header.clientId || CLIENT_ID;

      config.header['tenant-id'] = config.header['tenant-id'] || TENANT_ID;
      config.header.tenantId = config.header.tenantId || TENANT_ID;

      // 是否需要设置 token
      const isToken = config.custom?.auth === false;
      // 是否需要防止数据重复提交
      const isRepeatSubmit = config.custom?.repeatSubmit === false;
      const token = getToken();
      if (token && !isToken && config.header) {
        // token设置
        config.header.Authorization = token.startsWith(TokenPrefix) ? token : `${TokenPrefix}${token}`;
      }

      if (!isRepeatSubmit && (config.method === 'POST' || config.method === 'UPLOAD')) {
        const requestObj = {
          url: config.url,
          data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
          time: new Date().getTime(),
        };
        const sessionObj = storage.getJSON('sessionObj');
        if (!sessionObj) {
          storage.setJSON('sessionObj', requestObj);
        }
        else {
          const s_url = sessionObj.url; // 请求地址
          const s_data = sessionObj.data; // 请求数据
          const s_time = sessionObj.time; // 请求时间
          const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
          if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
            const message = '数据正在处理，请勿重复提交';
            console.warn(`[${s_url}]: ${message}`);
            return Promise.reject(new Error(message));
          }
          else {
            storage.setJSON('sessionObj', requestObj);
          }
        }
      }
      return config;
    },
    (config: any) => // 可使用async await 做异步操作
      Promise.reject(config),
  );
}
function responseInterceptors(http: HttpRequestAbstract) {
  /**
   * 响应拦截
   * @param {object} http
   */
  http.interceptors.response.use(
    async (response: HttpResponse) => {
      /* 对响应成功做点什么 可使用async await 做异步操作 */
      const data = response.data;
      // 配置参数
      const config = response.config;
      // 自定义参数
      const custom = config?.custom;

      // 请求成功则返回结果
      if (data.code === 200)
        return data || {};

      // 登录状态失效，重新登录
      if (Number(data.code) === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          clearToken();
          useUserStore().resetInfo();
          uni.reLaunch({ url: '/pages/common/login/index' });
          isRefreshing = false;
        }
        return Promise.reject(data);
      }

      // 如果没有显式定义custom的toast参数为false的话，默认对报错进行toast弹出提示
      if (custom?.toast !== false)
        uni.$u.toast(data.msg || data.message);

      // 如果需要catch返回，则进行reject
      if (custom?.catch) {
        return Promise.reject(data);
      }
      else {
        // 否则返回一个pending中的promise
        return new Promise(() => {});
      }
    },
    (response: HttpError) => {
      if (response.statusCode) {
        // 请求已发出，但是不在2xx的范围
        showMessage(response.statusCode);
        return Promise.reject(response.data);
      }
      showMessage('网络连接异常,请稍后再试!');
      return Promise.reject(response);
    },
  );
}

export { requestInterceptors, responseInterceptors };
