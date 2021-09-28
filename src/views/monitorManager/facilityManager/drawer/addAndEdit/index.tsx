/**
 * 新增、修改人员信息
 */
import React, { Component } from 'react';
import { Form, Spin } from 'antd';

import moment from 'moment';
import { EditDrawer } from '@/common/';
import AddressInfoForm from './addressInfoForm';
import FacilityInfoForm from './facilityInfoForm';
import FacilityImg from './facilityImg';

import {
  deleteImg, getFacilityDetailInfo,
  addFacility, updateFacility,
} from '@/server/monitorManager';

import styles from '../../../index.module.less';
import { message } from 'antd';

interface IProps {
  monitorInfo: any;
  drawerVisible: {
    addAndedit: false | 'add' | 'edit' | undefined;
    detailVisible: boolean | undefined | 'synthesisSet';
  };
  changeDrawer: Function;
  currentTable: any;
  currentSelectOrg?: string | null;
}

interface IState {
  monitorId: string;
  dataInfo: any;
  loading: boolean;
  fileImgList: Array<IImgItem>;
  deleteImgArr: Array<string>;
  markerPosition: Array<number> | null
}
interface IImgItem {
  name: string;
  time: string;
  username: string;
  url: string;
  newUpload?: boolean;
  photoId: string;
}


// 需要转换日期格式的字段
const dateArr = [
  'birthday',
  'drivingStartDate',
  'drivingEndDate',
  'installTime'
]

class AddAndEditDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      dataInfo: {},// 页面所有字段的数据
      loading: false,
      fileImgList: [],// 设施照片
      deleteImgArr: [],// 存放被用户删除的原有图片(之前已经上传的设施照片,只有在用户删除该图片并点击确定按钮提交数据后才会真正删除)
      markerPosition: null,// 设施标注在地图上显示的位置
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
    if (addAndedit === 'edit' && monitorInfo && monitorInfo.id !== monitorId) {
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

  /**
   * 获取页面信息
   */
  getBasicInfo = async (id: string) => {
    const result = await getFacilityDetailInfo<Array<Record<string, any>>>(id);

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
      let position: any = null;
      if (data.longitude != undefined && data.latitude != undefined) {
        position = [data.longitude, data.latitude]
      }

      this.setState({
        monitorId: id,
        dataInfo: data,
        fileImgList: data.monitorPhotoList,
        loading: false,
        markerPosition: position
      }, () => {
        const orgId = data.orgId;
        data.orgId = {// 组装所属企业字段值
          label: data.orgName,
          value: orgId,
        };
        data.facilityTypeId = { value: data.facilityTypeId, label: data.facilityType }
        this.formRef.current.setFieldsValue(data);
      })
    } else {
      this.setState({ loading: false });
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
   * 确认删除图片
   */
  confirmDeleteImg = async (imgArr: Array<string>) => {
    await deleteImg<boolean>(imgArr);
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
    // 组装所属企业的名字与id
    if (typeof values.orgId === 'object') {
      values.orgName = values.orgId.label;
      values.orgId = values.orgId.value;
    } else {
      values.orgName = '';
    }

    const { drawerVisible: { addAndedit }, currentTable, monitorInfo } = this.props;
    const { fileImgList, deleteImgArr } = this.state;

    values.addPhotos = fileImgList;
    values.facilityTypeId = values.facilityTypeId.value;

    if (addAndedit === 'add') {// 新增

      // 组装所属组织的名字与id
      if (typeof values.orgId === 'object') {
        values.orgName = values.orgId.label;
        values.orgId = values.orgId.value;
      } else {
        values.orgName = '';
      }

      const result = await addFacility<boolean>(values);
      if (result) {
        this.changeDrawerVisible({ addAndedit: false });
        message.success('新增成功');
        currentTable.current.reloadPageOne();
      }

    } else if (addAndedit === 'edit') {// 修改
      values.id = monitorInfo.id;
      if (typeof values.orgId === 'object') {
        values.orgName = values.orgId.label;
        values.orgId = values.orgId.value;
      }

      values.deletePhotoIds = deleteImgArr

      const result = await updateFacility<boolean>(values);
      if (result) {
        this.setState({
          monitorId: '',
        }, () => {
          this.changeDrawerVisible({ addAndedit: false, detailVisible: false });
          if (deleteImgArr.length > 0) {
            this.confirmDeleteImg(deleteImgArr);
          }
          message.success('修改成功');
          currentTable.current.reload();
        })
      }
    }
  }

  /**
  * 改变抽屉显示状态
  */
  changeDrawerVisible = (param: object) => {
    const { changeDrawer } = this.props;
    changeDrawer(param);
    this.resetDrawerData();
  };

  /**
   * 重置抽屉数据
   */
  resetDrawerData = () => {
    this.setState({
      monitorId: '',
      dataInfo: {},
      loading: false,
      fileImgList: [],
      deleteImgArr: [],
      markerPosition: null,
    });
    this.formRef.current.resetFields();
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    this.setState({
      monitorId: '',
    }, () => {
      this.changeDrawerVisible({ addAndedit: false })
    })
  };

  /**
   * 监听表单值变化
   * 当经纬度改变时,联动改变地图上的标注位置
   * PS:经纬度必须符合相关校验
   */
  fieldsChange = (changedFields: { latitude: number; longitude: number }) => {
    if (changedFields.latitude || changedFields.longitude) {
      const { current } = this.formRef;
      const posValue = current.getFieldsValue(['longitude', 'latitude']);
      if (posValue.longitude && posValue.latitude) {
        const longitudeReg = new RegExp(/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/);
        const latitudeReg = new RegExp(/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/);
        if (longitudeReg.test(posValue.longitude) && latitudeReg.test(posValue.latitude)) {
          this.setState({
            markerPosition: [posValue.longitude, posValue.latitude]
          })
        }
      }
    }
  }

  /**
   * 修改设施照片，上传、删除等操作
   */
  changeImg = (result: { fileImgList?: Array<IImgItem>, deleteImgArr?: Array<string> }) => {
    this.setState(result as any);
  }

  render() {
    const { currentSelectOrg, drawerVisible: { addAndedit }, monitorInfo } = this.props;
    const { loading, fileImgList, markerPosition, deleteImgArr } = this.state;

    return (
      <EditDrawer
        title={addAndedit === 'add' ? '新增设施' : '修改基本信息'}
        width={1060}
        visible={addAndedit ? true : false}
        onConfirm={() => {
          this.formRef.current.submit()
        }}
        onClose={this.closeDrawer}
        getContainer='body'
      >
        <div className={styles.editForm}>
          <Form
            ref={this.formRef}
            className={styles.publicDrawer}
            id="facilitySelectContainer"
            initialValues={{
              facilityColor: 1,
              status: 1,
              fixStatus: 0,
              bloodType: 'A',
            }}
            onFinish={this.formSubmit}
            onValuesChange={this.fieldsChange}
          >
            <div className={styles.innerBox}>
              {/* 设施信息 */}
              <FacilityInfoForm
                formRef={this.formRef}
                monitorInfo={monitorInfo}
                drawerVisible={addAndedit}
                currentSelectOrg={currentSelectOrg}
              />
              {/* 位置信息 */}
              <AddressInfoForm formRef={this.formRef} monitorInfo={monitorInfo} markerPosition={markerPosition} />
              {/* 设施照片 */}
              <FacilityImg fileImgList={fileImgList} deleteImgArr={deleteImgArr} changeImg={this.changeImg} />
            </div>
          </Form>
          {/* 加载loading */}
          {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
        </div>
      </EditDrawer>
    );
  }
}
export default AddAndEditDrawer;
