import { getCategory, addCategory, getFoods, getFoodsCount, addFood, updateFood, deleteFood } from '@/services/food'

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
    selectedCategoryValue: {}, // 选中的食品种类
    attributes: [
      {
        value: '新',
        label: '新品'
      },
      {
        value: '招牌',
        label: '招牌'
      }
    ], // 食品特点
    specs: [] // 规格
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
      const { data = {}, success, message: msg, error_msg } = yield call(addCategory, payload)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveAddCategory',
          payload: data
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *fetch({ payload }, { call, put }) {
      const { currentPage, pageSize } = payload
      const { data } = yield call(getFoods, payload)
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
      const { data = {}, success, message: msg, error_msg } = yield call(addFood, payload)
      if (!success) {
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveAddFood',
          payload: data
        })
        !!resolve && resolve({ success, message: msg || error_msg })
      }
    },
    *updateFood({ payload }, { call, put }) {
      const { resolve } = payload
      const { data = {}, success, message: msg, error_msg } = yield call(updateFood, payload)
      if (!success) {
        // message.error(msg || error_msg)
        !!resolve && resolve({ success, message: msg || error_msg })
      } else {
        yield put({
          type: 'saveUpdateFood',
          payload: data
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
    *setCurFood({ payload = {} }, { put }) {
      const { curFood } = payload
      yield put({
        type: 'saveCurFood',
        payload: curFood
      })
    },
    *setSelectedCategoryValue({ payload = {} }, { put }) {
      const { selectedCategoryValue = {} } = payload
      yield put({
        type: 'saveSelectedCategoryValue',
        payload: selectedCategoryValue
      })
    },
    *setSpecs({ payload = {} }, { put }) {
      const { specs } = payload
      yield put({
        type: 'saveSpecs',
        payload: specs
      })
    },
    *delSpecs({ payload = {} }, { put }) {
      const { index, type = '' } = payload
      // 是否是清空操作
      if (type === 'clear') {
      }
      yield put({
        type: 'saveDeleteSpecs',
        payload: []
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
    },
    saveSelectedCategoryValue(state, { payload }) {
      return {
        ...state,
        selectedCategoryValue: payload
      }
    },
    saveSpecs(state, { payload }) {
      return {
        ...state,
        specs: [...state.specs, payload]
      }
    },
    saveDeleteSpecs(state, { payload }) {
      return {
        ...state,
        specs: payload
      }
    }
  }
}
