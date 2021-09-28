/**
 * 当班人员
 */
import React, { useEffect, useRef, useState } from "react";
import { SwapOutlined, UserSwitchOutlined } from "@ant-design/icons";
import trajectory from '@/static/image/trajectory.svg';// 轨迹图片
import styles from './index.module.less';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getMonitorWindowInfo, getDutyPeople, getModeList } from "@/server/workMonitoring";
import { message, Select, Row, Col, Button, Table } from "antd";
import { getAttendanceStatus, getOnWorkStatus, getWorkStatus, noImg } from "../../publicFun";
import channel from "../../channel";
import { useHistory } from "react-router-dom";
import { IList } from "./onDutyVehicle";
const { Option } = Select;

interface IProps {
  curWorkObj: {
    id: string,
    workType: number,
    sectionId: string,
  },
  // updateStatus: boolean,
  goOperationDetail: Function,
  peopleStatusTab: number | null
}

interface INumObj {
  abnormalAttendanceNum: number,// 考勤异常数
  alarmNum: number,// 报警数
  leaveWorkNum: number,// 脱岗数
  offLineNum: number,// 离线数
  onWorkNum: number,// 在岗数
  totalNum: number,// 统计的监控对象总数
}

const OnDutyPeople = (props: IProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const orderRefObj = useRef({
    orderField: '',// 排序字段:shiftStartTime,roadFinishRate
    orderType: ['ASC', 'ASC'],// 排序方式: ASC, DESC
    modeId: '',// 作业模式
  });
  const [loading, setLoading] = useState(false);
  const [curStatus, setCurStatus] = useState(-1);// 当前显示状态 -1:全部 0脱岗 1：在岗
  const [modeData, setModeData] = useState<Array<IList>>([]);// 作业模式数据
  const [monitorList, setMonitorList]: any = useState([]);
  const [numObj, setNumObj] = useState<INumObj>({
    abnormalAttendanceNum: 0,// 考勤异常数
    alarmNum: 0,// 报警数
    leaveWorkNum: 0,// 脱岗数
    offLineNum: 0,// 离线数
    onWorkNum: 0,// 在岗数                          
    totalNum: 0,// 统计的监控对象总数
  });

  // 连接redux数据
  const { currentSelectTreeNode, isFullScreen } = useSelector(({
    workMonitoring: {
      currentSelectTreeNode
    },
    container: {
      isFullScreen
    }
  }: any) => {
    return {
      currentSelectTreeNode,
      isFullScreen
    }
  }, shallowEqual);

  useEffect(() => {
    getModeListFun();
  }, [])

  /**
   * 在作业概况模块,点击统计区域跳转至本页面
   * 需改变对应tab,并重新查询数据
   */
  useEffect(() => {
    if (props.curWorkObj.id || props.curWorkObj.sectionId) {
      orderRefObj.current.modeId = '';
      if (props.peopleStatusTab !== null) {
        setCurStatus(props.peopleStatusTab);
        getWorkObjectCurShiftData({
          queryType: props.peopleStatusTab
        }, true);
      } else {
        getWorkObjectCurShiftData();
      }
    }
  }, [props.curWorkObj, props.peopleStatusTab])

  // 获取作业模式数据
  const getModeListFun = async () => {
    const param: any = props.curWorkObj;
    param.workId = param.id;
    const result = await getModeList<Array<IList>>(param);
    if (result) {
      setModeData(result);
    }
  }

  const changeFocusMonitor = (payload: any) => {
    dispatch({ type: 'workMonitoring/changeFocusMonitorEvery', payload });
  }

  const changeFocusingTrack = (payload: any) => {
    dispatch({ type: 'workMonitoring/changeFocusingTrackEvery', payload });
  }

  const goMonitorDetail = (payload: any) => {
    // monitorFocusFun(payload)
    dispatch({ type: 'workMonitoring/changeDetailMonitorInfoEvery', payload });
    props.goOperationDetail(payload, true);
  }

  /**
   * 改变地图显示的海量点信息
   */
  const changeMapMonitor = (payload: any) => {
    dispatch({ type: 'workMonitoring/changeMapMonitorEvery', payload });
  }

  /**
   * 获取当班人员数据
   * @param param 
   */
  const getWorkObjectCurShiftData = async (filterParam: any = {}, mapChange?: boolean) => {
    setLoading(true);
    const { id, workType, sectionId } = props.curWorkObj;
    const param = {
      queryType: curStatus,
      modeId: orderRefObj.current?.modeId,
      modeType: 1,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
      sectionId,// 标段Id
      workId: id,// 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
      workType,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
      ...filterParam
    }
    const result: any = await getDutyPeople(param);
    if (result) {
      setMonitorList(result.monitors);
      setNumObj(result.stat);
      if (mapChange) {
        getMassivePointFun(result, true);
      }
    } else {
      setMonitorList([]);
    }
    setLoading(false);
  }

  /**
  * 获取海量点信息
  * @param data 
  */
  const getMassivePointFun = async (data?: any, setFitView?: boolean) => {
    const windowObj: any = window;
    if (windowObj.mapPointTimer) {
      clearInterval(windowObj.mapPointTimer);
      windowObj.mapPointTimer = undefined;
    }
    let result = data;
    const { id, workType, sectionId } = props.curWorkObj;
    if (!result) {
      const param = {
        queryType: props.peopleStatusTab,
        modeType: 1,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
        sectionId,// 标段Id
        workId: id,// 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
        workType,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
      }
      result = await getDutyPeople(param);
    }
    if (result) {
      const pointData = result.monitors.map((item: any) => {
        item.monitorKey = `${item.monitorId}_null`;
        item.workType = workType;
        item.status = item.online;
        item.monitorType = 1;
        return item;
      })
      changeMapMonitor({
        type: 'people',
        data: pointData,
        setFitView
      })
      windowObj.mapPointTimer = setInterval(() => {
        getMassivePointFun(false, false);
      }, 30000)
    }
  }

  /**
   * 点击监控对象,在地图上聚焦显示
   * trackStatus:true 代表设置聚焦跟踪对象信息(需在在地图上绘制尾迹)
   */
  const monitorFocusFun = async (item: IList, trackStatus?: boolean) => {
    const result: any = await getMonitorWindowInfo({ monitorId: item.monitorId });
    if (result) {
      const { lastLocation: { longitude, latitude, status, monitorId } } = result;
      if (currentSelectTreeNode) {
        const { id, key, workType } = currentSelectTreeNode;
        result.lastLocation.workType = workType;
        if (currentSelectTreeNode.type === 'work') {
          result.lastLocation.monitorKey = `${monitorId}_${id}`;
        } else {
          result.lastLocation.monitorKey = key;
        }
      }
      if (!longitude && !latitude) {
        message.warning('监控对象暂无位置数据');
        return;
      }
      if (trackStatus) {// 聚焦跟踪
        if (status === 3) {
          message.warning('监控对象离线');
          return;
        }
        // if (focusingTrack && focusingTrack.monitorId === monitorId) {
        //   changeFocusingTrack(null);
        // } else {
        changeFocusingTrack(result.lastLocation);
        // }
      } else {// 聚焦
        changeFocusMonitor(result.lastLocation);
      }
    }
  }

  /**
   * 跳转作业回放
   * @param monitorId 
   */
  const goTrackBack = (monitorId: number, monitorName: string) => {
    if (currentSelectTreeNode) {
      const { workType, key, type, pId } = currentSelectTreeNode;
      const monitorKey = type === 'monitor' ? key : `${monitorId}_${pId}`;
      channel.trigger(`/view/monitoringManager/workPlayback?key=${monitorKey}&name=${monitorName}&workType=${workType}`);
      history.replace(`/view/monitoringManager/workPlayback?key=${monitorKey}&name=${monitorName}&workType=${workType}`);

    }
  }

  /**
   * 列表排序
   * @param orderField 
   */
  const orderFun = (orderField: string) => {
    const { orderType } = orderRefObj.current;
    orderRefObj.current.orderField = orderField;
    if (orderField === 'shiftStartTime') {
      orderType[0] = orderType[0] === 'ASC' ? 'DESC' : 'ASC';
    } else {
      orderType[1] = orderType[1] === 'ASC' ? 'DESC' : 'ASC';
    }
    orderRefObj.current.orderType = orderType;
    getWorkObjectCurShiftData({
      orderField,
      orderType: orderField === 'shiftStartTime' ? orderType[0] : orderType[1]
    })
  }

  /**
   * 改变作业状态
   * @param status 
   */
  const queryTypeChange = (status: number) => {
    setCurStatus(status);
    getWorkObjectCurShiftData({
      queryType: status
    })
  }

  /**
   * 改变作业模式
   * @param status 
   */
  const modeChange = (value: string) => {
    orderRefObj.current.modeId = value;
    getWorkObjectCurShiftData({
      modeId: value
    })
  }

  const columns = [
    {
      title: '',
      render: (text: any, item: IList) => <div key={item.id} style={{ borderBottom: '1px solid #ccc', marginBottom: 10, padding: '10px 10px 5px' }}>
        <div className={styles.recordHeader}>
          <h4><UserSwitchOutlined /> {item.monitorName}({item.name})</h4>
          <span className={styles.workName}>{item.workName}</span>
          {item.shiftName && <span className={styles.blue}>{item.shiftName} {item.shiftStart.substring(0, 5)}-{item.shiftEnd.substring(0, 5)}</span>}
          {!item.shiftName && <span className={styles.blue}>暂无班次</span>}
        </div>
        <Row>
          <Col span={16}>
            <Row>
              <Col span={12}>
                <div>在岗状态: <span className={styles.blue}>{getOnWorkStatus(item.onWorkStatus)}</span></div>
                <div>作业状态: <span className={styles.blue}>{getWorkStatus(item.workStatus)}</span></div>
                <div>报警类型: <span>{item.alarmType || '--'}</span></div>
              </Col>
              <Col span={12} style={{ paddingLeft: 10, paddingRight: 10 }}>
                <div>考勤: <span>{getAttendanceStatus(item.attendanceStatus)}</span></div>
              </Col>
            </Row>
            <div style={{ marginTop: 20 }}><img width='20' src={trajectory} /> {item.address || '未定位'}</div>
          </Col>
          <Col span={8} className={styles.rightInfo}>
            <div className={styles.itemImg}>
              <img src={item.photoUrl ? item.photoUrl : noImg} style={{ width: '100%' }} />
            </div>
            <div>{item.orgName}</div>
          </Col>
        </Row>
        <div className={styles.betweenFlexBox} style={{ marginTop: 15, marginBottom: 5 }}>
          <div className={styles.rightBtn}>
            <Button size='small' ghost type='primary' onClick={() => { goTrackBack(item.monitorId, item.monitorName) }}>轨迹</Button>
            <Button size='small' ghost type='primary' onClick={() => { monitorFocusFun(item, true) }}>跟踪</Button>
          </div>
          <Button size='small' ghost type='primary' onClick={() => { goMonitorDetail(item) }}>详情</Button>
        </div>
      </div>
    },
  ];

  return <div className={styles.onDutyVehicle}>
    <div className={styles.typeTabs}>
      <div className={styles.typeTab}><UserSwitchOutlined /> 人员概况</div>
    </div>
    <div className={styles.statusTabs} style={{ backgroundColor: '#fafafa' }}>
      <div
        className={[styles.statusTab, curStatus === -1 && styles.active].join(' ')}
        onClick={() => queryTypeChange(-1)}
      >
        全部({numObj.totalNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 31 && styles.active].join(' ')}
        onClick={() => queryTypeChange(31)}
      >
        在岗({numObj.onWorkNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 30 && styles.active].join(' ')}
        onClick={() => queryTypeChange(30)}
      >
        脱岗({numObj.leaveWorkNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 10 && styles.active].join(' ')}
        onClick={() => queryTypeChange(10)}
      >
        报警({numObj.alarmNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 5 && styles.active].join(' ')}
        onClick={() => queryTypeChange(5)}
      >
        离线({numObj.offLineNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 20 && styles.active].join(' ')}
        onClick={() => queryTypeChange(20)}
      >
        考勤异常({numObj.abnormalAttendanceNum})
      </div>
    </div>
    <div className={styles.betweenFlexBox} style={{ marginTop: 10, padding: 4, backgroundColor: '#e4e4e4' }}>
      <div>
        作业模式：
        <Select
          size='small'
          className={styles.leftMarginSix}
          value={orderRefObj.current?.modeId || ''}
          style={{ minWidth: 100 }}
          onChange={modeChange}
        >
          <Option value=''>全部</Option>
          {modeData.map(item => <Option key={item.id} value={item.id}>{item.modeName}</Option>)}
        </Select>
      </div>
      <div>
        <span style={{ marginRight: 20 }}>班次 <SwapOutlined className={styles.rotate} onClick={() => orderFun('shiftStartTime')} /></span>
        {/* <span>作业进度 <SwapOutlined className={styles.rotate} onClick={() => orderFun('roadFinishRate')} /></span> */}
      </div>
    </div>
    <Table
      bordered
      loading={loading}
      className={styles.listTable}
      columns={columns}
      dataSource={monitorList}
      showHeader={false}
      pagination={false}
      scroll={{ y: `calc(100vh - ${!isFullScreen ? '355px' : '294px'})` }}
    />
  </div>
}

export default OnDutyPeople;