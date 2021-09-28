/**
 * 音视频参数设置
 */
import React, { useEffect, useRef, useState } from "react";
import { EditDrawer, TableForm } from '@/common/';
import { Button, Col, Form, message, Row, Select, Spin } from "antd";
const { Option } = Select;
import { realTimeStream, sendResultColumn, storageFlowStream, subtitleOverlay } from "./tableColumn";

import styles from '../../../../../index.module.less'
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getSelectContainer, getStatus } from "@/framework/utils/function";
import {
  getMonitorVideoSetting, saveMonitorVideoSetting,
  getVideoListDropdownMonitor, monitorOnline, getVideoLastSendMsg
} from '@/server/monitorManager';
import { shallowEqual, useSelector } from "react-redux";
import { getStore } from "@/framework/utils/localStorage";

interface IProps {
  monitorInfo: any;
  drawerVisible: boolean;
  changeDrawer: Function;
}

const initialValues: any = {
  realtimeStreamMode: 0,// 实时流编码模式
  realtimeStreamResolution: 1,// 实时流分辨率
  realtimeStreamKeyframeInterval: '8',// 实时流关键帧间隔
  realtimeStreamTargetFrame: '8',// 实时流目标帧率
  realtimeStreamTargetBitRate: '329',// 实时流目标码率
  storeStreamMode: 0,// 存储流编码模式
  storeStreamResolution: 1,// 存储流分辨率
  storeStreamKeyframeInterval: '8',// 存储流关键帧间隔
  storeStreamTargetFrame: '8',// 存储流目标帧率
  storeStreamTargetBitRate: '329',// 存储流目标码率
  dateAndTime: '1',// 日期和时间
  monitorName: '1',// 车牌号
  logicChannelNumber: '0',// 逻辑通道号
  latitudeAndLongitude: '1',// 经纬度
  recordedSpeed: '1',// 行驶记录速度
  gpsSpeed: '0',// 卫星定位速度
  channelData: [{
    physicsChannelNumber: 1,
    logicChannelNumber: 1,
    channelType: 0,
    streamType: 1,
  }],// 通道设置数据
};

interface IMonitor {
  id: string;
  name: string
}

const AudioAndVideo = (props: IProps) => {
  const formRef: any = useRef();
  const [loading, setLoading] = useState(false);
  const [isSend, setIsSend] = useState(true);// 参数是否下发
  const [showStatus, setShowStatus]: any = useState({});// 控制通道设置码流类型字段显示
  const [referenceMonitorData, setReferenceMonitorData] = useState([]);// 参考对象

  useEffect(() => {
    if (props.drawerVisible) {
      setIsSend(true);
      getVideoInfo(props.monitorInfo.id);
      getListDropdownMonitorFun();
      getVideoLastSendMsgFun();
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
    if (!globalSocket) return;
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
    if (res) {
      const result = JSON.parse(res.body);
      const status = getStatus(result.status)
      formRef.current?.setFieldsValue({
        lastSendTime: result.sentTime,
        sendStatus: status
      })
    }
  }

  // 获取监控对象当前最新下发记录
  const getVideoLastSendMsgFun = async () => {
    const result: any = await getVideoLastSendMsg(props.monitorInfo.id);
    if (result) {
      const status = getStatus(result.status)
      formRef.current?.setFieldsValue({
        lastSendTime: result.sentTime,
        sendStatus: status
      })
    }
  };

  // 获取监控对象已设置的传感器绑定信息
  const getVideoInfo = async (monitorId: string) => {
    setLoading(true);
    const result = await getMonitorVideoSetting<any>(monitorId);
    if (result && result.monitorVideo) {
      const monitorVideo = result.monitorVideo;
      monitorVideo.channelData = result.channels;
      setParamValue(monitorVideo);
    }
    setLoading(false);
  }

  // 获取参考对象数据
  const getListDropdownMonitorFun = async (keyword?: string) => {
    const param = {
      monitorId: props.monitorInfo?.id,
      keyword
    }
    const result = await getVideoListDropdownMonitor<any>(param);
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
      onChange={(id: any) => { if (id) getVideoInfo(id) }}
      getPopupContainer={() => getSelectContainer('audioVideoContainer')}
    >
      {
        referenceMonitorData.map((item: IMonitor) =>
          <Option key={item.id} value={item.id}>{item.name}</Option>
        )
      }
    </Select></div>
  }]

  const closeDrawer = () => {
    props.changeDrawer('');
  }

  // 渲染表单值
  const setParamValue = (values: any) => {
    if (values.osd) {// 渲染osd字幕叠加字段值
      const osdArr = values.osd.toString(2).split('');
      values.gpsSpeed = osdArr[0] || '0';
      values.recordedSpeed = osdArr[1] || '0';
      values.latitudeAndLongitude = osdArr[2] || '0';
      values.logicChannelNumber = osdArr[3] || '0';
      values.monitorName = osdArr[4] || '0';
      values.dateAndTime = osdArr[5] || '0';
    }
    formRef.current?.setFieldsValue(values);
    if (values.channelData) {// 音频通道隐藏码流类型字段
      const obj: any = {};
      values.channelData.map((item: any, index: number) => {
        obj[index] = item.channelType === 1 ? false : true;
      })
      setShowStatus(obj);
    }
  }

  // 组装osd字幕叠加字段值
  const renderOsdValue = (values: any) => {
    const paramArr = [
      'gpsSpeed',
      'recordedSpeed',
      'latitudeAndLongitude',
      'logicChannelNumber',
      'monitorName',
      'dateAndTime'
    ];
    const result: any = [];
    paramArr.map(key => {
      result.push(values[key]);
      values[key] = undefined;
    })
    values.osd = parseInt(result.join(""), 2);
  }

  // 表单提交事件
  const formSubmit = async (values: any) => {
    renderOsdValue(values);
    values.audioOutputEnable = 1;
    values.logicChannelNumber = 0;
    const param = {
      monitorId: props.monitorInfo.id,
      channels: values.channelData,
      monitorVideo: values,
    }
    const result = await saveMonitorVideoSetting<any>(param);
    if (result) {
      if (!isSend) {
        props.changeDrawer('');
        setIsSend(true);
        return;
      }
      const online = await monitorOnline(props.monitorInfo.id);
      if (!online) {
        message.warning('监控对象离线');
      }
      sendSocketFun()
    }
  }

  // 获取逻辑通道号值
  const getLogicChannelNum = (index: number) => {
    if (index < 33) return index + 1;
    if (index < 35) return index + 3;
    return index + 29;
  }

  // 渲染音视频通道设置视图
  const renderChannelView = () => {
    return <Form.List name="channelData">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, fieldKey, ...restField }, index) => (
            <div key={key} className={styles.videoRow}>
              <Row gutter={[15, 15]}>
                <Col span={10}>
                  <Form.Item
                    {...restField}
                    label='物理通道号'
                    name={[name, 'physicsChannelNumber']}
                    fieldKey={fieldKey}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const channelDataArr = getFieldValue('channelData');
                          let repeat = false;
                          channelDataArr.map((item: any, _index: number) => {
                            if (_index !== index && item.physicsChannelNumber === value) {
                              repeat = true;
                            }
                          })
                          if (!repeat) {
                            return Promise.resolve();
                          }
                          return Promise.reject('物理通道号不能重复');
                        },
                      }),
                    ]}
                  >
                    <Select getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
                      {
                        (new Array(35).fill(1)).map((k, i) => <Option value={i + 1} key={i}>{i + 1}</Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    {...restField}
                    label='逻辑通道号'
                    name={[name, 'logicChannelNumber']}
                    fieldKey={fieldKey}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const channelDataArr = getFieldValue('channelData');
                          let repeat = false;
                          channelDataArr.map((item: any, _index: number) => {
                            if (_index !== index && item.logicChannelNumber === value) {
                              repeat = true;
                            }
                          })
                          if (!repeat) {
                            return Promise.resolve();
                          }
                          return Promise.reject('逻辑通道号不能重复');
                        },
                      }),
                    ]}
                  >
                    <Select getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
                      {
                        (new Array(37).fill(1)).map((k, i) => {
                          const num = getLogicChannelNum(i);
                          return <Option value={num} key={num}>{num}</Option>
                        })
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={3} push={1}>
                  {index === 0 ?
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                      if (fields.length > 34) return;
                      add({
                        channelType: 0,
                        streamType: 1,
                        physicsChannelNumber: String(fields.length + 1),
                        logicChannelNumber: String(getLogicChannelNum(fields.length))
                      })
                    }} />
                    : <Button type="primary" icon={<DeleteOutlined />} danger onClick={() => {
                      remove(name);
                      const newshowStatus = JSON.parse(JSON.stringify(showStatus));
                      newshowStatus[index] = true;
                      setShowStatus(newshowStatus);
                    }} />
                  }

                </Col>
              </Row>
              <Row gutter={[15, 15]}>
                <Col span={10}>
                  <Form.Item
                    {...restField}
                    label='通道类型'
                    name={[name, 'channelType']}
                    fieldKey={fieldKey}
                  >
                    <Select onChange={(val) => {
                      const newshowStatus = JSON.parse(JSON.stringify(showStatus));
                      if (val === 1) {
                        newshowStatus[index] = false;
                        setShowStatus(newshowStatus);
                      } else {
                        newshowStatus[index] = true;
                        setShowStatus(newshowStatus);
                      }
                    }} getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
                      <Option value={0}>音视频</Option>
                      <Option value={1}>音频</Option>
                      <Option value={2}>视频</Option>
                    </Select>
                  </Form.Item>
                </Col>
                {showStatus[index] !== false && <Col span={10}>
                  <Form.Item
                    {...restField}
                    label='码流类型'
                    name={[name, 'streamType']}
                    fieldKey={fieldKey}
                  >
                    <Select getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
                      <Option value={1}>子码流</Option>
                      <Option value={0}>主码流</Option>
                    </Select>
                  </Form.Item>
                </Col>
                }
              </Row>
            </div>
          ))}
        </>
      )}
    </Form.List>
  }

  return (
    <EditDrawer
      title="视频参数设置"
      width={1060}
      onClose={closeDrawer}
      visible={props.drawerVisible}
      onConfirm={() => {
        setIsSend(false);
        formRef.current.submit()
      }}
      getContainer="body"
    >
      <div className={styles.editForm}>
        <TableForm dataSource={referenceObject} column={2} header='音视频参数' />
        <Form
          ref={formRef}
          initialValues={initialValues}
          onFinish={formSubmit}
          className={styles.publicDrawer}
          id="audioVideoContainer"
        >
          <div className={styles.innerBox} style={{ paddingBottom: 5 }}>
            <TableForm dataSource={realTimeStream} column={6} header='实时流设置' />
            <TableForm dataSource={storageFlowStream} column={6} header='存储流设置' />
            <TableForm dataSource={subtitleOverlay} column={8} header='OSD字幕叠加设置' />
            <table className={styles.itemTable}>
              <tbody>
                <tr><th className={styles.tableHeader}>音视频通道设置</th></tr>
                <tr>
                  <td>
                    <div className={styles.channelBox}>
                      {renderChannelView()}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <Button type='primary' htmlType='submit' style={{ marginBottom: 15 }}>参数下发</Button>
            <TableForm className={styles.itemTable} dataSource={sendResultColumn} column={4} header='下发参数结果' type='detail' />
          </div>
        </Form>
        {/* 加载loading */}
        {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
      </div>
    </EditDrawer>
  );
}

export default AudioAndVideo;