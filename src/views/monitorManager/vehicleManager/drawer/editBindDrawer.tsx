/**
 * 修改车辆绑定信息
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import moment from 'moment';
import {
  Form, Select, DatePicker, Spin,
} from 'antd';
const { Option } = Select;
import { EditDrawer } from '@/common/';

import {
  getEditBindInfo, getProfessionalList,
  updateBindInfo, repeatMonitorNumber, checkShiftByMonitorId,
} from '@/server/monitorManager';

import PublicTreeSelect from '@/common/publicTreeSelect';
import SearchSelect from '@/common/searchSelect';


import styles from '../../index.module.less';
import { message } from 'antd';
// import { regularText } from '@/common/rules';
import { getSelectContainer } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';
import { IO } from 'redux-saga/lib/runSaga';

interface IProps {
  monitorInfo: any;
  drawerVisible: {
    editBindInfo: boolean;
    detailVisible: boolean | undefined | 'synthesisSet';
  };
  changeDrawer: Function;
  unbindData: {
    vehicleList: Array<object>;
    deviceList: Array<object>;
    simCardList: Array<object>;
  };
  vehicleTypeData: Array<IOption>;
  getBindData: Function;
  groupTreeData: Array<object>;
  protocolTypeData: Array<IOption>;
  currentTable: any;
}
interface IOption {
  id: string;
  name: string;
  val?: number
}

interface IState {
  professionalData: Array<IOption>;
  terminalTypesData: Array<IOption>;
  monitorId: string;
  bindInfo: any;
  disabledStatus: boolean;
  simCardId: string | null;
  deviceId: string | null;
  loading: boolean;
}

const dateArr = ['billingDate', 'expireDate'];// 需要转换日期格式的字段

class EditBindDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      bindInfo: {},
      loading: true,
      disabledStatus: false,// 字段禁用控制
      simCardId: '',// SIM卡id
      deviceId: '',// 终端id
      professionalData: [],// 从业人员
      terminalTypesData: [],// 终端型号
    };
  }

  componentDidMount() {
    const { monitorInfo: { orgId } } = this.props;
    this.getSelectData(orgId);
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { monitorInfo, drawerVisible: { editBindInfo } } = nextProps;
    const { monitorId } = this.state;
    if (editBindInfo && monitorInfo) {
      const { monitorInfo: { id } } = nextProps;
      if (monitorId === '' || id && monitorId !== id) {
        this.getBindInfo(id);
      }
    }
  }

  /**
   * 获取绑定信息并对页面表单元素赋值
   * @param monitorId 车辆Id
   */
  getBindInfo = async (monitorId: string) => {
    const resultData: any = await getEditBindInfo<Record<string, any>>(monitorId);
    const checkStatus = await checkShiftByMonitorId<boolean>(monitorId);
    if (resultData) {
      const result = JSON.parse(JSON.stringify(resultData));
      dateArr.map(key => {
        result[key] = result[key] ? moment(result[key]) : '';
      })
      const proInfo = result.professionals;
      if (proInfo) {
        proInfo.map((item: any) => {
          item.value = item.id;
          item.label = item.name;
          return item;
        })
      }
      this.setState({
        monitorId,
        bindInfo: resultData,
        simCardId: resultData.simCardId,
        deviceId: resultData.deviceId,
        disabledStatus: checkStatus === undefined ? false : checkStatus,
        loading: false,
      }, () => {
        // 重新组装SIM卡与终端号所属企业下拉项值
        if (result.simCardOrgName) {
          result.simCardOrgId = { label: result.simCardOrgName, value: result.simCardOrgId };
        }
        if (result.deviceOrgName) {
          result.deviceOrgId = { label: result.deviceOrgName, value: result.deviceOrgId };
        }
        if (result.vehicleTypeId) {
          result.vehicleTypeId = { label: result.vehicleType, value: result.vehicleTypeId };
        }
        this.formRef.current.setFieldsValue(result);
      })
    } else {
      this.setState({
        loading: false,
        disabledStatus: checkStatus === undefined ? false : checkStatus,
      });
    }
  }

  /**
  * 查询数据字典,获取页面中的部分下拉项数据
  */
  getSelectData = async (orgId: string) => {
    const professionalListResult = await getProfessionalList<Array<Record<string, any>>>(orgId);

    const professionalData: any = professionalListResult || [];

    this.setState({
      professionalData,
    }, () => {
      // 默认选中第一个选项
      const { vehicleTypeData } = this.props;
      if (this.formRef.current) {
        const obj = {
          value: vehicleTypeData[0] ? vehicleTypeData[0].id : '',
          label: vehicleTypeData[0] ? vehicleTypeData[0].name : '',
        }
        this.formRef.current.setFieldsValue({ vehicleTypeId: obj });
      }
      const { monitorInfo: { id }, drawerVisible: { editBindInfo } } = this.props;
      if (editBindInfo) {
        this.getBindInfo(id);
      }
    })
  }

  /**
   * 渲染下拉选项
   * 终端型号数据没有name字段,修改字段为terminalType
   */
  renderSelectOption = (data: Array<IOption>, key?: string) => {
    return data.map((item: any) => (
      <Option
        value={key ? item[key] : item.id}
        key={`${item.name !== undefined ? item.name : item.terminalType}_${item.id}`}
      >
        {item.name !== undefined ? item.name : item.terminalType}
      </Option>
    ))
  }

  /**
   * 改变抽屉显示状态
   */
  changeDrawerVisible = (param: object) => {
    this.setState({
      monitorId: ''
    }, () => {
      const { changeDrawer } = this.props;
      changeDrawer(param);
      this.formRef.current.resetFields();
    })
  };

  /**
   * 选择从业人员校验
   */
  checkProfessionalFun = (rule: any, checkObj: { value: string }, callback: Function) => {
    if (!checkObj) {
      callback();
      return;
    }
    const professionalValue = this.formRef.current.getFieldValue('professionals');
    if (professionalValue.length > 10) {
      callback('最多选择10个从业人员');
    }
    callback();
  }

  /**
   * 表单提交
   */
  formSubmit = async (values: any) => {
    const { bindInfo, simCardId, deviceId, monitorId } = this.state;
    console.log('提交参数', values);
    dateArr.map(key => {
      values[key] = values[key] ? moment(values[key]).format('YYYY-MM-DD') : '';
    })

    // 组装旧的绑定信息
    values.oldDeviceId = bindInfo.deviceId;
    values.oldMonitorId = bindInfo.monitorId;
    values.oldSimCardId = bindInfo.simCardId;

    values.professionalIds = [];
    values.professionalNames = [];
    values.professionals.map((item: any) => {
      values.professionalIds.push(item.value);
      values.professionalNames.push(item.label);
    })
    values.professionalIds = values.professionalIds.join(',');
    values.professionalNames = values.professionalNames.join(',');

    // 组装更改后的绑定信息
    values.moType = 0;// 监控对象类型:车
    values.monitorId = monitorId;
    values.simCardId = simCardId;
    values.deviceId = deviceId;

    values.vehicleTypeId = values.vehicleTypeId.value;
    values.typeId = values.vehicleTypeId;

    if (values.orgId && typeof values.orgId === 'object') {
      values.orgName = values.orgId.label;
      values.orgId = values.orgId.value;
    }
    // 终端,SIM卡所属企业与监控对象所属企业一致
    values.simCardOrgName = values.orgName;
    values.simCardOrgId = values.orgId;
    values.deviceOrgName = values.orgName;
    values.deviceOrgId = values.orgId;

    // if (values.simCardOrgId && typeof values.simCardOrgId === 'object') {
    //     values.simCardOrgName = values.simCardOrgId.label;
    //     values.simCardOrgId = values.simCardOrgId.value;
    // }
    // if (values.deviceOrgId && typeof values.deviceOrgId === 'object') {
    //     values.deviceOrgName = values.deviceOrgId.label;
    //     values.deviceOrgId = values.deviceOrgId.value;
    // }

    const result: any = await updateBindInfo<boolean>(values);
    if (result) {
      const { currentTable } = this.props;
      this.changeDrawerVisible({ editBindInfo: false, detailVisible: false });
      message.success('修改成功');
      currentTable.current.reload();
    }
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    this.changeDrawerVisible({ editBindInfo: false })
  }

  /**
  * 校验车牌号是否已存在
  */
  repeatMonitorNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback();
      return;
    }
    const param = new URLSearchParams();
    param.set('number', value);
    const { monitorInfo: { id } } = this.props;
    param.set('id', id);

    repeatMonitorNumber<boolean>(param).then(res => {
      if (res) {
        callback();
      } else {
        callback('车牌号已存在');
      }
    });
  }

  /**
   * 所属企业改变,联动改变从业人员数据
   * @param data 
   */
  orgChange = async (data: any) => {
    const { value } = data;
    console.log('value', data);
    const professionalListResult = await getProfessionalList<Array<Record<string, any>>>(value);
    const professionalData: any = professionalListResult || [];
    this.setState({
      professionalData,
    }, () => {
      this.formRef.current.setFieldsValue({
        professionals: [],
      });
    })
  }

  /**
   * 控制日期可选范围
   * 到期日期必须大于等于计费日期
   */
  dateDisabled = (currentDate: any, key: string) => {
    const startDate = this.formRef.current.getFieldValue('billingDate');
    const endDate = this.formRef.current.getFieldValue('expireDate');
    if (key === 'billingDate' && endDate) {// 计费日期
      return currentDate >= endDate;
    } else if (key === 'expireDate' && startDate) {// 到期日期
      return currentDate < startDate;
    }
    return false;
  }

  /**
   * 获取表单显示列信息
   */
  getTableColumn = () => {
    const {
      groupTreeData, protocolTypeData, vehicleTypeData, unbindData: { simCardList, deviceList },
    } = this.props;
    const { professionalData, disabledStatus } = this.state;

    // 对象详情
    const monitorInfoColumn = [{
      name: '车牌号',
      key: 'monitorNumber',
      validate: {
        rules: [
          { required: true, message: '请输入车牌号' },
          {
            pattern: new RegExp(/^[\u4e00-\u9fa5-a-zA-Z0-9]{2,20}$/),
            message: '请输入汉字、字母、数字或短横杠,长度2-20位',
          },
          {
            validator: this.repeatMonitorNumberFun,
          }]
      },
      inputProps: {
        maxLength: 20,
      },
    }, {
      name: '车辆类型',
      key: 'vehicleTypeId',
      validate: {
        rules: [{ required: true, message: '请选择车辆类型' }]
      },
      component: <Select
        labelInValue
        placeholder="请选择车辆类型"
        bordered={false}
        disabled={disabledStatus}
      >
        {this.renderSelectOption(vehicleTypeData)}
      </Select>
    }, {
      name: '所属企业',
      key: 'orgId',
      validate: {
        rules: [{ required: true, message: '请选择所属企业' }]
      },
      colWidth: 200,
      component: <PublicTreeSelect
        bordered={false}
        treeData={groupTreeData}
        treeType='enterprise'
        placeholder='请勾选企业'
        onChange={this.orgChange}
        disabled={disabledStatus}
        getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}
      />
    }];

    // 终端详情
    const deviceInfoColumn = [{
      name: '终端号',
      key: 'deviceNumber',
      validate: {
        rules: [{ required: true, message: '终端号不能为空' }]
      },
      component: <SearchSelect
        menuData={deviceList}
        titleKey='deviceNumber'
        formRef={this.formRef}
        itemName="deviceNumber"
        linkageField='deviceId'
        optionClick={(item: null | { id: string }) => {
          this.setState({
            deviceId: item ? item.id : null
          })
        }}
        itemRules={[
          { required: true, message: '终端号不能为空' },
          {
            pattern: new RegExp(/^[a-zA-Z0-9]{7,30}$/),
            message: '请输入字母、数字,长度7~30位',
          }
        ]}
        inputProps={{
          maxLength: 30,
          placeholder: '请输入或选择终端号'
        }}
      />
    }, {
      name: '终端厂商',
      key: 'terminalManufacturer',
      validate: {
        rules: [{ required: true, message: '请选择终端厂商' }]
      },
      component: <Select
        bordered={false}
        getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}
      >
        <Option value="[f]F3">[f]F3</Option>
      </Select>
    }, {
      name: '所属企业',
      key: 'orgId',
      validate: {
        rules: [{ required: true, message: '请选择所属企业' }]
      },
      colWidth: 200,
      component: <PublicTreeSelect
        bordered={false}
        treeData={groupTreeData}
        onChange={this.orgChange}
        treeType='enterprise'
        placeholder='请勾选企业'
        disabled={disabledStatus}
        getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}
      />
    }, {
      name: '通讯类型',
      key: 'deviceType',
      validate: {
        rules: [{ required: true, message: '请选择通讯类型' }]
      },
      component: <Select bordered={false} placeholder="请选择通讯类型">
        {protocolTypeData.map((item: any) =>
          <Option key={item.val} value={item.val}>{item.name}</Option>
        )}
      </Select>
    }, {
      name: '终端型号',
      key: 'terminalTypeId',
      validate: {
        rules: [{ required: true, message: '请选择终端型号' }]
      },
      component: <Select bordered={false}>
        <Option value="-1">F3-default</Option>
      </Select>
    }];

    // SIM卡详情
    const simInfoColumn = [{
      name: '终端手机号',
      key: 'simCardNumber',
      validate: {
        rules: [{ required: true, message: '终端手机号不能为空' }]
      },
      component: <SearchSelect
        menuData={simCardList}
        titleKey='simCardNumber'
        formRef={this.formRef}
        itemName="simCardNumber"
        linkageField='simCardId'
        optionClick={(item: null | { id: string }) => {
          this.setState({
            simCardId: item ? item.id : null
          })
        }}
        itemRules={[
          { required: true, message: '终端手机号不能为空' },
          {
            pattern: new RegExp(/^[0-9]{7,20}$/),
            message: '请输入字母、数字,长度7~20位',
          }
        ]}
        inputProps={{
          maxLength: 20,
          placeholder: '请输入或选择终端手机号'
        }}
      />
    }, {
      name: 'ICCID',
      key: 'iccid',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9A-Z]{0,20}$/),
          message: '请输入数字/大写字母',
        }]
      },
      inputProps: {
        maxLength: 20,
      }
    }, {
      name: '所属企业',
      key: 'orgId',
      validate: {
        rules: [{ required: true, message: '请选择所属企业' }]
      },
      colWidth: 200,
      component: <PublicTreeSelect
        bordered={false}
        treeData={groupTreeData}
        onChange={this.orgChange}
        treeType='enterprise'
        placeholder='请勾选企业'
        disabled={disabledStatus}
        getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}
      />
    }, {
      name: '运营商',
      key: 'operator',
      validate: {
        rules: [{ required: true, message: '请选择运营商' }]
      },
      component: <Select bordered={false} placeholder="请选择运营商" getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}>
        <Option value='中国移动'>中国移动</Option>
        <Option value='中国联通'>中国联通</Option>
        <Option value='中国电信'>中国电信</Option>
      </Select>
    }, {
      name: '真实SIM卡号',
      key: 'realNumber',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{7,20}$/),
          message: '请输入数字,长度7-20位',
        }]
      },
      inputProps: {
        maxLength: 20,
      }
    }];

    // 服务期限
    const dateInfoColumn = [{
      name: '计费日期',
      key: 'billingDate',
      component: <DatePicker
        bordered={false}
        style={{ width: '100%' }}
        disabledDate={(current: any) => { return this.dateDisabled(current, 'billingDate') }}
        getPopupContainer={() => getSelectContainer('vehicleSelectContainer')} />
    }, {
      name: '到期日期',
      key: 'expireDate',
      component: <DatePicker
        bordered={false}
        style={{ width: '100%' }}
        disabledDate={(current: any) => { return this.dateDisabled(current, 'expireDate') }}
        getPopupContainer={() => getSelectContainer('vehicleSelectContainer')} />
    }]

    // 从业人员
    const professionalColumn = [{
      name: '',
      key: 'professionals',
      validate: {
        rules: [{ validator: this.checkProfessionalFun }]
      },
      component: <Select
        mode='tags'
        showSearch
        labelInValue
        bordered={false}
        placeholder='请选择从业人员'
        optionFilterProp="children"
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}
      >
        {this.renderSelectOption(professionalData)}
      </Select>
    }]

    return { monitorInfoColumn, deviceInfoColumn, simInfoColumn, dateInfoColumn, professionalColumn };
  }

  render() {
    const { drawerVisible: { editBindInfo } } = this.props;
    const { loading } = this.state;

    const { monitorInfoColumn, deviceInfoColumn, simInfoColumn, dateInfoColumn, professionalColumn } = this.getTableColumn();


    return (
      <EditDrawer
        title="修改绑定信息"
        width={1060}
        onClose={this.closeDrawer}
        visible={editBindInfo}
        getContainer="body"
        onConfirm={() => {
          this.formRef.current.submit()
        }}
      >
        <div className={styles.editForm}>
          <Form
            ref={this.formRef}
            initialValues={{
              deviceType: 101100,
              operator: '中国移动',
              terminalManufacturer: '[f]F3',
              terminalTypes: 'F3-default'
            }}
            onFinish={this.formSubmit}
            className={styles.publicDrawer}
            id="vehBindSelectContainer"
            style={{ position: 'relative' }}
          >
            <div className={styles.innerBox}>
              <TableForm dataSource={monitorInfoColumn} column={6} header='对象详情' />
              <TableForm dataSource={deviceInfoColumn} column={6} header='终端详情' />
              <TableForm dataSource={simInfoColumn} column={6} header='SIM卡详情' />
              <TableForm dataSource={dateInfoColumn} column={6} header='服务期限' />
              <TableForm dataSource={professionalColumn} column={6} header='从业人员' />
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
  (state: AllState) => ({
    unbindData: state.monitorMananger.unbindData,
    groupTreeData: state.monitorMananger.groupTreeData,
    vehicleTypeData: state.monitorMananger.vehicleTypeData,
    protocolTypeData: state.monitorMananger.protocolTypeData,
  }),
  dispatch => ({
    getBindData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
    },
  }),
)(EditBindDrawer);