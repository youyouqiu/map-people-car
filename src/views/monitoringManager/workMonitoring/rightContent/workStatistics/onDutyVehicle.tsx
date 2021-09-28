/**
 * 当班车辆
 */
import React, { useEffect, useRef, useState } from "react";
import { CarOutlined, SwapOutlined } from "@ant-design/icons";
import trajectory from '@/static/image/trajectory.svg';// 轨迹
import styles from './index.module.less';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getMonitorWindowInfo, getDutyVehicles, getModeList } from "@/server/workMonitoring";
import { message, Select, Row, Col, Progress, Button, Table } from "antd";
import { getAttendanceStatus, getOnWorkStatus, getWorkStatus, noImg } from "../../publicFun";
import channel from "../../channel";
import { useHistory } from "react-router-dom";
import { monitorIsOnline } from "@/framework/utils/function";
const { Option } = Select;

interface IProps {
  curWorkObj: {
    id: string,
    workType: number,
    sectionId: string,
  },
  goOperationDetail: Function,
  vehicleStatusTab: number | null
}
export interface IList {
  id: number,// 监控对象ID
  number: string,// 监控对象名
  modeId: number,// 作业模式id，管理组长为0
  modeName: string,// 作业模式名称
  roadFinishRate: number,// 路径完成度(%)
  shiftEnd: string,// 排班结束时间
  shiftName: string,// 排班名称
  shiftStart: string,// 排班开始时间
  taskStatus: number,// 任务状态 0:未开始 1:作业中 2:已完成 3:未完成
  workId: number,// 作业对象id，机动组为0
  workName: string,// 作业对象名称
  workType: number,// 1作业道路 2作业区域 3 清运区域 4 机动组
  vehicleType: string,// 车辆类型/职位类型,
  monitorId: number,// 监控对象ID
  monitorName: string,// 监控对象名称（人员工号）
  monitorType: number,// 监控对象类型 0车辆 1人员
  name: string,// 监控对象别名或姓名
  onWorkStatus: number,// 在岗状态 0脱岗 1：在岗 为空表示不在上班时间
  online: number,
  orgName: string,// 所属企业名称
  photoUrl: string,// 监控对象图片URl
  attendanceStatus: number,// 考勤状态：1 ：调休 2： 请假 3：未签到 4:晚到 5：正常签到 6：早退 7：正常签退 8：缺勤
  workStatus: number,// 工作状态 0：有效工作 1：非有效作业 2：非工作 3：静止 4：行走 5 离线 6 未定位 7 在线
  gpsSpeed: number,// 行驶速度
  bindSensorSet: Array<number>,// 已绑传感器
  remainingOilList: Array<number>,// 剩余油量
  remainingWaterList: Array<number>,// 剩余水量
  loadWeightList: Array<number>,// 载重量
  address: string,//地址
  professionalsList: any, // 从业人员
  isVideo: boolean,// 是否设置了音视频
  type: string,// 车辆类型
  alarmType: string,// 报警类型
}

interface INumObj {
  abnormalAttendanceNum: number,// 考勤异常数
  alarmNum: number,// 报警数
  invalidWorkNum: number,// 非有效作业数
  notWorkNum: number,// 未作业数
  offLineNum: number,// 离线数
  totalNum: number,// 统计的监控对象总数
  validWorkNum: number,// 有效作业数
}

const OnDutyVehicle = (props: IProps) => {
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
    invalidWorkNum: 0,// 非有效作业数
    notWorkNum: 0,// 未作业数
    offLineNum: 0,// 离线数
    totalNum: 0,// 统计的监控对象总数
    validWorkNum: 0,// 有效作业数
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
      if (props.vehicleStatusTab !== null) {
        setCurStatus(props.vehicleStatusTab);
        getWorkObjectCurShiftData({
          queryType: props.vehicleStatusTab
        }, true);
      } else {
        getWorkObjectCurShiftData();
      }
    }
  }, [props.curWorkObj, props.vehicleStatusTab])

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
   * 获取当班车辆数据
   * @param param 
   */
  const getWorkObjectCurShiftData = async (filterParam: any = {}, mapChange?: boolean) => {
    setLoading(true);
    const { id, workType, sectionId } = props.curWorkObj;
    const param = {
      queryType: curStatus,
      modeId: orderRefObj.current?.modeId,
      modeType: 0,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
      sectionId,// 标段Id
      workId: id,// 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
      workType,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
      ...filterParam
    }
    const result: any = await getDutyVehicles(param);
    if (result) {
      setMonitorList(result.monitors);
      setNumObj(result.stat)
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
        queryType: props.vehicleStatusTab,
        modeType: 0,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
        sectionId,// 标段Id
        workId: id,// 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
        workType,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
      }
      result = await getDutyVehicles(param);
    }
    if (result) {
      const pointData = result.monitors.map((item: any) => {
        item.monitorKey = `${item.monitorId}_null`;
        item.monitorType = 0;
        if (!item.workType && workType) {
          item.workType = workType;
        }
        item.status = item.online;
        return item;
      })
      changeMapMonitor({
        type: 'vehicle',
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
        // if (!focusingTrack || (focusingTrack && focusingTrack.monitorId !== monitorId)) {
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
   * 改变实时视频监控对象信息
   */
  const changeVideoMonitroInfo = async (monitorId: number, monitorName: string) => {
    const isOnline = await monitorIsOnline(monitorId);
    if (!isOnline) {
      message.warning('监控对象离线');
      return;
    }
    dispatch({ type: 'workMonitoring/refreshData', payload: { key: 'videoParam', data: { id: monitorId, name: monitorName } } });
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
      render: (text: any, item: IList) => {
        let { workType } = props.curWorkObj;
        if (item.workType) {
          workType = item.workType;
        }
        const showProgress = workType !== 2 && workType !== 3;
        return <div key={`${item.monitorId}_${workType}`} style={{ marginBottom: 10, padding: '10px 10px 0' }}>
          <div className={styles.recordHeader}>
            <h4><CarOutlined /> {item.monitorName}({item.type})</h4>
            <span className={styles.workName}>{item.workName}</span>
            {item.shiftName && <span className={styles.blue}>{item.shiftName.substring(0, 5)} {item.shiftStart.substring(0, 5)}-{item.shiftEnd.substring(0, 5)}</span>}
            {!item.shiftName && <span className={styles.blue}>暂无班次</span>}
          </div>
          <Row>
            <Col span={16}>
              <Row>
                <Col span={12}>
                  <div>在岗状态: <span className={styles.blue}>{getOnWorkStatus(item.onWorkStatus)}</span></div>
                  <div>作业状态: <span className={styles.blue}>{getWorkStatus(item.workStatus)}</span></div>
                  <div>考勤: <span>{getAttendanceStatus(item.attendanceStatus)}</span></div>
                  <div>报警类型: <span>{item.alarmType || '--'}</span></div>
                </Col>
                <Col span={12} style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <div>行驶速度: <span>{item.gpsSpeed === undefined ? '--' : `${item.gpsSpeed}km/h`}</span></div>
                  {item.bindSensorSet?.indexOf(1) !== -1 && <div>剩余油量: <span>{item.remainingOilList?.length > 0 ? `${item.remainingOilList.join('L/')}L` : '--'}</span></div>}
                  {item.bindSensorSet?.indexOf(2) !== -1 && <div>剩余水量: <span>{item.remainingWaterList?.length > 0 ? `${item.remainingWaterList.join('L/')}L` : '--'}</span></div>}
                  {item.bindSensorSet?.indexOf(3) !== -1 && <div>载重量: <span>{item.loadWeightList?.length > 0 ? `${item.loadWeightList.join('kg/')}kg` : '--'}</span></div>}
                </Col>
              </Row>
              <div>
                {/* 作业区域和清运区域，路径不展示 */}
                {showProgress ? <div className={styles.betweenFlexBox} style={{ margin: '10px 0' }}>
                  <span style={{ width: 50 }}>路径:</span>
                  <Progress
                    type='line'
                    percent={item.roadFinishRate || 0}
                    strokeColor='rgb(94,200,254)'
                  />
                </div> : null}
                <div><img width='20' src={trajectory} /> {item.address || '未定位'}</div>
              </div>
            </Col>
            <Col span={8} className={styles.rightInfo}>
              <div className={styles.itemImg}>
                <img src={item.photoUrl ? item.photoUrl : noImg} style={{ width: '100%' }} />
              </div>
              <div>{item.orgName}</div>
              {item.professionalsList && <div>驾驶员: {item.professionalsList.map((value: any) => `${value.name}(${value.number})`).join(',')}</div>}
            </Col>
          </Row>
          <div className={styles.betweenFlexBox} style={{ marginTop: 15, marginBottom: 5 }}>
            <div className={styles.rightBtn}>
              {item.isVideo && <Button size='small' ghost type='primary' onClick={() => { changeVideoMonitroInfo(item.monitorId, item.monitorName) }}>视频</Button>}
              <Button size='small' ghost type='primary' onClick={() => { goTrackBack(item.monitorId, item.monitorName) }}>轨迹</Button>
              <Button size='small' ghost type='primary' onClick={() => { monitorFocusFun(item, true) }}>跟踪</Button>
            </div>
            <Button size='small' ghost type='primary' onClick={() => { goMonitorDetail(item) }}>详情</Button>
          </div>
        </div>
      }
    },
  ];

  return <div className={styles.onDutyVehicle}>
    <div className={styles.typeTabs}>
      <div className={styles.typeTab}>机器作业</div>
    </div>
    <div className={styles.statusTabs} style={{ backgroundColor: '#fafafa' }}>
      <div
        className={[styles.statusTab, curStatus === -1 && styles.active].join(' ')}
        onClick={() => queryTypeChange(-1)}
      >
        全部({numObj.totalNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 0 && styles.active].join(' ')}
        onClick={() => queryTypeChange(0)}
      >
        有效作业({numObj.validWorkNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 2 && styles.active].join(' ')}
        onClick={() => queryTypeChange(2)}
      >
        未作业({numObj.notWorkNum})
      </div>
      <div
        className={[styles.statusTab, curStatus === 1 && styles.active].join(' ')}
        onClick={() => queryTypeChange(1)}
      >
        非有效作业({numObj.invalidWorkNum})
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
        <span>作业进度 <SwapOutlined className={styles.rotate} onClick={() => orderFun('roadFinishRate')} /></span>
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

export default OnDutyVehicle;