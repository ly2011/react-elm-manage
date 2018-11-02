// 管理员列表
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Table } from 'antd';
// import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../List/TableList.less';

/* eslint react/no-multi-comp:0 */
@connect(({ admin, loading }) => ({
  admin,
  loading: loading.models.rule,
}))
@Form.create()
class AdminList extends PureComponent {
  state = {
    // modalVisible: false,
    // updateModalVisible: false,
    selectedRows: [],
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
    const { dispatch } = this.props;
    dispatch({
      type: 'admin/fetch',
    });
  }

  onSelectChange = rows => {
    // console.log('rows: ', rows);
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

  expandedRowRender = record => <p style={{ margin: 0 }}>{record.admin}</p>;

  render() {
    const {
      loading,
      admin: { list, pagination },
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRows,
      onChange: this.onSelectChange,
    };
    return (
      <PageHeaderWrapper title="管理员列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm} />
            {/* <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary">
                新建
              </Button>
            </div> */}
            {/* <StandardTable
              rowKey="user_name"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            /> */}
            {/* eslint-disable */}
            <Table
              rowKey={record => record._id}
              rowSelection={rowSelection}
              expandedRowRender={this.expandedRowRender}
              loading={loading}
              columns={this.columns}
              dataSource={list}
              pagination={pagination}
            />
            {/* eslint-enable */}
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

/* eslint-disable */
/* eslint-enable */

export default AdminList;
