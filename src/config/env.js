/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseApi: 域名地址
 * baseImgPath: 图片存放地址
 *
 */
let baseApi = ''
let baseImgPath

if (process.env.NODE_ENV == 'development') {
  baseApi = 'http://127.0.0.1:7001/api'
  baseImgPath = '/img/'
} else {
  baseApi = 'http://127.0.0.1:7001/api'
  baseImgPath = '/img/'
}

export { baseApi, baseImgPath }
