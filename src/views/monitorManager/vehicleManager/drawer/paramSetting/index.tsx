/**
 * 参数设置共用抽屉
 */
import React, { Component } from 'react';
import {
  Form, Spin, Button, Row, Col, message, Select, Popconfirm,
} from 'antd';
const { Option } = Select;
import { EditDrawer } from '@/common/';
import TableForm from '@/common/tableForm';
import { columnInfo } from './tableColumn';
import {
  saveParamByCommandType, getParamStatus, getParamSetMonitorDropdown,
  getMonitorParamInfo, monitorOnline, restoreDefaultData, updateMonitorSetStatus
} from '@/server/monitorManager';
import { getStore } from '@/framework/utils/localStorage';
import { WebSocketClass } from '@/framework/utils/webSocket';
import { paramParsing } from './paramParsing';

import styles from '../../../index.module.less';
import { connect } from 'react-redux';
import { AllState } from '@/model';
interface IProps {
  monitorInfo: any;
  drawerVisible: string;
  changeDrawer: Function;
  currentTable: any;
  updateDetailInfo: Function;
  globalSocket: WebSocketClass;
}

interface IState {
  referenceMonitorData: Array<IItem>;
  loading: boolean;
  curSendStatus: string;
  curSocketStatus: string;
  currentCommandType: string;
  curPositionUpTactics: number;
  btnLoading: boolean;
  setDefaultValue: boolean;
  addressResult: any;
}

interface IItem {
  monitorId: number,
  monitorName: string
}

// 下发结果table列信息
const sendResultColumn = [{
  name: '最后一次下发时间',
  key: 'lastSendTime',
}, {
  name: '下发状态',
  key: 'sendStatus',
}]

/**
 * 指令类型
 */
const commandTypeObj: any = {
  message: 11,// 通讯参数
  terminal: 12,// 终端参数
  address: 14,// 位置信息
}
class ParamSetting extends Component<IProps, IState, any> {
  /**
   * socket 实例
   */
  socket: WebSocketClass
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      curSendStatus: 'send',// 当前下发状态:send:'下发参数',reset:'恢复默认'
      curSocketStatus: '',// 当前socket连接(read:'读取',send:'下发')
      referenceMonitorData: [],// 参考对象数据
      loading: false,// 页面加载loading状态
      currentCommandType: '',// 当前参数设置类型
      curPositionUpTactics: 0,// 当前位置汇报策略
      btnLoading: false,// 按钮加载状态
      addressResult: {},// 位置汇报已设置的参数信息
      setDefaultValue: false,// 位置汇报参数是否需要设置默认值
    };
  }

  componentDidMount() {
    const { drawerVisible } = this.props;
    if (drawerVisible) {
      this.setState({
        currentCommandType: drawerVisible
      }, () => {
        this.getMonitorParamInfoFun();
        this.getMonitorDropdownFun('');
        this.getParamStatusFun(drawerVisible);
      })
    }
  }

  UNSAFE_componentWillReceiveProps = async (nextProps: IProps) => {
    const { drawerVisible, monitorInfo: { id } } = nextProps;
    const { drawerVisible: oldDrawerVisible } = this.props;
    const { currentCommandType } = this.state;
    if (drawerVisible && drawerVisible !== oldDrawerVisible) {
      if (drawerVisible !== currentCommandType) {
        this.setState({
          currentCommandType: drawerVisible
        })
      }
      this.getMonitorDropdownFun('', nextProps);
      this.getMonitorParamInfoFun(id);
      this.getParamStatusFun(drawerVisible);
    }
  }

  /**
   * socket 连接成功
   */
  onSocketSucces = (requestStr?: any) => {
    const { globalSocket } = this.props;
    if (!globalSocket || !requestStr) return;
    const { currentCommandType } = this.state;
    let url = 'communication_param';// 通讯参数
    if (currentCommandType === 'terminal') {// 终端参数
      url = 'terminal_param';
    } else if (currentCommandType === 'address') {// 位置汇报
      url = 'position_report';
    }

    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    globalSocket.subscribeAndSend(`/user/queue/${url}`, this.socketCallback.bind(this), '/app/monitor/command', header, requestStr);
  }

  socketCallback = (res: any) => {
    const { curSocketStatus } = this.state;
    if (curSocketStatus === 'send') {// 下发参数
      this.sendParamCallback(res);
    } else {// 读取
      this.readParamCallBack(res);
    }
  }

  /**
   * 下发参数成功,socket回调方法
   * @param res 
   */
  sendParamCallback = (res: any) => {
    console.log('res', res);
    const result = JSON.parse(res.body)
    if (result) {
      this.renderStatus(result.status, result.sendTime);
    }
  }

  /**
   * 读取参数成功,socket回调方法
   */
  readParamCallBack = (res: any) => {
    const result = JSON.parse(res.body);
    if (result) {
      // 解析读取的参数值
      if (!result.data || !result.data.params) return;
      const paramValue = paramParsing(result.data.params);
      const lastSendTime = this.formRef.current.getFieldValue('lastSendTime');
      const sendStatus = this.formRef.current.getFieldValue('sendStatus');
      paramValue.lastSendTime = lastSendTime;
      paramValue.sendStatus = sendStatus;

      if (paramValue.positionUpTactics !== undefined) {
        this.setState({
          curPositionUpTactics: paramValue.positionUpTactics
        })
      }

      this.formRef.current.resetFields();
      this.formRef.current.setFieldsValue(paramValue);
    }
  }

  /**
   * socket 连接失败
   */
  onSocketClose = () => {
    console.log('socket 连接失败');
  }

  /**
   * 获取监控对象已设置的参数信息
   */
  getMonitorParamInfoFun = (monitorId?: any, resetStatus?: boolean) => {
    this.setState({
      loading: true
    }, async () => {
      const { drawerVisible, monitorInfo: { id } } = this.props;
      const result: any = await getMonitorParamInfo({
        commandType: drawerVisible ? commandTypeObj[drawerVisible] : '',
        monitorId: monitorId ? monitorId : id
      });
      if (result) {
        const lastSendTime = this.formRef.current.getFieldValue('lastSendTime');
        const sendStatus = this.formRef.current.getFieldValue('sendStatus');
        result.lastSendTime = lastSendTime;
        result.sendStatus = sendStatus;

        if (resetStatus) {
          this.formRef.current.resetFields();
        }
        if (drawerVisible === 'address') {// 位置汇报参数需先设置位置汇报策略值
          this.setState({
            curPositionUpTactics: result.positionUpTactics || 0,
            addressResult: result
          }, () => {
            this.formRef.current.setFieldsValue(result);
          })
        } else {
          this.formRef.current.setFieldsValue(result);
        }
      } else if (result !== undefined) {
        this.renderDefaultValue();
        this.setState({
          setDefaultValue: true
        })
      }
      this.setState({
        loading: false
      })
    })
  }

  /**
   * 获取参数下发状态
   */
  getParamStatusFun = async (drawerVisible: string) => {
    const { monitorInfo: { id } } = this.props;
    let functionPage = 'communication_param';// 通讯参数
    if (drawerVisible === 'terminal') {// 终端参数
      functionPage = 'terminal_param';
    } else if (drawerVisible === 'address') {// 位置汇报
      functionPage = 'position_report';
    }
    const param = {
      functionPage,// 功能页面
      monitorId: id
    }
    const result = await getParamStatus<{ status: number, sendTimeStr: string }>(param);
    if (result) {
      console.log('status result', result);

      const { status, sendTimeStr } = result;
      this.renderStatus(status, sendTimeStr);
    }
  }

  /**
   * 渲染下发状态及时间
   * @param data 
   * @param sendTimeStr 
   */
  renderStatus = (data: number, sendTimeStr: string) => {
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

    this.formRef.current.setFieldsValue({
      lastSendTime: sendTimeStr,
      sendStatus: status
    })
  }

  /**
   * 获取参考对象数据
   * @param param 
   */
  getMonitorDropdownFun = async (param: string, props?: IProps) => {
    const { drawerVisible, monitorInfo: { id } } = props ? props : this.props;
    console.log('drawerVisible', drawerVisible);

    let commandType = 11;
    if (drawerVisible === 'terminal') {
      commandType = 12;
    } else if (drawerVisible === 'address') {
      commandType = 14;
    }

    const result = await getParamSetMonitorDropdown<Array<IItem>>({ commandType, keyword: param, monitorId: id });
    if (result) {
      this.setState({
        referenceMonitorData: result
      })
    }
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const { changeDrawer, updateDetailInfo } = this.props;
    updateDetailInfo();
    changeDrawer('');

    this.setState({
      curPositionUpTactics: 0,
      setDefaultValue: false,
    }, () => {
      this.formRef.current.resetFields();
    })
  };

  /**
   * 获取抽屉标题
   */
  getDrawerTitle = () => {
    const { drawerVisible } = this.props;

    if (drawerVisible === 'message') {
      return '通讯参数设置';
    } else if (drawerVisible === 'terminal') {
      return '终端参数设置';
    } else if (drawerVisible === 'address') {
      return '位置汇报参数设置';
    }
    return '';
  }

  /**
   * 读取终端参数并回显至表单项
   * @param 下发8106指令
   */
  readTerminalParam = async () => {
    const { drawerVisible, monitorInfo: { id } } = this.props;
    if (!drawerVisible) return;
    const online = await monitorOnline(id);
    if (!online) {
      message.warning('监控对象离线');
      // return;
    }
    this.setState({
      curSocketStatus: 'read'
    }, async () => {
      const commandType = commandTypeObj[drawerVisible];
      const dataObj = {
        monitorIds: [id],
        commandType,
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
  /**
   * 恢复默认
   */
  restoreDefault = async () => {
    const { drawerVisible,
      currentTable,
      monitorInfo: {
        id,
        setCommunicationParam,
        setTerminalParam,
        setPositionReport
      }
    } = this.props;
    const online = await monitorOnline(id);
    if (!online) {
      message.warning('监控对象离线');
      // return;
    }
    if (!drawerVisible) return;
    const commandType = commandTypeObj[drawerVisible];
    const param = {
      commandType,  //指令类型11:通讯参数; 12:终端参数; 14:位置汇报参数;
      monitorId: id,
    }
    const data = await restoreDefaultData(param);
    if (data) {
      this.renderDefaultValue();
      // 触发表单提交事件,下发参数
      this.setState({
        curSendStatus: 'reset'
      }, () => {
        this.formRef.current.submit();
      })

      // 终端是否被设置的判断,需要'通讯','终端','位置汇报'三个都未设置才代表终端未被设置过
      let sendStatu = 0;
      if (drawerVisible === 'message') {
        if (setTerminalParam || setPositionReport) {
          sendStatu = 1;
        }
      } else if (drawerVisible === 'terminal') {
        if (setCommunicationParam || setPositionReport) {
          sendStatu = 1;
        }

      } else if (drawerVisible === 'address') {
        if (setCommunicationParam || setTerminalParam) {
          sendStatu = 1;
        }
      }
      const statusResult = await updateMonitorSetStatus({
        name: 'terminalSetting',
        status: sendStatu,// 0:未设置,1:已设置
        monitorId: id
      });
      if (statusResult) {// 更新表格状态
        currentTable.current.reload();
      }
    }
  }

  /**
   * 渲染默认参数
   */
  renderDefaultValue = () => {
    const { drawerVisible } = this.props;
    let result = {};
    if (drawerVisible === 'terminal') {// 终端参数设置
      result = {
        heartSpace: 5,
        tcpAckTimeOut: 10,
        tcpReUpTimes: 5,
        udpAckTimeOut: 10,
        udpReUpTimes: 5,
        smsAckTimeOut: 20,
        smsReUpTimes: 10,
        inflectionPointAdditional: 25,
        electronicFenceRadius: 15
      }
    } else if (drawerVisible === 'address') {// 位置汇报参数设置
      const { curPositionUpTactics } = this.state;
      if (curPositionUpTactics === 0) {// 定时汇报
        result = {
          defaultTimeUpSpace: 30,
          dormancyUpTimeSpace: 120,
          emergencyAlarmUpTimeSpace: 15,
          driverLoggingOutUpTimeSpace: 30
        }
      } else if (curPositionUpTactics === 1) {// 定距汇报
        result = {
          defaultDistanceUpSpace: 500,
          dormancyUpDistanceSpace: 20000,
          emergencyAlarmUpDistanceSpace: 100,
          driverLoggingOutUpDistanceSpace: 200
        }
      } else if (curPositionUpTactics === 2) {// 定时和定距汇报
        result = {
          defaultTimeUpSpace: 30,
          dormancyUpTimeSpace: 120,
          emergencyAlarmUpTimeSpace: 15,
          driverLoggingOutUpTimeSpace: 30,
          defaultDistanceUpSpace: 500,
          dormancyUpDistanceSpace: 20000,
          emergencyAlarmUpDistanceSpace: 100,
          driverLoggingOutUpDistanceSpace: 200
        }
      }
    }
    this.formRef.current.setFieldsValue(result);
  }

  /**
   * 表单提交,下发参数至终端
   * 指令类型为8103
   * PS: 先请求保存接口,成功后再连接下发socket
   */
  sendParam = async (values: any) => {
    let hasParam = false;
    Object.keys(values).map(key => {
      if (key !== 'sendStatus' && key !== 'lastSendTime' && values[key] !== undefined) {
        hasParam = true;
      }
      return values[key];
    })
    if (!hasParam) {
      message.warning('请至少填写一个参数值!');
      return;
    }
    // this.setState({
    //     btnLoading: true
    // })
    const { drawerVisible, currentTable, monitorInfo: { id } } = this.props;
    if (!drawerVisible) return;
    const commandType = commandTypeObj[drawerVisible];

    const param = {
      commandType,  //指令类型11:通讯参数; 12:终端参数; 14:位置汇报参数;
      monitorIds: [id],
      paramJson: [values],
    }
    const result = await saveParamByCommandType(param);
    if (result) {
      const { curSendStatus } = this.state;
      if (curSendStatus !== 'reset') {
        const statusResult = await updateMonitorSetStatus({
          name: 'terminalSetting',
          status: 1,// 1:已设置
          monitorId: id
        });
        if (statusResult) {// 更新表格状态
          currentTable.current.reload();
        }
      } else {
        this.setState({
          curSendStatus: 'send'
        })
      }
      const online = await monitorOnline(id);
      if (!online) {
        message.warning('监控对象离线');
        // return;
      }
      const dataObj = {
        monitorIds: [id],
        commandType,
        type: 0,
      };
      const requestStrS = {
        desc: {
          type: 1
        },
        data: dataObj
      };
      this.setState({
        curSocketStatus: 'send'
      }, () => {
        this.onSocketSucces(requestStrS);
      })
    } else {
      this.setState({
        btnLoading: false
      })
    }
  }

  /**
   * 位置汇报参数设置
   * 汇报策略变动联动表单项显示隐藏
   */
  changePositionUpTactics = (changedFields: Array<{ name: Array<string>; value: any }>) => {
    const { drawerVisible } = this.props;
    if (drawerVisible !== 'address') return;
    if (changedFields[0] && changedFields[0].name[0] === 'positionUpTactics') {
      const { curPositionUpTactics } = this.state;
      if (changedFields[0].value !== curPositionUpTactics) {
        this.setState({
          curPositionUpTactics: changedFields[0].value
        }, () => {
          const { setDefaultValue, addressResult } = this.state;
          if (addressResult.positionUpTactics === changedFields[0].value) {
            this.formRef.current.setFieldsValue(addressResult);
            return;
          }
          if (setDefaultValue || addressResult.positionUpTactics !== changedFields[0].value) {
            this.renderDefaultValue();
          }
        })
      }
    }
  }

  /**
   * 获取表单渲染数据源
   */
  getDataSource = () => {
    const { drawerVisible, monitorInfo: { deviceTypeStr = '' } } = this.props;
    const { curPositionUpTactics } = this.state;

    let dataSource: any = drawerVisible ? columnInfo[drawerVisible] : [];
    if (drawerVisible === 'message') {// 通讯参数需要判断协议类型
      if (deviceTypeStr.indexOf('2019') !== -1) {
        dataSource = dataSource['2019'];
      } else {
        dataSource = dataSource['2013'];
      }
    } else if (drawerVisible === 'address') {
      // 位置汇报参数需根据选择的位置汇报策略动态改变显示参数项
      dataSource = dataSource[curPositionUpTactics];
    }
    return dataSource;
  }

  render() {
    const { drawerVisible } = this.props;
    const { loading, btnLoading, referenceMonitorData } = this.state;
    const dataSource = this.getDataSource();
    const title = this.getDrawerTitle();

    return (
      <EditDrawer
        title={title}
        width={1060}
        visible={drawerVisible ? true : false}
        onClose={this.closeDrawer}
        getContainer='body'
      >
        <div className={styles.editForm}>
          <Form
            ref={this.formRef}
            onFinish={this.sendParam}
            initialValues={{ positionUpTactics: 0, positionUpScheme: 0 }}
            onFieldsChange={this.changePositionUpTactics}
            className={styles.publicDrawer}
            id="paramSetContainer"
          >
            <div className={styles.innerBox}>
              <TableForm dataSource={dataSource} column={4} header={title} />
              <Row className={styles.paramBtnGroup}>
                <Col span={16}>
                  <Button type='primary' onClick={this.readTerminalParam}> 读取</Button>
                  {drawerVisible === 'message' ? null :
                    <Popconfirm
                      key='resetMonitorBtn'
                      placement="top"
                      title='是否恢复默认信息？'
                      onConfirm={this.restoreDefault}
                      okText="确认"
                      cancelText="取消">
                      <Button type='primary'>恢复默认</Button>
                    </Popconfirm>
                  }
                  <Button type='primary' htmlType="submit" loading={btnLoading}>下发参数</Button>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="参考对象"
                  >
                    <Select
                      showSearch
                      allowClear
                      key={`reference_${drawerVisible}`}
                      onSearch={this.getMonitorDropdownFun}
                      onSelect={(value) => this.getMonitorParamInfoFun(value, true)}>
                      {
                        referenceMonitorData.map(item =>
                          <Option key={item.monitorId} value={item.monitorId}>{item.monitorName}</Option>
                        )
                      }
                    </Select>
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
)(ParamSetting)

