// 添加食品
import React, { PureComponent, Fragment } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import {
  Form,
  Card,
  Button,
  message,
  Input,
  Upload,
  Icon,
  Select,
  Modal,
  InputNumber,
  Table,
  Row,
  Col,
  Radio,
} from 'antd';
import moment from 'moment';
import { baseApi } from '@/config/env';
import { deepCopy } from '@/utils/utils';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import shopStyles from './ShopList.less';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 10, offset: 7 },
  },
};
const globalFormData = {
  name: '',
  description: '',
  image_path: '',
  activity: '',
  attributes: [],
  specs: [
    {
      // 食品规格
      specs: '默认',
      packing_fee: 0,
      price: 20,
    },
  ],
};
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}
function beforeUpload(file) {
  // 限制用户上传的图片格式和大小。
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  if (!isJPG && !isPNG) {
    message.error('只能上传JPG/PNG格式图片！');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB！');
  }
  return isJPG && isLt2M;
}

@connect(({ food, loading }) => ({
  food,
  loading: loading.models.food,
}))
@Form.create()
class AddCategoryForm extends PureComponent {
  state = {
    loading: false,
    categorySelect: '', // 选中的食品种类
    showAddCategory: false, // 是否显示添加食品种类form
  };

  handleSelectCategory = value => {
    this.setState({
      categorySelect: value,
    });
  };

  changeIsShowCategory = () => {
    this.setState({
      showAddCategory: !this.state.showAddCategory,
    });
  };

  addCategory = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      try {
        console.log('fieldsValue: ', fieldsValue);
        new Promise((resolve, reject) => {
          dispatch({
            type: 'food/addCategory',
            payload: {
              ...fieldsValue,
              resolve,
            },
          });
        })
          .then(({ success, message }) => {
            if (success) {
              message.success('添加商铺成功');
              // 重置内容
              this.setState({
                formData: deepCopy(globalFormData),
                selectedCategory: deepCopy(selectedCategory),
                activities: deepCopy(activities),
              });
            } else {
              message.error(message);
            }
          })
          .catch(err => {
            message.error('添加商铺出错');
          });
      } catch (err) {
        console.error('添加商铺失败：', err);
      }
    });
  };

  renderAvancedForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { loading } = this.state;

    return (
      <Fragment>
        <FormItem label="食品种类" {...formItemLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入食品种类' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem label="种类描述" {...formItemLayout}>
          {getFieldDecorator('description', {
            rules: [{ required: true, message: '请输入种类描述' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </FormItem>
      </Fragment>
    );
  };

  render() {
    const {
      handleCancel,
      food: { categoryList = [] },
      form: { getFieldDecorator },
    } = this.props;
    const { showAddCategory } = this.state;
    // console.log('categoryList:  ', categoryList);
    return (
      <Form onSubmit={this.addCategory}>
        <FormItem label="食品种类" {...formItemLayout}>
          {getFieldDecorator('categorySelect')(
            <Select placeholder="请选择" onChange={this.handleSelectCategory}>
              {categoryList.map((item, index) => (
                <Option key={index} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        {showAddCategory && this.renderAvancedForm()}
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <div onClick={this.changeIsShowCategory}>
            {showAddCategory ? (
              <Icon
                type="caret-up"
                style={{ fontSize: '16px', color: '#ccc', transition: 'all .4s' }}
              />
            ) : (
              <Icon
                type="caret-down"
                style={{ fontSize: '16px', color: '#ccc', transition: 'all .4s' }}
              />
            )}
            <span>添加食品种类</span>
          </div>
        </FormItem>
      </Form>
    );
  }
}

/**
 * 添加规格
 */
@connect(({ food, loading }) => ({
  food,
  loading: loading.models.food,
}))
@Form.create()
class SpecsForm extends PureComponent {
  state = {
    formData: {
      specs: '',
      packing_fee: 0,
      price: 20,
    },
  };

  addSpecs = () => {
    const { handleOk, form } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log('err: ', err, fieldsValue);
      if (err) return;
      this.setState({
        formData: {
          specs: '',
          packing_fee: 0,
          price: 20,
        },
      });
      handleOk && handleOk(fieldsValue);
    });
  };

  getModalContent = () => {
    const { formData } = this.state;
    return (
      <Form>
        <FormItem label="规格" {...formItemLayout}>
          {getFieldDecorator('specs', {
            rules: [{ required: true, message: '请输入规格' }],
            initialValue: formData.specs,
          })(<Input placeholder="请输入" autoComplete="off" />)}
        </FormItem>
        <FormItem label="包装费" {...formItemLayout}>
          {getFieldDecorator('packing_fee', {
            initialValue: formData.packing_fee,
          })(<InputNumber min={0} max={100} />)}
        </FormItem>
        <FormItem label="价格" {...formItemLayout}>
          {getFieldDecorator('price', {
            initialValue: formData.price,
          })(<InputNumber min={0} max={10000} />)}
        </FormItem>
      </Form>
    );
  };

  render() {
    const {
      modalVisible,
      handleCancel,
      form: { getFieldDecorator },
    } = this.props;
    const modalFooter = { onText: '确定', onOk: this.addSpecs, onCancel: handleCancel };
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
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ food, loading }) => ({
  food,
  loading: loading.models.food,
}))
@Form.create()
class addFoodPage extends PureComponent {
  state = {
    restaurant_id: '', // 店铺id
    loading: false,
    modalVisible: false,
    foodAvatarUploadLoading: false, // 食品头像loading
    formData: deepCopy(globalFormData), // 食品信息
    foodSpecsType: 'one', // 食品规格类型 one: 单规格, more: 多规格
  };

  columns = [
    { title: '规格', dataIndex: 'specs', align: 'center', width: 120 },
    { title: '包装费', dataIndex: 'packing_fee', align: 'center', width: 120 },
    { title: '价格', dataIndex: 'price', align: 'center' },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <Fragment>
          <Button size="small" type="danger" onClick={() => this.handleDeleteFoodSpecs(index)}>
            删除
          </Button>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { restaurant_id } = this.props.location.query;
    console.log('restaurant_id: ', restaurant_id);
    if (!restaurant_id) {
      this.showConfirm()
      return;
    }
    this.setState(
      {
        restaurant_id,
      },
      () => {
        this.initData();
      }
    );
  }

  showConfirm = () => {
    confirm({
      title: '提示',
      content: '添加食品需要选择一个商铺，先去就去选择商铺吗？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        router.push('/shop/shop-list')
      },
      onCancel() {
        message.info('取消')
      },
    });
  };

  initData = async () => {
    this.getCategory();
  };

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

  addFood = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { formData } = this.state;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      console.log('fieldsValue: ', fieldsValue, formData);
      // this.setState({ formValues: fieldsValue });
    });
  };

  shopAvatarNormFile = e => {
    console.log('Upload event: ', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  handleFoodAvatarChange = info => {
    const { formData } = this.state;
    if (info.file.status === 'uploading') {
      this.setState({
        foodAvatarUploadLoading: true,
      });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        this.setState({
          formData: {
            ...formData,
            image_path: imageUrl,
          },
          foodAvatarUploadLoading: false,
        });
      });
    }
  };

  // 切换单个/多个规格
  handleSelectFoodSpecs = e => {
    this.setState({
      foodSpecsType: e.target.value,
    });
  };

  // 渲染单个规格
  renderOneFoodSpecs = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Fragment>
        <FormItem label="包装费" {...formItemLayout}>
          {getFieldDecorator('packing_fee')(<InputNumber min={0} max={100} />)}
        </FormItem>
        <FormItem label="价格" {...formItemLayout}>
          {getFieldDecorator('price')(<InputNumber min={0} max={10000} />)}
        </FormItem>
      </Fragment>
    );
  };

  // 渲染多个规格
  renderMoreFoodSpecs = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { formData } = this.state;
    return (
      <Fragment>
        <FormItem {...submitFormLayout} style={{ marginTop: 32, marginBottom: 10 }}>
          <Button type="primary">添加规格</Button>
        </FormItem>
        <Table rowKey="name" dataSource={formData.specs} columns={this.columns} />
      </Fragment>
    );
  };

  // 删除规格
  handleDeleteFoodSpecs = index => {
    const { formData } = this.state;
    const specs = deepCopy(this.state.formData.specs);
    specs.splice(index, 1);
    this.setState({
      formData: {
        ...formData,
        specs,
      },
    });
  };

  // 添加规格
  handleAddFoodSpecsOk = (params = {}) => {
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        specs: params,
      },
      modalVisible: false,
    });
  };

  // 取消添加规格
  handleAddFoodSpecsCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      food: { attributes },
    } = this.props;
    const { foodSpecsType, modalVisible, formData } = this.state;
    const uploadFoodAvatarButton = (
      <div>
        <Icon type={this.state.foodAvatarUploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <PageHeaderWrapper title="添加食品">
        <Card bordered={false}>
          <AddCategoryForm />
          <Form onSubmit={this.addFood} style={{ marginTop: 8 }}>
            <FormItem label="食品名称" {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入食品名称' }],
              })(<Input autoComplete="off" />)}
            </FormItem>
            <FormItem label="食品活动" {...formItemLayout}>
              {getFieldDecorator('activity')(<Input autoComplete="off" />)}
            </FormItem>
            <FormItem label="食品详情" {...formItemLayout}>
              {getFieldDecorator('description')(<Input autoComplete="off" />)}
            </FormItem>
            <FormItem label="上传食品图片" {...formItemLayout}>
              {getFieldDecorator('uploadShopAvatar', {
                rules: [{ required: true, message: '请上传店铺头像' }],
                valuePropName: 'image_path',
                getValueFromEvent: this.shopAvatarNormFile,
              })(
                <Upload
                  listType="picture-card"
                  className={shopStyles['avatar-uploader']}
                  showUploadList={false}
                  action={`${baseApi}/shopping/addImg`}
                  beforeUpload={beforeUpload}
                  onChange={info => this.handleFoodAvatarChange(info)}
                >
                  {formData.image_path ? (
                    <img src={formData.image_path} alt="avatar" />
                  ) : (
                    uploadFoodAvatarButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem label="食品特点" {...formItemLayout}>
              {getFieldDecorator('attributes')(
                <Select placeholder="请选择">
                  {attributes.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="食品规格" {...formItemLayout}>
              {getFieldDecorator('foodSpecsType', {
                initialValue: foodSpecsType,
              })(
                <RadioGroup onChange={this.handleSelectFoodSpecs}>
                  <Radio value="one">单规格</Radio>
                  <Radio value="more">多规格</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {foodSpecsType === 'one' ? this.renderOneFoodSpecs() : this.renderMoreFoodSpecs()}
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定添加食品
              </Button>
            </FormItem>
          </Form>
          {modalVisible ? (
            <SpecsForm
              modalVisible={modalVisible}
              handleOk={this.handleAddFoodSpecsOk}
              handleCancel={this.handleAddFoodSpecsCancel}
            />
          ) : null}
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default addFoodPage;
