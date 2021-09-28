/**
 * 新增、修改人员信息
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Spin, Upload, Modal } from 'antd';

import moment from 'moment';
import { EditDrawer } from '@/common/';
import PeopleInfoForm from './peopleInfoForm';
import DrivingLicenseForm from './drivingLicenseForm';

import {
  deleteImg, getPeopleInfo,
  addPeople, updatePeople, checkShiftByMonitorId,
} from '@/server/monitorManager';
import { message } from 'antd';
import { regularText } from '@/common/rules';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';

import styles from '../../../index.module.less';

interface IProps {
  monitorInfo: any;
  drawerVisible: {
    addAndedit: false | 'add' | 'edit' | undefined;
    detailVisible: boolean | undefined | 'synthesisSet';
  };
  getBindData: Function;
  changeDrawer: Function;
  currentTable: any;
  currentSelectOrg?: string | null;
}

interface IState {
  monitorId: string;
  dataInfo: any;
  loading: boolean;
  fileList: any;
  fileLoading: boolean,
  oldImg: {
    url: string;
    isDelete: boolean;
  };
  disabledStatus: boolean;
  previewVisible: boolean;
}

// 需要转换日期格式的字段
const dateArr = [
  'birthday',
  'hireDate',
  'drivingStartDate',
  'drivingEndDate',
]

class AddAndEditDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      dataInfo: {},// 页面所有字段的数据
      loading: false,
      fileList: [],
      disabledStatus: false,// 字段禁用控制
      fileLoading: false,// 图片上传加载状态
      oldImg: {// 修改界面默认显示的图片
        url: '',
        isDelete: false,
      },
      previewVisible: false,
    };
  }

  componentDidMount() {
    const { monitorInfo, drawerVisible: { addAndedit } } = this.props;
    if (addAndedit === 'edit' && monitorInfo) {
      this.setState({
        loading: true
      }, () => {
        this.getBasicInfo(monitorInfo.id);
      });
    }
    if (addAndedit === 'add') {
      this.renderOrgId();
    }
  }

  // props改变时触发
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { monitorId } = this.state;
    const { monitorInfo, drawerVisible: { addAndedit } } = nextProps;
    if (addAndedit === 'edit' && monitorInfo) {
      const { monitorInfo: { id } } = nextProps;
      if (monitorId === '' || id && monitorId !== id) {
        this.setState({
          loading: true
        }, () => {
          this.getBasicInfo(monitorInfo.id);
        })
      }
    }
    if (addAndedit === 'add') {
      this.renderOrgId();
    }
  }

  /**
   * 获取页面信息
   */
  getBasicInfo = async (id: string) => {
    const result = await getPeopleInfo<Array<Record<string, any>>>(id);
    const checkStatus = await checkShiftByMonitorId<boolean>(id);
    if (result) {
      const data: any = result;
      if (data) {
        Object.keys(data).map(key => {
          const item = data[key];
          // 将日期格式数据转化为moment对象,才可以用于表单日期控件赋值
          if (dateArr.indexOf(key) !== -1 && item) {
            // data[key] = '';
            data[key] = moment(new Date(item));
          }
          if (item === null || item === 'null') {
            data[key] = '';
          }
          return item;
        })
      }
      let fileList: any = [];
      if (data.photograph) {// 用户照片
        fileList = [{
          response: {
            data: {
              fileName: '',
              webUrl: data.photograph,
            },
            code: 200,
          },
          uid: '-1',
          name: '',
          status: 'done',
          url: data.photograph,
        }]
      }
      this.setState({
        monitorId: id,
        dataInfo: data,
        fileList,
        loading: false,
        disabledStatus: checkStatus === undefined ? false : checkStatus,
        oldImg: { url: data.photograph || '', isDelete: false }
      }, () => {
        data.orgId = {// 组装分组字段值
          // label: data.orgName,
          value: data.orgId,
        };
        data.positionTypeId = { label: data.positionTypeName, value: data.positionTypeId }
        this.formRef.current.setFieldsValue(data);
      })
    } else {
      this.setState({
        loading: false,
        disabledStatus: checkStatus === undefined ? false : checkStatus,
      });
    }
  }

  /**
   * 新增时,如果用户在左侧组织树选中了企业，默认为选中的企业
   */
  renderOrgId = () => {
    const { currentSelectOrg } = this.props;
    if (currentSelectOrg && this.formRef.current) {
      this.formRef.current.setFieldsValue({
        orgId: {
          value: currentSelectOrg
        }
      });
    }
  }

  /**
   * 图片上传及预览相关方法
   */
  beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('必须上传JPG/PNG格式!');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('图片大小不超过1MB!');
    }
    return isJpgOrPng && isLt1M;
  }
  handlePreview = async () => {
    this.setState({
      previewVisible: true,
    });
  };

  /**
  * 上传人员照片
  */
  handleChange = (list: any) => {
    const { fileList } = list;
    // 过滤掉不符合要求的图片文件
    if (fileList.length > 0 && !fileList[0].status) {
      this.setState({ fileList: [] });
      return;
    }
    if (fileList[0]) {
      fileList[0].newUpload = true;
    }
    this.setState({
      fileLoading: false,
      fileList: [...fileList]
    });
  };

  /**
  * 删除图片
  */
  deleteImgFun = async (data: any) => {
    const { oldImg, oldImg: { url } } = this.state;
    const deleteUrl = data.response.data.webUrl;
    if (deleteUrl === url) {// 删除的不是重新选择的图片时,不调用后端接口删除图片
      oldImg.isDelete = true;
      this.setState({
        oldImg,
        fileList: [],
      })
    } else {
      await deleteImg<boolean>([deleteUrl]);
    }
    return true;
  }

  /**
   * 表单提交
   */
  formSubmit = async (values: any) => {
    dateArr.map(key => {
      const item = values[key];
      if (item) {// 转换日期格式
        values[key] = moment(item).format('YYYY-MM-DD');
      }
      return item;
    })
    const { getBindData, drawerVisible: { addAndedit }, currentTable, monitorInfo } = this.props;
    const { fileList, oldImg: { url, isDelete } } = this.state;
    console.log('提交参数', fileList, values);
    if (fileList.length > 0) {
      const { response } = fileList[0];
      if (response && response.code === 200) {// 组装用户照片
        const data = typeof (response.data) === 'string' ? JSON.parse(response.data) : response.data;
        values.photograph = data.webUrl;
      }
    }
    // 组装所属组织的名字与id
    if (typeof values.orgId === 'object') {
      values.orgName = values.orgId.label;
      values.orgId = values.orgId.value;
    } else {
      values.orgName = '';
    }
    values.positionTypeId = values.positionTypeId.value;

    if (addAndedit === 'add') {// 新增
      const result = await addPeople<boolean>(values);
      if (result) {
        this.changeDrawerVisible({ addAndedit: false });
        message.success('新增成功');
        getBindData();// 更新未绑定车辆数据
        currentTable.current.reloadPageOne();
      }

    } else if (addAndedit === 'edit') {// 修改
      values.id = monitorInfo.id;
      values.id = monitorInfo.id;
      const result = await updatePeople<boolean>(values);
      if (result) {
        if (isDelete) {// 点击提交时再真正的删除用户照片
          await deleteImg<boolean>([url]);
        }
        currentTable.current.reload();
        this.changeDrawerVisible({ addAndedit: false, detailVisible: false });
        getBindData();// 更新未绑定车辆数据
        message.success('修改成功');
      }
    }
  }

  /**
  * 改变抽屉显示状态
  */
  changeDrawerVisible = (param: object) => {
    const { changeDrawer } = this.props;
    this.setState({
      disabledStatus: false
    })
    this.resetDrawerData();
    changeDrawer(param);
  };

  /**
   * 重置抽屉数据
   */
  resetDrawerData = () => {
    this.setState({
      monitorId: '',
      dataInfo: {},
      loading: false,
      fileList: [],
      fileLoading: false,
      oldImg: {
        url: '',
        isDelete: false,
      },
      previewVisible: false,
    });
    this.formRef.current.resetFields();
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    this.changeDrawerVisible({ addAndedit: false })
  };

  render() {
    const { drawerVisible: { addAndedit }, monitorInfo } = this.props;
    const { loading, fileLoading, fileList, previewVisible, disabledStatus } = this.state;

    const previewImage = (fileList[0] && fileList[0].response ? fileList[0].response.data.webUrl : '');// 预览图片地址
    const uploadButton = (
      <div>
        {fileLoading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">上传照片</div>
      </div>
    );

    return (
      <EditDrawer
        title={addAndedit === 'add' ? '新增人员' : '修改基本信息'}
        width={1060}
        visible={addAndedit ? true : false}
        onConfirm={() => {
          this.formRef.current.submit()
        }}
        onClose={this.closeDrawer}
        getContainer='body'
      >
        <div className={styles.editForm} key={`edit-${addAndedit}`}>
          <Form
            ref={this.formRef}
            initialValues={{
              gender: '1',
              state: '0',
              manoeuvreMember: 0,
              bloodType: 'A',
            }}
            onFinish={this.formSubmit}
            className={styles.publicDrawer}
            id="peopleSelectContainer"
          >
            <div className={styles.innerBox}>
              <table className={styles.itemTable}>
                <tbody>
                  <tr><th colSpan={2} className={styles.tableHeader}>人员信息</th></tr>
                  <tr>
                    <td width={180} className={styles.peopleImgBox}>
                      <div className={styles.uploadBox}>
                        <Upload
                          headers={{
                            'Authorization': `Bearer ${getStore('token')}`
                          }}
                          action='/api/mo/monitoring-vehicle/photo'
                          listType="picture-card"
                          fileList={fileList}
                          accept='image/jpg,image/jpeg,image/png'
                          beforeUpload={this.beforeUpload}
                          onPreview={this.handlePreview}
                          onRemove={this.deleteImgFun}
                          onChange={this.handleChange}
                        >
                          {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                      </div>
                      {/* 预览图片弹窗 */}
                      <Modal
                        visible={previewVisible}
                        title='图片预览'
                        footer={null}
                        onCancel={() => { this.setState({ previewVisible: false }) }}
                      >
                        <img style={{ width: '100%' }} src={previewImage} />
                      </Modal>
                    </td>
                    <td>
                      <PeopleInfoForm
                        formRef={this.formRef}
                        monitorInfo={monitorInfo}
                        drawerVisible={addAndedit}
                        disabledStatus={disabledStatus}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>备注</th>
                    <td>
                      <Form.Item
                        name='remark'
                        rules={[regularText]}
                      >
                        <Input type="text" allowClear autoComplete='off' maxLength={150} placeholder='请输入备注' />
                      </Form.Item>
                    </td></tr>
                </tbody>
              </table>
              {/* 驾驶证信息 */}
              <DrivingLicenseForm formRef={this.formRef} />
            </div>
          </Form>
          {/* 加载loading */}
          {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
        </div>
      </EditDrawer>
    );
  }
}
export default connect(
  null,
  dispatch => ({
    getBindData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
    }
  }),
)(AddAndEditDrawer);