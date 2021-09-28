/**
 * 右上角作业内容模块
 */
import React, { Component } from "react";
import { Empty } from 'antd'

import { RiseOutlined } from "@ant-design/icons";

import styles from '../index.module.less';
import { connect } from "react-redux";
import { AllState } from "@/model";
import { requestWorkObjects } from '@/server/workMonitoring'
import { INodeItem } from "@/model/workMonitoring";

interface IProps {
  itemClick: Function,
}
interface IState {
  menuVisible: boolean,
  workObjects: any[],
  active: number | string | undefined,
}
class Index extends Component<IProps, IState, any>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      menuVisible: true,// 作业内容显示隐藏
      workObjects: [],
      active: 0
    }
  }

  UNSAFE_componentWillReceiveProps = (nextProps: any) => {
    const { workObjectData, currentSelectDate } = nextProps;

    if (!currentSelectDate || !workObjectData) {
      this.setState({
        menuVisible: true,
        workObjects: [],
        active: 0
      });
      return false;
    }

    if (!workObjectData) return false;
    this.setState({
      workObjects: workObjectData
    })
  }

  changeMenuVisible = () => {
    const { menuVisible } = this.state;
    this.setState({
      menuVisible: !menuVisible,
    })
  }

  handleWorkObjectVisible = (str: any, index: number, key: number) => {
    const { itemClick } = this.props;
    const { active } = this.state;
    itemClick && itemClick(str, index);
    if (active === undefined) {
      this.setState({
        active: key
      })
    } else {
      this.setState({
        active: undefined
      })
    }
  }

  renderWorkObject = (data: any[]) => {
    const { active } = this.state;
    if (data && data.length) {
      return (
        data.map((item, index) => {
          return <li key={item.name} className={active === index ? styles.activeColor : null}
            onClick={() => this.handleWorkObjectVisible(item.fenceLongLat, item.name, index)}><RiseOutlined /> {item.name}</li>
        })
      )
    }
  }

  render() {
    const { menuVisible, workObjects } = this.state;

    if (!workObjects || !workObjects.length) {
      return null;
    }
    return <div className={styles.workContentBox}>
      <h3 onClick={this.changeMenuVisible}>作业内容</h3>
      <div className={[styles.workContent, !menuVisible ? styles.hideMenu : ''].join(' ')}>
        {
          workObjects.length != 0 ?
            <ul>
              {this.renderWorkObject(workObjects)}
            </ul>
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
      </div>
    </div>
  }
}

export default connect(
  (state: AllState) => ({
    currentSelectDate: state.workPlayTrack.currentSelectDate,
    workObjectData: state.workPlayTrack.workObjectData,
  }),
  dispatch => ({
    getOrgTreeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getOrgTreeDataEvery', payload });
    }
  }),
)(Index);