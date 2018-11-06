/**
 * 食品接口汇总
 */
import { stringify } from 'qs';
import request from '@/utils/request';
import { baseApi } from '@/config/env';

/**
 * 获取食品列表
 * @param {object} params
 */
export async function getFoods(params = {}) {
  return request(`${baseApi}/shopping/foods?${stringify(params)}`);
}

/**
 * 获取食品数量
 * @param {object} params
 */
export async function getFoodsCount(params = {}) {
  return request(`${baseApi}/shopping/foods/count?${stringify(params)}`);
}

/**
 * 获取menu详情
 * @param {String} cid
 */
export async function getMenuById(cid) {
  return request(`${baseApi}/shopping/menu/${cid}`);
}

/**
 * 更新食品信息
 * @param {object} params
 */
export async function updateFoods(params = {}) {
  return request(`${baseApi}/shoping/updateFood`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除食品
 * @param {String} id
 */
export async function deleteFood(id) {
  return request(`${baseApi}/shopping/food/${id}`, {
    method: 'DELETE',
  });
}
