// 返回res.data的interface
export interface IResponse<T = any> {
  code: number | string;
  msg?: string;
  message?: string;
  data?: T;
  result?: T;
}
