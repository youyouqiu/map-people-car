/**
 * 作业概况
 */
import React, { useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { UserSwitchOutlined, CarOutlined, RightOutlined, DeleteOutlined } from "@ant-design/icons";
import { Row, Col, Empty, Progress } from "antd";
import styles from './index.module.less';
import {
  getWorkProgress, getVehicleGeneral, getPeopleGeneral,
  getFacilityGeneral, getFacilityMassPoint
} from "@/server/workMonitoring";

interface IProps {
  curWorkObj: {
    id: string,
    sectionId: string,
    workType: number
  },
  changeDetailVisible: Function,
  updateStatus: boolean,
  goEquipmentFacilities: Function,
  changeParentState: Function,
}

// 设施概况
interface IFacilityStatistic {
  intelligentNum: number
  totalNum: number
  typeId: number
  typeName: string
}

interface IStatistic {
  abnormalAttendanceNum?: number,// 考勤异常数
  alarmNum?: number,// 报警数
  invalidWorkNum?: number,// 非有效作业数
  leaveWorkNum?: number,// 脱岗数
  modeType?: number,// 作业模式类型 0:机器作业 1：人工作业 2:垃圾清运 3:垃圾转运
  notWorkNum?: number,// 未作业数
  offLineNum?: number,// 离线数
  onWorkNum?: number,// 在岗数
  peopleRunNum?: number,// 人员行走数量
  peopleStopNum?: number,// 人员静止数量
  totalNum?: number,// 统计的监控对象总数
  validWorkNum?: number,// 有效作业数
}

interface IWorkProgress {
  finishNum?: number,// 已完成数
  notStartedNum?: number,// 未开始的数量
  totalNum?: number,// 总班次数
  unfinishedNum?: number,// 未完成数
  workingNum?: number,// 作业中数量
}

const WorkSurvey = (props: IProps) => {
  const dispatch = useDispatch();
  const [activeItem, setActiveItem]: any = useState<Array<string>>([]);// 当前选中项
  const [workProgress, setWorkProgress] = useState<IWorkProgress>({});// 作业进度
  const [vehicleStatistic, setVehicleStatistic] = useState<IStatistic>({});// 车辆概况数据
  const [peopleStatistic, setPeopleStatistic] = useState<IStatistic>({});// 人员概况数据
  const [facilityStatistic, setFacilityStatistic] = useState<Array<IFacilityStatistic>>([]);// 设施概况数据

  useEffect(() => {
    if (props.curWorkObj.id || props.curWorkObj.sectionId) {
      getStatisticData();
    }
  }, [props.curWorkObj, props.updateStatus])

  // 连接redux数据
  const { currentSelectTreeNode } = useSelector(({
    workMonitoring: {
      currentSelectTreeNode,
    }
  }: any) => {
    return {
      currentSelectTreeNode,
    }
  }, shallowEqual);

  /**
   * 改变地图显示的海量点信息
   */
  const changeMapMonitor = (payload: any) => {
    dispatch({ type: 'workMonitoring/changeMapMonitorEvery', payload });
  }

  /**
   * 获取概况统计数据
   */
  const getStatisticData = async () => {
    const { id, workType, sectionId } = props.curWorkObj;
    const param: any = {
      modeType: 0,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
      sectionId,// 标段Id
      workId: id,// 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
      workType,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
    }
    const workProgressData = await getWorkProgress<IWorkProgress>(param);
    const vehicleGeneral = await getVehicleGeneral<IStatistic>(param);
    param.modeType = 1;
    const peopleGeneral = await getPeopleGeneral<IStatistic>(param);
    param.modeType = '';
    const facilityGeneral = await getFacilityGeneral<Array<IFacilityStatistic>>(param);
    if (workProgressData) {
      setWorkProgress(workProgressData);
    }
    if (vehicleGeneral) {
      setVehicleStatistic(vehicleGeneral);
    }
    if (peopleGeneral) {
      setPeopleStatistic(peopleGeneral);
    }
    if (facilityGeneral) {
      setFacilityStatistic(facilityGeneral);
    }
  }

  /**
   * 修改父组件状态
   * @param activeTab 
   * @param statusTab 
   */
  const changeParentStateFun = (activeTab: string, statusTab: number) => {
    if (activeTab === 'onDutyVehicle') {
      props.changeParentState({
        activeTab,
        vehicleStatusTab: statusTab
      })
    } else {
      props.changeParentState({
        activeTab,
        peopleStatusTab: statusTab
      })
    }
  }

  /**
   * 获取设施类型海量点信息
   * @param  queryType 查询类型：查询类型：-1 全部 1 智慧设施
   * @param  typeId 类型ID
   */
  const getFacilityPointData = async (key: string, data: { typeId: number, queryType: number }) => {
    const { typeId, queryType } = data;
    console.log('getFacilityPointData', key);

    const index = activeItem.indexOf(key);
    if (index !== -1) {// 取消当前设施类型海量点显示
      const newArr = [...activeItem];
      newArr.splice(index, 1);
      setActiveItem(newArr);
      changeMapMonitor({
        type: 'facility',
        data: []
      })
    } else if (currentSelectTreeNode) {
      const newData = [];
      newData.push(key);
      // 去除相似key值的active项
      activeItem.map((item: string) => {
        if (item.indexOf(`facility${typeId.toString()}`) === -1) {
          newData.push(item)
        }
      })
      setActiveItem(newData);
      const param = {
        sectionId: props.curWorkObj.sectionId,
        typeId,// 类型ID
        queryType,// 查询类型：-1 按总排班数查询 0 查询脱岗数查询 1 按在岗数查询 2 查询当前班次
        workId: props.curWorkObj.id,// 作业对象Id
        workType: 3,// 清运区域
      }
      const result = await getFacilityMassPoint(param);
      if (result) {
        changeMapMonitor({
          type: 'facility',
          data: result
        })
      }
    }
  }

  const renderNum = (data: number | undefined) => {
    return data || 0;
  }

  /**
   * 渲染作业进度视图
   */
  const renderWorkProgress = useMemo(() => {
    return <>
      <div className={styles.subHeader}>
        <h4><UserSwitchOutlined /> 环卫作业进度</h4>
      </div>
      <div style={{ padding: 15 }}>
        <div className={styles.betweenFlexBox}>
          <div>机器作业进度</div>
          <div style={{ cursor: 'pointer' }} onClick={() => props.changeParentState({ machineVisible: true })}>共{renderNum(workProgress.totalNum)} <RightOutlined /></div>
        </div>
        <Progress
          type='line'
          percent={workProgress.totalNum && workProgress.finishNum ? Math.ceil((workProgress.finishNum / workProgress.totalNum) * 100) : 0}
          strokeColor='rgb(94,200,254)'
        />
        <div className={styles.betweenFlexBox} style={{ justifyContent: 'flex-start' }}>
          <div style={{ width: '40%' }}>完成 <span className={styles.greenyellow}>{renderNum(workProgress.finishNum)}</span></div>
          <div>作业中 <span className={styles.blue}>{renderNum(workProgress.workingNum)}</span></div>
        </div>
      </div>
    </>
  }, [workProgress])

  /**
   * 渲染车辆概况视图
   */
  const renderVehicleStatistic = useMemo(() => {
    return <>
      <div className={styles.subHeader}>
        <h4><CarOutlined /> 车辆概况</h4>
      </div>
      <Row className={styles.rowItem}>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', -1)}>
          <strong className={styles.defaultNum}>{renderNum(vehicleStatistic.totalNum)}</strong>
          <div>机器作业</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', 0)}>
          <strong className={styles.onlineNum}>{renderNum(vehicleStatistic.validWorkNum)}</strong>
          <div >有效作业</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', 2)}>
          <strong className={styles.onlineNum}>{renderNum(vehicleStatistic.notWorkNum)}</strong>
          <div>未作业</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', 1)}>
          <strong className={styles.offlineNum}>{renderNum(vehicleStatistic.invalidWorkNum)}</strong>
          <div>非有效作业</div>
        </Col>
      </Row>
      <Row className={styles.rowItem}>
        <Col span={6}>
          <Progress
            type='circle'
            percent={vehicleStatistic.totalNum && vehicleStatistic.validWorkNum ? Math.ceil((vehicleStatistic.validWorkNum / vehicleStatistic.totalNum) * 100) : 0}
            width={80}
            style={{ marginTop: -12 }}
            strokeWidth={10}
            strokeColor='rgb(94,200,254)'
            format={(percent) => <div>{percent}%<p style={{ margin: '5px 0 0', fontSize: 13 }}>作业率</p></div>}
          />
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', 5)}>
          <strong className={styles.defaultNum}>{renderNum(vehicleStatistic.offLineNum)}</strong>
          <div>离线</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', 10)}>
          <strong className={styles.red}>{renderNum(vehicleStatistic.alarmNum)}</strong>
          <div>报警</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyVehicle', 20)}>
          <strong className={styles.red}>{renderNum(vehicleStatistic.abnormalAttendanceNum)}</strong>
          <div>考勤异常</div>
        </Col>
      </Row>
    </>
  }, [vehicleStatistic])

  /**
   * 渲染人员概况视图
   */
  const renderPeopleStatistic = useMemo(() => {
    return <>
      <div className={styles.subHeader}>
        <h4><UserSwitchOutlined /> 人员概况</h4>
      </div>
      <Row className={styles.rowItem}>
        <Col span={6} onClick={() => changeParentStateFun('onDutyPeople', -1)}>
          <strong className={styles.defaultNum}>{renderNum(peopleStatistic.totalNum)}</strong>
          <div>总排班人员</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyPeople', 31)}>
          <strong className={styles.onlineNum}>{renderNum(peopleStatistic.onWorkNum)}</strong>
          <div>在岗</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyPeople', 30)}>
          <strong className={styles.onlineNum}>{renderNum(peopleStatistic.leaveWorkNum)}</strong>
          <div>脱岗</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyPeople', 5)}>
          <strong className={styles.defaultNum}>{renderNum(peopleStatistic.offLineNum)}</strong>
          <div>离线</div>
        </Col>
      </Row>
      <Row className={styles.rowItem}>
        <Col span={6}>
          <Progress
            type='circle'
            percent={peopleStatistic.totalNum && peopleStatistic.onWorkNum ? Math.ceil((peopleStatistic.onWorkNum / peopleStatistic.totalNum) * 100) : 0}
            width={80}
            style={{ marginTop: -12 }}
            strokeWidth={10}
            strokeColor='rgb(94,200,254)'
            format={(percent) => <div>{percent}%<p style={{ margin: '5px 0 0', fontSize: 13 }}>作业率</p></div>}
          />
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyPeople', 10)}>
          <strong className={styles.red}>{renderNum(peopleStatistic.alarmNum)}</strong>
          <div>报警</div>
        </Col>
        <Col span={6} onClick={() => changeParentStateFun('onDutyPeople', 20)}>
          <strong className={styles.red}>{renderNum(peopleStatistic.abnormalAttendanceNum)}</strong>
          <div>考勤异常</div>
        </Col>
      </Row>
    </>
  }, [peopleStatistic])

  /**
   * 渲染设施概况内容
   */
  const renderfacilityStatistic = useMemo(() => {
    if (!facilityStatistic || facilityStatistic.length === 0) return null;

    return <>
      <div className={styles.subHeader}>
        <h4><DeleteOutlined /> 设施概况</h4>
      </div>
      {facilityStatistic.map((item: IFacilityStatistic) =>
        <Row className={styles.rowItem} key={`${item.typeName}_${item.typeId}`}>
          <Col
            span={12}
            className={activeItem.indexOf(`all_facility${item.typeId}`) !== -1 ? styles.active : ''}
            onClick={() => { getFacilityPointData(`all_facility${item.typeId}`, { typeId: item.typeId, queryType: -1 }) }}
          >
            <strong className={styles.defaultNum}>{item.totalNum}</strong>
            <div className={styles.numTitle}>{item.typeName ? item.typeName : '垃圾箱'}</div>
          </Col>
          <Col
            span={12}
            className={activeItem.indexOf(`intelligent_facility${item.typeId}`) !== -1 ? styles.active : ''}
            onClick={() => { getFacilityPointData(`intelligent_facility${item.typeId}`, { typeId: item.typeId, queryType: 1 }) }}
          >
            <strong className={styles.onlineNum}>{item.intelligentNum}</strong>
            <div className={styles.numTitle}>智慧设施</div>
          </Col>
        </Row>
      )}
    </>
  }, [facilityStatistic, activeItem])

  return <div className={styles.workSurvey}>
    {renderWorkProgress}
    {renderVehicleStatistic}
    {renderPeopleStatistic}
    {renderfacilityStatistic}
  </div>
}

export default WorkSurvey;
