/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, memo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Form, Switch, Input, Tabs, Row, Col, Empty } from 'antd';
import styles from './index.module.less';
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 8 },
};

interface IProps {
  detailModeList: any,
  type: number | undefined, //抽屉类型(新增:0,修改:1,详情:2)
  ref?: any
  workAlarmParameterSettingResps?: any;
}

const arePropsEqual = (prevProps: any, nextProps: any) => {
  let prevArr: any, nextArr: any;

  if (nextProps.type == 2) {
    prevArr = prevProps.workAlarmParameterSettingResps;
    nextArr = nextProps.workAlarmParameterSettingResps;
  } else {
    prevArr = prevProps.detailModeList;
    nextArr = nextProps.detailModeList;
  }

  // const prevArrFlag = prevArr.every((item: any) => {
  //   return nextArr.some((i: any) => item.workId == i.workId)
  // });

  // const nextArrFlag = nextArr.every((item: any) => {
  //   return prevArr.some((i: any) => item.workId == i.workId)
  // });
  // console.log('====================================');
  // console.log('xxx', JSON.stringify(prevArr) == JSON.stringify(nextArr));
  // console.log('prevProps', prevProps);
  // console.log('nextProps', nextProps);
  // console.log('prevArr', prevArr);
  // console.log('nextArr', nextArr);
  // console.log('prevArrFlag', prevArrFlag);
  // console.log('nextArrFlag', nextArrFlag);
  // console.log('aaa', prevArr.length == nextArr.length && prevArrFlag && nextArrFlag);
  // return prevArr.length == nextArr.length && prevArrFlag && nextArrFlag

  return JSON.stringify(prevArr) == JSON.stringify(nextArr);
}

const AlarmSetting = forwardRef((props: IProps, ref) => {
  const [tabKey, setTabKey] = useState('');
  const formRef: any = useRef();

  useImperativeHandle(ref, () => ({
    formRef: formRef.current
  }));

  useEffect(() => {
    if (formRef.current && props.detailModeList.length > 0) {
      setTabKey(props.detailModeList[0].workModeId);
      props.detailModeList.map((item: any) => {
        defaultValue(item);
      });
    }
  }, [props.detailModeList]);

  /**
  * 默认值
  */
  const defaultValue = (data: any) => {
    /** 新增 */
    if (props.type == 0 && formRef.current) {
      addAlarmItem(data);
    }

    /** 修改 */
    if ((props.type == 1 || props.type == 2) && formRef.current) {
      editAlarmItem(data);
    }
  }

  /**
   * 新增抽屉报警项默认值
   */
  const addAlarmItem = (data: any) => {
    /** 人员报警 1:超时停留阈值 2:离岗时间阈值 3:聚众阈值*/
    const peopleTimeOutSwitch = `stayOvertime-alarmPush_15000_${data.workModeId}`;
    const peopleTimeOutInput = `stayOvertime-parameterValue_15000_${data.workModeId}`;

    const peopleLeaveTimeSwitch = `leaveTime-alarmPush_15001_${data.workModeId}`;
    const peopleLeaveTimeInput = `leaveTime-parameterValue_15001_${data.workModeId}`;

    const gatherSwitch = `gather-alarmPush_15002_${data.workModeId}`;
    const gatherTimeInput = `gatherTime-parameterValue_15002_${data.workModeId}`;
    const gatherScopeInput = `gatherScope-parameterValue_15002_${data.workModeId}`;

    /** 车辆报警 1:作业速度阈值 2:超时停留阈值 3:离岗时间阈值 */
    const wrokSpeedSwitch = `workSpeed-alarmPush_15003_${data.workModeId}`;
    const workSpeedInput = `workSpeed-parameterValue_15003_${data.workModeId}`;

    const vehicleTimeOutSwitch = `stayOvertime-alarmPush_15004_${data.workModeId}`;
    const vehicleTimeOutInput = `stayOvertime-parameterValue_15004_${data.workModeId}`;

    const vehicleLeaveTimeSwitch = `leaveTime-alarmPush_15005_${data.workModeId}`;
    const vehicleLeaveTimeInput = `leaveTime-parameterValue_15005_${data.workModeId}`;

    const values: any = {};
    if (data.workType == 1) {
      values[peopleTimeOutSwitch] = true;
      values[peopleTimeOutInput] = 30;
      values[peopleLeaveTimeSwitch] = true;
      values[peopleLeaveTimeInput] = 3;
      values[gatherSwitch] = true;
      values[gatherTimeInput] = 20;
      values[gatherScopeInput] = 10
    } else if (data.workType == 0) {
      values[wrokSpeedSwitch] = true;
      values[workSpeedInput] = 30;
      values[vehicleTimeOutSwitch] = true;
      values[vehicleTimeOutInput] = 30
      values[vehicleLeaveTimeSwitch] = true;
      values[vehicleLeaveTimeInput] = 3
    }
    formRef.current.setFieldsValue(values);
  }

  /**
   * 修改抽屉报警项默认值
   */
  const editAlarmItem = (data: any) => {
    const workModeId = data.workModeId;
    const alarmItem = props.workAlarmParameterSettingResps.filter((item: any) => item.modeId == workModeId);
    console.log('alarmItem', alarmItem);

    if (alarmItem.length > 0) {
      alarmItem[0].alarmParameterSettingDtos.map((item: any) => {
        const name = formItemName(item.pos, item.paramCode);
        let switchName = '',
          inputName = '',
          switchVal = false,
          inputVal = '',
          gatherSwitch = '',
          gatherVal = false;

        for (const key in item) {
          if (key == 'alarmPush') {
            switchName = `${name}-alarmPush_${item.pos}_${item.modeId}`;
            switchVal = item.alarmPush == 1 ? true : false;
          }
          if (key == 'parameterValue') {
            inputName = `${name}-parameterValue_${item.pos}_${item.modeId}`;
            inputVal = item.parameterValue
          }

          if (key == 'paramCode') {
            if (item[key] == 'param2') {
              gatherSwitch = `gather-alarmPush_15002_${item.modeId}`
              gatherVal = item.alarmPush == 1 ? true : false
            }
          }
        }

        const values: any = {};
        values[switchName] = switchVal;
        values[inputName] = inputVal
        if (gatherSwitch) values[gatherSwitch] = gatherVal
        console.log('values', values);

        formRef.current.setFieldsValue(values);
      });
    }

    if (alarmItem.length == 0) {
      addAlarmItem(data)
    }
  }

  const formItemName = (num: string, code: string) => {
    switch (num) {
      case '15003':
        return 'workSpeed'
      case '15004':
        return 'stayOvertime'
      case '15005':
        return 'leaveTime'
      case '15000':
        return 'stayOvertime'
      case '15001':
        return 'leaveTime'
      case '15002':
        let value = 'gatherTime';
        if (code == 'param2') value = 'gatherScope';
        return value;
    }
  }

  const onChange = (value: string) => {
    setTabKey(value);
  }

  return (
    <Form
      {...layout}
      className={styles.policeSetting}
      ref={formRef}
      style={props.type == 2 ? { padding: '0 24px 24px 24px' } : {}}
    >
      {
        props.detailModeList.length == 0 ?
          <Empty style={{ marginTop: 100 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          :
          <Tabs type='card' activeKey={tabKey} onChange={onChange}>
            {
              props.detailModeList.map((item: any) =>
                item.workType == 1 ?
                  /** 人员报警 */
                  <TabPane forceRender={true} tab={item.workModeName} key={item.workModeId}>
                    <h3 className={styles.title}><span>{item.workType == 1 ? '人员报警' : '车辆报警'}</span></h3>
                    <Row>
                      <Col push={2} span={2}>
                        <Form.Item valuePropName="checked" name={`stayOvertime-alarmPush_15000_${item.workModeId}`}>
                          <Switch disabled={props.type == 2 ? true : false} checkedChildren="ON" unCheckedChildren="OFF" />
                        </Form.Item>
                      </Col>
                      <Col push={2} span={16}>
                        <Form.Item name={`stayOvertime-parameterValue_15000_${item.workModeId}`} label='超时停留时间阈值'
                          rules={[
                            {
                              pattern: /^[0-9][0-9]{0,3}$/,
                              message: '请输入范围为0-9999的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="分钟" allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col push={2} span={2}>
                        <Form.Item valuePropName="checked" name={`leaveTime-alarmPush_15001_${item.workModeId}`}>
                          <Switch disabled={props.type == 2 ? true : false} checkedChildren="ON" unCheckedChildren="OFF" />
                        </Form.Item>
                      </Col>
                      <Col push={2} span={16}>
                        <Form.Item name={`leaveTime-parameterValue_15001_${item.workModeId}`} label='离岗时间阈值'
                          rules={[
                            {
                              pattern: /^[0-9][0-9]{0,3}$/,
                              message: '请输入范围为0-9999的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="分钟" allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col push={2} span={2}>
                        <Form.Item valuePropName="checked" name={`gather-alarmPush_15002_${item.workModeId}`}>
                          <Switch disabled={props.type == 2 ? true : false} checkedChildren="ON" unCheckedChildren="OFF" />
                        </Form.Item>
                      </Col>
                      <Col push={2} span={16}>
                        <Form.Item name={`gatherTime-parameterValue_15002_${item.workModeId}`} label='聚众时间阈值'
                          rules={[
                            {
                              pattern: /^[0-9][0-9]{0,3}$/,
                              message: '请输入范围为0-9999的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="分钟" allowClear />
                        </Form.Item>
                      </Col>
                      <Col push={4} span={16}>
                        <Form.Item name={`gatherScope-parameterValue_15002_${item.workModeId}`} label='聚众范围阈值'
                          rules={[
                            {
                              pattern: /^([1]?\d{1,2})$/,
                              message: '请输入范围为0-100的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="m" allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                  </TabPane>
                  :
                  /** 车辆报警 */
                  <TabPane forceRender={true} tab={item.workModeName} key={item.workModeId}>
                    <h3 className={styles.title}><span>{item.workType == 1 ? '人员报警' : '车辆报警'}</span></h3>
                    <Row>
                      <Col push={2} span={2}>
                        <Form.Item valuePropName="checked" name={`workSpeed-alarmPush_15003_${item.workModeId}`}>
                          <Switch disabled={props.type == 2 ? true : false} checkedChildren="ON" unCheckedChildren="OFF" />
                        </Form.Item>
                      </Col>
                      <Col push={2} span={16}>
                        <Form.Item name={`workSpeed-parameterValue_15003_${item.workModeId}`} label='作业速度阈值'
                          rules={[
                            {
                              pattern: /^([0-9]|[1-9][0-9]|(1[01][0-9]|120))$/,
                              message: '请输入范围为0-120的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="km/h" allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col push={2} span={2}>
                        <Form.Item valuePropName="checked" name={`stayOvertime-alarmPush_15004_${item.workModeId}`}>
                          <Switch disabled={props.type == 2 ? true : false} checkedChildren="ON" unCheckedChildren="OFF" />
                        </Form.Item>
                      </Col>
                      <Col push={2} span={16}>
                        <Form.Item name={`stayOvertime-parameterValue_15004_${item.workModeId}`} label='超时停留时间阈值'
                          rules={[
                            {
                              pattern: /^[0-9][0-9]{0,3}$/,
                              message: '请输入范围为0-9999的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="分钟" allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col push={2} span={2}>
                        <Form.Item valuePropName="checked" name={`leaveTime-alarmPush_15005_${item.workModeId}`}>
                          <Switch disabled={props.type == 2 ? true : false} checkedChildren="ON" unCheckedChildren="OFF" />
                        </Form.Item>
                      </Col>
                      <Col push={2} span={16}>
                        <Form.Item name={`leaveTime-parameterValue_15005_${item.workModeId}`} label='离岗时间阈值'
                          rules={[
                            {
                              pattern: /^[0-9][0-9]{0,3}$/,
                              message: '请输入范围为0-9999的整数！'
                            }
                          ]}
                        >
                          <Input disabled={props.type == 2 ? true : false} autoComplete='off' suffix="分钟" allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                  </TabPane>
              )
            }
          </Tabs>
      }
    </Form >
  )
})

export default memo(AlarmSetting, arePropsEqual)