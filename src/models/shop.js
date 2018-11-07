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
    total: 0,
    pagination: {
      current: 1,
      pageSize: 3,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: total => `共 ${total} 条数据`
    },
    foodCategory: [], // 食品店铺分类
    addressList: [], // 地址列表
    city: {} // 当前城市
  },
  effects: {
    *fetch(_, { call, put }) {
      const { data } = yield call(queryShop)
      yield put({
        type: 'save',
        payload: data
      })
    },
    *fetchShopInfo(_, { call, put }) {
      const response = yield call(queryShopInfo)
      yield put({
        type: 'saveShopInfo',
        payload: response
      })
    },
    *fetchShopCount(_, { call, put }) {
      const response = yield call(queryShopCount)
      yield put({
        type: 'saveShopCount',
        payload: response
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
    }
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        list: payload || []
      }
    },
    saveShopInfo(state, { payload }) {
      return {
        ...state,
        currentShopInfo: payload || {}
      }
    },
    saveShopCount(state, { payload }) {
      return {
        ...state,
        total: payload || 0
      }
    },
    saveAddShop(state, { payload }) {
      console.log('saveAddShop: ', payload)
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
      console.log('updateShop - list: ', list)
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
    }
  }
}
