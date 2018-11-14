import { getCategory, addCategory, queryShop, getFoodsCount, addFood, updateFood, deleteFood } from '@/services/food'

export default {
  namespace: 'food',
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
    categoryList: [], // 获取当前店铺食品种类
    curCategory: {}, // 当前店铺食品分类
    curFood: {}, // 当前当铺数据
    attributes: [
      {
        value: '新',
        label: '新品'
      },
      {
        value: '招牌',
        label: '招牌'
      }
    ] // 食品特点
  },
  effects: {
    *getCategory({ payload = {} }, { call, put }) {
      const { restaurant_id } = payload
      // console.log('payload: ', payload);
      const { data } = yield call(getCategory, restaurant_id)
      // console.log('getCategory: ', data)
      yield put({
        type: 'saveCategory',
        payload: data
      })
    },
    *addCategory({ payload = {} }, { call, put }) {
      const { resolve } = payload
      const { success, message: msg, error_msg } = yield call(addCategory, payload)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveAddCategory',
          payload
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *fetch({ payload }, { call, put }) {
      const { currentPage, pageSize } = payload
      const { data } = yield call(queryShop, payload)
      yield put({
        type: 'save',
        payload: { data, pagination: { currentPage, pageSize } }
      })
    },
    *fetchFoodsCount({ payload }, { call, put }) {
      const { data } = yield call(getFoodsCount, payload)
      yield put({
        type: 'saveFoodsCount',
        payload: data
      })
    },
    *addFood({ payload }, { call, put }) {
      const { resolve } = payload
      const { success, message: msg, error_msg } = yield call(addFood, payload)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveAddFood',
          payload
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *updateFood({ payload }, { call, put }) {
      const { resolve } = payload
      const { success, message: msg, error_msg } = yield call(updateFood, payload)
      if (!success) {
        // message.error(msg || error_msg)
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveUpdateFood',
          payload
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *delFood({ payload }, { call, put }) {
      const { resolve, id } = payload
      const { success, message: msg, error_msg } = yield call(deleteFood, id)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveDeleteFood',
          id
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *setCurShop({ payload = {} }, { put }) {
      const { curFood } = payload
      yield put({
        type: 'saveCurShop',
        payload: curFood
      })
    }
  },
  reducers: {
    saveCategory(state, { payload }) {
      return {
        ...state,
        categoryList: payload || []
      }
    },
    saveAddCategory(state, { payload }) {
      return {
        ...state,
        categoryList: [...state.categoryList, payload]
      }
    },
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
    saveFoodsCount(state, { payload = 0 }) {
      const { pagination } = state
      return {
        ...state,
        pagination: {
          ...pagination,
          total: payload || 0
        }
      }
    },
    saveAddFood(state, { payload }) {
      return {
        ...state,
        list: [...state.list, payload]
      }
    },
    saveUpdateFood(state, { payload }) {
      let { list } = state
      list = list.map(item => {
        if (item._id === payload._id) {
          return { ...item, ...payload }
        }
        return item
      })
      return {
        ...state,
        list
      }
    },
    saveDeleteFood(state, { payload }) {
      const { list } = state
      const index = list.findIndex(item => item._id === payload)
      list.splice(index, 1)
      return {
        ...state,
        list
      }
    },
    saveCurFood(state, { payload }) {
      return {
        ...state,
        curFood: payload
      }
    }
  }
}
