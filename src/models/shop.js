import { queryShop, queryShopInfo, queryShopCount, addShop, updateShop, delShop } from '@/services/shop'

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
    }
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
    }
  }
}
