// 店铺列表
import React, { PureComponent, Fragment } from 'react'
import router from 'umi/router'
import { connect } from 'dva'
import { Card, Form, Button, Divider, message, Row, Col, Input, Modal, Select, Upload, Icon } from 'antd'
import { baseApi, baseImgPath } from '@/config/env'
import StandardTable from '@/components/StandardTable'
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import styles from '../List/TableList.less'
import shopStyles from './ShopList.less'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 }
}
function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
function beforeUpload(file) {
  // 限制用户上传的图片格式和大小。
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  if (!isJPG && !isPNG) {
    message.error('只能上传JPG/PNG格式图片！')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB！')
  }
  return isJPG && isLt2M
}

@connect(({ food, loading }) => ({
  food,
  loading: loading.models.food
}))
@Form.create()
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      imageUrl: '', // 图片地址
      imageUploadLoading: false,
      categorySelect: '' // 选中的食品种类
    }
  }

  componentDidMount() {
    const {
      food: { curFood }
    } = this.props
    const imageUrl = curFood.image_path
    const selectedCategory = curFood.category ? curFood.category.split('/') : []
    this.setState({
      imageUrl,
      selectedCategory
    })
  }

  handleImageChange = info => {
    console.log('handleImageChange: ', info)
    if (info.file.status === 'uploading') {
      this.setState({
        imageUploadLoading: true
      })
      return
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          imageUploadLoading: false
        })
      )
    }
  }

  normFile = e => {
    console.log('Upload event: ', e)
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }
  // 获取食品分类
  getCategory = () => {
    const { dispatch } = this.props;
    const { restaurant_id } = this.state;
    const params = {
      restaurant_id,
    };
    new Promise((resolve, reject) => {
      dispatch({
        type: 'food/getCategory',
        payload: params,
      });
    })
      .then()
      .catch();
  };
  // 选择食品分类
  handleSelectCategory = value => {
    this.setState(
      {
        categorySelect: value
      },
      () => {
        const {
          dispatch,
          food: { categoryList = [] }
        } = this.props
        const selectable = categoryList[value] || {}
        console.log('select - > ', value, selectable)
        dispatch({
          type: 'food/setSelectedCategoryValue',
          payload: {
            selectedCategoryValue: selectable
          }
        })
      }
    )
  }

  // 更新店铺信息
  updateFood = e => {
    e.preventDefault()
    const { dispatch, form } = this.props
    const {
      food: { curFood = {} }
    } = this.props
    const id = curFood ? curFood.id : ''
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return
      try {
        let formData = JSON.parse(JSON.stringify(curFood))
        formData = { ...formData, ...this.state.address }
        formData.image_path = this.state.imageUrl
        formData.category = this.state.selectedCategory.join('/')
        console.log('formData: ', formData)
        console.log('fieldsValue: ', fieldsValue)
        new Promise((resolve, reject) => {
          dispatch({
            type: 'food/updateFood',
            payload: {
              id,
              ...formData,
              ...fieldsValue,
              resolve
            }
          })
        }).then(({ success, message }) => {
          if (success) {
            message.success('更新食品成功')
            form.resetFields()
            dispatch({
              type: 'food/setCurFood',
              payload: { curFood: {} }
            })
            this.props.handleOk && this.props.handleOk()
          } else {
            message.error(message)
          }
        })
      } catch (err) {
        message.error('更新食品失败')
      }
    })
  }

  render() {
    const {
      modalVisible,
      handleCancel,
      food: { curFood = {}, categoryList = [] },
      form: { getFieldDecorator }
    } = this.props
    const { imageUrl } = this.state
    const uploadButton = (
      <div>
        <Icon type={this.state.imageUploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    )
    const getModalContent = () => (
      <Form>
        <FormItem label="食品名称" {...formItemLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入' }],
            initialValue: curFood.name
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem label="食品介绍" {...formItemLayout}>
          {getFieldDecorator('description', {
            initialValue: curFood.description
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem label="食品分类" {...formItemLayout}>
          {getFieldDecorator('categorySelect')(
            <Select placeholder="" onChange={this.handleSelectCategory}>
              {categoryList.map((item, index) => (
                <Option key={index} value={index}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="店铺图片" {...formItemLayout}>
          {getFieldDecorator('imageUrl', {
            rules: [{ required: true, message: '请上传店铺头像' }],
            valuePropName: 'image_path',
            initialValue: imageUrl
          })(
            <Upload
              listType="picture-card"
              className={shopStyles['avatar-uploader']}
              showUploadList={false}
              action={`${baseApi}/shopping/addImg`}
              beforeUpload={beforeUpload}
              onChange={this.handleImageChange}
            >
              {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
            </Upload>
          )}
        </FormItem>
      </Form>
    )
    const modalFooter = { onText: '保存', onOk: this.updateFood, onCancel: handleCancel }
    return (
      <Modal
        title="店铺编辑"
        width={640}
        bodyStyle={{ padding: '28px 0 0' }}
        destroyOnClose
        visible={modalVisible}
        {...modalFooter}
      >
        {getModalContent()}
      </Modal>
    )
  }
}

/**
 * 添加规格
 */
@connect(({ food, loading }) => ({
  food,
  loading: loading.models.food
}))
@Form.create()
class SpecsForm extends PureComponent {
  state = {
    formData: {
      specs: '',
      packing_fee: 0,
      price: 20
    }
  }

  addSpecs = e => {
    e.preventDefault()
    const { handleOk, form } = this.props
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log('err: ', err, fieldsValue)
      if (err) return
      this.setState({
        formData: {
          specs: '',
          packing_fee: 0,
          price: 20
        }
      })
      handleOk && handleOk(fieldsValue)
    })
  }

  getModalContent = () => {
    const {
      form: { getFieldDecorator }
    } = this.props
    const { formData } = this.state
    return (
      <Form onSubmit={this.addSpecs}>
        <FormItem label="规格" {...formItemLayout}>
          {getFieldDecorator('specs', {
            rules: [{ required: true, message: '请输入规格' }],
            initialValue: formData.specs
          })(<Input placeholder="请输入" autoComplete="off" />)}
        </FormItem>
        <FormItem label="包装费" {...formItemLayout}>
          {getFieldDecorator('packing_fee', {
            initialValue: formData.packing_fee
          })(<InputNumber min={0} max={100} />)}
        </FormItem>
        <FormItem label="价格" {...formItemLayout}>
          {getFieldDecorator('price', {
            initialValue: formData.price
          })(<InputNumber min={0} max={10000} />)}
        </FormItem>
      </Form>
    )
  }

  render() {
    const {
      modalVisible,
      handleCancel,
      form: { getFieldDecorator }
    } = this.props
    const modalFooter = { onText: '确定', onOk: this.addSpecs, onCancel: handleCancel }
    return (
      <Modal
        title="添加规格"
        width={640}
        bodyStyle={{ padding: '28px 0 0' }}
        destroyOnClose
        visible={modalVisible}
        {...modalFooter}
      >
        {this.getModalContent()}
      </Modal>
    )
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ food, loading }) => ({
  food,
  loading: loading.models.food
}))
@Form.create()
class FoodList extends PureComponent {
  state = {
    modalVisible: false,
    specsFormVisible: false,
    selectedRows: [],
    formValues: {}, // 查询表单数据
    expandForm: false // 是否是展开查询
  }

  columns = [
    { title: '食品名称', dataIndex: 'name', align: 'center' },
    { title: '食品介绍', dataIndex: 'description', align: 'center' },
    { title: '评分', dataIndex: 'rating', align: 'center' },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      render: (text, record) => (
        <Fragment>
          <Button size="small" onClick={() => this.showEditModal(record)}>
            编辑
          </Button>
          <Divider type="vertical" />
          <Button size="small" type="danger" onClick={() => this.deleteFood(record.id)}>
            删除
          </Button>
        </Fragment>
      )
    }
  ]

  componentDidMount() {
    this.initData()
  }

  initData = async () => {
    // 初始化数据
    this.getTableData()
  }

  // 获取店铺列表数据以及分页总数
  getTableData = (params = {}) => {
    const {
      dispatch,
      food: { pagination }
    } = this.props

    // 获取分页总数
    const foodCountFormData = { ...params }
    delete foodCountFormData.currentPage
    delete foodCountFormData.pageSize
    dispatch({
      type: 'food/fetchFoodCount',
      payload: foodCountFormData
    })

    // 获取店铺列表数据
    const foodFormData = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...params
    }
    dispatch({
      type: 'food/fetch',
      payload: foodFormData
    })
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows
    })
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { formValues } = this.state
    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues
    }
    // if (sorter.field) {
    //   params.sorter = `${sorter.field}_${sorter.order}`;
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
      <FormItem label="食品名称">
        <span>{record.name}</span>
      </FormItem>
      <FormItem label="餐馆名称">
        <span>{record.restaurant_name}</span>
      </FormItem>
      <FormItem label="食品 ID">
        <span>{record.item_id}</span>
      </FormItem>
      <FormItem label="餐馆 ID">
        <span>{record.restaurant_id}</span>
      </FormItem>
      <FormItem label="食品介绍">
        <span>{record.description}</span>
      </FormItem>
      <FormItem label="餐馆地址">
        <span>{record.restaurant_address}</span>
      </FormItem>
      <FormItem label="食品评分">
        <span>{record.rating}</span>
      </FormItem>
      <FormItem label="月销量">
        <span>{record.month_sales}</span>
      </FormItem>
    </Form>
  )

  showEditModal = record => {
    const {
      dispatch,
      food: { foodCategory = [] }
    } = this.props
    if (!foodCategory.length) {
      this.getCategory()
    }
    dispatch({
      type: 'food/setCurFood',
      payload: { curFood: record || {} }
    })
    this.setState({
      modalVisible: true
    })
  }

  handleOk = () => {
    this.setState({ modalVisible: false })
  }

  handleCancel = () => {
    // 取消编辑
    this.setState({ modalVisible: false })
  }

  deleteFood = id => {
    // 删除店铺
    const { dispatch } = this.props
    new Promise((resolve, reject) => {
      dispatch({
        type: 'food/delFood',
        payload: { id, resolve }
      })
    })
      .then(({ success, message }) => {
        if (success) {
          message.success('删除食品成功')
        } else {
          message.error(message)
        }
      })
      .catch(err => {
        message.error('删除食品出错')
      })
  }

  getCategory = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'food/getCategory'
    })
  }

  renderSimpleForm() {
    const {
      form: { getFieldDecorator }
    } = this.props
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="食品名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" autoComplete="off" />)}
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
            <FormItem label="食品名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="餐馆名称">
              {getFieldDecorator('restaurant_name')(<Input placeholder="请输入" autoComplete="off" />)}
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

  // 删除规格
  handleDeleteFoodSpecs = index => {
    const { formData } = this.state
    const specs = deepCopy(this.state.formData.specs)
    specs.splice(index, 1)
    this.setState({
      formData: {
        ...formData,
        specs
      }
    })
  }

  // 添加规格
  handleAddFoodSpecsOk = (params = {}) => {
    const { formData } = this.state
    this.setState({
      formData: {
        ...formData,
        specs: [...this.state.formData.specs, params]
      },
      specsFormVisible: false
    })
  }

  // 取消添加规格
  handleAddFoodSpecsCancel = () => {
    this.setState({
      specsFormVisible: false
    })
  }

  // 打开添加规格的弹框
  openAddFoodSpecsModal = () => {
    this.setState({
      specsFormVisible: true
    })
  }

  render() {
    const {
      loading,
      food: { list, pagination }
    } = this.props
    const { selectedRows, modalVisible, specsFormVisible } = this.state
    const data = { list, pagination }

    return (
      <PageHeaderWrapper title="食品列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator} />
            <StandardTable
              className={shopStyles['shop-list-table']}
              rowKey="id"
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
        {modalVisible ? (
          <UpdateForm modalVisible={modalVisible} handleOk={this.handleOk} handleCancel={this.handleCancel} />
        ) : null}
        {specsFormVisible ? (
          <SpecsForm
            modalVisible={specsFormVisible}
            handleOk={this.handleAddFoodSpecsOk}
            handleCancel={this.handleAddFoodSpecsCancel}
          />
        ) : null}
      </PageHeaderWrapper>
    )
  }
}

export default FoodList
