/**
 * 食品接口汇总
 */
import { stringify } from 'qs'
import request from '@/utils/request'
import { baseApi } from '@/config/env'

/**
 * 获取当前店铺食品种类
 * @param {String} restaurant_id
 */
export async function getCategory(restaurant_id) {
  const params = {
    restaurant_id
  }
  return request(`${baseApi}/shopping/getFoodCategory?${stringify(params)}`)
}

/**
 * 添加食品种类
 * @param {Object} params
 */
export async function addCategory(params = {}) {
  return request(`${baseApi}/shopping/addFoodCategory`, {
    method: 'POST',
    body: params
  })
}
/**
 * 添加食品
 * @param {Object} params
 */
export async function addFood(params = {}) {
  return request(`${baseApi}/shopping/addFood`, {
    method: 'POST',
    body: params
  })
}
/**
 * 获取食品列表
 * @param {object} params
 */
export async function getFoods(params = {}) {
  return request(`${baseApi}/shopping/foods?${stringify(params)}`)
}

/**
 * 获取食品数量
 * @param {object} params
 */
export async function getFoodsCount(params = {}) {
  return request(`${baseApi}/shopping/foods/count?${stringify(params)}`)
}

/**
 * 更新食品信息
 * @param {object} params
 */
export async function updateFoods(params = {}) {
  return request(`${baseApi}/shopping/updateFood`, {
    method: 'POST',
    body: params
  })
}

/**
 * 删除食品
 * @param {String} id
 */
export async function deleteFood(id) {
  const params = {
    id
  }
  return request(`${baseApi}/shopping/deleteFood?${stringify(params)}`)
}

/**
 * 获取menu详情
 * @param {String} cid
 */
export async function getMenuById(cid) {
  return request(`${baseApi}/shopping/menu/${cid}`)
}
