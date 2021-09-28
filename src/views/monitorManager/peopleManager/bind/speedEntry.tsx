import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { monitorSpeedEntry, getPeoplePositionType, getUnknownDevice } from '@/server/monitorManager';

import Form from "antd/es/form";
import Button from "antd/es/button";
import Row from "antd/es/row";
import Col from "antd/es/col";
import { Select } from 'antd';
const { Option } = Select;
import Input from "antd/es/input";
import { message } from 'antd';

import { getCurrentUserPermission } from '@/framework/utils/function';
import SearchSelect from '@/common/searchSelect';
import styles from '../../index.module.less';
import { realNameReg } from "@/framework/utils/regExp";
import { IOption } from "@/model/monitorMananger";
import ProtocolType from '../../public/protocolType';
import { repeatDeviceNumberFun, repeatPeopleNumberFun } from "../../public/publicFun";

interface IDeviceData {
  deviceId: string;
  deviceType: string;
  id: string;
  monitorNumber: string;
  simNumber: string;
  status: number;
  uniqueNumber: string;
}

interface ISpeedParam {
  deviceId: string;
  deviceNumber: string;
  deviceType: string;
  moType: string;
  monitorId: string;
  monitorNumber: string;
  simCardId: string;
  simCardNumber: string;
  uniqueNumber: string;
}

interface IProps {
  currentTable: any;
  unbindData: {
    peopleList: Array<object>;
    deviceList: Array<object>;
    simCardList: Array<object>;
  };
  postTypeData: Array<IOption>;
  getBindData: Function;
}

interface IState {
  unknownDeviceData: Array<any>;
  editStatus: boolean;
  checkNumberId: null | string;
  checkDeviceId: null | string;
  btnLoading: boolean;
}

// 当前页面权限
const permission = getCurrentUserPermission('4_people_list');
let searchTimer: any = null;// 未注册设备模糊搜索定时器
class SpeedEntryForm extends Component<IProps, IState, any>{
  formRef: any = React.createRef();

  constructor(props: IProps) {
    super(props);
    this.state = {
      unknownDeviceData: [],
      editStatus: false,//是否可编辑
      checkNumberId: null,
      checkDeviceId: null,
      btnLoading: false, // 提交按钮加载状态
    }
  }

  componentDidMount() {
    this.getUnknownDeviceData();
  }

  /**
   * 获取未注册设备数据
   * @param keyword 模糊搜索参数
   */
  getUnknownDeviceData = async (keyword?: string) => {
    if (keyword === undefined) {
      const result = await getUnknownDevice<Array<Record<string, any>>>({ keyword: keyword || '' });
      if (result) {
        this.setState({
          unknownDeviceData: result
        })
      }
    } else {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(async () => {
        const result = await getUnknownDevice<Array<Record<string, any>>>({ keyword: keyword || '' });
        if (result) {
          this.setState({
            unknownDeviceData: result
          })
        }
      }, 500);
    }
  }

  /**
   * 加载未注册设备数据
   */
  dropdownVisibleChange = (open: boolean) => {
    if (open) {
      this.getUnknownDeviceData();
    }
  }

  /**
   * 选择终端号,联动显示通讯类型
   * @param item 
   */
  deviceSelect = (item: null | { id: string, deviceType: number }) => {
    this.setState({
      checkDeviceId: item ? item.id : null
    }, () => {
      if (item) {
        this.formRef.current.setFieldsValue({
          deviceType: item.deviceType
        });
      }
    })
  }

  /**
   * 极速录入
   */
  speedEntryFun = (values: ISpeedParam) => {
    const { checkNumberId, checkDeviceId } = this.state;
    this.setState({
      btnLoading: true
    }, async () => {
      const param: any = values;
      param.moType = '1';
      param.deviceId = checkDeviceId || '';
      param.monitorId = checkNumberId || '';
      param.typeId = param.typeId.value;
      param.state = 0;

      const result = await monitorSpeedEntry<boolean>(param);
      if (result) {
        const { getBindData, currentTable } = this.props;
        currentTable.current.reload();
        this.formRef.current.resetFields();
        getBindData();
        this.getUnknownDeviceData();
        message.success('绑定新增成功!');
        this.setState({
          checkDeviceId: null,
          checkNumberId: null,
        })
      }
      this.setState({
        btnLoading: false,
      })
    })
  }

  renderUnregisteredData = () => {
    const { unknownDeviceData } = this.state;
    return unknownDeviceData.map((item: IDeviceData) => {
      if (item.status === 0) {
        return <Option value={item.id} key={`${item.id}_${item.uniqueNumber}`} className={styles.noBindOptoion} item={item}>{item.uniqueNumber}</Option>
      }
      return <Option value={item.id} key={`${item.id}_${item.uniqueNumber}`} className={styles.bindOptoion} item={item}>{item.uniqueNumber}</Option>
    })
  }

  /**
   * 未注册设备点击事件
   */
  unregisteredItemClick = (value: string, node: any) => {
    console.log('value, node, extra', value, node);
    const { item } = node;
    const itemObj = {
      monitorNumber: item.monitorName,
      deviceNumber: item.deviceNumber,
      simCardNumber: item.simCardNumber,
      deviceType: parseInt(item.deviceType),
    }
    this.formRef.current.setFieldsValue(itemObj);
    this.setState({ editStatus: true });
  }

  /**
   * 工号切换
   */
  peopleNumberSelect = async (item: null | { id: string, name: string, number: number }) => {
    if (item) {
      const result = await getPeoplePositionType<{ id: number, professionalsType: string }>(item.id);
      if (result) {
        this.formRef.current.setFieldsValue({
          aliases: item.name,
          typeId: { value: result.id, label: result.professionalsType }
        });
      }
    }
    this.setState({
      checkNumberId: item ? item.id : null
    })
  }

  render() {
    const { postTypeData, unbindData: { peopleList, deviceList } } = this.props;
    const { editStatus, btnLoading } = this.state;

    return (
      <Form
        ref={this.formRef as any}
        labelCol={{
          xxl: { span: 6 },
          xl: { span: 9 },
          lg: { span: 12 },
          md: { span: 24 },
        }}
        wrapperCol={{
          xxl: { span: 18 },
          xl: { span: 15 },
          lg: { span: 12 },
          md: { span: 24 },
        }}
        initialValues={{ deviceType: 101100 }}
        onFinish={this.speedEntryFun}
        id='editBindForm'
        style={{ paddingRight: '15px' }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="未注册设备"
              name="uniqueNumber"
              rules={[{ required: true, message: '未注册设备不能为空' }]}
            >
              <Select
                showSearch
                placeholder="平台已接收的信息"
                optionFilterProp="children"
                allowClear
                onSelect={this.unregisteredItemClick}
                onSearch={this.getUnknownDeviceData}
                onDropdownVisibleChange={this.dropdownVisibleChange}
                filterOption={(input, option: any) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.renderUnregisteredData()}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={<span className={styles.hasRedIcon}>工号</span>}
              name="monitorNumber"
              className={styles.formItemCol}
            >
              <SearchSelect
                menuData={peopleList}
                titleKey='number'
                formRef={this.formRef}
                itemName="monitorNumber"
                optionClick={this.peopleNumberSelect}
                itemRules={[
                  { required: true, message: '工号不能为空' },
                  {
                    pattern: new RegExp(/^[A-Za-z0-9]{1,20}$/),
                    message: '请输入字母/数字',
                  },
                  {
                    validator: (rule: any, value: string, callback: Function) => {
                      const { checkNumberId } = this.state;
                      if (!checkNumberId) {
                        repeatPeopleNumberFun(rule, value, callback)
                      } else {
                        callback();
                      }
                    },
                  }
                ]}
                inputProps={{
                  maxLength: 20,
                  placeholder: '请新增或选择工号'
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="姓名"
              name="aliases"
              rules={[
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
              ]}
            >
              <Input maxLength={25} placeholder='请输入姓名' autoComplete='off' allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="岗位类型"
              name="typeId"
              rules={[{ required: true, message: '岗位类型不能为空' }]}
            >
              <Select labelInValue placeholder="请选择岗位类型">
                {
                  postTypeData.map(item =>
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  )
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={6}>
            {/* 通讯类型 */}
            <ProtocolType disabled />
          </Col>
          <Col span={6}>
            <Form.Item
              label={<span className={styles.hasRedIcon}>终端号</span>}
              name="deviceNumber"
              className={styles.formItemCol}
            >
              <SearchSelect
                menuData={deviceList}
                titleKey='deviceNumber'
                formRef={this.formRef}
                itemName="deviceNumber"
                optionClick={this.deviceSelect}
                itemRules={[
                  { required: true, message: '终端号不能为空' },
                  {
                    pattern: new RegExp(/^[a-zA-Z0-9]{7,30}$/),
                    message: '请输入字母、数字,长度7~30位',
                  },
                  {
                    validator: (rule: any, value: string, callback: Function) => {
                      const { checkDeviceId } = this.state;
                      if (!checkDeviceId) {
                        repeatDeviceNumberFun(rule, value, callback)
                      } else {
                        callback();
                      }
                    },
                  }
                ]}
                inputProps={{
                  maxLength: 30,
                  disabled: !editStatus,
                  placeholder: '请新增或选择终端号'
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="终端手机号"
              name="simCardNumber"
              rules={[{ required: true, message: '终端手机号不能为空' }]}
            >
              <Input type='text' disabled />
            </Form.Item>
          </Col>
          <Col span={6} push={4}>
            <Button disabled={permission.indexOf('绑定') === -1} loading={btnLoading} type="primary" htmlType="submit">提交</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}


export default connect(
  (state: AllState) => ({
    unbindData: state.monitorMananger.unbindData,
    postTypeData: state.monitorMananger.postTypeData
  }),
  dispatch => ({
    getBindData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
    },
  }),
)(injectIntl(SpeedEntryForm as any));