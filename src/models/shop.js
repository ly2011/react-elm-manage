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
      pageSize: 10,
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
    *addShop(_, { call, put }) {
      const response = yield call(addShop)
      yield put({
        type: 'addShop',
        payload: response
      })
    },
    *updateShop(_, { call, put }) {
      const response = yield call(updateShop)
      yield put({
        type: 'updateShop',
        payload: response
      })
    },
    *delShop(_, { call, put }) {
      const response = yield call(delShop)
      yield put({
        type: 'delShop',
        payload: response
      })
    },
    *queryFoodCategory(_, { call, put }) {
      const { data: categories, success } = yield call(queryFoodCategory)
      if (success) {
        const categoryOptions = []
        console.log('queryFoodCategory: ', categories)
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
      console.log('model - searchPlace: ', payload)
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
    save(state, action) {
      return {
        ...state,
        list: action.payload || []
      }
    },
    saveShopInfo(state, action) {
      return {
        ...state,
        currentShopInfo: action.payload || {}
      }
    },
    saveShopCount(state, action) {
      return {
        ...state,
        total: action.payload || 0
      }
    },
    addShop(state, action) {
      return {
        ...state,
        list: [...state.list, action.payload]
      }
    },
    updateShop(state, action) {
      let { list } = state
      list = list.map(shop => {
        if (shop._id === action.payload._id) {
          return action.payload
        }
      })
      return {
        ...state,
        list
      }
    },
    delShop(state, action) {
      const { list } = state
      const index = list.findIndex(item => item._id === action.payload)
      list.splice(index, 1)
      return {
        ...state,
        list
      }
    },
    saveFoodCategory(state, action) {
      return {
        ...state,
        foodCategory: action.payload || []
      }
    },
    saveAddressList(state, action) {
      return {
        ...state,
        addressList: action.payload || []
      }
    },
    saveCityGuess(state, action) {
      return {
        ...state,
        city: action.payload || {}
      }
    }
  }
}
