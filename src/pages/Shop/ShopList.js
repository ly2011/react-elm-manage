// 管理员列表
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Button,
  Divider,
  message,
  Row,
  Col,
  Input,
  AutoComplete,
  Modal,
  Cascader,
  Upload,
  Icon,
} from 'antd';
import { baseApi, baseImgPath } from '@/config/env';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../List/TableList.less';
import shopStyles from './ShopList.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
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
/* eslint react/no-multi-comp:0 */
@connect(({ shop, loading }) => ({
  shop,
  loading: loading.models.rule,
}))
@Form.create()
class ShopList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {}, // 查询表单数据
    done: false,
    current: {}, // 编辑表单数据
    imageUrl: '', // 图片地址
    imageUploadLoading: false,
    address: {}, // 当前编辑的店铺地址
    selectedCategory: [], // 当前编辑的分类
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
          <Button size="small" onClick={() => this.showEditModal(record)}>
            编辑
          </Button>
          <Divider type="vertical" />
          <Button size="small">添加食品</Button>
          <Divider type="vertical" />
          <Button size="small" type="danger" onClick={() => this.deleteShop(record._id)}>
            删除
          </Button>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    // const { dispatch } = this.props
    // dispatch({
    //   type: 'shop/fetch'
    // })
    this.initData();
  }

  initData = async () => {
    // 初始化数据
    const { dispatch } = this.props;
    dispatch({
      type: 'shop/cityGuess',
    });
    dispatch({
      type: 'shop/fetchShopCount',
    });
    dispatch({
      type: 'shop/fetch',
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    // 重新拉取数据
  };

  handleSearch = e => {
    e.preventDefault();
  };

  expandedRowRender = record => (
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

  showModal = () => {
    this.setState({
      modalVisible: true,
      current: undefined,
    });
  };

  showEditModal = record => {
    const {
      shop: { foodCategory = [] },
    } = this.props;
    if (!foodCategory.length) {
      this.getCategory();
    }
    const selectedCategory = record.category ? record.category.split('/') : [];
    const imageUrl = record ? record.image_path : '';
    this.setState({
      modalVisible: true,
      current: record || {},
      address: { ...this.state.address, ...{ address: record.address } },
      selectedCategory,
      imageUrl,
    });
  };

  handleDone = () => {
    // 编辑完成
    this.setState({
      done: false,
      modalVisible: false,
    });
  };

  handleCancel = () => {
    // 取消编辑
    this.setState({ modalVisible: false });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { current } = this.state;
    const id = current ? current._id : '';
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      try {
        let current = JSON.parse(JSON.stringify(this.state.current));
        current = { ...current, ...this.state.address };
        current.image_path = this.state.imageUrl;
        current.category = this.state.selectedCategory.join('/');
        console.log('current: ', current);
        console.log('fieldsValue: ', fieldsValue);
        dispatch({
          type: 'shop/updateShop',
          payload: {
            id,
            ...current,
            ...fieldsValue,
          },
        });
        this.setState({
          // done: true,
          modalVisible: false,
        });
      } catch (err) {}

      // dispatch({
      //   type: 'shop/fetch',
      //   payload: {
      //     id,
      //     ...fieldsValue,
      //   },
      // });
    });
  };

  deleteShop = id => {
    // 删除店铺
    message.warning('删除成功');
    const { dispatch } = this.props;
    dispatch({
      type: 'shop/fetch',
      payload: { id },
    });
  };

  getCategory = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'shop/queryFoodCategory',
    });
  };

  handleSearchAddress = value => {
    console.log('handleSearchAddress: ', value);
    const { dispatch } = this.props;
    dispatch({
      type: 'shop/searchPlace',
      payload: {
        keyword: value,
      },
    });
  };

  handleImageChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({
        imageUploadLoading: true,
      });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
        })
      );
    }
  };

  handleSelectCategory = value => {
    console.log('handleSelectCategory: ', value);
    this.setState({
      selectedCategory: value,
    });
  };

  render() {
    const {
      loading,
      shop: { list, pagination, foodCategory, city, addressList },
      form: { getFieldDecorator },
    } = this.props;
    const {
      selectedRows,
      modalVisible,
      done,
      current = {},
      imageUploadLoading,
      imageUrl,
      selectedCategory,
    } = this.state;
    const data = { list, pagination };

    const uploadButton = (
      <div>
        <Icon type={this.state.imageUploadLoading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const getModalContent = () => (
      <Form>
        <FormItem label="店铺名称" {...formItemLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入店铺名称' }],
            initialValue: current.name,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem label="详细地址" {...formItemLayout}>
          {getFieldDecorator('address', {
            rules: [{ required: true, message: '请输入店铺详细地址' }],
            initialValue: current.address,
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
              onSelect={value => {
                const { address, latitude, longitude } = value;
                this.address = { address, latitude, longitude };
              }}
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
        <FormItem label="店铺介绍" {...formItemLayout}>
          {getFieldDecorator('description', {
            rules: [{ required: true, message: '请输入店铺介绍' }],
            initialValue: current.description,
          })(<Input placeholder="请输入店铺介绍" />)}
        </FormItem>
        <FormItem label="联系电话" {...formItemLayout}>
          {getFieldDecorator('phone', {
            rules: [{ required: true, message: '请输入联系电话' }],
            initialValue: current.phone,
          })(<Input placeholder="请输入联系电话" />)}
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
        <FormItem label="店铺图片" {...formItemLayout}>
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
        </FormItem>
      </Form>
    );
    const modalFooter = { onText: '保存', onOk: this.handleSubmit, onCancel: this.handleCancel };

    return (
      <PageHeaderWrapper title="店铺列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm} />
            {/* <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={this.showModal}>
                添加
              </Button>
            </div> */}
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
        <Modal
          title={
            done ? null : `店铺${current && Object.keys(current).length > 0 ? '编辑' : '添加'}`
          }
          className={shopStyles['']}
          width={640}
          bodyStyle={done ? { padding: '72px 0' } : { padding: '28px 0 0' }}
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

export default ShopList;
