/**
 * 顶部统计数据模块
 */
import React, { Component } from "react";
import { connect } from 'react-redux';

import { PushpinOutlined, BankOutlined } from "@ant-design/icons";
import { Row, Col, Spin } from "antd";

import styles from '../../index.module.less';
import { AllState } from "@/model";
import { INodeItem } from "@/model/workMonitoring";
import { getTopStatistic } from "@/server/workMonitoring";
import { getStore } from "@/framework/utils/localStorage";

interface IProps {
  history: any;
  topChangeStatus: boolean;
  currentSelectTreeNode: INodeItem | null,
  changeTopChangeStatus: Function,
}
interface IState {
  menuVisible: boolean,
  currentId: string;
  statisticsName: string,
  statisticsData: IStatistics
}

interface IStatistics {
  name: string,
  offlinePeopleNo: number
  offlineVehicleNo: number
  onlinePeopleNo: number
  onlineVehicleNo: number
  totalPeopleNo: number
  totalVehicleNo: number
}

// 刷新定时器
let timerUpdate: any = null;
class Index extends Component<IProps, IState, any>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      menuVisible: true,
      currentId: '',// 当前统计的组织或者企业id
      statisticsName: '',// 统计的组织或者企业名称
      statisticsData: {
        name: '',
        offlinePeopleNo: 0,
        offlineVehicleNo: 0,
        onlinePeopleNo: 0,
        onlineVehicleNo: 0,
        totalPeopleNo: 0,
        totalVehicleNo: 0,
      }
    }
  }

  componentDidMount() {
    let loginUserInfo: any = getStore('loginUserInfo');
    if (loginUserInfo) {
      loginUserInfo = JSON.parse(loginUserInfo);
      const param: any = {
        id: loginUserInfo.organization_id,
        enterpriseId: loginUserInfo.organization_id,
        type: !loginUserInfo.user_type ? 'organization' : ''
      }
      this.getStatisticsData(param);
    }
    // 监听路由变化
    this.props.history.listen(this.listenRouter)
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { currentSelectTreeNode } = nextProps;
    // 点击节点为组织或者企业时,更新统计信息
    if (currentSelectTreeNode) {
      let changeId;
      if (currentSelectTreeNode.type === 'organization') {
        changeId = currentSelectTreeNode.id;
      } else {
        changeId = currentSelectTreeNode.enterpriseId;
      }
      const { currentId } = this.state;
      if (changeId && changeId !== currentId) {
        this.getStatisticsData(currentSelectTreeNode)
      }
    }
  }

  componentWillUnmount() {
    this.clearTimeOutFun();
  }

  /**
   * 监听路由变化
   * 跳转到其他界面时,清除本页面定时器
   * 回到本页面时重新请求数据
   */
  listenRouter = (route: any) => {
    const { pathname } = route;
    if (pathname === '/view/monitoringManager/workMonitoring') {
      const { currentSelectTreeNode } = this.props;
      // 选中节点为组织或者企业时,更新统计信息
      if (currentSelectTreeNode) {
        this.getStatisticsData(currentSelectTreeNode)
      } else {
        let loginUserInfo: any = getStore('loginUserInfo');
        if (loginUserInfo) {
          loginUserInfo = JSON.parse(loginUserInfo);
          const param: any = {
            id: loginUserInfo.organization_id,
            enterpriseId: loginUserInfo.organization_id,
            type: !loginUserInfo.user_type ? 'organization' : ''
          }
          this.getStatisticsData(param);
        }
      }
    } else {
      this.clearTimeOutFun();
    }
  }

  clearTimeOutFun = () => {
    if (timerUpdate) {
      clearInterval(timerUpdate);
      timerUpdate = null;
    }
  }

  /**
   * 获取统计信息数据
   * @param id 
   */
  getStatisticsData = async (node: INodeItem) => {
    this.clearTimeOutFun();
    const { id, type, enterpriseId } = node;
    const param = {
      id: type === 'organization' ? id : enterpriseId,
      queryType: type === 'organization' ? 0 : 1
    }
    const result = await getTopStatistic<any>(param);
    if (result) {
      this.setState({
        statisticsName: result.name,
        statisticsData: result,
        currentId: param.id
      })
      clearInterval(timerUpdate);
      timerUpdate = setInterval(() => {
        const { changeTopChangeStatus, topChangeStatus } = this.props;
        if (topChangeStatus) {// 监控对象状态有变化时,重新请求接口
          this.getStatisticsData(node);
          changeTopChangeStatus(false);
        }
      }, 30000)
    } else {
      this.setState({
        currentId: '',
        statisticsName: '',
        statisticsData: {
          name: '',
          offlinePeopleNo: 0,
          offlineVehicleNo: 0,
          onlinePeopleNo: 0,
          onlineVehicleNo: 0,
          totalPeopleNo: 0,
          totalVehicleNo: 0,
        }
      })
    }
  }

  changeMenuVisible = () => {
    const { menuVisible } = this.state;
    this.setState({
      menuVisible: !menuVisible
    }, () => {
      if (menuVisible) {
        document.getElementById('topstatistics')?.classList.add('hideStatistics');
      } else {
        document.getElementById('topstatistics')?.classList.remove('hideStatistics');
      }
    })
  }

  render() {
    const { menuVisible, statisticsData, statisticsName } = this.state;
    const lockTitle = menuVisible ? '解除锁定' : '锁定';

    return <div id="topstatistics" className={styles.statisticsContainer}>
      <div className={styles.topstatisticsBox}>
        <div className={styles.topHeader}>
          <h3><BankOutlined /> {statisticsName}</h3>
          <PushpinOutlined
            title={lockTitle}
            onClick={this.changeMenuVisible}
            className={[styles.lockIcon, !menuVisible ? styles.cancelLock : ''].join(' ')} />
        </div>
        <Row>
          <Col span={4} className={styles.itemNum}>
            <h4>人员总数</h4>
            <div>{statisticsData.totalPeopleNo}</div>
          </Col>
          <Col span={4} className={[styles.itemNum, styles.green].join(' ')}>
            <h4>在线人员</h4>
            <div>{statisticsData.onlinePeopleNo}</div>
          </Col>
          <Col span={4} className={[styles.itemNum, styles.gray].join(' ')}>
            <h4>离线人员</h4>
            <div>{statisticsData.offlinePeopleNo}</div>
          </Col>
          <Col span={4} className={styles.itemNum}>
            <h4>车辆总数</h4>
            <div>{statisticsData.totalVehicleNo}</div>
          </Col>
          <Col span={4} className={[styles.itemNum, styles.green].join(' ')}>
            <h4>在线车辆</h4>
            <div>{statisticsData.onlineVehicleNo}</div>
          </Col>
          <Col span={4} className={[styles.itemNum, styles.gray].join(' ')}>
            <h4>离线车辆</h4>
            <div>{statisticsData.offlineVehicleNo}</div>
          </Col>
        </Row>
      </div>
      <div className={styles.hoverArea}></div>
    </div>
  }
}

export default connect(
  (state: AllState) => ({
    currentSelectTreeNode: state.workMonitoring.currentSelectTreeNode,
    topChangeStatus: state.workMonitoring.topChangeStatus,
  }),
  dispatch => ({
    changeTopChangeStatus: (payload: boolean) => {
      dispatch({ type: 'workMonitoring/changeTopChangeStatusEvery', payload });
    }
  })
)(Index);