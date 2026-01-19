import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

const API_PUBLIC_KEY =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdHnzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==';
const AES_KEY_LENGTH = 16;
const AES_KEY_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * 生成随机AES密钥
 */
function createAesKey(length: number = AES_KEY_LENGTH): string {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * AES_KEY_CHARS.length);
    result += AES_KEY_CHARS.charAt(index);
  }
  return result;
}

/**
 * 使用AES加密请求体
 */
function encryptAes(plainText: string, aesKey: string): string {
  const key = CryptoJS.enc.Utf8.parse(aesKey);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

/**
 * 使用RSA加密AES密钥
 */
function encryptRsa(aesKey: string): string {
  const rsa = new JSEncrypt();
  rsa.setPublicKey(API_PUBLIC_KEY);
  const aesKeyBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(aesKey));
  const encrypted = rsa.encrypt(aesKeyBase64);
  if (!encrypted) {
    throw new Error('生成加密头失败');
  }
  return encrypted;
}

/**
 * 构建加密请求体与加密头
 */
export function buildEncryptPayload(data: Record<string, any>) {
  const aesKey = createAesKey();
  const encryptKey = encryptRsa(aesKey);
  const encryptData = encryptAes(JSON.stringify(data), aesKey);
  return { encryptKey, encryptData };
}
