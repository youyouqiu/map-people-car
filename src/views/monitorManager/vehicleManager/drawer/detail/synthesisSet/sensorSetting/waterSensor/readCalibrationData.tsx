/**
 * 读取标定数据
 */
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, message, Modal, Popconfirm, Row, Table } from "antd";

import styles from '../../index.module.less'
import { shallowEqual, useSelector } from "react-redux";
import { getStore } from "@/framework/utils/localStorage";
import { addCalibrationData, getCalibration, getParamStatus, monitorOnline } from "@/server/monitorManager";
import { TableForm } from "@/common";
import { sendResultColumn } from "./paramColumn";
import { getStatus } from "@/framework/utils/function";
import Form from "antd/lib/form/Form";

interface IProps {
  changeVisible: Function,
  monitorId: string,// 监控对象id
  sensorOutId: number,// 传感器外设id：67(0x43水量主)、68(0x44水量副)
}

const columns = [
  {
    title: '序号',
    render: (text: any, record: any, index: number) => `${index + 1}`,
  },
  {
    title: '液位高度(mm)',
    dataIndex: 'key',
  },
  {
    title: '水量值(L)',
    dataIndex: 'value',
  },
];
const ReadCalibrationData = (props: IProps) => {
  const formRef: any = useRef();
  const [plateformData, setPlateformData] = useState([]);// 平台设置参数
  const [sensorData, setSensorData] = useState([]);// 传感器上报参数
  useEffect(() => {
    getCalibrationFun();
    readInfo();
    getParamStatusFun();
  }, [])

  // 获取参数下发状态
  const getParamStatusFun = async () => {
    const param = {
      functionPage: 'water_calibration',// 功能页面
      monitorId: props.monitorId
    }
    const result = await getParamStatus<{ status: number, sendTimeStr: string }>(param);
    if (result) {
      console.log('status result', result);
      const status = getStatus(result.status)
      formRef.current?.setFieldsValue({
        lastSendTime: result.sendTimeStr,
        sendStatus: status
      })
    }
  }

  // 获取平台设置参数
  const getCalibrationFun = async () => {
    const param = {
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
    }
    const result = await getCalibration<any>(param);
    if (result && result.length > 0) {
      setPlateformData(JSON.parse(result[0].calibrationJson));
    }
  }

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

  const readInfo = async () => {
    const online = await monitorOnline(props.monitorId);
    if (!online) {
      message.warning('监控对象离线');
      // return;
    }
    sendSocketFun(1);
  }

  const sendSocketFun = (type: number) => {
    if (!globalSocket) return;
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = {
      desc: {
        type: 1
      },
      data: {
        monitorId: props.monitorId,
        sensorOutId: props.sensorOutId,
        sensorId: 2,
        type,// 0:下发,1:读取
      }
    };
    globalSocket.subscribeAndSend('/user/queue/water_calibration', (res: any) => { socketCallBack(res, type) }, '/app/monitor/calibration', header, requestStr, true);
  }
  const socketCallBack = (res: any, type: number) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      console.log('msgBody', result);
      if (type === 1) {// 读取
        if (result.data && result.data.params && result.data.params.length > 0) {
          const newData = result.data.params[0].paramValue.list.map((item: any) => {
            item.key = item.height;
            item.value = item.volume;
            return item;
          })
          setSensorData(newData)
        }
      } else {// 下发
        if (result.pushPage) {
          if (result.status === 0) {// 参数生效
            setSensorData(plateformData);
          }
          const status = getStatus(result.status)
          formRef.current?.setFieldsValue({
            lastSendTime: result.sendTime,
            sendStatus: status
          })
        }
      }
    }
  }

  // 标准切换
  const changeStandard = async (type: 'sensor' | 'platform') => {
    const param = [
      {
        calibrationList: sensorData,
        id: 0,
        monitorId: props.monitorId,
        sensorOutId: props.sensorOutId
      }
    ]
    if (type === 'sensor') {// 以传感器为准
      const result = await addCalibrationData(param);
      if (result) {
        setPlateformData(sensorData);
      }
    } else {// 以平台为准
      const online = await monitorOnline(props.monitorId);
      if (!online) {
        message.warning('监控对象离线');
        // return;
      }
      param[0].calibrationList = plateformData;
      const result = await addCalibrationData(param);
      if (result) {
        sendSocketFun(0);
      }
    }
  }

  return (
    <Modal
      title="读取标定数据"
      visible
      mask={false}
      width={800}
      onCancel={() => props.changeVisible('')}
      footer={[<Button key="readLoadCalibration" onClick={() => props.changeVisible('')}>取消</Button>]}
    >
      <Row style={{ textAlign: 'center' }}>
        <Col span={11}>
          <h4>传感器上报参数</h4>
          <Table
            bordered
            className={styles.customTable}
            columns={columns}
            dataSource={sensorData}
            pagination={false}
            scroll={{ y: `calc(100vh - 530px)` }}
          />
          <Popconfirm
            placement="top"
            title='确认以传感器为准？'
            onConfirm={() => changeStandard('sensor')}
            disabled={sensorData.length === 0}
            okText="确定"
            cancelText="取消">
            <Button type='primary' disabled={sensorData.length === 0} className={styles.setStandardBtn}>以传感器为准</Button>
          </Popconfirm>
        </Col>
        <Col span={11} push={2}>
          <h4>平台设置参数</h4>
          <Table
            bordered
            className={styles.customTable}
            columns={columns}
            dataSource={plateformData}
            pagination={false}
            scroll={{ y: `calc(100vh - 530px)` }}
          />
          <Popconfirm
            placement="top"
            title='确认以平台设置为准？'
            onConfirm={() => changeStandard('platform')}
            disabled={plateformData.length === 0}
            okText="确定"
            cancelText="取消">
            <Button type='primary' disabled={plateformData.length === 0} className={styles.setStandardBtn}>以平台设置为准</Button>
          </Popconfirm>
        </Col>
      </Row>
      <Form ref={formRef}>
        <TableForm dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
      </Form>
    </Modal>
  );
}

export default ReadCalibrationData;