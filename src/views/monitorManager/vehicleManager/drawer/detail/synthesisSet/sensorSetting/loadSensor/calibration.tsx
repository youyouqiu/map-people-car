
/**
 * 载重标定
 */
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Input, message, Row, Table } from "antd";

import styles from '../../index.module.less'
import { TableForm } from "@/common";
import { shallowEqual, useSelector } from "react-redux";
import { addCalibrationData, getCalibration, getParamStatus, monitorOnline } from "@/server/monitorManager";
import { getStore } from "@/framework/utils/localStorage";
import { getStatus } from "@/framework/utils/function";

interface IProps {
  monitorId: string,// 监控对象id
  sensorOutId: number,// 传感器外设id：112(0x70载重1#)、113(0x71载重2#)
  drawerVisible: boolean
}

// 下发结果
const sendResultColumn = [{
  name: '最后一次下发时间',
  key: 'lastSendTime',
}, {
  name: '下发状态',
  key: 'sendStatus',
}]

// 用于生成记录的唯一ID
const randomString = () => {
  const t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const a = t.length;
  let n = "";
  for (let i = 0; i < 32; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

const Calibration = (props: IProps) => {
  const formRef: any = useRef();
  const searchFormRef: any = useRef();
  const mapRef: any = useRef({
    formIndexMap: new Map(),
    insertIndex: 0, // 新增数据插入索引位置
  });
  // const [selectRow, setSelectRow]: any = useState();
  // const [tableCheckArr, setTableCheckArr]: any = useState([]);
  const [tableSource, setTableSource]: any = useState([]);
  const [btnLoading, setBtnLoading] = useState('');// 控制按钮加载状态

  const columns = [
    {
      title: '序号',
      render: (text: any, record: any, index: number) => `${index + 1}`,
    },
    {
      title: '操作',
      render: (text: any, record: any, index: number) => {
        return <Button disabled={record.id === 'default'} key={`deleteBtn_${index}`} type="link" onClick={(e) => { e.stopPropagation(); deleteRow(index) }}>删除</Button>;
      },
    },
    {
      title: 'AD值',
      dataIndex: 'theAdValue',
      render: (text: any, record: any, index: number) => {
        return <Form.Item
          className={index < 2 ? 'formItem-bottom-explain' : ''}
          name={`theAdValue_${record.id}`}
          key={`theAdValue_${record.id}`}
          validateFirst
          rules={[
            {
              required: record.id === 'default' ? false : true,
              message: '请输入AD值',
            },
            {
              validator: async (rule: any, value: string) => {
                const newNum = Number(value);
                if (record.id === 'default' && (value === undefined || value === '')) {
                  return Promise.reject('请先输入起始值再新增');
                }
                if (value) {
                  if (!isNaN(newNum) && newNum >= 0 && newNum <= 65535) {
                    return Promise.resolve();
                  }
                  return Promise.reject('输入范围0-65535');
                }
              }
            },
            {
              validator: (rule, value, callback) => { return repeatAdValueFun(rule, value, callback, record) },
            }
          ]}
        >
          <Input type='text' autoComplete='off' maxLength={5} placeholder='输入范围0-65535' />
        </Form.Item>
      }
    },
    {
      title: '实际载重(kg)',
      dataIndex: 'actualLoad',
      render: (text: any, record: any, index: number) => {
        return <Form.Item
          name={`actualLoad_${record.id}`}
          key={`actualLoad_${record.id}`}
          validateFirst
          rules={[
            {
              required: true,
              message: '请输入实际载重',
            },
            {
              validator: async (rule: any, value: string) => {
                const newNum = Number(value);
                if (record.id === 'default' || newNum < 1) {
                  return Promise.resolve();
                }
                if (value) {
                  if (!isNaN(newNum) && newNum >= 1 && newNum <= 99999) {
                    return Promise.resolve();
                  }
                  return Promise.reject('输入范围1-99999');
                }
              }
            },
            {
              validator: (rule, value, callback) => {
                if (record.id === 'default') {
                  return Promise.resolve();
                }
                return repeatActualLoadFun(rule, value, callback, record)
              },
            }
          ]}
        >
          <Input disabled={index === 0} type='text' autoComplete='off' maxLength={5} placeholder='输入范围1-99999' />
        </Form.Item>
      }
    },
  ];

  useEffect(() => {
    if (props.drawerVisible) {
      getCalibrationFun();
      getParamStatusFun();
    }
  }, [props.drawerVisible])

  // 获取参数最后下发时间及状态
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

  // 获取平台设置参数
  const getCalibrationFun = async () => {
    const param = {
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
    }
    const result = await getCalibration<any>(param);
    if (result && result.length > 0) {
      const data = JSON.parse(result[0].calibrationJson);
      renderTableSource(data);
    } else {
      renderTableSource([{
        key: '',
        value: 0
      }])
    }
  }

  // 渲染表格显示数据
  const renderTableSource = (data: any) => {
    const formData: any = {};
    const newTableSource: any = [];
    const formIndexMap = new Map();
    data.map((item: any, index: number) => {
      const id = index === 0 ? 'default' : randomString();
      item.index = index;
      formIndexMap.set(index, id);
      newTableSource.push({
        index,
        id,
        theAdValue: item.key,
        actualLoad: item.value,
        disabled: index === 0
      })
      formData[`theAdValue_${id}`] = item.key;
      formData[`actualLoad_${id}`] = item.value;
    })
    mapRef.current.formIndexMap = formIndexMap;
    formRef.current?.setFieldsValue(formData);
    setTableSource(newTableSource);
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
      return;
    }
    sendSocketFun(1);
  }

  const sendSocketFun = (type: number) => {
    if (!globalSocket) return;
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    if (type === 0) {// 下发参数
      const requestStr = {
        desc: {
          type: 1
        },
        data: {
          monitorId: props.monitorId,
          sensorOutId: props.sensorOutId,
          sensorId: 3,
          type,// 0:下发,1:读取
        }
      };
      globalSocket.subscribeAndSend('/user/queue/load_calibration', (res: any) => { socketCallBack(res, type) }, '/app/monitor/calibration', header, requestStr, true);
    } else {// 读取AD值
      const requestStr = { data: props.monitorId, desc: { type: 0 } } //订阅
      globalSocket.subscribeAndSend('/user/queue/query_position', (res: any) => { socketCallBack(res, type) }, '/app/monitor/queryPosition', header, requestStr, true);

    }
  }
  const socketCallBack = (res: any, type: number) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      if (type === 1) {// 读取AD值
        const loadInfos = result.data.gpsInfo.loadInfos;
        if (!loadInfos || loadInfos.length === 0) return;
        for (let i = 0; i < loadInfos.length; i++) {
          const test = loadInfos[i];
          const pid = test.id;
          const originalAd = test.originalAd;
          if (props.sensorOutId === pid) {
            searchFormRef.current?.setFieldsValue({
              theAdValue: originalAd,
            });
            return;
          }
        }
      } else {// 下发参数
        if (result.pushPage) {
          const status = getStatus(result.status)
          formRef.current?.setFieldsValue({
            lastSendTime: result.sendTime,
            sendStatus: status
          })
        }
      }
    }
  }

  /**
  * AD值校验
  */
  const repeatAdValueFun = (rule: any, value: string, callback: Function, record?: { id: string, index: number }) => {
    if (value === undefined || value === '') {
      return Promise.resolve();
    }
    const index = record?.index;
    const { formIndexMap } = mapRef.current;
    // 本行AD值需在相邻两行值之间
    if (index !== undefined) {
      const prevId = formIndexMap.get(index - 1);
      const nextId = formIndexMap.get(index + 1);
      let prevValue: any = -1;
      let nextValue: any = 65536;
      if (prevId) {
        prevValue = formRef.current?.getFieldValue(`theAdValue_${prevId}`);
      }
      if (nextId) {
        nextValue = formRef.current?.getFieldValue(`theAdValue_${nextId}`);
      }
      if (prevValue === '' || nextValue === '') {
        return Promise.resolve();
      }
      if (Number(value) > Number(prevValue) && Number(value) < Number(nextValue)) {
        return Promise.resolve();
      }
      return Promise.reject(`该AD值取值范围需在相邻行值之间`);
      // return Promise.reject(`该AD值取值范围【${Number(prevValue) + 1}-${nextValue === 65535 ? 65535 : nextValue - 1}】`);
    } else {
      mapRef.current.insertIndex = 0;
      const allValue = formRef.current?.getFieldsValue();
      let index = 0;
      let repeat = false;
      if (value <= allValue['theAdValue_default']) {
        return Promise.reject('新增的AD值不能小于等于已有标定数组中最小的AD值');
      }
      formIndexMap.forEach((id: string, key: number) => {
        const theAdValue = allValue[`theAdValue_${id}`];
        if (value === theAdValue) {
          repeat = true;
        }
        if (Number(value) > Number(theAdValue)) {
          index = key + 1;
        }
      })
      if (repeat) {
        return Promise.reject('AD值已存在');
      }
      mapRef.current.insertIndex = index;
      return Promise.resolve();
      // const prevId = formIndexMap.get(tableSource.length - 1);
      // let prevValue = 0;
      // if (prevId) {
      //   prevValue = formRef.current?.getFieldValue(`theAdValue_${prevId}`) || 0;
      // }
      // if (Number(value) > prevValue) {
      //   return Promise.resolve();
      // }
      // return Promise.reject(`该AD值取值范围【${Number(prevValue) + 1}-65535】`);
    }
  }

  /**
  * 实际载重校验
  */
  const repeatActualLoadFun = (rule: any, value: string, callback: Function, record?: { id: string, index: number }) => {
    if (value === undefined || value === '') {
      return Promise.resolve();
    }
    const index = record?.index;
    const { formIndexMap } = mapRef.current;
    // 本行实际载重需在相邻两行值之间
    if (index !== undefined) {
      const prevId = formIndexMap.get(index - 1);
      const nextId = formIndexMap.get(index + 1);
      let prevValue: any = 0;
      let nextValue: any = 100000;
      if (prevId) {
        prevValue = formRef.current?.getFieldValue(`actualLoad_${prevId}`);
      }
      if (nextId) {
        nextValue = formRef.current?.getFieldValue(`actualLoad_${nextId}`);
      }
      if (prevValue === '' || nextValue === '') {
        return Promise.resolve();
      }
      if (Number(value) > Number(prevValue) && Number(value) < Number(nextValue)) {
        return Promise.resolve();
      }
      return Promise.reject(`该实际载重取值范围需在相邻行值之间`);
      // return Promise.reject(`该实际载重取值范围【${Number(prevValue) + 1}-${nextValue === 99999 ? 99999 : nextValue - 1}】`);
    } else {
      const allValue = formRef.current?.getFieldsValue();
      let repeat = false;
      formIndexMap.forEach((id: string) => {
        const actualLoad = allValue[`actualLoad_${id}`];
        if (value === actualLoad) {
          repeat = true;
        }
      })
      if (repeat) {
        return Promise.reject('实际载重已存在');
      }
      const { insertIndex } = mapRef.current;
      if (insertIndex !== 0) {
        const prevId = formIndexMap.get(insertIndex - 1);
        const nextId = formIndexMap.get(insertIndex);
        let prevValue: any = 0;
        let nextValue: any = 100000;
        if (prevId) {
          prevValue = formRef.current?.getFieldValue(`actualLoad_${prevId}`);
        }
        if (nextId) {
          nextValue = formRef.current?.getFieldValue(`actualLoad_${nextId}`);
        }
        if (prevValue === '' || nextValue === '') {
          return Promise.resolve();
        }
        if (Number(value) > Number(prevValue) && Number(value) < Number(nextValue)) {
          return Promise.resolve();
        }
        return Promise.reject('实际载重与前后数据矛盾,请确认');
      }
      return Promise.resolve();

      // const prevId = formIndexMap.get(tableSource.length - 1);
      // let prevValue = 1;
      // if (prevId) {
      //   prevValue = formRef.current?.getFieldValue(`actualLoad_${prevId}`) || 1;
      // }
      // if (Number(value) > prevValue) {
      //   return Promise.resolve();
      // }
      // return Promise.reject(`该实际载重取值范围【${Number(prevValue) + 1}-65535】`);
    }
  }

  // 实际载重输入框聚焦时计算实际载重值
  const calculationLoad = () => {
    const { insertIndex } = mapRef.current;
    if (tableSource.length <= 1 || insertIndex === 0) return;
    searchFormRef.current?.validateFields(['theAdValue']).then(async (values: any) => {
      const { formIndexMap } = mapRef.current;
      const adVal = values.theAdValue;
      let lastId = formIndexMap.get(insertIndex);
      let lastPrevId = formIndexMap.get(insertIndex - 1);
      if (insertIndex === tableSource.length) {
        lastId = formIndexMap.get(insertIndex - 1);
        lastPrevId = formIndexMap.get(insertIndex - 2);
      }
      const valueResult = formRef.current?.getFieldsValue([`theAdValue_${lastId}`, `theAdValue_${lastPrevId}`, `actualLoad_${lastId}`, `actualLoad_${lastPrevId}`])
      const nextAdValue = valueResult[`theAdValue_${lastId}`];
      const nextActualLoad = valueResult[`actualLoad_${lastId}`];
      const prevAdValue = valueResult[`theAdValue_${lastPrevId}`];
      const prevActualLoad = valueResult[`actualLoad_${lastPrevId}`];
      //根据比例算出对应的实际载重
      if (nextAdValue !== undefined && nextActualLoad !== undefined && prevAdValue !== undefined && prevActualLoad !== undefined && nextAdValue !== prevAdValue) {
        const m = (adVal - nextAdValue) / (nextAdValue - prevAdValue);
        const adActualValue = m * (nextActualLoad - prevActualLoad) + parseFloat(nextActualLoad);
        searchFormRef.current?.setFieldsValue({
          actualLoad: adActualValue.toFixed(1)
        })
      }
    })
  }

  // 下发参数
  const formSubmit = async (values: any) => {
    setBtnLoading('send');
    console.log('values', values);
    const calibrationArr: any = [];
    const { formIndexMap } = mapRef.current;
    formIndexMap.forEach((id: string) => {
      const theAdValue = values[`theAdValue_${id}`];
      const actualLoad = values[`actualLoad_${id}`];
      calibrationArr.push({
        key: theAdValue,
        value: actualLoad
      })
    })
    const param = [
      {
        calibrationList: calibrationArr,
        id: 0,
        monitorId: props.monitorId,
        sensorOutId: props.sensorOutId
      }
    ]
    const result = await addCalibrationData(param);
    if (result) {
      const online = await monitorOnline(props.monitorId);
      if (!online) {
        setBtnLoading('');
        message.warning('监控对象离线');
        // return;
      }
      sendSocketFun(0);
    }
    setBtnLoading('');
  }

  /**
   * 表格勾选变化
   */
  // const tableRowChange = (rowIdArr: Array<string>, selectRow: Array<object>) => {
  //   setSelectRow(selectRow)
  //   setTableCheckArr(rowIdArr)
  // }

  const addRow = (values: any) => {
    const paramArr = ['theAdValue_default'];
    formRef.current?.validateFields(paramArr).then(() => {
      const { insertIndex } = mapRef.current;
      if (tableSource.length >= 50) {
        message.warning('标定数组已达到最大');
        return;
      }
      const newTableSource = JSON.parse(JSON.stringify(tableSource));
      const id = randomString();
      newTableSource.splice(insertIndex, 0, {
        id,
        index: insertIndex,
        theAdValue: values.theAdValue,
        actualLoad: values.actualLoad
      })
      const formIndexMap = new Map();
      newTableSource.map((item: any, index: number) => {
        item.index = index;
        formIndexMap.set(index, item.id);
        return item;
      })
      mapRef.current.formIndexMap = formIndexMap;
      const data: any = {};
      data[`theAdValue_${id}`] = values.theAdValue;
      data[`actualLoad_${id}`] = values.actualLoad;
      formRef.current?.setFieldsValue(data);
      searchFormRef.current?.resetFields();
      setTableSource(newTableSource);
    })
  }

  const deleteRow = (index: number) => {
    const newTableSource = JSON.parse(JSON.stringify(tableSource));
    newTableSource.splice(index, 1);
    const formIndexMap = new Map();
    newTableSource.map((item: any, index: number) => {
      item.index = index;
      formIndexMap.set(index, item.id);
    })
    mapRef.current.formIndexMap = formIndexMap;
    setTableSource(newTableSource)
  }

  return <div className={styles.customForm}>
    <div className={styles.formWrapper}>
      {/* 添加AD信息表单 */}
      <Form
        ref={searchFormRef}
        onFinish={addRow}
      >
        <Row gutter={[20, 20]} className='formItem-bottom-explain'>
          <Col span={4}>
            <Button type='primary' className={styles.btnMargin} onClick={readInfo}>获取AD值</Button>
          </Col>
          <Col span={8}>
            <Form.Item
              label='AD值:'
              name='theAdValue'
              validateFirst
              rules={[
                {
                  required: true,
                  message: '请输入AD值',
                },
                {
                  validator: async (rule: any, value: string) => {
                    const newNum = Number(value);
                    if (value) {
                      if (!isNaN(newNum) && newNum >= 0 && newNum <= 65535) {
                        return Promise.resolve();
                      }
                      return Promise.reject('输入范围0-65535');
                    }
                  }
                },
                {
                  validator: repeatAdValueFun
                }
              ]}
            >
              <Input type='text' autoComplete='off' maxLength={5} placeholder='输入范围0-65535' />
            </Form.Item>
          </Col><Col span={8}>
            <Form.Item
              label='实际载重:'
              name='actualLoad'
              validateFirst
              rules={[
                {
                  required: true,
                  message: '请输入实际载重',
                },
                {
                  validator: async (rule: any, value: string) => {
                    const newNum = Number(value);
                    if (value) {
                      if (!isNaN(newNum) && newNum >= 1 && newNum <= 99999) {
                        return Promise.resolve();
                      }
                      return Promise.reject('输入范围1-99999');
                    }
                  }
                },
                {
                  validator: repeatActualLoadFun
                }
              ]}
            >
              <Input type='text' onFocus={calculationLoad} autoComplete='off' maxLength={5} placeholder='输入范围1-99999' />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button type='primary' className={styles.btnMargin} htmlType='submit' disabled={tableSource.length === 0 || tableSource.length === 50}>添加</Button>
          </Col>
        </Row>
      </Form>
      {/* 表格显示表单 */}
      <Form
        ref={formRef}
        onFinish={formSubmit}
        className={styles.tableForm}
      >
        <Table
          className={`${styles.customTable} ${styles.calibationTable}`}
          style={{ marginBottom: 20 }}
          bordered
          columns={columns}
          dataSource={tableSource}
          rowKey='id'
          pagination={false}
          scroll={{ y: 500 }}
          loading={tableSource.length === 0}
        // rowSelection={{
        //   onChange: tableRowChange,
        //   selectedRowKeys: tableCheckArr,
        //   getCheckboxProps: (record: { disabled?: boolean }) => ({
        //     disabled: record.disabled, // Column configuration not to be checked
        //   }),
        // }}
        />
        <div className={styles.divMargin}>
          <Button type='primary' htmlType='submit' loading={btnLoading === 'send'}>下发参数</Button>
        </div>
        <TableForm dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
      </Form>
    </div>
  </div>
}

export default Calibration;