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
      showTotal: total => `共 ${total} 条数据`,
    },
  },
  effects: {},
  reducers: {},
};
