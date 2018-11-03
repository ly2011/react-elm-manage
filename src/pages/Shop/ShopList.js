// 管理员列表
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Button, Divider, message, Row, Col } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../List/TableList.less';
import shopStyles from './ShopList.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 12 },
  },
};
/* eslint react/no-multi-comp:0 */
@connect(({ shop, loading }) => ({
  shop,
  loading: loading.models.rule,
}))
@Form.create()
class ShopList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    formValues: {}, // 查询表单数据
    editFormValues: {}, // 编辑表单数据
  };

  columns = [
    { title: '店铺名称', dataIndex: 'name', align: 'center' },
    { title: '店铺地址', dataIndex: 'address', align: 'center' },
    { title: '店铺介绍', dataIndex: 'description', align: 'center' },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      render: (text, record) => (
        <Fragment>
          <Button size="small" onClick={() => this.handleUpdateModalVisible(true, record)}>
            编辑
          </Button>
          <Divider type="vertical" />
          <Button size="small">添加食品</Button>
          <Divider type="vertical" />
          <Button size="small" type="danger" onClick={() => this.handleDelShop(record)}>
            删除
          </Button>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'shop/fetch',
    });
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

  handleSearch = e => {
    e.preventDefault();
  };

  expandedRowRender = record => {
    console.log(record);

    return (
      <Form layout="inline" className={shopStyles['shop-table-expanded-form']}>
        <FormItem label="店铺名称">
          <span>{record.name}</span>
        </FormItem>
        <FormItem label="店铺地址">
          <span>{record.address}</span>
        </FormItem>
        <FormItem label="店铺介绍">
          <span>{record.description}</span>
        </FormItem>
        <FormItem label="店铺ID">
          <span>{record._id}</span>
        </FormItem>
        <FormItem label="联系电话">
          <span>{record.phone}</span>
        </FormItem>
        <FormItem label="评分">
          <span>{record.rating}</span>
        </FormItem>
        <FormItem label="销售量">
          <span>{record.recent_order_num}</span>
        </FormItem>
        <FormItem label="分类">
          <span>{record.category}</span>
        </FormItem>
      </Form>
    );
  };

  hanleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      editFormValues: record || {},
    });
  };

  handleAdd = fields => {
    message.success('添加成功');
    this.hanleModalVisible();
  };

  addFood = () => {
    message.success('添加食品成功')
  }

  handleDelShop = () => {
    message.warning('删除成功');
  };

  render() {
    const {
      loading,
      shop: { list, pagination },
    } = this.props;
    const { selectedRows } = this.state;
    const data = { list, pagination };
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
              className={shopStyles['shop-list-table']}
              rowKey="_id"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onChange={this.handleStandardTableChange}
              expandedRowRender={this.expandedRowRender}
              rowSelection={null}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ShopList;
