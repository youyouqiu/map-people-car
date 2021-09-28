/**
 * 综合设置
 */
import React, { Component } from 'react';
import ParamSettingDrawer from '../paramSetting';// 参数设置
import SensorPolling from '../sensor/sensorPolling';// 传感器轮询
import SensorTypeSet from '../sensor/sensorTypeSet';// 传感器类型设置
import AudioAndVideo from './synthesisSet/audioAndVideo';// 音视频设置
import OilSensor from './synthesisSet/sensorSetting/oilSensor';// 油量传感器设置
import LoadSensor from './synthesisSet/sensorSetting/loadSensor';// 载重传感器设置
import { getCurrentUserPermission } from '@/framework/utils/function';

import styles from '../../../index.module.less';
import { Button } from 'antd';
import WaterSensor from './synthesisSet/sensorSetting/waterSensor';

interface IProps {
  monitorInfo: any;
  currentTable: any;
  changeDrawer: Function;
  updateDetailInfo: Function;
}

interface IState {
  monitorId: string;
  currentVisible: string;
}

// 当前页面权限
const permission = getCurrentUserPermission('4_vehicle_list');
class SynthesisSet extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      currentVisible: '',
    };
  }

  // componentDidMount() {

  // }

  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }

  /**
   * 获取外设传感器是否被设置过
   */
  getIsSet = (item: { peripheralName: string }, ioTypes: Array<number>) => {
    const isSet = item.peripheralName === '90IO输入检测' ? ioTypes.indexOf(1) !== -1 : ioTypes.indexOf(2) !== -1;
    return isSet;
  }

  /**
   * 修改详情内联抽屉显示状态
   */
  changeInnerDrawer = (param: any) => {
    this.setState({ currentVisible: param });
  }

  /**
   * 渲染传感器设置按钮
   */
  renderSensorBtn = () => {
    const {
      monitorInfo: {
        ioTypes = [],
        peripheralMonitorInfoList = [],
      },
    } = this.props;
    const sensorObj: any = {
      oil: '油量',
      water: '水量',
      load: '载重'
    }
    if (peripheralMonitorInfoList.length === 0) return <div className={styles.tdNoInfo}>暂无数据</div>;
    return peripheralMonitorInfoList.map((item: any) => {
      if (!item.sensorId) {
        return <Button key={item.id} ghost={this.getIsSet(item, ioTypes)} type={this.getIsSet(item, ioTypes) ? 'primary' : 'default'}
          onClick={() => { this.changeInnerDrawer(item.peripheralName) }}>{item.peripheralName}</Button>
      }
      if (sensorObj.oil && item.sensorId === 1) {
        sensorObj.oil = undefined;
        return <Button key={item.id} onClick={() => { this.changeInnerDrawer('oilSensor') }}>油量</Button>;
      }
      if (sensorObj.water && item.sensorId === 2) {
        sensorObj.water = undefined;
        return <Button key={item.id} onClick={() => { this.changeInnerDrawer('waterSensor') }}>水量</Button>;
      }
      if (sensorObj.load && item.sensorId === 3) {
        sensorObj.load = undefined;
        return <Button key={item.id} onClick={() => { this.changeInnerDrawer('loadSensor') }}>载重</Button>;
      }
      return null;
    })
  }

  render() {
    const {
      monitorInfo,
      monitorInfo: {
        ioTypes = [],
        peripheralMonitorInfoList = [],
        setCommunicationParam,
        setTerminalParam,
        setPositionReport
      },
      currentTable,
      updateDetailInfo
    } = this.props;
    const { currentVisible } = this.state;

    return (
      <div>
        <table className={styles.itemTable}>
          <tbody>
            <tr>
              <th className={styles.setName}>终端设置</th>
              {monitorInfo.bindingType === 1 && this.hasPermission('绑定')
                ? <td><div className={styles.settingBox}>
                  <span>参数设置</span>
                  <Button ghost={setCommunicationParam} type={setCommunicationParam && 'primary'} onClick={() => { this.changeInnerDrawer('message') }}>通讯</Button>
                  <Button ghost={setTerminalParam} type={setTerminalParam && 'primary'} onClick={() => { this.changeInnerDrawer('terminal') }} >终端</Button>
                  <Button ghost={setPositionReport} type={setPositionReport && 'primary'} onClick={() => { this.changeInnerDrawer('address') }} >位置汇报</Button>
                </div> </td>
                : <td className={styles.tdNoInfo}>暂无数据</td>
              }
            </tr>
          </tbody>
        </table>
        <table className={styles.itemTable}>
          <tbody>
            <tr>
              <th className={styles.setName}>传感器设置</th>
              {monitorInfo.bindingType === 1 && this.hasPermission('绑定')
                ? <td>
                  <div className={styles.settingBox}>
                    <span>基础设置</span>
                    <Button ghost={peripheralMonitorInfoList.length > 0} type={peripheralMonitorInfoList.length > 0 ? 'primary' : 'default'} onClick={() => { this.changeInnerDrawer('sensorPolling') }}>轮询{peripheralMonitorInfoList.length > 0 && `(${peripheralMonitorInfoList[0].pollingTime}秒)`}</Button>
                    {/* <Button onClick={() => { this.changeInnerDrawer({ sensorTypeSet: '91外界IO控制器' }) }}>91外界IO控制器</Button> */}
                  </div>
                  <div className={styles.settingBox}>
                    <span>类型设置</span>
                    {this.renderSensorBtn()}
                  </div>
                </td>
                : <td className={styles.tdNoInfo}>暂无数据</td>
              }
            </tr>
          </tbody>
        </table>
        <table className={styles.itemTable}>
          <tbody>
            <tr>
              <th className={styles.setName}>音视频设置</th>
              <td>
                <div className={styles.settingBox}>
                  <span>参数设置</span>
                  <Button onClick={() => { this.changeInnerDrawer('audioAndVideo') }}>音视频</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {/* 参数设置抽屉 */}
        {['message', 'terminal', 'address'].indexOf(currentVisible) !== -1 &&
          <ParamSettingDrawer
            currentTable={currentTable}
            monitorInfo={monitorInfo}
            drawerVisible={currentVisible}
            updateDetailInfo={updateDetailInfo}
            changeDrawer={this.changeInnerDrawer} />
        }
        {/* 传感器轮询 */}
        <SensorPolling
          currentTable={currentTable}
          monitorInfo={monitorInfo}
          drawerVisible={currentVisible === 'sensorPolling'}
          updateDetailInfo={updateDetailInfo}
          changeDrawer={this.changeInnerDrawer} />
        {/* 传感器设置 */}
        {(currentVisible === '90IO输入检测' || currentVisible === '91外接IO控制器') &&
          <SensorTypeSet
            currentTable={currentTable}
            monitorInfo={monitorInfo}
            drawerVisible={currentVisible}
            updateDetailInfo={updateDetailInfo}
            changeDrawer={this.changeInnerDrawer} />
        }
        {/* 油量传感器设置 */}
        <OilSensor
          monitorInfo={monitorInfo}
          drawerVisible={currentVisible === 'oilSensor'}
          changeDrawer={this.changeInnerDrawer} />
        {/* 水量传感器设置 */}
        <WaterSensor
          monitorInfo={monitorInfo}
          drawerVisible={currentVisible === 'waterSensor'}
          changeDrawer={this.changeInnerDrawer} />
        {/* 载重传感器设置 */}
        <LoadSensor
          monitorInfo={monitorInfo}
          drawerVisible={currentVisible === 'loadSensor'}
          changeDrawer={this.changeInnerDrawer} />
        {/* 音视频设置 */}
        <AudioAndVideo
          monitorInfo={monitorInfo}
          drawerVisible={currentVisible === 'audioAndVideo'}
          changeDrawer={this.changeInnerDrawer} />
      </div>
    );
  }
}

export default SynthesisSet;