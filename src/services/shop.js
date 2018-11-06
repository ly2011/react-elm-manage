/**
 * 店铺接口汇总
 */
import { stringify } from 'qs'
import request from '@/utils/request'

const baseApi = 'http://127.0.0.1:7001/api'

/**
 * 获取食品店铺分类
 */
export async function queryFoodCategory() {
  return request(`${baseApi}/shopping/restaurant/category`)
}
/**
 * 获取店铺列表
 * @param {Object} params
 */
export async function queryShop(params = {}) {
  return request(`${baseApi}/shopping/restaurants?${stringify(params)}`)
}
/**
 * 获取店铺具体信息
 * @param {Object} params
 */
export async function queryShopInfo(id) {
  return request(`${baseApi}/shopping/restaurant/${id}`)
}

/**
 * 添加店铺
 * @param {Object} params
 */
export async function addShop(params = {}) {
  return request(`${baseApi}/shopping/addShop`, {
    method: 'POST',
    body: params
  })
}
/**
 * 更新店铺
 * @param {Object} params
 */
export async function updateShop(params = {}) {
  return request(`${baseApi}/shopping/updateShop`, {
    method: 'POST',
    body: params
  })
}
/**
 * 删除店铺
 * @param {String} id
 */
export async function delShop(id) {
  return request(`${baseApi}/shopping/restaurant/${id}`, { method: 'DELETE' })
}
/**
 * 获取店铺数量
 * @param {Object} params
 */
export async function queryShopCount(params = {}) {
  return request(`${baseApi}/shopping/restaurants/count?${stringify(params)}`)
}

/**
 * 获取搜索地址
 * @param {String} city_id
 * @param {String} keyword
 */
export async function searchPlace(city_id, keyword) {
  const params = {
    type: 'search',
    city_id,
    keyword
  }
  return request(`${baseApi}/v1/pois?${stringify(params)}`)
}
/**
 * 城市定位
 */
export async function cityGuess() {
  const params = {
    type: 'guess'
  }
  return request(`${baseApi}/v1/cities?${stringify(params)}`)
}
/**
 * 获取当前店铺食品种类
 * @param {String} restaurant_id
 */
export async function getCategoryById(restaurant_id) {
  const params = {
    id: restaurant_id
  }
  return request(`${baseApi}/shopping/getCategory/${stringify(params)}`)
}

/**
 * 添加食品种类
 * @param {Object} params
 */
export async function addCategory(params = {}) {
  return request(`${baseApi}/shopping/addCategory`, {
    method: 'POST',
    body: params
  })
}
