import { queryAllAdmin, queryAdminInfo, queryAdminCount } from '@/services/admin'

export default {
  namespace: 'admin',
  state: {
    list: [],
    currentAdminInfo: {},
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
      const { data } = yield call(queryAllAdmin)
      yield put({
        type: 'save',
        payload: data
      })
    },
    *fetchAdminInfo(_, { call, put }) {
      const response = yield call(queryAdminInfo)
      yield put({
        type: 'saveAdminInfo',
        payload: response
      })
    },
    *fetchAdminCount(_, { call, put }) {
      const response = yield call(queryAdminCount)
      yield put({
        type: 'saveAdminCount',
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
    saveAdminInfo(state, action) {
      return {
        ...state,
        currentAdminInfo: action.payload || {}
      }
    },
    saveAdminCount(state, action) {
      return {
        ...state,
        total: action.payload || 0
      }
    }
  }
}
