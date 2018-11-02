// 管理员列表
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Button } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../List/TableList.less';

/* eslint react/no-multi-comp:0 */
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
@Form.create()
class AdminList extends PureComponent {
  state = {
    // modalVisible: false,
    // updateModalVisible: false,
    selectedRows: [],
    data: {
      list: [],
      pagination: {},
    },
  };

  columns = [
    { title: '姓名', dataIndex: 'user_name', align: 'center' },
    {
      title: '注册日期',
      dataIndex: 'create_time',
      align: 'center',
      sorter: true,
      render: val => <span>{val}</span>,
    },
    { title: '地址', dataIndex: 'address', align: 'center' },
  ];

  componentDidMount() {
    // ajax
    const list = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 20; i++) {
      list.push({
        user_name: `范冰冰${i + 1}`,
        create_time: Date.now(),
        address: `上海浦东${i + 1}号`,
      });
    }
    /* eslint-disable */
    const data = {
      list: this.state.data.list.concat(list),
      pagination: this.state.data.pagination,
    };
    this.setState({
      data,
    });
    /* eslint-enable */
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    // const { dispatch } = this.props
    // const { formValues } = this.state

    // const filters = Object.keys(filtersArg).reduce((obj, key) => {
    //   const newObj = { ...obj }
    //   newObj[key] = getValue(filtersArg[key])
    //   return newObj
    // }, {})

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      // ...formValues,
      // ...filters
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    // console.log('handleStandardTableChange: ', params.sorter)

    // 重新拉取数据
  };

  render() {
    const { loading } = this.props;
    const { selectedRows, data } = this.state;
    return (
      <PageHeaderWrapper title="店铺列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm} />
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary">
                新建
              </Button>
            </div>
            <StandardTable
              rowKey="user_name"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AdminList;
