/**
 * 载重参数
 */
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, message, Popconfirm, Select } from "antd";
import { TableForm } from "@/common";
const { Option } = Select;

import styles from '../../index.module.less';
import { addLoadSensorBindInfo, updateLoadSensorBindInfo, unbindSensor, monitorOnline, getParamStatus, updateMonitorSetStatus } from '@/server/monitorManager';
import { getSelectContainer, getStatus } from "@/framework/utils/function";
import { getStore } from "@/framework/utils/localStorage";
import { shallowEqual, useSelector } from "react-redux";

interface IProps {
  monitorId: string,// 监控对象id
  formData: any,// 用于赋值表单数据
  updateId: number | null,
  drawerVisible: boolean,
  sensorOutId: number,// 传感器外设id：112(0x70载重1#)、113(0x71载重2#)
  updateFun: Function,// 表单提交后,刷新数据
}

const initialValues = {
  loadMeasureMethod: 0,// 载重测量方式
  sensorWeightUnit: 3,// 传感器重量单位
  noLoadThresholdDeviation: '10',// 空载阈值偏差
  lightLoadThresholdDeviation: '10',// 轻载阈值偏差
  fullLoadThresholdDeviation: '10',// 满载阈值偏差
  overLoadThresholdDeviation: '10',// 超载阈值偏差
};

// 下发结果
const sendResultColumn = [{
  name: '最后一次下发时间',
  key: 'lastSendTime',
}, {
  name: '下发状态',
  key: 'sendStatus',
}]

const LoadParam = (props: IProps) => {
  const formRef: any = useRef();
  const [btnLoading, setBtnLoading] = useState('');// 控制按钮加载状态
  // const [inputMaxLength, setInputMaxLength] = useState(8);// 控制输入框最大输入长度
  const [clearDisabled, setClearDisabled] = useState(true);// 控制清空参数按钮是否可用

  useEffect(() => {
    if (props.drawerVisible) {
      getParamStatusFun();
    }
  }, [props.drawerVisible])

  useEffect(() => {
    if (props.formData) {
      formRef.current?.setFieldsValue(props.formData);
    } else {
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

  const sendSocketFun = () => {
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
        sensorId: 3,
        type: 0,// 0:下发,1:读取
      }
    };
    globalSocket.subscribeAndSend('/user/queue/load_sensor', socketCallBack, '/app/monitor/sensor', header, requestStr, true);
  }
  const socketCallBack = (res: any) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      if (result.pushPage === 'load_sensor') {
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
      functionPage: 'load_sensor',// 功能页面
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
    const param = [{
      id: 0,
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
      personalParameter: values,
      sensorType: 6,
      sensorId: 3,
    }]
    let result;
    if (props.updateId) {// 更新
      param[0].id = props.updateId;
      result = await updateLoadSensorBindInfo<any>(param);
    } else {// 新增
      result = await addLoadSensorBindInfo<any>(param);
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
      sendSocketFun();
    }
    setBtnLoading('');
  }

  // 清空参数
  const clearParam = async () => {
    const param = {
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
      sensorId: 3
    }
    const result = await unbindSensor<boolean>(param);
    if (result) {
      formRef.current?.resetFields();
      setClearDisabled(true);
      message.success('清空成功');
    }
  }

  // 获取传感器重量单位值
  const getSensorWeightUnit = (data: number) => {
    let val = 0;
    switch (data) {
      case 0:
        val = 0.1;
        break;
      case 1:
        val = 1;
        break;
      case 2:
        val = 10;
        break;
      case 3:
        val = 100;
        break;
    }
    return val;
  }

  // 传感器重量单位改变,重新校验表单字段
  const sensorWeightUnitChange = () => {
    const arr = ['noLoadThreshold', 'lightLoadThreshold', 'fullLoadThreshold', 'overLoadThreshold']
    const formValues = formRef.current.getFieldsValue();
    for (let i = 3; i > 0; i -= 1) {
      if (!formValues[arr[i]]) {
        arr.splice(i, 1);
      }
    }
    formRef.current?.validateFields(arr);
  }

  // 实时流设置
  const paramColumn = [{
    name: '载重测量方式',
    key: 'loadMeasureMethod',
    nameWidth: 140,
    colWidth: 300,
    validate: {
      rules: [{
        required: true,
        message: '请选择载重测量方式',
      }]
    },
    component: <Select bordered={false} getPopupContainer={() => getSelectContainer(`loadParam_${props.sensorOutId}`)}>
      <Option value={0}>单计重</Option>
      <Option value={1}>双计重</Option>
      <Option value={2}>四计重</Option>
    </Select >
  }, {
    name: '传感器重量单位',
    key: 'sensorWeightUnit',
    nameWidth: 140,
    validate: {
      rules: [{
        required: true,
        message: '请选择传感器重量单位',
      }]
    },
    component: <Select
      bordered={false}
      onChange={sensorWeightUnitChange}
      getPopupContainer={() => getSelectContainer(`loadParam_${props.sensorOutId}`)}
    >
      <Option value={0}>0.1kg</Option>
      <Option value={1}>1kg</Option>
      <Option value={2}>10kg</Option>
      <Option value={3}>100kg</Option>
    </Select >
  }, {
    name: '空载阈值(kg)',
    key: 'noLoadThreshold',
    validate: {
      rules: [{
        required: true,
        message: '请输入空载阈值',
      }, {
        pattern: new RegExp(/^\d*\.{0,1}\d{0,1}$/),
        message: '请输入数字,保留1位小数'
      },
      {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const sensorWeightUnit = formRef.current?.getFieldValue('sensorWeightUnit');
            const lightLoadThreshold = formRef.current?.getFieldValue('lightLoadThreshold');
            const maxNum = getSensorWeightUnit(sensorWeightUnit) * 10000;
            if (newNum < getSensorWeightUnit(sensorWeightUnit)) {
              return Promise.reject('空载阈值必须大于等于传感器重量单位');
            }
            if (!(!isNaN(newNum) && newNum >= 1 && newNum < maxNum)) {
              return Promise.reject(`输入范围需小于${maxNum}`);
            }
            if (lightLoadThreshold && newNum >= Number(lightLoadThreshold)) {
              return Promise.reject('空载阈值需小于轻载阈值');
            }
            return Promise.resolve();
          }
        }
      }]
    }
  },
  {
    name: '空载阈值偏差(%)',
    key: 'noLoadThresholdDeviation',
    validate: {
      rules: [{
        required: true,
        message: '请输入空载阈值偏差',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            if (!isNaN(newNum) && newNum >= 1 && newNum <= 100) {
              return Promise.resolve();
            }
            return Promise.reject('输入范围1-100的整数');
          }
        }
      }]
    }
  }, {
    name: '轻载阈值(kg)',
    key: 'lightLoadThreshold',
    validate: {
      rules: [{
        required: true,
        message: '请输入轻载阈值',
      }, {
        pattern: new RegExp(/^\d*\.{0,1}\d{0,1}$/),
        message: '请输入数字,保留1位小数'
      },
      {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const sensorWeightUnit = formRef.current?.getFieldValue('sensorWeightUnit');
            const fullLoadThreshold = formRef.current?.getFieldValue('fullLoadThreshold');
            const maxNum = getSensorWeightUnit(sensorWeightUnit) * 10000;
            if (newNum < getSensorWeightUnit(sensorWeightUnit)) {
              return Promise.reject('轻载阈值必须大于等于传感器重量单位');
            }
            if (!(!isNaN(newNum) && newNum >= 1 && newNum < maxNum)) {
              return Promise.reject(`输入范围需小于${maxNum}`);
            }
            if (fullLoadThreshold && newNum >= Number(fullLoadThreshold)) {
              return Promise.reject('轻载阈值需小于满载阈值');
            }
            return Promise.resolve();
          }
        }
      }]
    }
  }, {
    name: '轻载阈值偏差(%)',
    key: 'lightLoadThresholdDeviation',
    validate: {
      rules: [{
        required: true,
        message: '请输入轻载阈值偏差',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            if (!isNaN(newNum) && newNum >= 1 && newNum <= 100) {
              return Promise.resolve();
            }
            return Promise.reject('输入范围1-100的整数');
          }
        }
      }]
    }
  }, {
    name: '满载阈值(kg)',
    key: 'fullLoadThreshold',
    validate: {
      rules: [{
        required: true,
        message: '请输入满载阈值',
      }, {
        pattern: new RegExp(/^\d*\.{0,1}\d{0,1}$/),
        message: '请输入数字,保留1位小数'
      },
      {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const sensorWeightUnit = formRef.current?.getFieldValue('sensorWeightUnit');
            const overLoadThreshold = formRef.current?.getFieldValue('overLoadThreshold');
            const maxNum = getSensorWeightUnit(sensorWeightUnit) * 10000;
            if (newNum < getSensorWeightUnit(sensorWeightUnit)) {
              return Promise.reject('满载阈值必须大于等于传感器重量单位');
            }
            if (!(!isNaN(newNum) && newNum >= 1 && newNum < maxNum)) {
              return Promise.reject(`输入范围需小于${maxNum}`);
            }
            if (overLoadThreshold && newNum >= Number(overLoadThreshold)) {
              return Promise.reject('满载阈值需小于超载阈值');
            }
            return Promise.resolve();
          }
        }
      }]
    }
  }, {
    name: '满载阈值偏差(%)',
    key: 'fullLoadThresholdDeviation',
    validate: {
      rules: [{
        required: true,
        message: '请输入满载阈值偏差',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            if (!isNaN(newNum) && newNum >= 1 && newNum <= 100) {
              return Promise.resolve();
            }
            return Promise.reject('输入范围1-100的整数');
          }
        }
      }]
    }
  }, {
    name: '超载阈值(kg)',
    key: 'overLoadThreshold',
    validate: {
      rules: [{
        required: true,
        message: '请输入超载阈值',
      }, {
        pattern: new RegExp(/^\d*\.{0,1}\d{0,1}$/),
        message: '请输入数字,保留1位小数'
      },
      {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            const sensorWeightUnit = formRef.current?.getFieldValue('sensorWeightUnit');
            const maxNum = getSensorWeightUnit(sensorWeightUnit) * 10000;
            if (newNum < getSensorWeightUnit(sensorWeightUnit)) {
              return Promise.reject('超载阈值必须大于等于传感器重量单位');
            }
            if (!isNaN(newNum) && newNum >= 1 && newNum < maxNum) {
              return Promise.resolve();
            }
            return Promise.reject(`输入范围需小于${maxNum}`);
          }
        }
      }]
    }
  }, {
    name: '超载阈值偏差(%)',
    key: 'overLoadThresholdDeviation',
    validate: {
      rules: [{
        required: true,
        message: '请输入超载阈值偏差',
      }, {
        validator: async (rule: any, value: string) => {
          const newNum = Number(value);
          if (value) {
            if (!isNaN(newNum) && newNum >= 1 && newNum <= 100) {
              return Promise.resolve();
            }
            return Promise.reject('输入范围1-100的整数');
          }
        }
      }]
    }
  }]

  return (
    <Form
      ref={formRef}
      initialValues={initialValues}
      onFinish={formSubmit}
      id={`loadParam_${props.sensorOutId}`}
      style={{ paddingTop: 5 }}
    >
      <TableForm dataSource={paramColumn} column={4} />
      <div className={styles.divMargin}>
        <Button type='primary' htmlType='submit' loading={btnLoading === 'send'}>下发参数</Button>
        <Popconfirm
          disabled={clearDisabled}
          placement="top"
          title='确认是否继续？'
          onConfirm={clearParam}
          okText="确定"
          cancelText="取消">
          <Button type='primary' disabled={clearDisabled} className={styles.btnMargin}>清空参数</Button>
        </Popconfirm>
      </div>
      <TableForm dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
    </Form>
  );
}

export default LoadParam;