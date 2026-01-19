/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // eslint-disable-next-line ts/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'uview-plus';
declare module 'uview-plus/libs/mixin/mpShare.js';

declare module 'jsencrypt' {
  /**
   * JSEncrypt 加密工具类
   */
  export default class JSEncrypt {
    /**
     * 设置公钥
     */
    setPublicKey(publicKey: string): void;
    /**
     * 加密字符串
     */
    encrypt(plainText: string): string | false;
  }
}
