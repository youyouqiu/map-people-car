/**
 * 读取常规参数
 */
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Form, Row, Col, Popconfirm, Input, message, Select } from "antd";
const { Option } = Select;
import styles from '../../index.module.less'
import { shallowEqual, useSelector } from "react-redux";
import { addSensorBindInfo, getParamStatus, getSensorBindInfo, monitorOnline, updateSensorBindInfo } from "@/server/monitorManager";
import { getStore } from "@/framework/utils/localStorage";
import { TableForm } from "@/common";
import { sendResultColumn } from "./paramColumn";
import { getStatus } from "@/framework/utils/function";

interface IProps {
  visible: boolean,
  changeVisible: Function,
  updateId: number | null,
  updateFun: Function,
  monitorId: string,// 监控对象id
  sensorOutId: number,// 传感器外设id：65(0x41油量主)、66(0x42油量副)
}

const formColumns = [{
  name: '传感器ID:',
  key: 'sensorId',
  rules: [{
    required: true
  }]
}, {
  name: '补偿使能:',
  key: 'inertiaCompEn',
  component: <Select disabled>
    <Option value={1}>使能</Option>
    <Option value={2}>禁用</Option>
  </Select>
}, {
  name: '自动上传时间(s):',
  key: 'autoInterval',
}, {
  name: '输出修正系数K:',
  key: 'outputK',
}, {
  name: '输出修正系数B:',
  key: 'outputB',
}, {
  name: '传感器长度:',
  key: 'sensorLength',
}, {
  name: '燃料类型:',
  key: 'oilType',
  component: <Select disabled>
    <Option value={1}>柴油</Option>
    <Option value={2}>汽油</Option>
    <Option value={3}>LNG</Option>
    <Option value={4}>CNG</Option>
  </Select>
}, {
  name: '油箱形状:',
  key: 'shape',
  component: <Select disabled>
    <Option value={1}>长方体</Option>
    <Option value={2}>圆柱形</Option>
    <Option value={3}>D形</Option>
    <Option value={4}>椭圆形</Option>
  </Select>
}, {
  name: '长度(mm):',
  key: 'length',
}, {
  name: '宽度(mm):',
  key: 'width',
}, {
  name: '高度(mm):',
  key: 'height',
}, {
  name: '加油时间阈值(s):',
  key: 'addOilTimeThreshold',
}, {
  name: '漏油时间阈值(s):',
  key: 'seepOilTimeThreshold',
}, {
  name: '加油量阈值(L):',
  key: 'addOilAmountThreshold',
}, {
  name: '漏油量阈值(L):',
  key: 'seepOilAmountThreshold',
}];

const ReadRegularParam = (props: IProps) => {
  const formRef: any = useRef();
  const [plateformData, setPlateformData] = useState({});// 平台设置参数
  const [sensorData, setSensorData] = useState({});// 传感器上报参数
  useEffect(() => {
    if (props.visible) {
      getSensorBindInfoFun();
      readSensorInfo();
      getParamStatusFun();
    } else {
      formRef.current?.resetFields();
    }
  }, [props.visible])

  // 获取参数下发状态
  const getParamStatusFun = async () => {
    const param = {
      functionPage: 'oil_sensor',// 功能页面
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

  // 获取监控对象已设置的传感器绑定信息
  const getSensorBindInfoFun = async () => {
    const param = {
      monitorId: props.monitorId,
      sensorId: 1,
    }
    const result = await getSensorBindInfo<any>(param);
    if (result && result.length > 0) {
      if (props.sensorOutId === 65) {// 主油箱
        const data = JSON.parse(result[0].personalParameter);
        data.sensorId = result[0].sensorOutId.toString(16);
        formRef.current?.setFieldsValue(data);
        setPlateformData(data);
      } else if (props.sensorOutId === 66 && result[1]) {// 副油箱
        const data = JSON.parse(result[1].personalParameter);
        data.sensorId = result[1].sensorOutId.toString(16);
        formRef.current?.setFieldsValue(data);
        setPlateformData(data);
      }
    }
  }

  // 读取传感器设置信息
  const readSensorInfo = async () => {
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
        sensorId: 1,
        type,// 0:下发,1:读取
      }
    };
    globalSocket.subscribeAndSend('/user/queue/oil_sensor', (res: any) => { socketCallBack(res, type) }, '/app/monitor/sensor', header, requestStr, true);
  }
  const socketCallBack = (res: any, type: number) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      console.log('msgBody', result);
      if (type === 1) {// 读取传感器上报参数
        if (result.data && result.data.params && result.data.params.length > 0) {
          const data: any = {};
          const list = result.data.params[0].paramValue;
          if (list) {
            const keyObj: any = {
              fuelTankType: 'shape',
              tankSize1: 'length',
              tankSize2: 'width',
              tankSize3: 'height',
              addingTime: 'addOilTimeThreshold',
              addingThreshold: 'addOilAmountThreshold',
              leakageTime: 'seepOilTimeThreshold',
              leakageThreshold: 'seepOilAmountThreshold',
            }
            Object.keys(list.param).map(key => {
              data[`sensor_${keyObj[key] || key}`] = list.param[key];
            })
            data['sensor_sensorId'] = list.sensorId.toString(16);
            formRef.current?.setFieldsValue(data);
            setSensorData(data);
          }
        }
      } else {// 下发(以平台设置为准)
        if (result.pushPage) {
          if (result.status === 0) {// 参数生效
            const values = formRef.current?.getFieldsValue();
            const info: any = {}
            Object.keys(values).map(key => {
              if (key.indexOf('sensor') === -1) {
                info[`sensor_${key}`] = values[key];
              }
            })
            formRef.current?.setFieldsValue(info);
            setSensorData(info);
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
    const values = formRef.current?.getFieldsValue();
    const info: any = {
      sensor: {},
      plateform: {}
    }
    Object.keys(values).map(key => {
      if (key.indexOf('sensor') !== -1) {
        const curKey = key.split('_')[1];
        info.sensor[curKey] = values[key];
      } else {
        info.plateform[key] = values[key];
      }
    })
    const param = [{
      id: 0,
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
      personalParameter: info.sensor,
      sensorType: 9,
      sensorId: 1,
    }]
    if (type === 'sensor') {// 以传感器为准
      let result;
      if (props.updateId) {// 更新
        param[0].id = props.updateId;
        result = await updateSensorBindInfo<any>(param);
      } else {// 新增
        result = await addSensorBindInfo<any>(param);
      }
      if (result) {
        formRef.current?.setFieldsValue(info.sensor);
        setPlateformData(info.sensor);
        props.updateFun();
      }
    } else {// 以平台为准
      const online = await monitorOnline(props.monitorId);
      if (!online) {
        message.warning('监控对象离线');
        // return;
      }
      let result;
      param[0].personalParameter = info.plateform;
      if (props.updateId) {// 更新
        param[0].id = props.updateId;
        result = await updateSensorBindInfo<any>(param);
      } else {// 新增
        result = await addSensorBindInfo<any>(param);
      }
      if (result) {
        sendSocketFun(0);
      }
    }
  }

  const renderFormItem = (type?: string) => {
    return formColumns.map(item => <Form.Item
      label={item.name}
      name={type ? `${type}_${item.key}` : item.key}
      key={type ? `${type}_${item.key}` : item.key}
      rules={item.rules}
    >
      {item.component ? item.component : <Input type='text' disabled />}
    </Form.Item>)
  }

  return (
    <Modal
      title="读取常规参数"
      visible={props.visible}
      mask={false}
      width={800}
      bodyStyle={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}
      onCancel={() => props.changeVisible('')}
      footer={[<Button key="readRegularParam" onClick={() => props.changeVisible('')}>取消</Button>]}
    >
      <Form
        ref={formRef}
        className={styles.readRegularForm}
        labelCol={{
          lg: { span: 10 },
        }}
        wrapperCol={{
          lg: { span: 14 },
        }}
      >
        <Row style={{ marginBottom: 20 }}>
          <Col span={11}>
            <h4 style={{ textAlign: 'center' }}>传感器上报参数</h4>
            {renderFormItem('sensor')}
            <Popconfirm
              placement="top"
              title='确认以传感器为准？'
              onConfirm={() => changeStandard('sensor')}
              disabled={Object.keys(sensorData).length === 0}
              okText="确定"
              cancelText="取消">
              <Button type='primary' disabled={Object.keys(sensorData).length === 0} className={styles.setStandardBtn}>以传感器为准</Button>
            </Popconfirm>
          </Col>
          <Col span={11} push={2}>
            <h4 style={{ textAlign: 'center' }}>平台设置参数</h4>
            {renderFormItem()}
            <Popconfirm
              placement="top"
              title='确认以平台设置为准？'
              onConfirm={() => changeStandard('platform')}
              disabled={Object.keys(plateformData).length === 0}
              okText="确定"
              cancelText="取消">
              <Button type='primary' disabled={Object.keys(plateformData).length === 0} className={styles.setStandardBtn}>以平台设置为准</Button>
            </Popconfirm>
          </Col>
        </Row>
        <TableForm className={styles.customDiv} dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
      </Form>
    </Modal>
  );
}

export default ReadRegularParam;