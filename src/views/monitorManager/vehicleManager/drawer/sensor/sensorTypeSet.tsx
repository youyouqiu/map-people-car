/**
 * 传感器类型设置
 */
import React, { Component } from 'react';
import {
  Form, Spin, Row, Col, Select, message,
} from 'antd';
const { Option } = Select;
import { EditDrawer } from '@/common/';
import styles from '../../../index.module.less';
import { getSwitchTypeDropdown, saveIoParam, updateIoParam, getIoMonitorInfo, monitorOnline } from '@/server/monitorManager';
import ReferenceMonitor from './referenceMonitor';
import { getSelectContainer } from '@/framework/utils/function';
import { SyncOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
import { WebSocketClass } from '@/framework/utils/webSocket';
import { connect } from 'react-redux';
import { AllState } from '@/model';
interface IProps {
  monitorInfo: any;
  drawerVisible: boolean | undefined | string;
  changeDrawer: Function;
  currentTable: any;
  updateDetailInfo: Function;
  globalSocket: WebSocketClass;
}

interface IState {
  stateObject: object;
  loading: boolean;
  sensorData: Array<{
    sensorId: string;
    time: number;
  }>;
  signalStatusArr: Array<Array<number>>;
  switchTypeData: Array<ISwitchType>
  yetSwitchType: Array<string>;
  addOrUpdate: 'add' | 'update'
}

interface ISwitchType {
  id: string,
  name: string,
  stateOne: string,
  stateTwo: string,
}

interface IOitem {
  ioSite: number,
  ioType: number;
  functionId: string,
  functionName?: string;
  highSignalType: number,
  lowSignalType: number,
}

class SensorTypeSet extends Component<IProps, IState, any> {
  /**
    * socket 实例
    */
  socket: WebSocketClass
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.getSwitchTypeData();
    this.state = {
      loading: false,// 页面加载loading状态
      addOrUpdate: 'add',// 'add':新增,'update':修改
      signalStatusArr: [],// 高低电平状态
      stateObject: {},// 存储高低电平下拉项数据对象
      sensorData: [],// 传感器信息
      switchTypeData: [],// 检测功能类型数据
      yetSwitchType: [],// 已被其他传感器设置过的功能类型
    };
  }

  componentDidMount() {
    this.onSocketSucces();
    const { drawerVisible } = this.props;
    this.setState({
      sensorData: Array.from({ length: drawerVisible === '90IO输入检测' ? 4 : 16 })
    }, () => {
      this.getMonitorParamInfoFun();
    })
  }

  // props改变时触发
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { drawerVisible, monitorInfo: { id } } = nextProps;
    if (drawerVisible) {
      this.setState({
        sensorData: Array.from({ length: drawerVisible === '90IO输入检测' ? 4 : 16 })
      }, () => {
        this.getSwitchTypeData();
        this.onSocketSucces();
        this.getMonitorParamInfoFun();
      })
    }
  }

  /**
   * socket 连接成功
   */
  onSocketSucces = async () => {
    const { globalSocket, monitorInfo: { id } } = this.props;
    const online = await monitorOnline(id);
    if (!online) {
      message.warning('监控对象离线');
      // return;
    }
    if (!globalSocket) return;
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = { data: id, desc: { type: 0 } } //订阅
    globalSocket.subscribeAndSend('/user/queue/query_position', this.socketCallback.bind(this), '/app/monitor/queryPosition', header, requestStr);
  }

  socketCallback = (res: any) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      this.dataParsing(result.data);
    }
  }

  /**
   * 高低电平数据状态解析
   */
  dataParsing = (data: any) => {
    if (!data) return;
    const oilMassData = data.gpsInfo.cirIoCheckData;
    const ioSignalData = data.gpsInfo.ioSignalData;
    const { drawerVisible } = this.props;
    if ((oilMassData != null && oilMassData.length > 0) || (ioSignalData != null && ioSignalData.length > 0)) {
      const signalStatusArr: any = [];
      // 高低电平显示状态:0:不亮,1:亮
      if (drawerVisible === '90IO输入检测') {
        ioSignalData.map((item: any) => {
          if (item.id === 144) {
            for (let i = 0; i < 4; i += 1) {
              const signal = item[`signal${i}`];
              if (signal === 0) {
                signalStatusArr.push([1, 0])
              } else if (signal === 1) {
                signalStatusArr.push([0, 1])
              } else {
                signalStatusArr.push([0, 0])
              }
            }
          }
        })
      } else {
        oilMassData.map((item: any) => {
          const ioCount = item.ioCount > 32 ? 32 : item.ioCount;
          let statusList = item.statusList[0].ioStatus.toString(2);
          statusList = ((Array(ioCount).join('0') + statusList).slice(-ioCount)).split('').reverse();//高位补零
          for (let j = 0; j < ioCount; j += 1) {
            if (item.id === 145) {
              if (statusList.length > j) {
                if (statusList[j] === '0') {// 0代表高电平亮,1则是低电平亮
                  signalStatusArr.push([1, 0])
                } else {
                  signalStatusArr.push([0, 1])
                }
              } else {
                signalStatusArr.push([1, 0])
              }
            }
          }
          console.log('ioCount', ioCount, statusList, signalStatusArr)
        })
      }
      this.setState({
        signalStatusArr
      })
    }
  }

  /**
   * socket 连接失败
   */
  onSocketClose = () => {
    console.log('socket close');
  }

  /**
   * 更新高低电平高亮状态
   */
  updateStatusFun = () => {
    this.onSocketSucces();
  }

  /**
   * 获取检测功能类型数据
   */
  getSwitchTypeData = async () => {
    const { drawerVisible, monitorInfo: { id } } = this.props;
    const ioType = drawerVisible === '90IO输入检测' ? 1 : 2;
    const result = await getSwitchTypeDropdown<Array<ISwitchType>>({ ioType, monitorId: id });
    if (result) {
      this.setState({
        switchTypeData: result
      })
    }
  }

  /**
   * 选择功能类型校验
   */
  checkSwitchTypeFun = (rule: any, checkValue: { value: string }, callback: Function, index: number) => {
    if (!checkValue) {
      callback();
      return;
    }

    // 校验该功能类型是否已经被勾选
    const formValue = this.formRef.current.getFieldsValue();
    let isCheckStatus = false;
    Object.keys(formValue).map((item: any) => {
      if (item.indexOf('switchType_') !== -1 && formValue[item]) {
        const curIndex = parseInt(item.split('_')[1]);
        if (curIndex !== index && formValue[item].value === checkValue.value) {
          isCheckStatus = true;
        }
      }
      return item;
    })
    if (isCheckStatus) {
      callback('存在相同的信号位通道');
    }
    callback();
  }

  /**
   * 状态字段是否必填校验
   */
  checkStateFun = (rule: any, checkValue: string, callback: Function, index: number) => {
    // 校验该功能类型是否有值
    const switchType = this.formRef.current.getFieldValue(`switchType_${index}`);
    if (switchType && !checkValue) {
      callback('请选择状态');
    }
    callback();
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const { changeDrawer } = this.props;
    changeDrawer('');
    this.setState({
      signalStatusArr: [],
      yetSwitchType: [],
    }, () => {
      this.formRef.current.resetFields();
    })
  };

  /**
  * 获取监控对象已设置的参数信息
  */
  getMonitorParamInfoFun = (monitorId?: any) => {
    this.setState({
      loading: true
    }, async () => {
      const { drawerVisible, monitorInfo: { id } } = this.props;
      const result = await getIoMonitorInfo<Array<IOitem>>(monitorId ? monitorId : id);
      if (result) {
        // 转换数据,渲染表单值
        const { yetSwitchType } = this.state;
        const setObj: any = {};
        const ioType = drawerVisible === '90IO输入检测' ? 1 : 2;
        if (!monitorId) {// 已经被其他传感器设置过的类型不能再设置
          result.map((item) => {
            if (item.ioType !== ioType && yetSwitchType.indexOf(item.functionId) === -1) {
              yetSwitchType.push(item.functionId);
            }
          })
          this.setState({
            yetSwitchType,
            addOrUpdate: result.length === 0 ? 'add' : 'update'
          })
        }
        result.map((item) => {
          if (item.ioType === ioType && yetSwitchType.indexOf(item.functionId) === -1) {
            const index = item.ioSite;
            this.changeSwitchTypeState(index, item.functionId, item);

            setObj[`switchType_${index}`] = { value: item.functionId, label: item.functionName };
            setObj[`highSignalType_${index}`] = item.highSignalType;
            setObj[`lowSignalType_${index}`] = item.lowSignalType;
          }
        })
        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue(setObj);
      }
      this.setState({
        loading: false
      })
    })
  }

  /**
   * 根据检测功能类型,修改对应高低电平下拉项数据
   */
  changeSwitchTypeState = (index: number, itemId: any, curItem?: any) => {
    const { stateObject, switchTypeData } = this.state;
    const newStateObject: any = stateObject;
    if (curItem) {
      newStateObject[index] = [curItem.stateOne, curItem.stateTwo]
    } else {
      if (itemId) {
        switchTypeData.map(item => {
          if (item.id === itemId.value) {
            newStateObject[index] = [item.stateOne, item.stateTwo]
          }
        })
      } else {
        newStateObject[index] = [];
        // 清除高低电平字段值
        const valueObj: any = {};
        valueObj[`highSignalType_${index}`] = '';
        valueObj[`lowSignalType_${index}`] = '';
        this.formRef.current.setFieldsValue(valueObj);
      }

    }
    this.setState({
      stateObject: newStateObject
    })
  }

  /**
   * 渲染传感器设置列表
   */
  renderSensorTable = () => {
    const { drawerVisible } = this.props;
    const { sensorData, switchTypeData, stateObject } = this.state;
    const stateData: any = stateObject;
    console.log('stateData', stateData);

    return <table className={styles.itemTable}>
      <tbody>
        <tr>
          <th className={styles.tableHeader} colSpan={6}>
            参数设置[{drawerVisible}]
            <SyncOutlined className={styles.refreshIcon} onClick={this.updateStatusFun} />
          </th>
        </tr>
        {sensorData.map((item, index) => {
          return <tr key={index}>
            <th className={styles.trNo}>{index}</th>
            <td className={styles.switchType}>
              <Form.Item
                label=''
                name={`switchType_${index}`}
                rules={[
                  {
                    validator: (rule: any, value: any, callback: Function) => {
                      this.checkSwitchTypeFun(rule, value, callback, index);
                    }
                  }
                ]}
              >
                <Select
                  allowClear
                  bordered={false}
                  labelInValue
                  onChange={(value) => { this.changeSwitchTypeState(index, value) }}>
                  {
                    switchTypeData.map(item =>
                      <Option key={item.id} value={item.id}>{item.name}</Option>
                    )
                  }
                </Select>
              </Form.Item>
            </td>
            <th><div className={this.getStatus(index, 0)} />高电平</th>
            <td>
              <Form.Item
                label=''
                name={`highSignalType_${index}`}
                rules={[
                  {
                    validator: (rule: any, value: any, callback: Function) => {
                      this.checkStateFun(rule, value, callback, index);
                    }
                  }
                ]}
              >
                {
                  this.getStateSelect(stateData[index], `lowSignalType_${index}`)
                }
              </Form.Item>
            </td>
            <th><div className={this.getStatus(index, 1)} />低电平</th>
            <td>
              <Form.Item
                label=''
                name={`lowSignalType_${index}`}
                rules={[
                  {
                    validator: (rule: any, value: any, callback: Function) => {
                      this.checkStateFun(rule, value, callback, index);
                    }
                  }
                ]}
              >
                {
                  this.getStateSelect(stateData[index], `highSignalType_${index}`)
                }
              </Form.Item>
            </td>
          </tr>
        })}
      </tbody>
    </table>
  }

  // 获取高低电平开启状态
  getStatus = (index: number, num: number) => {
    const { signalStatusArr } = this.state;
    if (signalStatusArr[index] && signalStatusArr[index][num] === 1) {
      return styles.onStatus;
    }
    return styles.offStatus;
  }

  /**
   * 渲染检测类型状态下拉项
   * @param data 
   */
  getStateSelect = (data = [], relatedType: string) => {
    return <Select bordered={false} onChange={(value: any) => this.stateSelectChange(value, relatedType)} placeholder='请选择状态' getPopupContainer={() => getSelectContainer('sensorTypeSetContainer')}>
      {data.map((item, index) =>
        <Option key={item} value={index + 1}>{item}</Option>
      )}
    </Select>
  }

  /**
   * 高低电平下拉框取值互斥
   * PS:高电平开启,则低电平只能关闭
   */
  stateSelectChange = (value: number, relatedType: string) => {
    const relatedObj: any = {};
    relatedObj[relatedType] = value === 2 ? 1 : 2;
    this.formRef.current.setFieldsValue(relatedObj);
  }

  /**
   * 表单提交
   */
  formSubmit = async (values: any) => {
    const { drawerVisible, updateDetailInfo, monitorInfo: { id } } = this.props;
    const param: any = [];
    Object.keys(values).map(key => {
      if (key.indexOf('switchType_') !== -1 && values[key]) {
        const curIndex = parseInt(key.split('_')[1]);
        const obj = {
          functionId: values[key].value,
          ioSite: curIndex,
          ioType: drawerVisible === '90IO输入检测' ? 1 : 2,
          highSignalType: values[`highSignalType_${curIndex}`],
          lowSignalType: values[`lowSignalType_${curIndex}`],
          monitorId: id
        }
        param.push(obj);
      }
    })
    if (param.length === 0) {
      message.warning('请至少选择一项');
      return;
    }
    console.log('param', param, values);
    const { addOrUpdate } = this.state;
    let result;
    if (addOrUpdate === 'add') {// 新增
      result = await saveIoParam(param);
    } else {// 修改
      result = await updateIoParam({ monitorId: id, ioAlarmParameterDtoList: param });
    }
    if (result) {
      updateDetailInfo()
      this.closeDrawer();
    }
  }

  render() {
    const { drawerVisible, monitorInfo: { id } } = this.props;
    const {
      loading
    } = this.state;

    return (
      <EditDrawer
        title='传感器类型设置'
        width={1060}
        visible={drawerVisible ? true : false}
        onConfirm={() => {
          this.formRef.current.submit()
        }}
        onClose={this.closeDrawer}
        getContainer='body'
      >
        <div className={styles.editForm}>
          <Form
            ref={this.formRef}
            initialValues={{}}
            onFinish={this.formSubmit}
            className={styles.publicDrawer}
            id="sensorTypeSetContainer"
          >
            <div className={styles.innerBox}>
              {this.renderSensorTable()}
              <Row className={styles.paramBtnGroup}>
                <Col span={8} push={16}>
                  <Form.Item
                    label="参考对象"
                  >
                    {
                      drawerVisible && <ReferenceMonitor
                        type='ioSet'
                        monitorId={id}
                        onSelect={this.getMonitorParamInfoFun}
                        getPopupContainer={() => getSelectContainer('sensorTypeSetContainer')} />
                    }
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
          {/* 加载loading */}
          {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
        </div>
      </EditDrawer >
    );
  }
}
export default connect(
  (state: AllState) => ({
    globalSocket: state.root.globalSocket,
  }),
)(SensorTypeSet)
