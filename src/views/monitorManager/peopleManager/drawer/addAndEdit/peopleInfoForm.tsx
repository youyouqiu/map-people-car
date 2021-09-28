/**
 * 人员信息表单
 */
import React, { Component } from 'react';
import {
  Select, DatePicker, Radio
} from 'antd';
const { Option } = Select;

import PublicTreeSelect from '@/common/publicTreeSelect';
import { repeatPeopleName, repeatIdentity } from '@/server/monitorManager';

import styles from '../../../index.module.less';
import { getSelectContainer } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';
import { regularText } from '@/common/rules';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { IOption } from '@/model/monitorMananger';
import { realNameReg } from '@/framework/utils/regExp';
import { getStore } from '@/framework/utils/localStorage';

interface IProps {
  monitorInfo: any,
  drawerVisible: false | 'add' | 'edit' | undefined;
  postTypeData: Array<IOption>;
  formRef: any;
  disabledStatus: boolean;
}

interface IState {
  monitorId: string;
  dataInfo: any;
}

const nationalData = [
  "汉族",
  "壮族",
  "满族",
  "回族",
  "苗族",
  "维吾尔族",
  "土家族",
  "彝族",
  "蒙古族",
  "藏族",
  "布依族",
  "侗族",
  "瑶族",
  "朝鲜族",
  "白族",
  "哈尼族",
  "哈萨克族",
  "黎族",
  "傣族",
  "畲族",
  "傈僳族",
  "仡佬族",
  "东乡族",
  "高山族",
  "拉祜族",
  "水族",
  "佤族",
  "纳西族",
  "羌族",
  "土族",
  "仫佬族",
  "锡伯族",
  "柯尔克孜族",
  "达斡尔族",
  "景颇族",
  "毛南族",
  "撒拉族",
  "布朗族",
  "塔吉克族",
  "阿昌族",
  "普米族",
  "鄂温克族",
  "怒族",
  "京族",
  "基诺族",
  "德昂族",
  "保安族",
  "俄罗斯族",
  "裕固族",
  "乌孜别克族",
  "门巴族",
  "鄂伦春族",
  "独龙族",
  "塔塔尔族",
  "赫哲族",
  "珞巴族"
];

class Index extends Component<IProps, IState, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      dataInfo: {},// 页面所有字段的数据
    };
  }

  /**
   * 校验人员工号是否重复
   */
  repeatPeopleNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback();
      return;
    }
    const { drawerVisible, formRef } = this.props;
    const param: any = {
      jobNumber: value,
      orgId: getStore('orgId') || ''
    };

    const orgId = formRef.current.getFieldValue('orgId');
    if (orgId) {
      param.orgId = orgId.value ? orgId.value : orgId;
    }
    if (drawerVisible === 'edit') {
      const { monitorInfo: { id } } = this.props;
      param.id = id;
    }
    repeatPeopleName<boolean>(param).then(res => {
      if (res) {
        callback();
      } else {
        callback('工号已存在');
      }
    });
  }

  /**
   * 校验身份证号是否重复
   */
  repeatIdentityFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback();
      return;
    }
    const { drawerVisible, formRef } = this.props;
    let professionalId = '';
    if (drawerVisible === 'edit') {
      const { monitorInfo: { id } } = this.props;
      professionalId = id;
    }
    // const name = formRef.current.getFieldValue('name');
    // if (name && name.length > 1) {
    //   formRef.current.validateFields(['name']);
    // }
    repeatIdentity<boolean>(value, professionalId).then(res => {
      if (res) {
        callback();
      } else {
        callback('该身份证号已存在');
      }
    });
  }

  /**
   * 所属企业改变,触发工号字段重复校验
   */
  selectOrgChange = () => {
    const { formRef } = this.props;
    const jobNumber = formRef.current.getFieldValue('jobNumber');
    if (jobNumber) {
      formRef.current.validateFields(['jobNumber'], { force: true });
    }
  }

  /**
   * 获取表单显示列信息
   */
  getTableColumn = () => {
    const { postTypeData, disabledStatus } = this.props;
    // 人员信息
    const peopleInfoColumn = [{
      name: '姓名',
      key: 'name',
      validate: {
        rules: [
          { required: true, message: '姓名不能为空' },
          {
            validator: async (rule: any, value: string) => {
              if (value) {
                if (value.length != value.trim().length || value.length < 2 || !realNameReg.test(value)) {
                  return Promise.reject('格式为中文/字母/原点/非首尾的空格,长度2-25位');
                }
                return Promise.resolve();
              }
            }
          }
        ]
      },
      inputProps: {
        maxLength: 25,
      },
    }, {
      name: '工号',
      key: 'jobNumber',
      validate: {
        rules: [
          { required: true, message: '工号不能为空' },
          {
            pattern: new RegExp(/^[A-Za-z0-9]{1,20}$/),
            message: '请输入字母/数字',
          },
          {
            validator: this.repeatPeopleNumberFun,
          }
        ]
      },
      inputProps: {
        maxLength: 20,
      },
    }, {
      name: '身份证号',
      key: 'identity',
      validate: {
        rules: [
          {
            pattern: new RegExp(/^[A-Za-z0-9]*$/),
            message: '请输入字母/数字',
          },
          {
            validator: this.repeatIdentityFun,
          }
        ]
      },
      inputProps: {
        maxLength: 18,
      },
    }, {
      name: '所属企业',
      key: 'orgId',
      colSpan: 3,
      validate: {
        rules: [
          { required: true, message: '请选择企业' },
        ]
      },
      component: <PublicTreeSelect
        bordered={false}
        treeType='enterprise'
        placeholder='请选择企业'
        disabled={disabledStatus}
        onChange={this.selectOrgChange}
        getPopupContainer={() => getSelectContainer('peopleSelectContainer')}
      />
    }, {
      name: '性别',
      key: 'gender',
      component: <Radio.Group>
        <Radio value='1'>男</Radio>
        <Radio value='2'>女</Radio>
      </Radio.Group>,
    }, {
      name: '服务企业',
      key: 'serviceCompany',
      colSpan: 3,
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 50,
      },
    }, {
      name: '民族',
      key: 'national',
      component: <Select bordered={false} placeholder='请选择民族' getPopupContainer={() => getSelectContainer('peopleSelectContainer')}>
        {nationalData.map(item => (<Option key={item} value={item}>{item}</Option>))}
      </Select>,
    }, {
      name: '岗位类型',
      key: 'positionTypeId',
      validate: {
        rules: [
          { required: true, message: '请选择岗位类型' }
        ]
      },
      component: <Select disabled={disabledStatus} bordered={false} labelInValue>
        {
          postTypeData.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
        }
      </Select>
    }, {
      name: '工作状态',
      key: 'state',
      component: <Select bordered={false}>
        <Option value='0'>正常</Option>
        <Option value='1'>离职</Option>
        <Option value='2'>停用</Option>
      </Select>
    }, {
      name: '籍贯',
      key: 'nativePlace',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 10,
      },
    }, {
      name: '入职时间',
      key: 'hireDate',
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('peopleSelectContainer')} />
    }, {
      name: '机动组成员',
      key: 'manoeuvreMember',
      component: <Radio.Group>
        <Radio value={1}>是</Radio>
        <Radio value={0}>否</Radio>
      </Radio.Group>
    }, {
      name: '血型',
      key: 'bloodType',
      component: <Select bordered={false} placeholder='请选择血型' getPopupContainer={() => getSelectContainer('peopleSelectContainer')}>
        <Option value='A'>A</Option>
        <Option value='B'>B</Option>
        <Option value='AB'>AB</Option>
        <Option value='O'>O</Option>
      </Select>,
    }, {
      name: '联系电话',
      key: 'phone',
      validate: {
        rules: [{
          pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/),
          message: '电话号码格式有误',
        }]
      },
      inputProps: {
        maxLength: 11
      },
    }, {
      name: '手机2',
      key: 'phoneTwo',
      validate: {
        rules: [{
          pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/),
          message: '电话号码格式有误',
        }]
      },
      inputProps: {
        maxLength: 11
      },
    }, {
      name: '邮箱',
      key: 'email',
      inputProps: {
        maxLength: 50
      },
      validate: {
        rules: [{
          pattern: new RegExp(/^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/),
          message: '邮箱格式有误',
        }]
      },
    }, {
      name: '紧急联系人',
      key: 'emergencyContact',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 30,
      },
    }, {
      name: '紧急联系电话',
      key: 'emergencyContactPhone',
      inputProps: {
        maxLength: 20
      },
      validate: {
        rules: [{
          pattern: new RegExp(/^[-0-9]{7,20}$/),
          message: '数字/短横杠,长度7-20位',
        }]
      },
    }, {
      name: '生日',
      key: 'birthday',
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('peopleSelectContainer')} />,
    }, {
      name: '住址',
      key: 'address',
      colSpan: 3,
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 50,
      },
    }, {
      name: '所属地域',
      key: 'regional',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 10,
      },
    }];
    return peopleInfoColumn;
  }

  render() {
    const peopleInfoColumn = this.getTableColumn();
    console.log('postTypeData哈哈哈');

    return <TableForm className={styles.detailTable} dataSource={peopleInfoColumn} column={6} />
  }
}
export default connect(
  (state: AllState) => ({
    postTypeData: state.monitorMananger.postTypeData
  }),
)(Index);
