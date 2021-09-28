/**
 * 设施信息表单
 */
import React, { Component } from 'react';
import {
  Select, DatePicker, Radio
} from 'antd';
const { Option } = Select;

import PublicTreeSelect from '@/common/publicTreeSelect';
import { repeatFacilityName } from '@/server/monitorManager';
import { getOrgArea } from '@/server/auditsManagement';

import styles from '../../../index.module.less';
import { getSelectContainer } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';
import { regularText } from '@/common/rules';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { IOption } from '@/model/monitorMananger';

interface IProps {
  monitorInfo: any,
  drawerVisible: false | 'add' | 'edit' | undefined;
  formRef: any;
  facilityTypeData: Array<IOption>;
  currentSelectOrg?: string | null;
}

interface IState {
  pickupAreaData: Array<any>;
}

class Index extends Component<IProps, IState, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      pickupAreaData: [],// 清运区域
    };
  }
  componentDidMount() {
    const { drawerVisible, currentSelectOrg } = this.props;
    if (drawerVisible === 'add' && currentSelectOrg) {
      this.getPickupAreaData({ value: currentSelectOrg })
    } else if (drawerVisible === 'edit') {
      const { monitorInfo: { orgId, workId } } = this.props;
      this.getPickupAreaData({ value: orgId }, workId)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { drawerVisible, currentSelectOrg } = nextProps;
    if (drawerVisible === 'add' && currentSelectOrg) {
      this.getPickupAreaData({ value: currentSelectOrg })
    } else if (drawerVisible === 'edit') {
      const { monitorInfo: { orgId, workId } } = nextProps;
      this.getPickupAreaData({ value: orgId }, workId)
    } else if (!drawerVisible) {
      this.setState({
        pickupAreaData: []
      })
    }
  }

  /**
   * 校验设施编号是否已存在
   */
  repeatNumberFun = (rule: any, value: string, callback: Function) => {
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
    repeatFacilityName<boolean>(param).then(res => {
      if (res) {
        callback();
      } else {
        callback('设施编号已存在');
      }
    });
  }

  /**
   * 获取清运区域数据
   */
  async getPickupAreaData(selectData: any, workId?: string) {
    const { value } = selectData;
    const response: any = await getOrgArea({ enterpriseId: value });
    const data: any = [];

    if (response) {
      let pickupAreaItem;
      Object.keys(response).forEach((item) => {
        pickupAreaItem = {
          id: item,
          name: response[item]
        }
        data.push(pickupAreaItem)
      });

      this.setState({
        pickupAreaData: data
      }, () => {
        const { formRef } = this.props;
        formRef.current.setFieldsValue({
          workId: workId ? workId : ''
        });
      })
    }
  }

  /**
     * 获取表单显示列信息
     */
  getTableColumn = () => {
    const { facilityTypeData } = this.props;
    const { pickupAreaData } = this.state;
    // 设施信息
    const infoColumn = [{
      name: '设施编号',
      key: 'number',
      validate: {
        rules: [
          { required: true, message: '设施编号不能为空' },
          {
            pattern: new RegExp(/^[\u4e00-\u9fa5-a-zA-Z0-9]{2,20}$/),
            message: '请输入汉字、字母、数字或短横杠,长度2-20位',
          },
          {
            validator: this.repeatNumberFun,
          }
        ]
      },
      inputProps: {
        maxLength: 20,
      },
    }, {
      name: '别名',
      key: 'alias',
      validate: {
        rules: [
          {
            pattern: new RegExp(/^[A-Za-z0-9]{0,5}$/),
            message: '请输入字母/数字',
          },
        ]
      },
      inputProps: {
        maxLength: 5,
      },
    }, {
      name: '设施类型',
      key: 'facilityTypeId',
      validate: {
        rules: [
          { required: true, message: '请选择设施类型' },
        ]
      },
      component: <Select bordered={false} labelInValue>
        {
          facilityTypeData.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
        }
      </Select>
    }, {
      name: '设施颜色',
      key: 'facilityColor',
      component: <Select bordered={false}>
        <Option value={1}>白色</Option>
        <Option value={2}>黑色</Option>
        <Option value={3}>红色</Option>
        <Option value={4}>蓝色</Option>
        <Option value={5}>紫色</Option>
        <Option value={6}>黄色</Option>
        <Option value={7}>绿色</Option>
        <Option value={8}>粉色</Option>
        <Option value={9}>棕色</Option>
        <Option value={10}>灰色</Option>
      </Select>
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
        onChange={this.getPickupAreaData.bind(this)}
        getPopupContainer={() => getSelectContainer('facilitySelectContainer')}
      />
    }, {
      name: '联系人',
      key: 'facilityContacts',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 30
      },
    }, {
      name: '联系电话',
      key: 'contactsPhone',
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
      name: '设施状态',
      key: 'status',
      colWidth: 180,
      component: <Radio.Group>
        <Radio value={1}>启用</Radio>
        <Radio value={0}>停用</Radio>
      </Radio.Group>
    }, {
      name: '维修状态',
      key: 'fixStatus',
      component: <Radio.Group>
        <Radio value={1}>是</Radio>
        <Radio value={0}>否</Radio>
      </Radio.Group>
    }, {
      name: '安装时间',
      key: 'installTime',
      component: <DatePicker bordered={false} style={{ width: '100%' }} getPopupContainer={() => getSelectContainer('facilitySelectContainer')} />,
    }, {
      name: '清运区域',
      key: 'workId',
      component: <Select bordered={false}>
        {
          pickupAreaData.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
        }
      </Select>
    }, {
      name: '备注',
      key: 'remark',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 150,
      },
    }];
    return infoColumn;
  }

  render() {
    const infoColumn = this.getTableColumn();

    return <TableForm dataSource={infoColumn} column={8} header='设施信息' />
  }
}
export default connect(
  (state: AllState) => ({
    facilityTypeData: state.monitorMananger.facilityTypeData
  }),
)(Index);
