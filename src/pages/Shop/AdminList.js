// 管理员列表
import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Card, Form, Table, Row, Col, Button, Input, Icon } from 'antd'
// import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import styles from '../List/TableList.less'
import shopStyles from './ShopList.less'

const FormItem = Form.Item

/* eslint react/no-multi-comp:0 */
@connect(({ admin, loading }) => ({
  admin,
  loading: loading.models.admin
}))
@Form.create()
class AdminList extends PureComponent {
  state = {
    selectedRows: [],
    formValues: {}, // 查询表单数据
    expandForm: false // 是否是展开查询
  }

  columns = [
    { title: '姓名', dataIndex: 'user_name', align: 'center' },
    {
      title: '注册日期',
      dataIndex: 'create_time',
      align: 'center',
      sorter: true,
      render: val => <span>{val}</span>
    },
    { title: '地址', dataIndex: 'address', align: 'center' }
  ]

  componentDidMount() {
    // ajax
    this.getTableData()
  }

  onSelectChange = rows => {
    this.setState({
      selectedRows: rows
    })
  }

  // 获取店铺列表数据以及分页总数
  getTableData = (params = {}) => {
    const {
      dispatch,
      admin: { pagination }
    } = this.props

    // 获取分页总数
    const adminCountFormData = { ...params }
    delete adminCountFormData.currentPage
    delete adminCountFormData.pageSize
    dispatch({
      type: 'admin/fetchAdminCount',
      payload: adminCountFormData
    })

    // 获取店铺列表数据
    const adminFormData = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...params
    }
    dispatch({
      type: 'admin/fetch',
      payload: adminFormData
    })
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { formValues } = this.state
    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues
      // ...filters
    }
    // if (sorter.field) {
    //   params.sorter = `${sorter.field}_${sorter.order}`
    // }

    // 重新拉取数据
    this.getTableData(params)
  }

  // 重置
  handleFormReset = () => {
    const { form, dispatch } = this.props
    form.resetFields()
    this.setState({
      formValues: {}
    })
    this.getTableData()
  }

  toggleForm = () => {
    const { expandForm } = this.state
    this.setState({
      expandForm: !expandForm
    })
  }

  handleSearch = e => {
    e.preventDefault()
    const { dispatch, form } = this.props
    form.validateFields((err, fieldsValue) => {
      if (err) return
      this.setState({ formValues: fieldsValue })
      this.getTableData(fieldsValue)
    })
  }

  expandedRowRender = record => (
    <Form layout="inline" className={shopStyles['shop-table-expanded-form']}>
      <FormItem label="姓名">
        <span>{record.user_name}</span>
      </FormItem>
      <FormItem label="地址">
        <span>{record.address}</span>
      </FormItem>
      <FormItem label="管理员ID">
        <span>{record.id}</span>
      </FormItem>
      <FormItem label="联系电话">
        <span>{record.phone}</span>
      </FormItem>
      <FormItem label="注册时间">
        <span>{record.create_time}</span>
      </FormItem>
    </Form>
  )

  renderSimpleForm() {
    const {
      form: { getFieldDecorator }
    } = this.props
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="管理员名称">
              {getFieldDecorator('user_name')(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="地址">
              {getFieldDecorator('address')(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={shopStyles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    )
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator }
    } = this.props
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="管理员名称">
              {getFieldDecorator('user_name')(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="地址">
              {getFieldDecorator('address')(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="注册时间">
              {getFieldDecorator('create_time')(<Input placeholder="请输入" maxLength="11" autoComplete="off" />)}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    )
  }

  renderForm() {
    const { expandForm } = this.state
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm()
  }

  render() {
    const {
      loading,
      admin: { list, pagination }
    } = this.props
    const { selectedRows } = this.state
    const rowSelection = {
      selectedRows,
      onChange: this.onSelectChange
    }
    return (
      <PageHeaderWrapper title="管理员列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
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
              className={shopStyles['shop-list-table']}
              rowKey={record => record.id}
              rowSelection={rowSelection}
              expandedRowRender={this.expandedRowRender}
              loading={loading}
              columns={this.columns}
              dataSource={list}
              pagination={pagination}
              onChange={this.handleStandardTableChange}
            />
            {/* eslint-enable */}
          </div>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

/* eslint-disable */
/* eslint-enable */

export default AdminList
