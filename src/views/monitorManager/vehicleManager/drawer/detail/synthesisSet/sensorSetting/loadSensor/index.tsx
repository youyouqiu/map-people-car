/**
 * 载重传感器设置
 */
import React, { useEffect, useState } from "react";
import { EditDrawer, TableForm } from '@/common/';
import { Select, Spin, Tabs } from "antd";
const { Option } = Select;
const { TabPane } = Tabs;
import LoadParam from './loadParam';// 油量参数
import Calibration from './calibration';// 标定修正

import styles from '../../index.module.less'
import { getSelectContainer } from "@/framework/utils/function";
import { getSensorBindInfo, getListDropdownMonitor } from '@/server/monitorManager';
import { shallowEqual, useSelector } from "react-redux";
import { getStore } from "@/framework/utils/localStorage";

interface IProps {
  monitorInfo: any;
  drawerVisible: boolean;
  changeDrawer: Function;
}

interface IMonitor {
  monitorId: string;
  monitorName: string
}

const LoadSensor = (props: IProps) => {
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

  // 连接redux数据
  const { globalSocket } = useSelector(({
    root: {
      globalSocket,
    }
  }: any) => {
    return {
      globalSocket
    }
  }, shallowEqual);

  const sendSocketFun = () => {
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = {
      desc: {
        type: 1
      },
      data: {
        monitorId: props.monitorInfo.id
      }
    };
    globalSocket.subscribeAndSend('/user/queue/video/parameters', socketCallBack, '/app/video/parameters', header, requestStr);
  }
  const socketCallBack = (res: any) => {
    console.log('res', res);
  }

  // 获取监控对象已设置的传感器绑定信息
  const getSensorBindInfoFun = async (monitorId?: string) => {
    setLoading(true);
    const param = {
      monitorId: monitorId || props.monitorInfo?.id,
      sensorId: 3,
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
      sensorId: 3,
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
    component: <div><Select
      showSearch
      allowClear
      bordered={false}
      placeholder='请选择参考对象'
      onSearch={getListDropdownMonitorFun}
      onChange={(id: any) => { if (id) getSensorBindInfoFun(id) }}
      getPopupContainer={() => getSelectContainer('loadContainer')}
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
      title="载重传感器设置"
      width={1060}
      onClose={closeDrawer}
      visible={props.drawerVisible}
      getContainer="body"
    >
      <div id="loadContainer">
        <TableForm dataSource={referenceObject} column={2} header='参数设置[载重传感器]' />
        <div className={styles.innerBox} style={{ paddingBottom: 5 }}>
          <Tabs tabBarStyle={{ marginLeft: 120 }}>
            <TabPane tab="1#载重" key="1">
              <Tabs tabPosition='left'>
                <TabPane tab="载重参数" key="1">
                  <LoadParam
                    sensorOutId={112}
                    drawerVisible={props.drawerVisible}
                    formData={bindInfo[0] ? JSON.parse(bindInfo[0].personalParameter) : null}
                    updateId={currentMonitorInfo[0] ? currentMonitorInfo[0].id : null}
                    monitorId={props.monitorInfo.id}
                    updateFun={getSensorBindInfoFun}
                  />
                </TabPane>
                <TabPane tab="载重标定" key="2">
                  <Calibration
                    sensorOutId={112}
                    monitorId={props.monitorInfo.id}
                    drawerVisible={props.drawerVisible}
                  />
                </TabPane>
              </Tabs>
            </TabPane>
            <TabPane tab="2#载重" key="2">
              <Tabs tabPosition='left'>
                <TabPane tab="载重参数" key="1">
                  <LoadParam
                    sensorOutId={113}
                    drawerVisible={props.drawerVisible}
                    formData={bindInfo[1] ? JSON.parse(bindInfo[1].personalParameter) : null}
                    updateId={currentMonitorInfo[1] ? currentMonitorInfo[1].id : null}
                    monitorId={props.monitorInfo.id}
                    updateFun={getSensorBindInfoFun}
                  />
                </TabPane>
                <TabPane tab="载重标定" key="2">
                  <Calibration
                    sensorOutId={113}
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

export default LoadSensor;