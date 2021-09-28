import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment'
import MonthTrack from './monthlyMileage'
import LeftTree from '../workMonitoring/leftTree';
import { INodeItem } from "@/model/workMonitoring";
import styles from './index.module.less';
import channel from '@/views/monitoringManager/workMonitoring/channel'
export const formatNumberByZero = (n: number | string) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
interface IProps {
  changeCurrentDate: Function;
  getMonthlyMileageData: Function;
  changeSelectTree: Function;
  changeSelectDate: Function;
  updateWorkObjectData?: Function;
  setMileageData: Function;
}
class IndexComponent extends React.Component<IProps, any, any>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      parameter: undefined
    };
  }


  componentDidMount() {
    if (channel.listener.length == 0) {
      this.replaceRender()
    };
    channel.listener.push(this.replaceRender);
    const { setMileageData } = this.props;
    setMileageData && setMileageData([]);
  }

  /**
   * 作业监控页面跳转
   */
  replaceRender = () => {
    setTimeout(() => {
      const { getMonthlyMileageData, changeSelectTree, changeCurrentDate, changeSelectDate } = this.props;
      const search = window.location.search;
      if (search) {
        const key = this.getUrlParams('key', search);
        const workType = this.getUrlParams('workType', search);
        const name = this.getUrlParams('name', search);
        const time = moment().startOf("day").format('YYYY-MM-DD HH:mm:ss');
        const startTime = moment().startOf("month").format('YYYYMMDD'), endTime = moment().endOf("month").format('YYYYMMDD');
        const id = key?.split('_')[0];

        const param = {
          monitorId: id,
          startTime: startTime,
          endTime: endTime
        }
        this.setState({
          parameter: { key, name }
        }, () => {
          changeSelectDate(null);
          changeSelectTree({ id, workType: workType == 'undefined' ? undefined : workType });// 切换当前选中的树节点
          getMonthlyMileageData(param);// 切换当前选中的树节点
          changeCurrentDate(time);// 切换当前日历面板
        });
      }
    }, 600)
  }


  /**
  * 获取页面url参数方法
  */
  getUrlParams(name: string, str: string) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = str.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
  }


  treeNodeClick = (node: { id: string; type: string, name: string }) => {
    console.log('node', node);
    if (node.type !== 'work') {
      const { getMonthlyMileageData, changeSelectTree, changeCurrentDate, changeSelectDate } = this.props;
      changeSelectTree(node);// 切换当前选中的树节点
      const startTime = moment().startOf("month").format('YYYYMMDD'), endTime = moment().endOf("month").format('YYYYMMDD');
      const param = {
        monitorId: node.id, //node.id,
        startTime: startTime,
        endTime: endTime
      }
      const time = { time: moment().startOf("day").format('YYYY-MM-DD HH:mm:ss') }
      changeSelectDate(null);
      getMonthlyMileageData(param);// 切换当前选中的树节点
      changeCurrentDate(JSON.parse(JSON.stringify(time)));// 切换当前日历面板
      this.setState({
        treeNodeName: node.name
      })
    }
  }
  render() {
    const { parameter, treeNodeName } = this.state;

    return (
      <>
        <div className={styles.trackDateTime}>
          <MonthTrack />
        </div>
        <div id='playbackLeftTree' className={styles.trackMonitorTree}>
          <LeftTree type='workPlayBack' checkName={treeNodeName} defaultValue={parameter} treeHeight={window.outerHeight - 600} treeNodeClick={this.treeNodeClick} />
        </div>
      </>
    )
  }
}

export default connect(
  null,
  dispatch => ({
    changeCurrentDate: (payload: INodeItem) => {
      dispatch({ type: 'workPlayTrack/changeCurrentDateEvery', payload });
    },
    changeSelectTree: (payload: INodeItem) => {
      dispatch({ type: 'workPlayTrack/changeSelectTreeEvery', payload });
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
    getMonthlyMileageData: (payload: Object) => {
      dispatch({ type: 'workPlayTrack/getMonthlyMileageEvery', payload });
    },
    changeSelectDate: (parload: INodeItem) => {
      dispatch({ type: 'workPlayTrack/changeSelectDateEvery', parload })
    },
    setMileageData: (data: Record<string, any>) => {
      dispatch({ type: 'workPlayTrack/setMileageData', data })
    }
  }),
)(IndexComponent);