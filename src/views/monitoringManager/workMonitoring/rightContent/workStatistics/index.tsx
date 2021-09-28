/**
 * 右下角作业统计(包括作业概况、当班车辆、当班人员)
 */
import React, { Component } from "react";
import { StockOutlined, CarOutlined, UserSwitchOutlined, MinusCircleOutlined, LeftOutlined } from "@ant-design/icons";

import MachineOperation from "./machineOperation";// 机器作业
import WorkSurvey from './workSurvey';// 作业统计
import OnDutyVehicle from './onDutyVehicle';// 当班车辆
import OnDutyPeople from './onDutyPeople';// 当班人员
import OperationDetail from './operationDetail';// 作业详情

import styles from './index.module.less';
import { connect } from "react-redux";
import { AllState } from "@/model";
import { INodeItem } from "@/model/workMonitoring";
import { clearInterval } from "stompjs";
import { getMassivePoint, getShiftRecordDropdown, getWorkInfo } from "@/server/workMonitoring";
import { message } from "antd";

interface IProps {
  currentSelectTreeNode: INodeItem | null,
  detailMonitorInfo: INodeItem | null,
  changeMapMonitor: Function,
  history: any
}
interface IState {
  activeTab: string,
  curWorkObj: {
    id: string,// 作业对象ID
    orgId?: string,// 主管单位ID
    orgName: string,// 主管单位
    enterpriseName?: string,// 企业名称
    sectionId: string,// 标段id
    sectionName: string,// 标段名称
    workName?: string,// 作业对象名称
    workType: number,// 作业类型 1 作业道路 2作业区域 3 清运区域
  },
  updateStatus: boolean,
  detailVisible: boolean,
  machineVisible: boolean,
  vehicleStatusTab: null | number,
  peopleStatusTab: null | number,
  recordDropdown: Array<any>
}
// 刷新定时器
let timerUpdate: any = null;
class Index extends Component<any, IState, any>{
  constructor(props: any) {
    super(props);
    this.state = {
      curWorkObj: {
        id: '',// 作业对象id
        workType: 0,// 作业对象类型
        orgName: '',
        sectionId: '',
        sectionName: ''
      },// 当前显示的作业对象
      updateStatus: false,
      activeTab: '',// 当前展开的tab项(survey:作业概况,onDutyVehicle:当班车辆,onDutyPeople:当班人员)
      detailVisible: false,// 作业详情显示
      machineVisible: false,// 机器作业显示
      vehicleStatusTab: null,// 控制当班车辆当前选中tab
      peopleStatusTab: null,// 控制当班人员当前选中tab
      recordDropdown: [],// 监控对象排班信息
    }
  }

  componentDidMount() {
    // 监听路由变化
    this.props.history.listen(this.listenRouter)
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    // -100表示未排班
    const { currentSelectTreeNode, detailMonitorInfo } = nextProps;
    if (detailMonitorInfo) {
      this.goOperationDetail(detailMonitorInfo);
    }
    if (!detailMonitorInfo && currentSelectTreeNode?.type !== "organization" && currentSelectTreeNode?.type !== 'monitor' && !currentSelectTreeNode?.initStatus && currentSelectTreeNode?.workId !== -100) {
      if (!this.state.activeTab) {
        document.getElementById('topstatistics')?.classList.add('pushRight');// 修改顶部统计模块显示位置
      }
      this.setState({
        activeTab: 'survey',
        detailVisible: false,
        machineVisible: false,
        curWorkObj: {
          id: '',// 作业对象id
          workType: 0,// 作业对象类型
          orgName: '',
          sectionId: '',
          sectionName: ''
        }
      })
    }
    if (currentSelectTreeNode) {
      const { id, type, pId } = currentSelectTreeNode;
      if (type === 'section' || type === 'work' || type === 'monitor') {
        let curWorkId: any = id;
        if (type === 'monitor') {
          curWorkId = pId;
        }
        if (type === 'section' || curWorkId.indexOf('-100') === -1) {// -100:'未排班'
          this.changeStatus(currentSelectTreeNode);
        }
      } else {
        this.clearTimeOutFun();
      }
    }
  }

  /**
   * 获取监控对象排班信息,并跳转作业详情
   * @param detailInfo 
   * @param flag 为true表示是从作业进度跳转详情 
   */
  goOperationDetail = async (detailInfo: any, flag?: boolean) => {
    const { id, monitorId, pId, monitorType } = detailInfo;
    if (pId && pId.indexOf('-100') !== -1) {// 监控对象未排班时,隐藏作业统计区域
      document.getElementById('topstatistics')?.classList.remove('pushRight');// 修改顶部统计模块显示位置
      this.setState({
        activeTab: '',
        detailVisible: false,
        recordDropdown: []
      })
      return;
    }
    const recordDropdown: any = await getShiftRecordDropdown({ monitorId: id || monitorId });
    if (recordDropdown && recordDropdown.length > 0) {
      if (!this.state.activeTab) {
        document.getElementById('topstatistics')?.classList.add('pushRight');// 修改顶部统计模块显示位置
      }
      if (flag) {
        this.setState({
          detailVisible: true,
          recordDropdown
        })
        return;
      }
      if (monitorType === 1) {// 人
        this.setState({
          activeTab: 'onDutyPeople',
          detailVisible: true,
          machineVisible: false,
          recordDropdown
        })
      } else if (monitorType === 0) {// 车
        this.setState({
          activeTab: 'onDutyVehicle',
          detailVisible: true,
          machineVisible: false,
          recordDropdown
        })
      }
    } else {
      if (this.state.detailVisible) {
        document.getElementById('topstatistics')?.classList.remove('pushRight');// 修改顶部统计模块显示位置
        this.setState({
          activeTab: '',
          detailVisible: false,
          recordDropdown: []
        })
      }
      message.warning('监控对象今日未排班');
    }
  }

  componentWillUnmount() {
    this.clearTimeOutFun();
    const windowObj: any = window;
    if (windowObj.mapPointTimer) {
      clearInterval(windowObj.mapPointTimer);
      windowObj.mapPointTimer = undefined;
    }
  }

  /**
   * 监听路由变化
   * 跳转到其他界面时,清除本页面定时器
   * 回到本页面时重新请求数据
   */
  listenRouter = (route: any) => {
    const { pathname } = route;
    if (pathname === '/view/monitoringManager/workMonitoring') {
      this.judgeSendRequest();
    } else {
      this.clearTimeOutFun();
    }
  }

  /**
   * 判断是否需要发送请求更新数据
   */
  judgeSendRequest = () => {
    const { activeTab } = this.state;
    if (timerUpdate || !activeTab) return;
    const { currentSelectTreeNode } = this.props;
    if (currentSelectTreeNode) {
      const { id, type, pId } = currentSelectTreeNode;
      if (type === 'section' || type === 'work' || type === 'monitor') {
        let curWorkId: any = id;
        if (type === 'monitor') {
          curWorkId = pId;
        }
        if (type === 'section' || curWorkId.indexOf('-100') === -1) {// -100:'未排班'
          this.changeStatus(currentSelectTreeNode);
        }
      }
    }
  }

  clearTimeOutFun = () => {
    if (timerUpdate) {
      clearInterval(timerUpdate);
      timerUpdate = null;
    }
  }

  /**
   * 改变更新状态
   * @param curWorkId 
   * @param workType 
   */
  changeStatus = async (node: INodeItem) => {
    this.clearTimeOutFun();
    const windowObj: any = window;
    if (windowObj.mapPointTimer) {
      clearInterval(windowObj.mapPointTimer);
      windowObj.mapPointTimer = undefined;
    }
    if (this.state.activeTab) {
      document.getElementById('topstatistics')?.classList.add('pushRight');// 修改顶部统计模块显示位置
    }
    const { workType, workId, id, type, pId } = node;
    const param: any = {
      modeType: 0,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
      sectionId: '',// 标段Id
      workType,
    }
    if (type === 'section') {
      param.sectionId = id;
    }
    if (type === 'work') {
      if (Number(workId) < 0) {
        param.sectionId = pId;
      } else {
        param.workId = id;
      }
    }
    if (type === 'monitor') {
      const sectionId = pId.split('_')[1] || '';
      param.workId = pId;
      param.sectionId = sectionId;
    }
    const result: any = await getWorkInfo(param);
    this.getMassivePointFun(type !== 'monitor' ? result : null);
    if (result) {
      if (Number(workId) < 0) {
        result.id = id;
      }
      this.setState({
        curWorkObj: result,
        vehicleStatusTab: null,
        peopleStatusTab: null,
      })
    }

    clearInterval(timerUpdate);
    timerUpdate = setInterval(() => {
      const { updateStatus } = this.state;
      this.setState({
        updateStatus: !updateStatus
      })
    }, 30000)
  }

  /**
   * 获取海量点信息
   * @param data 
   */
  getMassivePointFun = async (data: any, setFitView?: boolean) => {
    const windowObj: any = window;
    if (windowObj.mapPointTimer) {
      clearInterval(windowObj.mapPointTimer);
      windowObj.mapPointTimer = undefined;
    }
    if (!data) return;
    const param = {
      sectionId: data.sectionId,// 标段Id
      workId: data.id ? data.id : `${data.orgId}_${data.sectionId}`,// 作业对象Id 当作业对象类型是机动组时{企业id}_{标段ID}
      workType: data.workType,// 作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
    }
    const result: any = await getMassivePoint(param);
    if (result) {
      const vehicleData: any = [];
      const peopleData: any = [];
      const facilityData: any = [];
      result.map((item: any) => {
        item.monitorKey = `${item.monitorId}_null`;
        item.workType = data.workType;
        if (item.monitorType === 0) {
          vehicleData.push(item);
        } else if (item.monitorType === 1) {
          peopleData.push(item);
        }
        else {
          facilityData.push(item);
        }
        return item;
      })
      const { changeMapMonitor } = this.props;
      changeMapMonitor([{
        type: 'vehicle',
        data: vehicleData,
        setFitView
      }, {
        type: 'people',
        data: peopleData,
        setFitView
      }])
      if (setFitView !== false) {
        setTimeout(() => {
          changeMapMonitor({
            type: 'facility',
            data: facilityData,
          })
        }, 100);
      }
      if (windowObj.mapPointTimer) {
        clearInterval(windowObj.mapPointTimer);
      }
      windowObj.mapPointTimer = setInterval(() => {
        this.getMassivePointFun(data, false);
      }, 30000)
    }
  }

  /**
   * 改变当前激活tab项
   * @param curTab 
   */
  changeActiveTab = (curTab: string) => {
    const { activeTab } = this.state;
    if (activeTab === '' && curTab) {
      document.getElementById('topstatistics')?.classList.add('pushRight');// 修改顶部统计模块显示位置
    }
    if (activeTab === 'onDutyVehicle') {
      this.setState({
        vehicleStatusTab: null
      })
    } else if (activeTab === 'onDutyPeople') {
      this.setState({
        peopleStatusTab: null
      })
    }
    this.setState({
      activeTab: activeTab !== curTab ? curTab : '',
      detailVisible: false,
      machineVisible: false
    }, () => {
      if (curTab === '' || activeTab === curTab) {
        this.clearTimeOutFun();
        document.getElementById('topstatistics')?.classList.remove('pushRight');
      } else {
        this.judgeSendRequest();
      }
    })
  }

  /**
   * 更改作业详情显示状态
   * @param status 
   */
  changeDetailVisible = (status: boolean) => {
    this.setState({
      detailVisible: status
    })
  }

  /**
   * 用于子组件修改state
   * @param param 
   */
  changeState = (param: any) => {
    this.setState(param);
  }

  render() {
    const {
      activeTab, curWorkObj, curWorkObj: { orgName, sectionName, workName },
      updateStatus, detailVisible, vehicleStatusTab, machineVisible, peopleStatusTab, recordDropdown
    } = this.state;

    const showName = `${orgName}/${sectionName}${workName ? `/${workName}` : ''}`;
    const status = machineVisible || detailVisible || !!activeTab;

    return <div className={`${styles.workStatistics}`} style={status ? { height: '100%' } : {}}>
      <div className={styles.workContent}>
        <div className={[styles.workBox, activeTab ? '' : styles.hideBox].join(' ')}>
          <div className={`${styles.header} ${detailVisible && styles.hide}`}>
            <h3>
              {machineVisible && <LeftOutlined onClick={() => this.changeState({ machineVisible: false })} />}
              {showName}
            </h3>
            <MinusCircleOutlined onClick={() => { this.changeActiveTab('') }} />
          </div>
          {/* 作业详情 */}
          {detailVisible && <OperationDetail recordDropdown={recordDropdown} changeVisible={this.changeDetailVisible} />}
          <div className={`${styles.scrollContent} ${detailVisible && styles.hide}`}>
            {/* 机器作业模块 */}
            {machineVisible && !detailVisible && <MachineOperation curWorkObj={curWorkObj} goOperationDetail={this.goOperationDetail} />}
            {/* 作业概况 */}
            {/* <div className={`${!(activeTab === 'survey' && !machineVisible && !detailVisible) ? styles.hide : ''}`}> */}
            {activeTab === 'survey' && !machineVisible && !detailVisible &&
              <WorkSurvey
                changeDetailVisible={this.changeDetailVisible}
                curWorkObj={curWorkObj}
                updateStatus={updateStatus}
                changeParentState={this.changeState}
                goEquipmentFacilities={() => {
                  this.changeActiveTab('equipmentFacilities')
                }}
              />}
            {/* </div> */}
            {/* 当班车辆 */}
            {activeTab === 'onDutyVehicle' && !detailVisible && <OnDutyVehicle
              goOperationDetail={this.goOperationDetail}
              curWorkObj={curWorkObj}
              vehicleStatusTab={vehicleStatusTab}
            />
            }
            {/* 当班人员 */}
            {activeTab === 'onDutyPeople' && !detailVisible && <OnDutyPeople
              goOperationDetail={this.goOperationDetail}
              curWorkObj={curWorkObj}
              peopleStatusTab={peopleStatusTab}
            />
            }
          </div>
        </div>
      </div>
      <div className={styles.workTabs}>
        <div
          className={[styles.workTab, activeTab === 'survey' ? styles.activeTab : ''].join(' ')}
          onClick={() => { this.changeActiveTab('survey') }}
        >
          <StockOutlined /> 作业概况
        </div>
        <div
          className={[styles.workTab, activeTab === 'onDutyVehicle' ? styles.activeTab : ''].join(' ')}
          onClick={() => { this.changeActiveTab('onDutyVehicle') }}
        >
          <CarOutlined /> 当班车辆
        </div>
        <div
          className={[styles.workTab, activeTab === 'onDutyPeople' ? styles.activeTab : ''].join(' ')}
          onClick={() => { this.changeActiveTab('onDutyPeople') }}
        >
          <UserSwitchOutlined /> 当班人员
        </div>
      </div>
    </div >
  }
}

export default connect(
  (state: AllState) => ({
    currentSelectTreeNode: state.workMonitoring.currentSelectTreeNode,
    detailMonitorInfo: state.workMonitoring.detailMonitorInfo,
  }),
  dispatch => ({
    changeMapMonitor: (payload: INodeItem) => {
      dispatch({ type: 'workMonitoring/changeMapMonitorEvery', payload });
    }
  })
)(Index);