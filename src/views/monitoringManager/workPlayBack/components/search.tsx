/**
 * 右上角作业内容模块
 */
import React, { Component } from "react";
import { Form, Button, DatePicker } from 'antd'
const { RangePicker } = DatePicker;
import moment, { Moment } from 'moment'
import { SearchOutlined } from "@ant-design/icons";

import styles from '../index.module.less';
import { connect } from "react-redux";
import { AllState } from "@/model";
import { INodeItem } from "@/model/workMonitoring";

interface IProps {
  onInquire: Function,
}
interface IState {
  iVisible: boolean,
  dates: any,
  dateStrings: any,
  initialValue: [Moment, Moment],
}
class Index extends Component<IProps, IState, any>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      iVisible: false,// 显示隐藏
      dates: undefined,
      dateStrings: false,
      initialValue: [moment().startOf('day'), moment()]
    }
  }

  // componentDidMount = () => {
  // const start = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"), end = moment().format("YYYY-MM-DD HH:mm:ss");
  // this.setState({
  //   dateStrings: [start, end]
  // })
  // }

  // UNSAFE_componentWillReceiveProps(nextProps: any) {
  //   const { currentSelectDate } = nextProps;
  //   if (currentSelectDate) {
  // const start = moment(currentSelectDate).startOf("day"), end = moment(currentSelectDate);
  // this.setState({
  //   dates: [start, end]
  // })
  // }
  // }

  changeIVisible = () => {
    const { iVisible } = this.state;
    this.setState({
      iVisible: !iVisible
    })
  }

  disabledDate = (current: moment.Moment) => {
    const { dates } = this.state;
    if (!dates) return false;
    const tooLate = dates[0] !== null && current.diff(dates[0], 'days') > 6;
    const tooEarly = dates[1] !== null && (dates[1] as any).diff(current, 'days') > 6;
    return tooEarly || tooLate;
  }

  handleDatetimeChange = (dates: [Moment, Moment], dateStrings: [string, string]) => {
    this.setState({
      dates,
      dateStrings
    })
  }

  onHandleInquire = () => {
    const { onInquire } = this.props;
    const { dateStrings } = this.state;
    if (dateStrings[0] && dateStrings[1]) {
      onInquire && onInquire(dateStrings);
    }
  }

  render() {
    const { iVisible, initialValue } = this.state;
    return <div className={styles.trackDatetimeSearch}>
      <div className={[styles.searchForm, !iVisible ? styles.hideMenu : ''].join(' ')}>
        <Form className={styles.searchFormContainer}>
          <Form.Item name="trackDatetime" initialValue={initialValue}>
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" disabledDate={this.disabledDate} onCalendarChange={this.handleDatetimeChange} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={this.onHandleInquire}>
              查询
            </Button>
          </Form.Item>
        </Form>
      </div>
      <Button type="primary" className={styles.trackDatetimeSearchBtn} onClick={this.changeIVisible}>
        <SearchOutlined />
        查
        询
      </Button>
    </div>
  }
}

export default connect(
  (state: AllState) => ({
    currentSelectDate: state.workPlayTrack.currentSelectDate,
  }),
  dispatch => ({
    getOrgTreeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getOrgTreeDataEvery', payload });
    }
  }),
)(Index);