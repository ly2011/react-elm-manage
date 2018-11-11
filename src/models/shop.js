import {
  queryShop,
  queryShopInfo,
  queryShopCount,
  addShop,
  updateShop,
  delShop,
  queryFoodCategory,
  searchPlace,
  cityGuess
} from '@/services/shop'

export default {
  namespace: 'shop',
  state: {
    list: [],
    pagination: {
      current: 1,
      pageSize: 3,
      showSizeChanger: true,
      showQuickJumper: true,
      total: 0,
      showTotal: total => `共 ${total} 条数据`
    },
    foodCategory: [], // 食品店铺分类
    addressList: [], // 地址列表
    curShop: {}, // 当前当铺数据
    city: {} // 当前城市
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const { currentPage, pageSize } = payload
      const { data } = yield call(queryShop, payload)
      yield put({
        type: 'save',
        payload: { data, pagination: { currentPage, pageSize } }
      })
    },
    *fetchShopInfo(_, { call, put }) {
      const { data } = yield call(queryShopInfo)
      yield put({
        type: 'saveShopInfo',
        payload: data
      })
    },
    *fetchShopCount({payload}, { call, put }) {
      const { data } = yield call(queryShopCount, payload)
      yield put({
        type: 'saveShopCount',
        payload: data
      })
    },
    *addShop({ payload }, { call, put }) {
      const { resolve } = payload
      const { success, message: msg, error_msg } = yield call(addShop, payload)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveAddShop',
          payload
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *updateShop({ payload }, { call, put }) {
      const { resolve } = payload
      const { success, message: msg, error_msg } = yield call(updateShop, payload)
      if (!success) {
        // message.error(msg || error_msg)
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveUpdateShop',
          payload
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *delShop({ payload }, { call, put }) {
      const { resolve, id } = payload
      const { success, message: msg, error_msg } = yield call(delShop, id)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveDeleteShop',
          id
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *queryFoodCategory(_, { call, put }) {
      const { data: categories, success } = yield call(queryFoodCategory)
      if (success) {
        const categoryOptions = []
        // console.log('queryFoodCategory: ', categories)
        categories.forEach(item => {
          if (item.sub_categories.length) {
            const addnew = {
              value: item.name,
              label: item.name,
              children: []
            }
            item.sub_categories.forEach((subitem, index) => {
              if (index === 0) {
                return
              }
              addnew.children.push({
                value: subitem.name,
                label: subitem.name
              })
            })
            categoryOptions.push(addnew)
          }
        })
        yield put({
          type: 'saveFoodCategory',
          payload: categoryOptions
        })
      }
    },
    *searchPlace({ payload = {} }, { call, put }) {
      const { city_id, keyword } = payload
      // console.log('model - searchPlace: ', payload)
      try {
        const { data: cityList } = yield call(searchPlace, city_id, keyword)
        if (Array.isArray(cityList)) {
          cityList.map(item => {
            item.value = item.address
            return item
          })
        }
        yield put({
          type: 'saveAddressList',
          payload: cityList
        })
      } catch (error) {
        console.error(error)
      }
    },
    *cityGuess(_, { call, put }) {
      try {
        const { data: city } = yield call(cityGuess)
        yield put({
          type: 'saveCityGuess',
          payload: city
        })
      } catch (error) {
        console.error(error)
      }
    },
    *setCurShop({ payload = {} }, { put }) {
      const { curShop } = payload
      yield put({
        type: 'saveCurShop',
        payload: curShop
      })
    }
  },
  reducers: {
    save(state, { payload = {} }) {
      const { pagination: oldPagination } = state
      const {
        data,
        pagination: { currentPage: current, pageSize }
      } = payload
      return {
        ...state,
        list: data || [],
        pagination: {
          ...oldPagination,
          current,
          pageSize
        }
      }
    },
    saveShopInfo(state, { payload = {} }) {
      return {
        ...state,
        currentShopInfo: payload || {}
      }
    },
    saveShopCount(state, { payload = 0 }) {
      const { pagination } = state
      return {
        ...state,
        pagination: {
          ...pagination,
          total: payload || 0
        }
      }
    },
    saveAddShop(state, { payload }) {
      return {
        ...state,
        list: [...state.list, payload]
      }
    },
    saveUpdateShop(state, { payload }) {
      let { list } = state
      list = list.map(shop => {
        if (shop._id === payload._id) {
          return { ...shop, ...payload }
        }
        return shop
      })
      return {
        ...state,
        list
      }
    },
    saveDeleteShop(state, { payload }) {
      const { list } = state
      const index = list.findIndex(item => item._id === payload)
      list.splice(index, 1)
      return {
        ...state,
        list
      }
    },
    saveFoodCategory(state, { payload }) {
      return {
        ...state,
        foodCategory: payload || []
      }
    },
    saveAddressList(state, { payload }) {
      return {
        ...state,
        addressList: payload || []
      }
    },
    saveCityGuess(state, { payload }) {
      return {
        ...state,
        city: payload || {}
      }
    },
    saveCurShop(state, { payload }) {
      return {
        ...state,
        curShop: payload
      }
    }
  }
}
