/**
 * 标定修正
 */
import React, { useEffect, useRef, useState } from "react";
import styles from '../../index.module.less'
import { RangePicker } from "@/common/datePicker";
import { Form, Button, Col, Row, Table, message, Modal, Radio, Spin } from "antd";
import moment from "moment";
import { TableForm } from "@/common";
import { addOilData } from "./paramColumn";
import { addCalibrationData, getCalibration, getEchartInfo, getLastCalibrationTime, monitorOnline } from "@/server/monitorManager";
import CalibrationChart from "./calibrationChart";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { shallowEqual, useSelector } from "react-redux";
import { getStore } from "@/framework/utils/localStorage";
import { getStatus } from "@/framework/utils/function";

interface IProps {
  monitorId: string,// 监控对象id
  sensorOutId: number,// 传感器外设id：65(0x41油量主)、66(0x42油量副)
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
const columns = [
  {
    title: '序号',
    width: 80,
    render: (text: any, record: any, index: number) => `${index + 1}`,
  },
  {
    title: '液位高度(mm)',
    dataIndex: 'key',
  },
  {
    title: '油量值(L)',
    dataIndex: 'value',
  },
];

const CalibrationCorrection = (props: IProps) => {
  const refObj: any = useRef({
    currentClickData: {},// 图表点击点数据
    tankLastTime: '',// 标定最后下发时间
  });
  const formRef: any = useRef();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateValue, setDateValue]: any = useState();
  const [radioValue, setRadioValue]: any = useState(1);
  const [echartData, setEchartData]: any = useState({
    date: [],
    oil: [],// 油量
    mileage: [],// 里程
    adHeight: [],// 液体高度
    oilTemp: [],// 燃油温度
    envTemp: [],// 环境温度
  });
  // 图表上的加油前、加油后图片显示位置
  const [addOilObj, setAddOilObj]: any = useState({
    oilBefore: '',
    timeBefore: '',
    oilAfter: '',
    timeAfter: '',
  });
  const [sensorData, setSensorData] = useState([]);// 传感器上报参数
  const [plateformData, setPlateformData] = useState([]);// 平台设置参数

  useEffect(() => {
    if (props.drawerVisible) {
      readInfo();
      getCalibrationFun();
      getNowDate(true);
    }
  }, [props.drawerVisible])

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
  const sendSocketFun = (type: number, data?: any) => {
    if (!globalSocket) return;
    // const token = getStore('token');
    // const header = { 'access_token': `Bearer ${token}` };
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
    globalSocket.subscribeAndSend('/user/queue/oil_calibration', (res: any) => { socketCallBack(res, type, data) }, '/app/monitor/calibration', header, requestStr, true);
  }
  const socketCallBack = (res: any, type: number, data?: any) => {
    console.log('res', res);
    if (res) {
      const result = JSON.parse(res.body);
      if (type === 1) {// 读取
        console.log('msgBody', JSON.parse(res.body));
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
          setSensorData(data);
          refObj.current.tankLastTime = addOilObj.timeAfter;
          const status = getStatus(result.status)
          formRef.current?.setFieldsValue({
            lastSendTime: result.sendTime,
            sendStatus: status
          })
        }
      }
    }
  }

  // 设置时间为今天
  const getNowDate = (noSearchStatus?: any) => {
    const date = moment(new Date());
    const startStr = date.format('YYYY-MM-DD') + ' 00:00:00';
    const endStr = date.format('YYYY-MM-DD HH:mm:ss');
    setDateValue([moment(startStr), moment(endStr)]);
    if (noSearchStatus === true) return;
    inquireEchartData([moment(startStr), moment(endStr)]);
  }

  // 前一天
  const prevDate = () => {
    if (dateValue) {
      const startStr = moment(dateValue[0]).subtract(1, 'days').format('YYYY-MM-DD') + ' 00:00:00';
      const endStr = moment(dateValue[1]).subtract(1, 'days').format('YYYY-MM-DD') + ' 23:59:59';
      setDateValue([moment(startStr), moment(endStr)]);
      inquireEchartData([moment(startStr), moment(endStr)]);
    }
  }

  const renderChartTime = (time: string) => {
    return `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)} ${time.slice(8, 10)}:${time.slice(10, 12)}:${time.slice(12)}`;
  }

  // 查询图表数据
  const inquireEchartData = async (time: any) => {
    if (!time) {
      message.warning('请先选择查询时间');
      return;
    }
    setLoading(true);
    const param = {
      startTime: moment(time[0]).format('YYYYMMDDHHmmss'),// 开始时间 格式yyyyMMddHHmmss
      endTime: moment(time[1]).format('YYYYMMDDHHmmss'),// 结束时间 格式yyyyMMddHHmmss
      monitorId: props.monitorId,// 监控对象id
      sensorId: 1,//传感器id,油量是1，水量是2，载重是3
      sensorOutId: props.sensorOutId,// 传感器外设id：65(0x41油量主) 、66(0x42油量副) 、67(0x43水量主) 、68(0x44水量副) 112(0x70载重主) 113(0x71载重副)
    }
    const timeResult: any = await getLastCalibrationTime({
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId
    });
    const lastCalibrationTime = typeof (timeResult) === 'string' ? timeResult : '';// 获取最后标定时间
    const result: any = await getEchartInfo(param);
    const chartData: any = {
      date: [],
      oil: [],// 油量
      mileage: [],// 里程
      adHeight: [],// 液体高度
      oilTemp: [],// 燃油温度
      envTemp: [],// 环境温度
    }
    let obj = {
      oilBefore: '',
      timeBefore: '',
      oilAfter: '',
      timeAfter: '',
    };
    const formObj: any = {
      beforeValue: '',
      beforeHeight: '',
      afterValue: '',
      afterHeight: '',
    }
    if (result) {
      console.log('result', result);
      const locationalDOList = result.locationalDOList;
      const sensorOutIdObj: any = {
        '65': 41,
        '66': 42,
        '67': 43,
        '68': 44,
      }
      const listName = `liquidData${sensorOutIdObj[String(props.sensorOutId)]}`;
      if (locationalDOList) {
        locationalDOList.map((item: any) => {
          const data = JSON.parse(item[listName]);
          const time = renderChartTime(item.time);
          const capacity = data ? data.capacity : 0;
          const adHeight = data ? data.adHeight : 0;
          chartData.date.push(time);
          chartData.mileage.push(item.gpsMileage);
          chartData.oil.push(data ? data.capacity : 0);
          chartData.adHeight.push(adHeight);
          chartData.oilTemp.push(data ? data.oilTem : 0);
          chartData.envTemp.push(data ? data.envTem : 0);

          /**
           * tankLastTime为用户最后标定时间
           * 只有当time大于tankLastTime时,才会重新计算加油前、加油后位置点的标定数据
           */
          if (lastCalibrationTime && lastCalibrationTime >= time) return;
          // 默认将当前最大值和最小值作为默认值显示在油量数据文本框中
          if (obj.oilAfter === '' || capacity >= obj.oilAfter) {
            obj.oilAfter = capacity;
            obj.timeAfter = time;
            formObj.afterValue = capacity;
            formObj.afterHeight = adHeight;
          }
        })
        for (let i = 0; i < locationalDOList.length; i += 1) {
          const item = locationalDOList[i];
          const data = JSON.parse(item[listName]);
          const time = renderChartTime(item.time);
          const capacity = data ? data.capacity : 0;
          const adHeight = data ? data.adHeight : 0;
          /**
           * tankLastTime为用户最后标定时间
           * 只有当time大于tankLastTime时,才会重新计算加油前、加油后位置点的标定数据
           */
          if (time > obj.timeAfter) break;
          if (lastCalibrationTime && lastCalibrationTime >= time) continue;
          if (obj.oilBefore === '' || (capacity < obj.oilBefore && time < obj.timeAfter)) {
            obj.oilBefore = capacity
            obj.timeBefore = time;
            formObj.beforeValue = capacity;
            formObj.beforeHeight = adHeight;
          }
        }
      }
    }
    if ((obj.oilAfter <= obj.oilBefore) || (obj.timeAfter <= obj.timeBefore)) {// 如果加油后小于等于加油前的值
      obj = {
        oilBefore: '',
        timeBefore: '',
        oilAfter: '',
        timeAfter: '',
      };
    } else {
      if (formObj.afterValue !== '' && formObj.beforeValue !== '') {
        formObj.thickness = formObj.afterValue - formObj.beforeValue;
      }
      formRef.current?.setFieldsValue(formObj);
    }
    setAddOilObj(obj);
    setEchartData(chartData);
    setLoading(false);
    refObj.current.tankLastTime = lastCalibrationTime;
  }

  // 图表鼠标点击事件
  const chartsEvent = (params: any) => {
    if (addOilObj.oilBefore === addOilObj.oilAfter) {
      message.error('不可标定');
      return;
    }
    const oilValue_num = params.data;
    if (isNaN(oilValue_num)) {
      message.error('未获取到油量值');
      return;
    }
    refObj.current.currentClickData = params;
    setRadioValue(1);
    setModalVisible(true);
  }
  // 更改加油前、加油后标定数据
  const handleOk = () => {
    console.log('refObj.currentClickData', refObj.current.currentClickData);
    const { currentClickData: curData, tankLastTime } = refObj.current;
    if (tankLastTime && tankLastTime >= curData.name) {
      message.error(`【${tankLastTime}】之前的数据已经被标定过，不能重复标定！`);
      return;
    }
    const obj = JSON.parse(JSON.stringify(addOilObj));
    const oilValue_num = curData.data;
    const oilValue_time = curData.name;
    const oilValue_index = curData.dataIndex;
    const oilValue_height = echartData.adHeight[oilValue_index];
    if (radioValue === 1) {// 加油前
      obj.oilBefore = oilValue_num;
      obj.timeBefore = oilValue_time;
    } else {// 加油后
      obj.oilAfter = oilValue_num;
      obj.timeAfter = oilValue_time;
    }
    if (obj.timeAfter < obj.timeBefore) {
      message.error('加油后的时间必须大于加油前的时间');
      return;
    }
    if (obj.oilAfter < obj.oilBefore) {
      message.error('加油后的油量必须大于加油前的油量');
      return;
    }
    if (radioValue === 1) {// 加油前
      formRef.current?.setFieldsValue({
        beforeValue: oilValue_num,
        beforeHeight: oilValue_height,
        thickness: obj.oilAfter - obj.oilBefore
      })
    } else {// 加油后
      formRef.current?.setFieldsValue({
        afterValue: oilValue_num,
        afterHeight: oilValue_height,
        thickness: obj.oilAfter - obj.oilBefore
      })
    }
    setModalVisible(false);
    setAddOilObj(obj);
  }

  // 修正下发
  const correctionIssued = async (values: any) => {
    const online = await monitorOnline(props.monitorId);
    if (!online) {
      message.warning('监控对象离线');
      // return;
    }
    const modal = Modal.confirm({
      title: '确认信息',
      icon: <ExclamationCircleOutlined />,
      content: <div>您确定实际加了<span className={styles.redTxt}>{values.thickness}L</span>油吗?</div>,
      onOk: () => {
        modal.destroy();
        Modal.confirm({
          title: '确认信息',
          icon: <ExclamationCircleOutlined />,
          content: '是否保存并下发这次标定',
          onOk: () => confirmIssued(values),
        });
      },
    });
  }
  const confirmIssued = async (values: any) => {
    const theoryAddOil = parseFloat(values.afterValue) - parseFloat(values.beforeValue);
    let factorK: any;
    if (theoryAddOil > 0) {
      // 修正系数K：K=实际加油量/[加油后油量<测>-加油前油量<测>]
      factorK = parseFloat(values.thickness) / theoryAddOil;
    }
    if (sensorData.length === 0) {
      message.error('未获取到标定数据');
      return;
    }
    let listData: any = JSON.parse(JSON.stringify(sensorData));
    if (isNaN(factorK)) {
      listData = listData.map((item: any) => {
        const innerEle: any = {};
        innerEle.value = (parseFloat(factorK) * parseFloat(item.value)).toFixed(1); // 用最原始的标定数据乘以修正系数，不然数据不准
        return innerEle;
      });
    }
    if (listData.length < 2) {
      message.warning("标定数据至少添加2组");
      listData = [];
      return;
    }
    const param = [
      {
        calibrationList: listData,
        id: 0,
        monitorId: props.monitorId,
        sensorOutId: props.sensorOutId,
        lastCalibrationTime: addOilObj.timeAfter
      }
    ]
    const result = await addCalibrationData(param);
    if (result) {
      sendSocketFun(0, listData);
    }
  }

  return <div>
    <Row gutter={[20, 20]}>
      <Col span={16}>
        <label style={{ marginRight: 15 }}>时间:</label>
        <RangePicker showTime value={dateValue} onChange={(date) => setDateValue(date)} />
      </Col>
      <Col span={8}>
        <Button type='primary' className={styles.btnMargin} onClick={getNowDate}>今天</Button>
        <Button type='primary' className={styles.btnMargin} onClick={prevDate}>前一天</Button>
        <Button type='primary' className={styles.btnMargin} onClick={() => inquireEchartData(dateValue || null)}>查询</Button>
      </Col>
    </Row>
    <h4 className={styles.panelTitle}>图形</h4>
    {/* 标定图表 */}
    <CalibrationChart echartData={echartData} addOilObj={addOilObj} chartsEvent={chartsEvent} />
    <Form
      ref={formRef}
      onFinish={correctionIssued}
    >
      <TableForm dataSource={addOilData} column={4} header='加油数据' />
      <Button type='primary' className={styles.divMargin} htmlType='submit'>修正下发</Button>
      <TableForm dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
    </Form>
    <h4 className={styles.panelTitle}>标定数据</h4>
    <Button type='primary' onClick={readInfo}>读取标定</Button>
    <Row>
      <Col span={11}>
        <h4 style={{ textAlign: 'center' }}>传感器上报参数</h4>
        <Table
          className={styles.customTable}
          bordered
          columns={columns}
          dataSource={sensorData}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Col>
      <Col span={11} push={2}>
        <h4 style={{ textAlign: 'center' }}>平台设置参数</h4>
        <Table
          className={styles.customTable}
          bordered
          columns={columns}
          dataSource={plateformData}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Col>
    </Row>
    {/* 标定修正弹框 */}
    <Modal title='标定修正' width={300} visible={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)}>
      <Radio.Group onChange={(e) => {
        setRadioValue(e.target.value)
      }} value={radioValue}>
        <Radio value={1}>加油前</Radio>
        <Radio value={2}>加油后</Radio>
      </Radio.Group>
    </Modal>
    {/* 加载loading */}
    {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
  </div>
}

export default CalibrationCorrection;
