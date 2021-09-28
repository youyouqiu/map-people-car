/**
 * 新增、修改车辆信息
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import {
  Row, Col, Form, Select, Input, Spin, Upload, Button
} from 'antd';
const { Option } = Select;


import { UploadOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
import { getNowDate } from '@/framework/utils/function';
import moment from 'moment';
import { EditDrawer } from '@/common/';
import VehicleForm from './vehicleForm';
import { message } from 'antd';

import {
  deleteImg, getMonitorDetailInfo,
  addVehicle, editVehicleBasicInfo, checkShiftByMonitorId,
} from '@/server/monitorManager';

import styles from '../../../index.module.less';

interface IProps {
  monitorInfo: any;
  drawerVisible: {
    addAndedit: false | 'add' | 'edit' | undefined;
    detailVisible: boolean | undefined | 'synthesisSet';
  };
  changeDrawer: Function;
  getBindData: Function,
  currentTable: any;
  currentSelectOrg?: string | null;
}

interface IState {
  monitorId: string;
  dataInfo: any;
  fileImgList: Array<IImgItem>;
  deleteImgArr: Array<string>;
  loading: boolean;
  disabledStatus: boolean;
  uploadImgLoading: boolean;
}

interface IImgItem {
  name: string;
  time: string;
  username: string;
  url: string;
  newUpload?: boolean;
}

// 需要转换日期格式的字段
const dateArr = [
  'maintainValidity',
  'insuranceValidity',
  'annualReviewValidity',
  'vehiclePlatformInstallDate',
]

// 表单默认值
const formInitValue = {
  plateColor: 2,
  vehicleColor: '1',
  areaAttribute: '1',
  phoneCheck: 0,
  isStart: 1,
  stateRepair: 0,
}

class AddAndEditDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      dataInfo: {},// 页面所有字段的数据
      loading: false,
      disabledStatus: false,// 字段禁用控制
      uploadImgLoading: false,// 上传图片按钮loading状态
      fileImgList: [],// 图片集合(type:{1:车辆照片,2:行驶证,3:运输证})
      deleteImgArr: [],// 需要删除的图片集合
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
  }

  // props改变时触发
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { monitorId } = this.state;
    const { monitorInfo, drawerVisible: { addAndedit } } = nextProps;
    if (addAndedit === 'edit' && monitorInfo && monitorInfo.id !== monitorId) {
      this.setState({
        loading: true
      }, () => {
        this.getBasicInfo(monitorInfo.id);
      });
    }
  }

  /**
   * 获取页面信息
   */
  getBasicInfo = async (id: string) => {
    const result = await getMonitorDetailInfo<Array<Record<string, any>>>(id);
    const checkStatus = await checkShiftByMonitorId<boolean>(id);
    if (result) {
      const data: any = result;
      if (data) {
        Object.keys(data).map(key => {
          const item = data[key];
          // 将日期格式数据转化为moment对象,才可以用于表单日期控件赋值
          if (dateArr.indexOf(key) !== -1 && item) {
            data[key] = moment(item);
          }
          if (item === null || item === 'null') {
            data[key] = '';
          }
          return item;
        })
      }
      this.setState({
        monitorId: id,
        dataInfo: data,
        loading: false,
        disabledStatus: checkStatus === undefined ? false : checkStatus,
        fileImgList: data.monitorPhotoList || [],
      }, () => {
        const orgId = data.orgId;
        data.orgId = {// 组装分组字段值
          label: data.orgName,
          value: orgId,
        };
        data.vehicleTypeId = { label: data.vehicleType, value: data.vehicleTypeId };
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
   * 改变抽屉显示状态
   */
  changeDrawerVisible = (param: object) => {
    const { changeDrawer } = this.props;
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
      uploadImgLoading: false,
      fileImgList: [],
      deleteImgArr: [],
    });
    this.formRef.current.resetFields();
  }

  /**
   * 确认删除图片
   */
  confirmDeleteImg = async (imgArr: Array<string>) => {
    await deleteImg<boolean>(imgArr);
  }

  /**
   * 删除图片
   */
  deleteImgFun = async (item: IImgItem, index: number) => {
    const { deleteImgArr, fileImgList } = this.state;
    if (item.newUpload) {// 新上传的图片,可直接调接口删除
      const result = await deleteImg<boolean>([item.url]);
      if (result) {
        fileImgList.splice(index, 1);
        this.setState({
          fileImgList
        })
      }
    } else {// 原有的图片,前端手动删除,在点击确定按钮后再调取接口确认删除
      deleteImgArr.push(item.url);
      fileImgList.splice(index, 1);
      this.setState({
        deleteImgArr,
        fileImgList: [...fileImgList]
      })
    }
  }

  /**
   * 修改车辆图片名称
   */
  changeImgName = (value: string, index: number) => {
    const { fileImgList } = this.state;
    fileImgList[index].name = value;
    fileImgList[index].username = getStore('userName') || '';
    this.setState({ fileImgList });
  }
  /**
  * 渲染车辆图片
  */
  renderVehicleImg = () => {
    const { fileImgList } = this.state;
    return (
      <div>
        {fileImgList.map((colItem: any, index) => {
          return <Row className={styles.vehicleImgItem} key={`${colItem.url}_${index}`} gutter={12}>
            <Col span={3}>
              <div className={styles.imgBox}>
                <img alt='照片' src={colItem.url} />
              </div>
            </Col>
            <Col span={9}>
              <div className={styles.imgName}>图片名称</div>
              <Input
                type="text"
                onChange={(e) => { this.changeImgName(e.target.value, index) }}
                value={colItem.name}
                allowClear
                maxLength={30}
              />
            </Col>
            <Col span={7}>
              <div className={styles.imgUser}>{colItem.username}</div>
              <div className={styles.imgTime}>{moment(colItem.time).format('YYYY-MM-DD HH:mm:ss')}</div>
            </Col>
            <Col span={4}>
              <Button className={styles.deleteImgBtn} type='link' onClick={() => { this.deleteImgFun(colItem, index) }}>删除</Button>
            </Col>
          </Row>
        })}
      </div>
    )
  }

  /**
   * 图片上传限制
   */
  beforeUpload = (file: any) => {
    const { fileImgList } = this.state;
    const curLen = fileImgList.length;

    if (curLen >= 8) {
      message.warning('最多上传8张车辆照片');
      return false;
    }

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

  /**
   * 上传车辆照片
   */
  handleChange = (list: any) => {
    const { fileList } = list;
    const len = fileList.length - 1;
    this.setState({
      uploadImgLoading: true
    })
    if (fileList && fileList[len]) {
      const { response, status } = fileList[len];
      if (response) {
        if (response.code === 200) {
          const { fileImgList } = this.state;
          const data = JSON.parse(response.data);
          const newImgObj = {
            url: data.webUrl,
            type: 1,
            name: data.filename.substring(data.filename.length - 30),
            newUpload: true,
            order: fileImgList.length,
            username: getStore('userName') || '',
            time: getNowDate()
          };
          fileImgList.push(newImgObj);
          this.setState({ fileImgList });
        } else if (response.msg) {
          message.error(response.msg);
        }

      }
      if (status !== "uploading") {
        this.setState({
          uploadImgLoading: false
        })
      }
    }
  };

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
    // 组装车辆图片集合
    const { fileImgList, deleteImgArr } = this.state;
    values.monitorPhotos = JSON.stringify(fileImgList);
    values.updateDataUsername = getStore('userName') || '';
    values.vehicleTypeId = values.vehicleTypeId.value;

    // 组装所属企业的名字与id
    if (typeof values.orgId === 'object') {
      values.orgName = values.orgId.label;
      values.orgId = values.orgId.value;
    } else {
      values.orgName = '';
    }
    console.log('提交参数', values);

    const { drawerVisible: { addAndedit }, currentTable, monitorInfo, getBindData } = this.props;

    values.vehicleCategoryId = 4;// 车辆类别固定未环卫车
    if (addAndedit === 'add') {// 新增
      const result = await addVehicle<boolean>(values);
      if (result) {
        this.changeDrawerVisible({ addAndedit: false });
        message.success('新增成功');
        getBindData();// 更新未绑定车辆数据
        currentTable.current.reloadPageOne();
      }

    } else if (addAndedit === 'edit') {// 修改
      values.id = monitorInfo.id;
      const result = await editVehicleBasicInfo<boolean>(values);
      if (result) {
        this.changeDrawerVisible({ addAndedit: false, detailVisible: false });
        if (deleteImgArr.length > 0) {
          this.confirmDeleteImg(deleteImgArr);
        }
        message.success('修改成功');
        getBindData();// 更新未绑定车辆数据
        currentTable.current.reload();
      }
    }
  }

  /**
   * 关闭抽屉时删除之前上传的照片
   */
  closeDrawer = () => {
    const { fileImgList } = this.state;
    const data: any = [];
    fileImgList.map(item => {
      if (item.newUpload) {
        data.push(item.url);
      }
      return item;
    })
    if (data.length > 0) {
      this.confirmDeleteImg(data);
    }
    this.setState({
      disabledStatus: false
    })
    this.changeDrawerVisible({ addAndedit: false })
  };

  render() {
    const { drawerVisible: { addAndedit }, currentSelectOrg } = this.props;
    const { dataInfo, loading, uploadImgLoading, disabledStatus } = this.state;

    return (
      <EditDrawer
        title={addAndedit === 'add' ? '新增车辆' : '修改基本信息'}
        width={1060}
        visible={addAndedit ? true : false}
        onConfirm={() => {
          this.formRef.current.submit()
        }}
        getContainer="body"
        onClose={this.closeDrawer}
      >
        <div className={styles.editForm}>
          <Form
            ref={this.formRef}
            initialValues={formInitValue}
            onFinish={this.formSubmit}
            className={styles.publicDrawer}
            id="vehicleSelectContainer"
          >
            <div className={styles.innerBox}>
              <VehicleForm
                monitorInfo={dataInfo}
                formRef={this.formRef}
                drawerVisible={addAndedit}
                disabledStatus={disabledStatus}
                currentSelectOrg={currentSelectOrg}
              />
              <table className={[styles.itemTable, styles.imgTable].join(' ')}>
                <tbody>
                  <tr><th className={styles.tableHeader}>车辆照片</th></tr>
                  <tr>
                    <td>
                      <div className={styles.vehicleImgBox}>
                        {this.renderVehicleImg()}
                        <div className={styles.uploadBox}>
                          <Upload
                            accept='image/jpg,image/jpeg,image/png'
                            beforeUpload={this.beforeUpload}
                            onChange={this.handleChange}
                            headers={{
                              'Authorization': `Bearer ${getStore('token')}`
                            }}
                            action='/api/mo/monitoring-vehicle/photo'
                            showUploadList={false}
                          >
                            <Button type='link' disabled={uploadImgLoading} loading={uploadImgLoading}>
                              {!uploadImgLoading && <UploadOutlined />}上传图片
                                                    </Button>
                          </Upload>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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

