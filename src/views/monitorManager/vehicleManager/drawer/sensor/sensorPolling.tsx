/**
 * 传感器轮询设置
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import {
  Form, Spin, Button, Row, Col, Select, Input, message,
} from 'antd';
const { Option } = Select;
import { CloseOutlined } from '@ant-design/icons';
import { EditDrawer } from '@/common/';
import TableForm from '@/common/tableForm';
import ReferenceMonitor from './referenceMonitor';
import styles from '../../../index.module.less';
import { getPeripheralDropdown, clearPolling, savePolling, getParamStatus, getPollingMonitorInfo, updateMonitorSetStatus, monitorOnline } from '@/server/monitorManager';
import { IOption } from '@/model/monitorMananger';
import { getStore } from '@/framework/utils/localStorage';
import { WebSocketClass } from '@/framework/utils/webSocket';
interface IProps {
  monitorInfo: any;
  drawerVisible: boolean | undefined;
  changeDrawer: Function;
  currentTable: any;
  updateDetailInfo: Function;
  globalSocket: WebSocketClass
}

interface IState {
  loading: boolean;
  curSocketStatus: string;
  btnLoading: boolean;
  sensorData: Array<ISensorData>;
  peripheralData: Array<IOption>
}
interface ISensorData {
  peripheralId: string;
  peripheralName?: string;
  pollingTime: number;
}
// 下发结果table列信息
const sendResultColumn = [{
  name: '最后一次下发时间',
  key: 'lastSendTime',
}, {
  name: '下发状态',
  key: 'sendStatus',
}]
class SensorPolling extends Component<IProps, IState, any> {
  /**
    * socket 实例
    */
  socket: WebSocketClass
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,// 页面加载loading状态
      curSocketStatus: '',// 当前socket连接(clear:'清除',send:'下发')
      btnLoading: false,// 下发参数按钮loading状态
      sensorData: [{
        peripheralId: '1',
        pollingTime: 3
      }],// 轮询传感器信息
      peripheralData: [],// 外设下拉项信息
    };
  }

  componentDidMount() {
    const { drawerVisible } = this.props;
    if (drawerVisible) {
      this.getPeripheralDropdownFun();
      this.getMonitorParamInfoFun();
      this.getParamStatusFun();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { drawerVisible, monitorInfo: { id } } = nextProps;
    const { drawerVisible: oldDrawerVisible } = this.props;
    if (drawerVisible && drawerVisible !== oldDrawerVisible) {
      this.getPeripheralDropdownFun();
      this.getParamStatusFun(nextProps);
      this.getMonitorParamInfoFun(id);
    }
  }

  /**
   * socket 连接成功
   */
  onSocketSucces = (requestStr?: any) => {
    const { globalSocket } = this.props;
    if (!globalSocket || !requestStr) return;

    const { curSocketStatus } = this.state;
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    if (curSocketStatus === 'send') {// 下发轮询
      globalSocket.subscribeAndSend('/user/queue/io_polling', this.socketCallback.bind(this), '/app/monitor/polling', header, requestStr);
    } else {// 清除轮询
      globalSocket.subscribeAndSend('/user/queue/clear_polling', this.socketCallback.bind(this), '/app/monitor/polling', header, requestStr);
    }
  }

  socketCallback = async (res: any) => {
    console.log('res', res);
    const result = JSON.parse(res.body)
    const { curSocketStatus } = this.state;
    if (curSocketStatus === 'send') {// 下发轮询
      const { status, sendTime } = result;
      const sendStatus = this.renderStatus(status);
      this.formRef.current?.setFieldsValue({
        lastSendTime: sendTime,
        sendStatus
      })
    } else {// 清除轮询
      const { status, sendTime } = result;
      const sendStatus = this.renderStatus(status);
      this.formRef.current?.setFieldsValue({
        lastSendTime: sendTime,
        sendStatus
      })
      if (result.status === 0) {
        const { currentTable, monitorInfo: { id } } = this.props;
        const clearStatus = await clearPolling(id);
        if (clearStatus) {
          const statusResult = await updateMonitorSetStatus({
            name: 'sensorSetting',
            status: 0,// 1:未设置
            monitorId: id
          });
          if (statusResult) {// 更新表格状态
            currentTable.current?.reload();
          }

          const { updateDetailInfo } = this.props;
          updateDetailInfo();
          this.setState({
            sensorData: [{
              peripheralId: '1',
              pollingTime: 3
            }]
          }, () => {
            this.formRef.current?.resetFields();
          })
        }
      }
    }
  }

  /**
   * socket 连接失败
   */
  onSocketClose = () => {
    console.log('socket close');
  }

  /**
   * 获取下发状态
   * @param data 
   */
  renderStatus = (data: number) => {
    let status = '';
    switch (data) {
      case 0:
        status = '下发成功,参数已生效';
        break;
      case 1:
        status = '下发失败,终端离线';
        break;
      case 2:
        status = '下发失败,指令错误';
        break;
      case 3:
        status = '下发失败,平台等待应答超时';
        break;
      case 4:
        status = '下发失败,底层系统异常';
        break;
      case 5:
        status = '下发失败,终端处理失败';
        break;
      case 6:
        status = '下发失败,终端应答消息有误';
        break;
      case 7:
        status = '下发失败,终端应答指令不支持';
        break;
      case 8:
        status = '下发中,终端已接收指令';
        break;
      case 9:
        status = '下发中,平台等待应答';
        break;
    }
    return status;
  }

  /**
   * 获取参数下发状态
   */
  getParamStatusFun = async (props?: IProps) => {
    const { monitorInfo: { id } } = props ? props : this.props;

    const param = {
      functionPage: 'io_polling,clear_polling',// 功能页面
      monitorId: id
    }
    const result = await getParamStatus<{ status: number, sendTimeStr: string }>(param);
    if (result) {
      const { status, sendTimeStr } = result;
      const sendStatus = this.renderStatus(status);

      this.formRef.current?.setFieldsValue({
        lastSendTime: sendTimeStr,
        sendStatus
      })
    }
  }

  /**
   * 获取传感器类型下拉项数据
   */
  getPeripheralDropdownFun = async () => {
    const result = await getPeripheralDropdown<Array<IOption>>();
    if (result) {
      this.setState({
        peripheralData: result
      })
    }
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const { changeDrawer } = this.props;
    changeDrawer('');
    this.formRef.current?.resetFields();
  };

  /**
   * 选择外设校验
   */
  checkSensorFun = (rule: any, checkValue: string, callback: Function, index: number) => {
    if (!checkValue) {
      callback();
      return;
    }

    // 校验该外设是否已经被勾选
    const formValue = this.formRef.current?.getFieldsValue();
    let isCheckStatus = false;
    Object.keys(formValue).map((item: any) => {
      if (item.indexOf('sensor_') !== -1 && formValue[item]) {
        const curIndex = parseInt(item.split('_')[1]);
        if (curIndex !== index && formValue[item] === checkValue) {
          isCheckStatus = true;
        }
      }
      return item;
    })
    console.log('formValue', formValue, isCheckStatus);

    if (isCheckStatus) {
      callback('请选择不同的传感器类型');
    }
    callback();
  }

  /**
   * 渲染轮询传感器列表
   */
  renderSensorTable = () => {
    const { sensorData, peripheralData } = this.state;

    return <table className={styles.itemTable}>
      <tbody>
        {sensorData.map((item, index) => {
          return <tr key={item.peripheralId} className={index === 0 ? 'formItem-bottom-explain' : ''} >
            <th className={styles.trNo}>
              {index > 0 ? <CloseOutlined onClick={() => { this.deleteSensorData(index) }} className={styles.deleteSensor} /> : null}
              {index + 1}
            </th>
            <th><span className={styles.redIcon}>*</span> 传感器类型</th>
            <td style={{ width: '300px' }}>
              <Form.Item
                label=''
                name={`sensor_${index}`}
                rules={[
                  { required: true, message: '请选择传感器类型' },
                  {
                    validator: (rule: any, value: any, callback: Function) => {
                      this.checkSensorFun(rule, value, callback, index);
                    }
                  }
                ]}
              >
                <Select bordered={false} labelInValue>
                  {
                    peripheralData.map(innerItem =>
                      <Option key={innerItem.id} value={innerItem.id}>{innerItem.name}</Option>
                    )
                  }
                </Select>
              </Form.Item>
            </td>
            <th>{index === 0 ? <span className={styles.redIcon}>*</span> : null} 轮询时间</th>
            <td>
              <Form.Item
                label=''
                name='pollingTime'
                rules={index === 0 ? [
                  { required: true, message: '请输入轮询时间' },
                  {
                    validator: async (rule: any, value: string) => {
                      const newNum = Number(value);
                      if (value) {
                        if (!isNaN(newNum) && newNum >= 1 && newNum <= 255) {
                          return Promise.resolve();
                        }
                        return Promise.reject('输入范围1-255的整数');
                      }
                    }
                  }
                ] : undefined}
              >
                <Input type="text" disabled={index !== 0} autoComplete='off' allowClear maxLength={3} />
              </Form.Item>
            </td>
          </tr>
        })}
      </tbody>
    </table >
  }

  /**
   * 添加传感器
   */
  addSensorData = () => {
    const { sensorData, peripheralData } = this.state;
    if (sensorData.length < peripheralData.length) {
      sensorData.push({
        peripheralId: (Math.random() * 100).toString(),
        pollingTime: 3,
      });
      this.setState({
        sensorData
      })
    } else {
      message.warn('最多只能添加两个传感器类型')
    }
  }

  /**
   * 删除传感器
   * @param index 索引
   */
  deleteSensorData = (index: number) => {
    const { sensorData } = this.state;
    sensorData.splice(index, 1);
    this.setState({
      sensorData
    })
  }

  /**
   * 获取监控对象已设置的参数信息
   */
  getMonitorParamInfoFun = (monitorId?: any) => {
    this.setState({
      loading: true
    }, async () => {
      const { monitorInfo: { id } } = this.props;
      const result = await getPollingMonitorInfo<Array<ISensorData>>(monitorId ? monitorId : id);
      if (result && result.length > 0) {
        this.setState({
          sensorData: result,
          loading: false
        }, () => {
          // 转换数据,渲染表单值
          const setObj: any = {};
          result.map((item, index) => {
            setObj[`sensor_${index}`] = { value: item.peripheralId, label: item.peripheralName };
            setObj.pollingTime = item.pollingTime;
          })
          this.formRef.current?.resetFields();
          this.formRef.current?.setFieldsValue(setObj);
        })
      } else {
        this.setState({
          sensorData: [{
            peripheralId: '1',
            pollingTime: 0
          }],
          loading: false
        }, () => {
          this.formRef.current?.setFieldsValue({ pollingTime: 3 });
        })
      }
    })

  }

  /**
   * 表单提交,下发参数至终端
   * 指令类型为8900
   * PS: 先请求保存接口,成功后再调用下发接口
   */
  sendParam = async (values: any) => {
    console.log(values);
    this.setState({
      btnLoading: true,
    })
    const { updateDetailInfo, currentTable, monitorInfo: { id } } = this.props;
    const param: any = [];
    Object.keys(values).map(key => {
      if (key.indexOf('sensor_') !== -1) {
        param.push({
          id: '',// 外设设置id（每条传感器的关联各对应一个id）
          peripheralId: values[key].value,
          pollingTime: values.pollingTime
        })
      }
    })
    const result = await savePolling(id, param);
    if (result) {
      const statusResult = await updateMonitorSetStatus({
        name: 'sensorSetting',
        status: 1,// 1:已设置
        monitorId: id
      });
      if (statusResult) {// 更新表格状态
        currentTable.current.reload();
      }

      this.setState({
        curSocketStatus: 'send'
      }, async () => {
        updateDetailInfo();
        const dataObj = {
          monitorIds: [id],
          type: 0,
        };
        const online = await monitorOnline(id);
        if (!online) {
          message.warning('监控对象离线');
        }
        const requestStrS = {
          desc: {
            type: 1
          },
          data: dataObj
        };
        this.onSocketSucces(requestStrS);
      })
    }
    this.setState({
      btnLoading: false
    })
  }

  /**
   * 清除轮询
   * 下发8900指令至终端,成功后删除轮询列表数据
   */
  clearPollingFun = async () => {
    const { monitorInfo: { id } } = this.props;
    this.setState({
      curSocketStatus: 'clear'
    }, () => {
      const dataObj = {
        monitorIds: [id],
        type: 1,
      };
      const requestStrS = {
        desc: {
          type: 1
        },
        data: dataObj
      };
      this.onSocketSucces(requestStrS);
    })
  }

  render() {
    const { drawerVisible, monitorInfo: { id } } = this.props;
    const {
      loading, sensorData, btnLoading, peripheralData
    } = this.state;

    return (
      <EditDrawer
        title='传感器轮询设置'
        width={1060}
        visible={drawerVisible ? true : false}
        onClose={this.closeDrawer}
        getContainer='body'
      >
        <div className={styles.editForm}>
          <Form
            ref={this.formRef}
            onFinish={this.sendParam}
            className={styles.publicDrawer}
            id="sensorPollingContainer"
          >
            <div className={styles.innerBox}>
              {this.renderSensorTable()}
              <Row className={styles.paramBtnGroup}>
                <Col span={16}>
                  <Button type='primary' onClick={this.addSensorData} disabled={sensorData.length >= peripheralData.length}>添加行</Button>
                  <Button type='primary' htmlType="submit" loading={btnLoading}>下发参数</Button>
                  <Button type='primary' onClick={this.clearPollingFun}>清除轮询</Button>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="参考对象"
                  >
                    {
                      drawerVisible && <ReferenceMonitor
                        monitorId={id}
                        onSelect={this.getMonitorParamInfoFun}
                      />
                    }
                  </Form.Item>
                </Col>
              </Row>
              <TableForm dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
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
)(SensorPolling)
