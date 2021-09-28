/**
 * 新增、修改车辆信息
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { FormattedMessage } from 'react-intl';
import { Select, DatePicker, Radio } from 'antd';
const { Option } = Select;

import PublicTreeSelect from '@/common/publicTreeSelect';
import {
  repeatMonitorNumber, getFuelType,
} from '@/server/monitorManager';

import { regularText } from '@/common/rules';
import { getSelectContainer } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';

import { realNameReg } from '@/framework/utils/regExp';

interface IProps {
  monitorInfo: any;
  drawerVisible: false | 'add' | 'edit' | undefined;
  formRef: any;
  disabledStatus: boolean;
  vehicleTypeData: Array<IOption>;
  currentSelectOrg?: string | null;
}

interface IState {
  fuelTypeData: Array<IOption>;
}

interface IOption {
  id: string;
  name: string;
  enabled?: boolean
}

class AddAndEditDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      fuelTypeData: [],// 燃料类型
    };
  }
  componentDidMount() {
    this.getSelectData();
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { drawerVisible } = nextProps;
    if (drawerVisible === 'add') {
      this.renderOrgId();
    }
  }

  /**
   * 新增时,如果用户在左侧组织树选中了企业，默认为选中的企业
   */
  renderOrgId = () => {
    const { currentSelectOrg, formRef } = this.props;
    if (currentSelectOrg && formRef.current) {
      formRef.current.setFieldsValue({
        isStart: 1,
        stateRepair: 0,
        orgId: {
          value: currentSelectOrg
        }
      });
    }
  }

  /**
   * 查询数据字典,获取页面中的部分下拉项数据
   * fuelTypeData:燃料类型
   */
  getSelectData = async () => {
    const fuelTypeResult = await getFuelType<Array<Record<string, any>>>();

    const fuelTypeData: any = fuelTypeResult || [];
    this.setState({
      fuelTypeData,
    }, () => {
      const { monitorInfo, drawerVisible, formRef } = this.props;
      if (drawerVisible === 'edit' && monitorInfo) {

      } else {
        // 默认选中第一个选项
        const { vehicleTypeData } = this.props;
        const obj = {
          value: vehicleTypeData[0] ? vehicleTypeData[0].id : '',
          label: vehicleTypeData[0] ? vehicleTypeData[0].name : '',
        }
        formRef.current.setFieldsValue({
          vehicleTypeId: obj,
          fuelTypeId: fuelTypeData[0] ? fuelTypeData[0].id : '',
        });
        this.renderOrgId();
      }
    })
  }

  /**
   * 渲染下拉选项
   */
  renderSelectOption = (data: Array<IOption>) => {
    return data.map(item => (
      <Option value={item.id} key={`${item.name}_${item.id}`}>{item.name}</Option>
    ))
  }

  /**
   * 校验车牌号是否已存在
   */
  repeatMonitorNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback();
      return;
    }
    const { drawerVisible } = this.props;
    const param = new URLSearchParams();
    param.set('number', value);
    if (drawerVisible === 'edit') {
      const { monitorInfo: { id } } = this.props;
      param.set('id', id);
    }
    repeatMonitorNumber<boolean>(param).then(res => {
      if (res) {
        callback();
      } else {
        callback('车牌号已存在');
      }
    });
  }

  /**
   * 获取表单显示列信息
   */
  getFormColumn = () => {
    const { vehicleTypeData, disabledStatus } = this.props;
    const { fuelTypeData } = this.state;

    const vehicleInfoColumn = [{
      name: '车牌号',
      key: 'number',
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
      name: '别名',
      key: 'aliases',
      validate: {
        rules: [{
          pattern: new RegExp(/^[a-zA-Z0-9]{0,5}$/),
          message: '请输入字母/数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: '请输入车辆别名'
      },
    }, {
      name: '车牌颜色',
      key: 'plateColor',
      validate: {
        rules: [{
          required: true,
          message: '请选择车牌颜色',
        }]
      },
      component: <Select
        placeholder="请选择车牌颜色"
        bordered={false}
        getPopupContainer={() => getSelectContainer('vehicleSelectContainer')}
      >
        <Option value={1}>
          <FormattedMessage id="monitor_blueColor" />
        </Option>
        <Option value={2}>
          <FormattedMessage id="monitor_yellowColor" />
        </Option>
        <Option value={3}>
          <FormattedMessage id="monitor_blackColor" />
        </Option>
        <Option value={4}>
          <FormattedMessage id="monitor_whiteColor" />
        </Option>
        <Option value={5}>
          <FormattedMessage id="monitor_greenColor" />
        </Option>
        <Option value={94}>
          <FormattedMessage id="monitor_gradientGreenColor" />
        </Option>
        <Option value={93}>
          <FormattedMessage id="monitor_yellowGreenColor" />
        </Option>
        <Option value={9}>
          <FormattedMessage id="monitor_otherColor" />
        </Option>
      </Select>
    }, {
      name: '车辆颜色',
      key: 'vehicleColor',
      component: <Select
        bordered={false}
        placeholder="请选择车辆颜色"
      >
        <Option value="0">黑色</Option>
        <Option value="1">白色</Option>
        <Option value="2">红色</Option>
        <Option value="3">蓝色</Option>
        <Option value="4">紫色</Option>
        <Option value="5">黄色</Option>
        <Option value="6">绿色</Option>
        <Option value="7">粉色</Option>
        <Option value="8">棕色</Option>
        <Option value="9">灰色</Option>
      </Select>
    }, {
      name: '所属企业',
      key: 'orgId',
      validate: {
        rules: [{ required: true, message: '请选择企业' }]
      },
      colSpan: 3,
      component:
        <PublicTreeSelect
          bordered={false}
          disabled={disabledStatus}
          treeType='enterprise'
          placeholder='请选择企业'
          getPopupContainer={() => getSelectContainer('vehicleSelectContainer')}
        />
    }, {
      name: '车辆类型',
      key: 'vehicleTypeId',
      validate: {
        rules: [{
          required: true,
          message: '请选择车辆类型',
        }]
      },
      component: <Select
        placeholder="请选择车辆类型"
        bordered={false}
        disabled={disabledStatus}
        labelInValue
      >
        {this.renderSelectOption(vehicleTypeData)}
      </Select>
    }, {
      name: '燃料类型',
      key: 'fuelTypeId',
      component: <Select
        placeholder="请选择燃料类型"
        bordered={false}
      >
        {this.renderSelectOption(fuelTypeData)}
      </Select>
    }, {
      name: '车辆状态',
      key: 'isStart',
      colWidth: 170,
      component: <Radio.Group>
        <Radio value={1}>启用</Radio>
        <Radio value={0}>停用</Radio>
      </Radio.Group>
    }, {
      name: '维修状态',
      key: 'stateRepair',
      component: <Radio.Group>
        <Radio value={1}>是</Radio>
        <Radio value={0}>否</Radio>
      </Radio.Group>
    }, {
      name: '核定载人数',
      key: 'numberLoad',
      validate: {
        rules: [
          {
            pattern: new RegExp(/^[0-9]{0,3}$/),
            message: '请输入数字',
          }
        ]
      },
      inputProps: {
        maxLength: 2,
      },
    }, {
      name: '核定承载量',
      key: 'loadingQuality',
      formClassName: 'whiteWrapOk',
      validate: {
        rules: [
          {
            pattern: new RegExp(/^(([1-9]{1}\d{0,5})|(0{1}))(\.\d{2})?$/),
            message: '请输入数字,保留两位小数,输入范围0-999999.99'
          }
        ]
      },
      inputProps: {
        maxLength: 9,
      },
    }, {
      name: '车辆联系人',
      key: 'vehicleOwner',
      validate: {
        rules: [
          {
            validator: async (rule: any, value: string) => {
              if (value) {
                if (value.length != value.trim().length || !realNameReg.test(value)) {
                  return Promise.reject('格式为中文/字母/原点/非首尾的空格');
                }
                return Promise.resolve();
              }
            }
          }
        ]
      },
      inputProps: {
        maxLength: 30,
      },
    }, {
      name: '联系电话',
      key: 'vehicleOwnerPhone',
      validate: {
        rules: [
          {
            pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/),
            message: '电话号码格式有误',
          }
        ]
      },
      inputProps: {
        maxLength: 11,
      },
    }, {
      name: '车辆保险单号',
      key: 'vehicleInsuranceNumber',
      colSpan: 3,
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 50,
      },
    }, {
      name: '保养里程数(km)',
      key: 'maintainMileage',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,8}$/),
          message: '请输入数字'
        }]
      },
      inputProps: {
        maxLength: 8,
        placeholder: '请输入保养里程数'
      },
    }, {
      name: '保养有效期',
      key: 'maintainValidity',
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('vehicleSelectContainer')} />
    }, {
      name: '保险有效期',
      key: 'insuranceValidity',
      colSpan: 3,
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('vehicleSelectContainer')} />
    }, {
      name: '当前总里程数(km)',
      key: 'currentTotalMileage',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,8}$/),
          message: '请输入数字'
        }]
      },
      inputProps: {
        maxLength: 8,
        placeholder: '请输入当前总里程数'
      },
    }, {
      name: '年审有效期',
      key: 'annualReviewValidity',
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('vehicleSelectContainer')} />
    }, {
      name: '车台安装日期',
      key: 'vehiclePlatformInstallDate',
      colSpan: 3,
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('vehicleSelectContainer')} />
    }, {
      name: '备注',
      key: 'remark',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 150,
      },
      colSpan: 7
    }];

    return vehicleInfoColumn;
  }

  render() {
    const vehicleInfoColumn = this.getFormColumn();

    return <TableForm dataSource={vehicleInfoColumn} column={8} header='车辆信息' />
  }
}
export default connect(
  (state: AllState) => ({
    vehicleTypeData: state.monitorMananger.vehicleTypeData,
  }),
)(AddAndEditDrawer);
