import { queryAllAdmin, queryAdminInfo, queryAdminCount } from '@/services/admin'

export default {
  namespace: 'admin',
  state: {
    list: [],
    currentAdminInfo: {},
    // total: 0,
    pagination: {
      current: 1,
      pageSize: 3,
      showSizeChanger: true,
      showQuickJumper: true,
      total: 0,
      showTotal: total => `共 ${total} 条数据`
    }
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const { currentPage, pageSize } = payload
      const { data } = yield call(queryAllAdmin, payload)
      yield put({
        type: 'save',
        payload: { data, pagination: { currentPage, pageSize } }
      })
    },
    *fetchAdminInfo(_, { call, put }) {
      const { data } = yield call(queryAdminInfo)
      yield put({
        type: 'saveAdminInfo',
        payload: data
      })
    },
    *fetchAdminCount(_, { call, put }) {
      const { data } = yield call(queryAdminCount)
      console.log('fetchAdminCount: ', data)
      yield put({
        type: 'saveAdminCount',
        payload: data
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
    saveAdminInfo(state, { payload = {} }) {
      return {
        ...state,
        currentAdminInfo: payload || {}
      }
    },
    saveAdminCount(state, { payload = 0 }) {
      const { pagination } = state
      return {
        ...state,
        pagination: {
          ...pagination,
          total: payload || 0
        }
      }
    }
  }
}
