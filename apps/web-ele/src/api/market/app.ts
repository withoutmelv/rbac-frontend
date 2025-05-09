import { requestClient } from '#/api/request';

/**
 * 分页查询用户列表
 * @param data
 */
export async function appPage(data: any) {
  return requestClient.post<any>('/sys/market/page', data);
}

export async function createApp(data: any) {
  return requestClient.post<any>('/sys/market/save', data);
}

export async function updateApp(data: any) {
  return requestClient.post<any>('/sys/market/save', data);
}

export async function deleteApp(data: any) {
  return requestClient.post<any>('/sys/market/save', data);
}
