/**
 * 管理员接口汇总
 */
import { stringify } from 'qs'
import request from '@/utils/request'
import { baseApi } from '@/config/env'

/**
 * 获取管理员列表
 * @param {Object} params
 */
export async function queryAllAdmin(params = {}) {
  return request(`${baseApi}/api/admin/all?${stringify(params)}`)
}
/**
 * 获取管理员信息
 * @param {Object} params
 */
export async function queryAdminInfo(params = {}) {
  return request(`${baseApi}/api/admin/info?${stringify(params)}`)
}
/**
 * 获取管理员数量
 * @param {Object} params
 */
export async function queryAdminCount(params = {}) {
  return request(`${baseApi}/api/admin/count?${stringify(params)}`)
}
