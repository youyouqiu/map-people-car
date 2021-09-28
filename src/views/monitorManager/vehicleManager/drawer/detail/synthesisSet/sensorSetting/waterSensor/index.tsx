/**
 * 水量传感器设置
 */
import React, { useEffect, useState } from "react";
import { EditDrawer, TableForm } from '@/common/';
import { Select, Spin, Tabs } from "antd";
const { Option } = Select;
const { TabPane } = Tabs;
import WaterParam from './waterParam';// 水量参数
import CalibrationCorrection from './calibrationCorrection';// 标定修正

import styles from '../../index.module.less'
import { getSelectContainer } from "@/framework/utils/function";
import { getSensorBindInfo, getListDropdownMonitor } from '@/server/monitorManager';

interface IProps {
  monitorInfo: any;
  drawerVisible: boolean;
  changeDrawer: Function;
}

interface IMonitor {
  monitorId: string;
  monitorName: string
}

const WaterSensor = (props: IProps) => {
  const [loading, setLoading] = useState(false);
  const [bindInfo, setBindInfo]: Array<any> = useState([]);// 监控对象已设置的传感器绑定信息
  const [referenceMonitorData, setReferenceMonitorData] = useState([]);// 参考对象
  const [currentMonitorInfo, setCurrentMonitorInfo]: any = useState([]);

  useEffect(() => {
    if (props.drawerVisible) {
      getSensorBindInfoFun();
      getListDropdownMonitorFun();
    }
  }, [props.drawerVisible])

  // 获取监控对象已设置的传感器绑定信息
  const getSensorBindInfoFun = async (monitorId?: string) => {
    setLoading(true);
    const param = {
      monitorId: monitorId || props.monitorInfo?.id,
      sensorId: 2,
    }
    const result = await getSensorBindInfo<any>(param);
    if (result) {
      setBindInfo(result);
      if (!monitorId) {
        setCurrentMonitorInfo(result);
      }
    }
    setLoading(false);
  }

  // 获取参考对象数据
  const getListDropdownMonitorFun = async (keyword?: string) => {
    const param = {
      monitorId: props.monitorInfo?.id,
      sensorId: 2,
      keyword
    }
    const result = await getListDropdownMonitor<any>(param);
    if (result) {
      setReferenceMonitorData(result);
    }
  }

  const referenceObject = [{
    name: '参考对象',
    key: 'referenceMonitor',
    colWidth: 500,
    component: <div>
      <Select
        showSearch
        allowClear
        bordered={false}
        placeholder='请选择参考对象'
        onSearch={getListDropdownMonitorFun}
        onChange={(id: any) => { if (id) getSensorBindInfoFun(id) }}
        getPopupContainer={() => getSelectContainer('waterContainer')}
      >
        {
          referenceMonitorData.map((item: IMonitor) =>
            <Option key={item.monitorId} value={item.monitorId}>{item.monitorName}</Option>
          )
        }
      </Select></div>
  }]

  const closeDrawer = () => {
    props.changeDrawer('');
  }

  return (
    <EditDrawer
      title="水量传感器设置"
      width={1060}
      onClose={closeDrawer}
      visible={props.drawerVisible}
      getContainer="body"
    >
      <div>
        <div id="waterContainer">
          <TableForm dataSource={referenceObject} column={2} header='参数设置[水量传感器]' />
        </div>
        <div className={styles.innerBox} style={{ paddingBottom: 5 }}>
          <Tabs tabBarStyle={{ marginLeft: 120 }}>
            <TabPane tab="主水箱" key="1">
              <Tabs tabPosition='left'>
                <TabPane tab="水量参数" key="1">
                  <WaterParam
                    sensorOutId={67}
                    drawerVisible={props.drawerVisible}
                    formData={bindInfo[0] ? JSON.parse(bindInfo[0].personalParameter) : null}
                    updateId={currentMonitorInfo[0] ? currentMonitorInfo[0].id : null}
                    monitorId={props.monitorInfo.id}
                    updateFun={getSensorBindInfoFun}
                  />
                </TabPane>
                <TabPane tab="标定修正" key="2">
                  <CalibrationCorrection
                    sensorOutId={67}
                    monitorId={props.monitorInfo.id}
                    drawerVisible={props.drawerVisible}
                  />
                </TabPane>
              </Tabs>
            </TabPane>
            <TabPane tab="副水箱" key="2">
              <Tabs tabPosition='left'>
                <TabPane tab="水量参数" key="1">
                  <WaterParam
                    sensorOutId={68}
                    drawerVisible={props.drawerVisible}
                    formData={bindInfo[1] ? JSON.parse(bindInfo[1].personalParameter) : null}
                    updateId={currentMonitorInfo[1] ? currentMonitorInfo[1].id : null}
                    monitorId={props.monitorInfo.id}
                    updateFun={getSensorBindInfoFun}
                  />
                </TabPane>
                <TabPane tab="标定修正" key="2">
                  <CalibrationCorrection
                    sensorOutId={68}
                    monitorId={props.monitorInfo.id}
                    drawerVisible={props.drawerVisible}
                  />
                </TabPane>
              </Tabs>
            </TabPane>
          </Tabs>
        </div>
        {/* 加载loading */}
        {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
      </div>
    </EditDrawer>
  );
}

export default WaterSensor;