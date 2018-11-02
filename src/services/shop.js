// import { stringify } from 'qs';
import request from '@/utils/request';

const baseApi = 'http://127.0.0.1:7001';

/**
 * 获取店铺列表
 * @param {Object} params
 */
export async function queryShop() {
  return request(`${baseApi}/api/shopping/restaurants`);
}
/**
 * 获取店铺具体信息
 * @param {Object} params
 */
export async function queryShopInfo(id) {
  return request(`${baseApi}/api/shopping/restaurant/${id}`);
}

/**
 * 添加店铺
 * @param {Object} params
 */
export async function addShop(params = {}) {
  return request(`${baseApi}/api/shopping/addShop`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 更新店铺
 * @param {Object} params
 */
export async function updateShop(params = {}) {
  return request(`${baseApi}/api/shopping/updateShop`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 删除店铺
 * @param {String} id
 */
export async function delShop(id) {
  return request(`${baseApi}/api/shopping/restaurant/${id}`, { method: 'DELETE' });
}
