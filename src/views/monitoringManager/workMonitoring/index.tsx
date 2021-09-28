import React, { Component } from "react";
import LeftTree from './leftTree';
import RightContent from './rightContent';
import { LeftOutlined } from "@ant-design/icons";
import { INodeItem } from "@/model/workMonitoring";
import { connect } from "react-redux";

import styles from './index.module.less';
import { getMonitorWindowInfo, getMapFenceInfo, getMonitorWorkObject } from "@/server/workMonitoring";
import { AllState } from "@/model";
import { message } from "antd";
import { monitorIsOnline } from "@/framework/utils/function";

interface IProps {
  changeSelectTree: Function,
  changeMapSection: Function,
  changeMapWorkObject: Function,
  changeMapCenterPos: Function,
  changeWorkObjectList: Function,
  changeActiveWorkId: Function,
  changeFocusMonitor: Function,
  changeDetailMonitorInfo: Function,
  changeVideoMonitroInfo: Function,
  isFullScreen: boolean
}
interface IState {
  treeVisible: boolean
}

class Index extends Component<IProps, IState, any>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      treeVisible: false,// 控制左侧树显示
    }
  }

  /**
   * 切换左侧组织树显示状态
   */
  toggleTreeVisible = () => {
    const { treeVisible } = this.state;
    this.setState({
      treeVisible: !treeVisible
    })
  }

  /**
   * 获取组织在地图上显示的数据
   */
  getOrganizationData = (id: string) => {
    console.log(id);
  }

  /**
   * 点击标段节点(显示标段围栏)
   */
  getSectionData = async (id: string) => {
    const result: any = await getMapFenceInfo({ pid: id });
    const { changeMapSection } = this.props;
    if (result && result.length > 0) {
      result[0].id = id;
      changeMapSection(result[0]);// 修改地图显示的标段数据
    }
  }

  /**
   * 点击作业对象节点(显示作业对象区域)
   * 并在地图上绘制其所属标段围栏
  */
  getWorkData = async (node: INodeItem) => {
    const { id, pId, workId } = node;
    if (workId === -100 || workId === -200) return;// 作业对象为未排班或者机动组
    const result: any = await getMapFenceInfo({ pid: pId, workId: id });
    const { changeMapSection, changeMapWorkObject } = this.props;
    if (result && result.length > 0) {
      const newData = new Map();
      newData.set(id, {
        workId: id,
        type: result[0].type,
        path: result[0].longLat
      })
      result[1].id = pId;
      changeMapSection(result[1]);// 修改地图显示的标段数据
      changeMapWorkObject(newData);// 修改地图显示的作业对象数据
    }
  }
  /**
   * 点击监控对象节点(显示相应监控对象图标)
   * 并在地图上绘制其所属作业对象以及标段围栏
   */
  getMonitorData = async (node: INodeItem) => {
    const {
      changeWorkObjectList, changeActiveWorkId,
      changeMapSection, changeMapWorkObject,
      changeFocusMonitor,
    } = this.props;
    const { id, key, workType, pId: workId } = node;
    const mapData: any = await getMonitorWorkObject(workId);
    const result: any = await getMonitorWindowInfo({ monitorId: id });
    if (mapData && mapData.length > 0) {
      const newData = new Map();
      if (mapData.length > 1) {
        mapData[1].id = workId;
        changeMapSection(mapData[1]);// 修改地图显示的标段数据
        newData.set(workId, {
          workId: workId,
          type: mapData[0].type,
          path: mapData[0].longLat
        })
        changeMapWorkObject(newData);// 修改地图显示的作业对象数据
      } else {// 返回数据只有一条,表示其为标段数据
        mapData[0].id = workId;
        changeMapSection(mapData[0]);// 修改地图显示的标段数据
      }
    }
    if (result) {
      changeWorkObjectList(result.workObjectList);
      changeActiveWorkId(workId);
      const { lastLocation: { latitude, longitude } } = result;
      if (!latitude && !longitude) {
        message.warning('监控对象暂无位置数据');
        return;
      }

      result.lastLocation.workType = workType;
      result.lastLocation.monitorKey = key;
      result.lastLocation.windowResult = result;
      changeFocusMonitor(result.lastLocation);
    }
    this.props.changeDetailMonitorInfo(node);
  }

  /**
   * 树节点点击事件
   * @param node 
   * @param e 
   */
  treeNodeClick = (node: INodeItem, e: Event) => {
    console.log('node', node, e);
    const { changeSelectTree } = this.props;
    changeSelectTree(node);// 切换当前选中的树节点
    this.props.changeDetailMonitorInfo(null);
    const { type, id } = node;
    switch (type) {
      case "organization":// 组织
        this.getOrganizationData(id);
        break;
      case 'section':// 企业(标段)
      case 'enterprise':
        this.getSectionData(id);
        break;
      case 'work':// 作业对象
        this.getWorkData(node);
        break;
      case 'monitor':// 监控对象
        this.getMonitorData(node);
        break;
    }
  }

  /**
   * 点击组织树节点视频图标
   * @param item 
   */
  videoClcik = (item: any) => {
    const isOnline = monitorIsOnline(item.id);
    if (!isOnline) {
      message.warning('监控对象离线');
      return;
    }
    this.props.changeVideoMonitroInfo({ key: 'videoParam', data: { id: item.id, name: item.name.split('(')[0] } })
  }

  render() {
    const { isFullScreen } = this.props;
    const { treeVisible } = this.state;
    const bodyHeight = document.querySelector('body')?.offsetHeight;

    return <div className={styles.monitoringContainer}>
      <div className={[styles.leftSide, !treeVisible ? styles.leftHide : ""].join(' ')}>
        {bodyHeight && <LeftTree videoClcik={this.videoClcik} treeHeight={bodyHeight - (isFullScreen ? 10 : 214)} type='monitoring' isShowselect treeNodeClick={this.treeNodeClick} />}
      </div>
      <div className={styles.rightSide}>
        <div className={styles.toggleIcon} onClick={this.toggleTreeVisible}>
          <LeftOutlined className={[styles.arrowIcon, !treeVisible ? styles.arrowRotate : ''].join(' ')} />
        </div>
        <RightContent />
      </div>
    </div>
  }
}

export default connect(
  (state: AllState) => ({
    mapMonitor: state.workMonitoring.mapMonitor,// 地图上显示的监控对象集合
    subscribeMonitorIds: state.workMonitoring.subscribeMonitorIds,
    isFullScreen: state.container.isFullScreen
  }),
  dispatch => ({
    changeSelectTree: (payload: INodeItem) => {
      dispatch({ type: 'workMonitoring/changeSelectTreeEvery', payload });
    },
    // 改变地图显示中心点
    changeMapCenterPos: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeMapCenterPosEvery', payload });
    },
    // 改变地图聚焦监控对象信息
    changeFocusMonitor: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeFocusMonitorEvery', payload });
    },
    // 改变地图显示标段
    changeMapSection: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeMapSectionEvery', payload });
    },
    // 改变地图显示作业对象
    changeMapWorkObject: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeMapWorkObjectEvery', payload });
    },
    // 改变作业内容显示数据
    changeWorkObjectList: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeWorkObjectListEvery', payload });
    },
    // 改变当前监控对象所属的作业对象id
    changeActiveWorkId: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeActiveWorkIdEvery', payload });
    },
    // 改变作业详情模块显示的监控对象信息
    changeDetailMonitorInfo: (payload: any) => {
      dispatch({ type: 'workMonitoring/changeDetailMonitorInfoEvery', payload });
    },
    //实时视频监控对象信息
    changeVideoMonitroInfo: (payload: any) => {
      dispatch({ type: 'workMonitoring/refreshData', payload });
    }
  }),
)(Index);