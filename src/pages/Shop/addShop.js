// 管理员列表
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Button,
  message,
  Input,
  AutoComplete,
  Cascader,
  Upload,
  Icon,
  Switch,
  Select,
  Modal,
  InputNumber,
  Table,
  TimePicker,
  Col,
} from 'antd';
import moment from 'moment';
import { baseApi } from '@/config/env';
import { deepCopy } from '@/utils/utils';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import shopStyles from './ShopList.less';

const FormItem = Form.Item;
const Option = Select.Option;

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

const TimeFormat = 'HH:mm'; // 秒列则会自动消失
// 原始数据
const globalFormData = {
  name: '', // 店铺名称
  address: '', // 地址
  latitude: '',
  longitude: '',
  description: '', // 店铺简介
  phone: '', // 联系电话
  promotion_info: '', // 店铺标语
  float_delivery_fee: 5, // 配送费
  float_minimum_order_amount: 20, // 起送价
  is_premium: true, // 品牌保证
  delivery_mode: true, // 蜂鸟专送
  is_new: true, // 新开店铺
  bao: true, // 外卖保
  zhun: true, // 准时达
  piao: true, // 开发票
  startTime: '', // 营业开始时间
  endTime: '', // 营业结束时间
  image_path: '', // 店铺头像
  business_license_image: '', // 营业执照
  catering_service_license_image: '', // 餐饮服务许可证
};
const activities = [
  {
    icon_name: '减',
    name: '满减优惠',
    description: '满30减5，满60减8',
  },
];
const selectedCategory = ['快餐便当', '简餐'];

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
/* eslint react/no-multi-comp:0 */
@connect(({ shop, loading }) => ({
  shop,
  loading: loading.models.shop,
}))
@Form.create()
class addShopPage extends PureComponent {
  state = {
    shopAvatarUploadLoading: false, // 店铺头像loading
    businessAvatarUploadLoading: false, // 营业执照loading
    serviceAvatarUploadLoading: false, // 餐饮服务许可证loading
    formData: deepCopy(globalFormData), // 店铺信息
    options: [
      {
        value: '满减优惠',
        label: '满减优惠',
      },
      {
        value: '优惠大酬宾',
        label: '优惠大酬宾',
      },
      {
        value: '新用户立减',
        label: '新用户立减',
      },
      {
        value: '进店领券',
        label: '进店领券',
      },
    ],
    activityValue: '满减优惠',
    activities: deepCopy(activities), // 活动
    selectedCategory: deepCopy(selectedCategory), // 店铺分类
    modalVisible: false,
    acivityDetail: '', // 活动详情
  };

  componentDidMount() {
    this.initData();
  }

  initData = async () => {
    // 初始化数据
    const { dispatch } = this.props;
    dispatch({
      type: 'shop/cityGuess',
    });
    dispatch({
      type: 'shop/queryFoodCategory',
    });
  };

  columns = [
    { title: '活动标题', dataIndex: 'icon_name', align: 'center', width: 120 },
    { title: '活动名称', dataIndex: 'name', align: 'center', width: 120 },
    { title: '活动详情', dataIndex: 'description', align: 'center' },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <Fragment>
          <Button size="small" type="danger" onClick={() => this.handleDeleteActivity(index)}>
            删除
          </Button>
        </Fragment>
      ),
    },
  ];

  handleDeleteActivity = index => {
    const activities = deepCopy(this.state.activities);
    activities.splice(index, 1);
    console.log('handleDeleteActivity -index: ', index, activities);
    this.setState({
      activities,
    });
  };

  addShop = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    // const { formData } = this.state;
    const formData = deepCopy(this.state.formData); // 改为深度复制
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log('err: ', err, fieldsValue);
      if (err) return;
      try {
        formData.activities = this.state.activities;
        formData.category = this.state.selectedCategory.join('/');
        console.log('activities: ', this.state.activities);
        console.log('formData: ', formData);
        console.log('fieldsValue: ', fieldsValue);
        new Promise((resolve, reject) => {
          dispatch({
            type: 'shop/addShop',
            payload: {
              ...formData,
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
              form.resetFields();
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

  handleSearchAddress = value => {
    console.log('handleSearchAddress: ', value);
    const {
      dispatch,
      shop: { city },
    } = this.props;
    dispatch({
      type: 'shop/searchPlace',
      payload: {
        city_id: city ? city.id : '',
        keyword: value,
      },
    });
  };

  // 商铺地址选择
  handleSelectAddress = value => {
    const {
      shop: { addressList },
    } = this.props;
    const newAddress = addressList.find(item => item.address === value);
    if (newAddress) {
      const formData = deepCopy(this.state.formData);
      const { address, latitude, longitude } = newAddress;
      this.setState({
        formData: {
          ...formData,
          address,
          latitude,
          longitude,
        },
      });
    }
  };

  handleShopAvatarChange = info => {
    const { formData } = this.state;
    if (info.file.status === 'uploading') {
      this.setState({
        shopAvatarUploadLoading: true,
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
          shopAvatarUploadLoading: false,
        });
      });
    }
  };

  handleBusinessAvatarChange = info => {
    const { formData } = this.state;
    if (info.file.status === 'uploading') {
      this.setState({
        businessAvatarUploadLoading: true,
      });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        this.setState({
          formData: {
            ...formData,
            business_license_image: imageUrl,
          },
          businessAvatarUploadLoading: false,
        });
      });
    }
  };

  handleServiceAvatarChange = info => {
    const { formData } = this.state;
    if (info.file.status === 'uploading') {
      this.setState({
        serviceAvatarUploadLoading: true,
      });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        this.setState({
          formData: {
            ...formData,
            catering_service_license_image: imageUrl,
          },
          serviceAvatarUploadLoading: false,
        });
      });
    }
  };

  handleSelectCategory = value => {
    console.log('handleSelectCategory: ', value);
    this.setState({
      selectedCategory: value,
    });
  };

  handleSelectActivity = value => {
    this.setState({
      activityValue: value,
      modalVisible: true,
    });
  };

  handleChangeAddAcivityDetail = e => {
    this.setState({
      acivityDetail: e.target.value,
    });
  };

  handleAddAcivityDetail = e => {
    e.preventDefault();
    console.log('acivityDetail: ', this.state.acivityDetail);
    const { acivityDetail, activities, activityValue } = this.state;
    if (!acivityDetail) {
      message.info('请输入活动详情');
      return;
    }
    let newObj = {};
    switch (activityValue) {
      case '满减优惠':
        newObj = {
          icon_name: '减',
          name: '满减优惠',
          description: acivityDetail,
        };
        break;
      case '优惠大酬宾':
        newObj = {
          icon_name: '特',
          name: '优惠大酬宾',
          description: acivityDetail,
        };
        break;
      case '新用户立减':
        newObj = {
          icon_name: '新',
          name: '新用户立减',
          description: acivityDetail,
        };
        break;
      case '进店领券':
        newObj = {
          icon_name: '领',
          name: '进店领券',
          description: acivityDetail,
        };
        break;
    }
    // console.log('activities: ', [...activities, newObj]);
    this.setState({
      modalVisible: false,
      acivityDetail: '',
      activities: [...activities, newObj],
    });
  };

  handleCancelAcivityDetail = () => {
    message.info('取消输入');
    this.setState({
      modalVisible: false,
      acivityDetail: '',
    });
  };

  shopAvatarNormFile = e => {
    console.log('Upload event: ', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  businessAvatarNormFile = e => {
    console.log('Upload event: ', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  serviceAvatarNormFile = e => {
    console.log('Upload event: ', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // 营业时间
  getStartTimeDisabledHours = () => {
    const hours = [];
    for (let i = 0; i < 5; i++) {
      hours.push(i);
    }
    return hours;
  };

  getStartTimeDisabledMinutes = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('startTime');
    const minutes = [];
    if (startTime) {
      const startHour = moment(startTime).hours();
      if (startHour === 5) {
        minutes.push(...[0, 15]);
      } else if (startHour === 23) {
        minutes.push(45);
      }
    }
    return minutes;
  };

  getEndTimeDisabledHours = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const hours = [];
    for (let i = 0; i < 5; i++) {
      hours.push(i);
    }
    const startTime = getFieldValue('startTime');
    if (startTime) {
      const startHour = moment(startTime).hours();
      const startMinute = moment(startTime).minutes();
      for (let i = startHour - 1; i >= 4; i--) {
        // 先不考虑临界点的时间
        hours.push(i);
      }
      if (startMinute <= 0) {
      }
      if (startMinute >= 45) {
        // 大于或等于45分钟，则需要将禁止的时间移到下一个小时
        hours.push(startHour);
      }
    }

    return hours;
  };

  getEndTimeDisabledMinutes = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('startTime');
    const endTime = getFieldValue('endTime');
    const minutes = [];
    if (startTime) {
      const startHour = moment(startTime).hours();
      const startMinute = moment(startTime).minutes();
      const endHour = moment(endTime).hours();
      // const endMinute = moment(endTime).minutes()
      if (startHour === 5) {
        minutes.push(...[0, 15]);
      } else if (startHour === 23) {
        minutes.push(45);
      }

      // TODO: 待优化
      if (startHour === endHour) {
        // if (startMinute <= 0) {
        //   minutes.push(0)
        // } else if (startMinute >= 45) {
        //   minutes.push(45)
        // }
        // if (startHour === 5) {
        //   minutes.push(30)
        // }
        // if (startHour === 23) {
        //   minutes.push(30)
        // }
        // if (startHour !== 23) {
        for (let i = 0; i <= startMinute; i++) {
          minutes.push(i);
        }
        // }
      }
    }
    if (endTime) {
      const endHour = moment(endTime).hours();
      if (endHour === 5) {
        minutes.push(...[0, 15]);
      } else if (endHour === 23) {
        minutes.push(45);
      }
    }
    return minutes;
  };

  handleStartTimeChange = time => {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['endTime']); // 选择开始时间的时候，重置结束时间
  };

  handleEndTimeChange = time => {};

  render() {
    const {
      loading,
      shop: { list, pagination, foodCategory, city, addressList },
      form: { getFieldDecorator },
    } = this.props;
    const { formData = {}, selectedCategory, options, modalVisible, activities } = this.state;

    const uploadShopAvatarButton = (
      <div>
        <Icon type={this.state.shopAvatarUploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const uploadBusinessAvatarButton = (
      <div>
        <Icon type={this.state.businessAvatarUploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const uploadServiceAvatarButton = (
      <div>
        <Icon type={this.state.serviceAvatarUploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const getModalContent = () => (
      <Form>
        <FormItem label="请输入活动详情">
          <Input onChange={this.handleChangeAddAcivityDetail} defaultValue="" />
        </FormItem>
      </Form>
    );

    const modalFooter = {
      onText: '保存',
      onOk: this.handleAddAcivityDetail,
      onCancel: this.handleCancelAcivityDetail,
    };

    return (
      <PageHeaderWrapper title="添加商铺">
        <Card bordered={false}>
          <Form onSubmit={this.addShop} style={{ marginTop: 8 }}>
            <FormItem label="店铺名称" {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入店铺名称' }],
                initialValue: formData.name,
              })(<Input placeholder="请输入" />)}
            </FormItem>
            <FormItem label="详细地址" {...formItemLayout}>
              {getFieldDecorator('address', {
                rules: [{ required: true, message: '请输入店铺详细地址' }],
                initialValue: formData.address,
              })(
                <AutoComplete
                  className={shopStyles['']}
                  onChange={value => {
                    console.log('change', value); // eslint-disable-line
                  }}
                  onSearch={value => {
                    console.log('input', value); // eslint-disable-line
                    this.handleSearchAddress(value);
                  }}
                  onPressEnter={value => {
                    console.log('enter', value); // eslint-disable-line
                  }}
                  onSelect={this.handleSelectAddress}
                  placeholder="请输入地址"
                >
                  {addressList.map(item => (
                    <AutoComplete.Option key={item.address} text={item.address}>
                      {item.address}
                    </AutoComplete.Option>
                  ))}
                </AutoComplete>
              )}
              <span>当前城市： {city ? city.name : null}</span>
            </FormItem>
            <FormItem label="联系电话" {...formItemLayout}>
              {getFieldDecorator('phone', {
                rules: [{ required: true, message: '请输入联系电话' }],
                initialValue: formData.phone,
              })(<Input placeholder="请输入联系电话" maxLength="11" />)}
            </FormItem>
            <FormItem label="店铺简介" {...formItemLayout}>
              {getFieldDecorator('description', {
                initialValue: formData.description,
              })(<Input placeholder="请输入店铺介绍" />)}
            </FormItem>
            <FormItem label="店铺标语" {...formItemLayout}>
              {getFieldDecorator('promotion_info', {
                initialValue: formData.promotion_info,
              })(<Input placeholder="请输入店铺标语" />)}
            </FormItem>
            <FormItem label="店铺分类" {...formItemLayout}>
              <Cascader
                options={foodCategory}
                defaultValue={selectedCategory}
                onChange={this.handleSelectCategory}
                changeOnSelect
                placeholder="请选择店铺分类"
              />
            </FormItem>
            <FormItem label="店铺特点" {...formItemLayout}>
              <span>品牌保证</span>
              {getFieldDecorator('is_premium', {
                valuePropName: 'checked',
                initialValue: formData.is_premium,
              })(<Switch />)}
              <span>蜂鸟专送</span>
              {getFieldDecorator('delivery_mode', {
                valuePropName: 'checked',
                initialValue: formData.delivery_mode,
              })(<Switch />)}
              <span>新开店铺</span>
              {getFieldDecorator('is_new', {
                valuePropName: 'checked',
                initialValue: formData.is_new,
              })(<Switch />)}
            </FormItem>
            <FormItem label=" " colon={false} {...formItemLayout}>
              <span>外卖保</span>
              {getFieldDecorator('bao', {
                valuePropName: 'checked',
                initialValue: formData.bao,
              })(<Switch />)}
              <span>准时达</span>
              {getFieldDecorator('zhun', {
                valuePropName: 'checked',
                initialValue: formData.zhun,
              })(<Switch />)}
              <span>开发票</span>
              {getFieldDecorator('piao', {
                valuePropName: 'checked',
                initialValue: formData.piao,
              })(<Switch />)}
            </FormItem>
            <FormItem label="配送费" {...formItemLayout}>
              {getFieldDecorator('float_delivery_fee', {
                rules: [{ required: true, message: '请输入配送费' }],
                initialValue: formData.float_delivery_fee,
              })(<InputNumber placeholder="请输入配送费" min={0} max={20} />)}
            </FormItem>
            <FormItem label="起送价" {...formItemLayout}>
              {getFieldDecorator('float_minimum_order_amount', {
                rules: [{ required: true, message: '请输入起送价' }],
                initialValue: formData.float_minimum_order_amount,
              })(<InputNumber placeholder="请输入起送价" min={0} max={100} />)}
            </FormItem>
            <FormItem label="营业时间" {...formItemLayout}>
              <Col span={11}>
                <FormItem>
                  {getFieldDecorator('startTime')(
                    <TimePicker
                      minuteStep={15}
                      format={TimeFormat}
                      hideDisabledOptions
                      onChange={this.handleStartTimeChange}
                      disabledHours={this.getStartTimeDisabledHours}
                      disabledMinutes={this.getStartTimeDisabledMinutes}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={2}>
                <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                  -
                </span>
              </Col>

              <Col span={11}>
                <FormItem>
                  {getFieldDecorator('endTime')(
                    <TimePicker
                      minuteStep={15}
                      format={TimeFormat}
                      hideDisabledOptions
                      onChange={this.handleEndTimeChange}
                      disabledHours={this.getEndTimeDisabledHours}
                      disabledMinutes={this.getEndTimeDisabledMinutes}
                    />
                  )}
                </FormItem>
              </Col>
            </FormItem>
            <FormItem label="上传店铺头像" {...formItemLayout}>
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
                  onChange={info => this.handleShopAvatarChange(info)}
                >
                  {formData.image_path ? (
                    <img src={formData.image_path} alt="avatar" />
                  ) : (
                    uploadShopAvatarButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem label="上传营业执照" {...formItemLayout}>
              {getFieldDecorator('uploadBusinessAvatar', {
                rules: [{ required: true, message: '请上传营业执照' }],
                valuePropName: 'business_license_image',
                getValueFromEvent: this.businessAvatarNormFile,
              })(
                <Upload
                  listType="picture-card"
                  className={shopStyles['avatar-uploader']}
                  showUploadList={false}
                  action={`${baseApi}/shopping/addImg`}
                  beforeUpload={beforeUpload}
                  onChange={info => this.handleBusinessAvatarChange(info)}
                >
                  {formData.business_license_image ? (
                    <img src={formData.business_license_image} alt="avatar" />
                  ) : (
                    uploadBusinessAvatarButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem label="上传餐饮服务许可证" {...formItemLayout}>
              {getFieldDecorator('uploadServiceAvatar', {
                rules: [{ required: true, message: '请上传餐饮服务许可证' }],
                valuePropName: 'catering_service_license_image',
                getValueFromEvent: this.serviceAvatarNormFile,
              })(
                <Upload
                  listType="picture-card"
                  className={shopStyles['avatar-uploader']}
                  showUploadList={false}
                  action={`${baseApi}/shopping/addImg`}
                  beforeUpload={beforeUpload}
                  onChange={info => this.handleServiceAvatarChange(info)}
                >
                  {formData.catering_service_license_image ? (
                    <img src={formData.catering_service_license_image} alt="avatar" />
                  ) : (
                    uploadServiceAvatarButton
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem label="优惠活动" {...formItemLayout}>
              {getFieldDecorator('activityValue', {
                initialValue: this.state.activityValue,
              })(
                <Select placeholder={this.state.activityValue} onChange={this.handleSelectActivity}>
                  {options.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <Table rowKey="name" dataSource={activities} columns={this.columns} />
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                立即创建
              </Button>
            </FormItem>
          </Form>
        </Card>

        <Modal
          title="提示"
          className={shopStyles['']}
          width={420}
          bodyStyle={{ padding: '20px' }}
          destroyOnClose
          visible={modalVisible}
          {...modalFooter}
        >
          {getModalContent()}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default addShopPage;
