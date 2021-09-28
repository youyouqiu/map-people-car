/**
 * 油量参数
 */
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, message, Popconfirm } from "antd";
import CheckCalibration from './checkCalibration';// 查看标定
import ReadCalibrationData from './readCalibrationData';// 读取标定数据
import ReadRegularParam from './readRegularParam';// 读取常规参数
import { TableForm } from "@/common";
import { personalityParam, sendResultColumn } from "./paramColumn";
import { addSensorBindInfo, updateSensorBindInfo, unbindSensor, addCalibration, calTheoryVol, getParamStatus, monitorOnline, getCalibration, updateMonitorSetStatus } from '@/server/monitorManager';

import { Select } from "antd";
import { getSelectContainer, getStatus } from '@/framework/utils/function';
const { Option } = Select;

import styles from '../../index.module.less';
import { shallowEqual, useSelector } from "react-redux";
import { getStore } from "@/framework/utils/localStorage";

interface IProps {
  monitorId: string,// 监控对象id
  formData: any,// 用于赋值表单数据
  updateId: number | null,
  drawerVisible: boolean,
  sensorOutId: number,// 传感器外设id：65(0x41油量主)、66(0x42油量副)
  updateFun: Function,// 表单提交后,刷新数据
}

const initialValues = {
  shape: 1,// 油箱形状
  thickness: '2',// 壁厚
  calibrationSets: '20',// 标定组数
  addOilAmountThreshold: '8',// 加油量阈值
  addOilTimeThreshold: '40',// 加油时间阈值
  seepOilTimeThreshold: '35',// 漏油时间阈值
  seepOilAmountThreshold: '6',// 漏油量阈值
};

const OilParam = (props: IProps) => {
  const formRef: any = useRef();
  const [visible, setVisible] = useState('');// 控制Modal显示
  const [btnLoading, setBtnLoading] = useState('');// 控制按钮加载状态
  const [clearDisabled, setClearDisabled] = useState(true);// 控制清空参数按钮是否可用
  const [currentShape, setCurrentShape] = useState(1);// 当前油箱形状

  useEffect(() => {
    if (props.drawerVisible) {
      getParamStatusFun();
    }
  }, [props.drawerVisible])

  useEffect(() => {
    if (props.formData) {
      setCurrentShape(props.formData.shape);
      formRef.current?.setFieldsValue(props.formData);
    } else {
      setCurrentShape(1);
      formRef.current?.resetFields();
    }
  }, [props.formData])

  useEffect(() => {
    if (props.updateId) {
      setClearDisabled(false);
    } else {
      setClearDisabled(true);
    }
  }, [props.updateId])

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

  const sendSocketFun = (type: string) => {
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
        type: 0,// 0:下发,1:读取
      }
    };
    let topic;
    let rec;
    if (type === 'sensor') {// 常规参数下发
      topic = '/monitor/sensor';
      rec = '/oil_sensor';
    } else {// 标定下发
      topic = '/monitor/calibration';
      rec = '/oil_calibration';
    }
    globalSocket.subscribeAndSend(`/user/queue${rec}`, socketCallBack, `/app${topic}`, header, requestStr, true);
  }
  const socketCallBack = (res: any) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      if (result.pushPage) {
        const status = getStatus(result.status)
        formRef.current?.setFieldsValue({
          lastSendTime: result.sendTime,
          sendStatus: status
        })
      }
    }
  }

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

  const formSubmit = async (values: any) => {
    setBtnLoading('send');
    // values.theoryVolume = '';
    values.realVolume = '';
    // await getTheoryVolume(values);
    const param = [{
      id: 0,
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
      personalParameter: values,
      sensorType: 9,
      sensorId: 1,
    }]
    let result;
    if (props.updateId) {// 更新
      param[0].id = props.updateId;
      result = await updateSensorBindInfo<any>(param);
    } else {// 新增
      result = await addSensorBindInfo<any>(param);
    }
    if (result) {
      await updateMonitorSetStatus({
        name: 'sensorSetting',
        status: 1,// 0:未设置,1:已设置
        monitorId: props.monitorId
      });
      props.updateFun();
      setClearDisabled(false);
      const online = await monitorOnline(props.monitorId);
      if (!online) {
        setBtnLoading('');
        message.warning('监控对象离线');
        // return;
      }
      sendSocketFun('sensor');
    }
    setBtnLoading('');
  }

  // 获取理论容积数据
  const getTheoryVolume = async (values: any) => {
    const result: any = await calTheoryVol<boolean>(values);
    if (result) {
      values.theoryVolume = result;
      values.realVolume = result;
      const renderResult: any = {
        theoryVolume: result,
      }
      const addOilAmountThreshold = Math.ceil(result / 25);
      if (addOilAmountThreshold >= 8) {
        renderResult.addOilAmountThreshold = addOilAmountThreshold;
        renderResult.addOilTimeThreshold = addOilAmountThreshold * 8;
      }
      formRef.current?.setFieldsValue(renderResult);
    }
  }

  // 计算标定
  const calculateCalibration = async () => {
    const paramArr = ['description', 'bottomRadius', 'calibrationSets', 'height', 'length', 'shape', 'thickness', 'topRadius', 'width'];
    formRef.current?.validateFields(paramArr).then(async (values: any) => {
      setBtnLoading('calculateCalibration');
      console.log('formRef222', formRef);
      const defaultParam: any = {
        monitorId: props.monitorId,// 监控对象id
        sensorOutId: props.sensorOutId,// 传感器外设id：65(0x41油量主)、66(0x42油量副)、67(0x43水量主)、68(0x44水量副)、112(0x70载重1#)、113(0x71载重2#)
        theoryVolume: '',// 理论容积：L
      }
      await getTheoryVolume(values);
      Object.assign(defaultParam, values);
      const result = await addCalibration<boolean>(defaultParam);
      if (result) {
        message.success('计算成功');
      } else {
        message.error('计算失败');
      }
      setBtnLoading('');
    })
  }

  // 标定下发
  const sendCalibration = async () => {
    const online = await monitorOnline(props.monitorId);
    if (!online) {
      message.warning('监控对象离线');
      // return;
    }
    const param = {
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
    }
    const result = await getCalibration<any>(param);
    if (result && result.length > 0) {
      sendSocketFun('calibration');
    } else {
      message.warning('请先计算标定');
    }
  }

  // 清空参数
  const clearParam = async () => {
    const param = {
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
      sensorId: 1
    }
    const result = await unbindSensor<boolean>(param);
    if (result) {
      formRef.current?.resetFields();
      setClearDisabled(true);
      message.success('清空成功');
    }
  }

  // 油箱基本参数
  const oilBasicParam = [{
    name: '油箱形状',
    key: 'shape',
    validate: {
      rules: [{
        required: true,
        message: '请选择油箱形状',
      }]
    },
    component: <Select onChange={(value) => { setCurrentShape(Number(value)) }} bordered={false} getPopupContainer={() => getSelectContainer(`oilParam_${props.sensorOutId}`)}>
      <Option value={1}>长方体</Option>
      <Option value={2}>圆柱形</Option>
      <Option value={3}>D形</Option>
      <Option value={4}>椭圆形</Option>
    </Select>
  }, {
    name: '长度(mm)',
    key: 'length',
    colWidth: 100,
    inputProps: {
      maxLength: 5,
      placeholder: '最多5位整数',
    },
    validate: {
      rules: [{
        required: true,
        message: '请输入长度',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const thickness = formRef.current?.getFieldValue('thickness');
            if (thickness && newNum <= Number(thickness) * 2) {
              return Promise.reject('长度必须大于2倍壁厚');
            }
            if (!isNaN(newNum) && newNum >= 0 && newNum <= 99999) {
              return Promise.resolve();
            }
            return Promise.reject('最多5位整数');
          }
        }
      }]
    }
  }, {
    name: '宽度(mm)',
    key: 'width',
    nameWidth: 140,
    inputProps: {
      maxLength: 5,
      placeholder: '100-99999的整数',
    },
    validate: {
      rules: [{
        required: true,
        message: '请输入宽度',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const thickness = formRef.current?.getFieldValue('thickness');
            if (thickness && newNum <= Number(thickness) * 2) {
              return Promise.reject('宽度必须大于2倍壁厚');
            }
            if (!isNaN(newNum) && newNum >= 100 && newNum <= 99999) {
              return Promise.resolve();
            }
            return Promise.reject('请输入100-99999的整数');
          }
        }
      }]
    }
  },
  {
    name: '高度(mm)',
    key: 'height',
    nameWidth: 150,
    inputProps: {
      maxLength: 5,
      placeholder: '100-99999的整数',
    },
    validate: {
      rules: [{
        required: true,
        message: '请输入高度',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const thickness = formRef.current?.getFieldValue('thickness');
            const sensorLength = formRef.current?.getFieldValue('sensorLength');
            if (thickness && newNum <= Number(thickness) * 2) {
              return Promise.reject('高度必须大于2倍壁厚');
            }
            if (sensorLength) {
              const num = Number(sensorLength);
              if (newNum < num || newNum > (num + 100)) {
                return Promise.reject(`输入范围${num > 100 ? num : '100'}-${(num + 100) > 99999 ? 99999 : (num + 100)}`);
              }
            }
            if (!isNaN(newNum) && newNum >= 100 && newNum <= 99999) {
              return Promise.resolve();
            }
            return Promise.reject('请输入100-99999的整数');
          }
        }
      }]
    }
  },
  {
    name: '壁厚(mm)',
    key: 'thickness',
    nameWidth: 150,
    inputProps: {
      maxLength: 2,
      placeholder: '1-10的整数',
    },
    validate: {
      rules: [{
        required: true,
        message: '请输入壁厚',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            if (!isNaN(newNum) && newNum >= 1 && newNum <= 10) {
              return Promise.resolve();
            }
            return Promise.reject('请输入1-10的整数');
          }
        }
      }]
    }
  },
  {
    name: '理论容积(L)',
    key: 'theoryVolume',
    nameWidth: 150,
    inputProps: {
      disabled: true
    }
  }];

  // 传感器基本参数
  const sensorBasicParam = [{
    name: '传感器长度',
    key: 'sensorLength',
    colWidth: 330,
    inputProps: {
      maxLength: 5,
      placeholder: '最多5位整数',
    },
    validate: {
      rules: [{
        required: true,
        message: '请输入传感器长度',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const height = formRef.current?.getFieldValue('height');
            if (height) {
              if (newNum <= Number(height) - 101 || newNum > Number(height)) {
                return Promise.reject(`输入范围${Number(height) - 100}-${height}`);
              }
            }
            if (!isNaN(newNum) && newNum >= 0 && newNum <= 99999) {
              return Promise.resolve();
            }
            return Promise.reject('最多5位整数');
          }
        }
      }]
    }
  }];

  // 油箱形状为长方体时,需显示上下圆角半径字段
  if (currentShape === 1) {
    const newParam = [{
      name: '下圆角半径(mm)',
      key: 'bottomRadius',
      nameWidth: 150,
      inputProps: {
        maxLength: 5,
        placeholder: '1-99999的整数',
      },
      validate: {
        rules: [{
          required: true,
          message: '请输入下圆角半径',
        }, {
          validator: async (rule: any, value: string) => {
            const newNum = Number(value);
            if (value) {
              const allValues: any = formRef.current?.getFieldsValue();
              if (allValues.thickness && newNum < Number(allValues.thickness)) {
                return Promise.reject('下圆角半径必须大于等于壁厚');
              }
              if (allValues.width && allValues.height) {
                if (newNum * 2 > Number(allValues.width) || newNum * 2 > Number(allValues.height)) {
                  return Promise.reject('下圆角半径必须小于等于宽或高的1/2');
                }
              }
              if (!isNaN(newNum) && newNum >= 1 && newNum <= 99999) {
                return Promise.resolve();
              }
              return Promise.reject('请输入1-99999的整数');
            }
          }
        }]
      }
    },
    {
      name: '上圆角半径(mm)',
      key: 'topRadius',
      nameWidth: 150,
      inputProps: {
        maxLength: 5,
        placeholder: '1-99999的整数',
      },
      validate: {
        rules: [{
          required: true,
          message: '请输入上圆角半径',
        }, {
          validator: async (rule: any, value: string) => {
            const newNum = Number(value);
            if (value) {
              const allValues: any = formRef.current?.getFieldsValue();
              if (allValues.thickness && newNum < Number(allValues.thickness)) {
                return Promise.reject('上圆角半径必须大于等于壁厚');
              }
              if (allValues.bottomRadius && newNum > Number(allValues.bottomRadius)) {
                return Promise.reject('上圆角半径必须小于等于下圆角半径');
              }
              if (allValues.width && allValues.height) {
                if (newNum * 2 > Number(allValues.width) || newNum * 2 > Number(allValues.height)) {
                  return Promise.reject('上圆角半径必须小于等于宽或高的1/2');
                }
              }
              if (!isNaN(newNum) && newNum >= 1 && newNum <= 99999) {
                return Promise.resolve();
              }
              return Promise.reject('请输入1-99999的整数');
            }
          }
        }]
      }
    }];
    oilBasicParam.splice(5, 0, newParam[0], newParam[1]);
  }

  return (
    <>
      <Form
        ref={formRef}
        initialValues={initialValues}
        onFinish={formSubmit}
        id={`oilParam_${props.sensorOutId}`}
        style={{ paddingTop: 5 }}
        className={styles.formWrapper}
      >
        <TableForm dataSource={oilBasicParam} column={4} header='油箱基本参数' />
        <TableForm dataSource={sensorBasicParam} column={2} header='传感器基本参数' />
        <TableForm dataSource={personalityParam} column={4} header='个性参数' />
        <div className={styles.setParamBtn}>
          <Button type='primary' onClick={calculateCalibration} loading={btnLoading === 'calculateCalibration'}>计算标定</Button>
          <Button type='primary' onClick={() => setVisible('checkCalibration')}>查看标定</Button>
          <Button type='primary' onClick={sendCalibration}>标定下发</Button>
          <Button type='primary' onClick={() => setVisible('readCalibrationData')}>读取标定数据</Button>
        </div>
        <div className={styles.setParamBtn}>
          <Button type='primary' htmlType='submit' loading={btnLoading === 'send'}>常规参数下发</Button>
          <Button type='primary' onClick={() => setVisible('readRegularParam')}>读取常规参数</Button>
          <Popconfirm
            disabled={clearDisabled}
            placement="top"
            title='确认是否继续？'
            onConfirm={clearParam}
            okText="确定"
            cancelText="取消">
            <Button type='primary' disabled={clearDisabled}>清空参数</Button>
          </Popconfirm>
        </div>
        <TableForm dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
      </Form>
      {/* 查看标定 */}
      {visible === 'checkCalibration' && <CheckCalibration changeVisible={setVisible} monitorId={props.monitorId} sensorOutId={props.sensorOutId} />}
      {/* 读取标定数据 */}
      {visible === 'readCalibrationData' && <ReadCalibrationData monitorId={props.monitorId} sensorOutId={props.sensorOutId} changeVisible={setVisible} />}
      {/* 读取常规参数 */}
      <ReadRegularParam
        visible={visible === 'readRegularParam'}
        updateId={props.updateId}
        monitorId={props.monitorId}
        sensorOutId={props.sensorOutId}
        changeVisible={setVisible}
        updateFun={props.updateFun}
      />
    </>
  );
}

export default OilParam;