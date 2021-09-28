/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import React, { memo, useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useSelector, shallowEqual } from 'react-redux';
import moment, { Moment } from 'moment'
import { AllState } from '@/model';
import { IMileageItem } from '@/model/workTrack'
import DatePickerModule from '../calendarPanel'
import styles from './index.module.less';
const formatTime = (date: any) => {
  return moment(date).format('YYYY-MM-DD');
};
interface ISelector {
  workPlayTrack: any;
};
interface IProps {
  intl: any;
  changeSelectDate: Function;
  getHistoryData: Function;
  getMonthlyMileageData: Function;
  // refreshData: Function;
}
const Index = memo((props: IProps) => {
  const [monthlyMileage, setMonthlyMileage] = useState<IMileageItem[]>([]);
  const [monitorId, setMonitorId] = useState(null);
  const [datePickerValue, setDatePickerValue] = useState<any>('');
  const modeRef = useRef<string>("date");
  const {
    mileageData,
    currentSelectTreeNode,
    currentDate
  } = useSelector(({
    workPlayTrack: { mileageData, currentSelectTreeNode, currentDate }
  }: ISelector) => {
    return {
      mileageData,
      currentSelectTreeNode,
      currentDate
    };
  }, shallowEqual);
  /**
     * 添加海量点数据
     */
  useEffect(() => {
    if (mileageData) {
      setDatePickerValue('');
      for (let i = 0; i < mileageData.length; i++) {
        const day = mileageData[i].day;
        if (day == moment(currentDate.time).format('YYYYMMDD')) {
          setDatePickerValue(moment(currentDate.time));
          break;
        }
      }

      setMonthlyMileage(mileageData);
    }
    if (currentSelectTreeNode && currentSelectTreeNode.id) {
      setMonitorId(currentSelectTreeNode.id);
    }
  }, [mileageData, currentSelectTreeNode]);


  // 日期选择框dom  初始化
  function calendarRender(current: Moment) {
    const style = {};
    const day = current.date();
    const month = current.month() + 1;
    const year = current.year();

    if (!monthlyMileage || !monthlyMileage.length) return (
      <div className="ant-picker-cell-inner empty" style={style}>
        {day}
        <div className={styles['date-mileage']}>-</div>
      </div>);

    let mileage = 0;

    for (let i = 0, len = monthlyMileage.length; i < len; i++) {
      const _day = parseInt(monthlyMileage[i].day.substring(6, 8));
      const _month = parseInt(monthlyMileage[i].day.substring(5, 6));
      const _year = parseInt(monthlyMileage[i].day.substring(0, 4));

      if (_day == day && _month === month && _year == year) {
        mileage = monthlyMileage[i].gpsMile;
        break;
      } else {
        mileage = -1;
      }
    }
    // const hasMileage = mileage && mileage != 0;
    const hasMileage = mileage != -1

    return (
      <div className={[['ant-picker-cell-inner'], hasMileage ? ['hasMileage'] : ''].join(' ')} style={style}>
        {day}
        <div className={styles['date-mileage']}>{hasMileage && mileage >= 0 ? mileage : '-'}</div>
      </div>)
  }
  /**
   * 时间不可选择
   */
  function hanleDisabledDate(date: Moment) {
    let flag = false;
    const now = formatTime(date);
    if (monthlyMileage.length) {
      for (let i = 0, len = monthlyMileage.length; i < len; i++) {
        const d = now.split("-"), day = d[2], month = d[1], year = d[0];
        const _day = monthlyMileage[i].day.substring(6, 8);
        const _month = monthlyMileage[i].day.substring(4, 6)
        const _year = monthlyMileage[i].day.substring(0, 4)
        if (day == _day && month == _month && year == _year) {
          flag = true;
          break;
        }
      }
    }

    if (modeRef.current == 'year' || modeRef.current == 'month') flag = true;

    return !flag;
  }
  /**
   * 日历面板变化事件
   */
  function onPanelChange(date: Moment, mode: string) {
    modeRef.current = mode
    if (mode === 'year') return false;
    if (monitorId) {
      const startTime = moment(date).startOf('month').format("YYYYMMDD"), endTime = moment(date).endOf('month').format("YYYYMMDD");
      const { getMonthlyMileageData } = props;
      const param = {
        monitorId: monitorId, //monitorId,
        startTime,
        endTime
      }

      getMonthlyMileageData(param);
    }
  }
  /**
   * 日历点击事件
   * @param date 
   */
  function onCalendarChange(date: Moment) {
    const { changeSelectDate } = props;
    const startTime = moment(date).format('YYYY-MM-DD') + ' 00:00:00';
    const endTime = moment(date).format('YYYY-MM-DD') + ' 23:59:59';
    changeSelectDate({ startTime, endTime });
  }

  return (
    <div className={styles['trackPlayback-dateTime']}>
      <DatePickerModule
        value={datePickerValue}
        onPanelChange={onPanelChange}
        onSelect={onCalendarChange}
        dateRender={calendarRender}
        disabledDate={hanleDisabledDate}
      />
    </div>
  )
})
export default connect(
  (state: AllState) => ({
    currentDate: state.workPlayTrack.currentDate,
    mileageData: state.workPlayTrack.mileageData,
    currentSelectTreeNode: state.workPlayTrack.currentSelectTreeNode
  }),
  dispatch => ({
    changeSelectDate: (payload: any) => {
      dispatch({ type: 'workPlayTrack/changeSelectDateEvery', payload });
    },
    getHistoryData: (payload: Object) => {
      dispatch({ type: 'workPlayTrack/getHistoryDataEvery', payload });
    },
    getMonthlyMileageData: (payload: Object) => {
      dispatch({ type: 'workPlayTrack/getMonthlyMileageEvery', payload });
    },
    // refreshData: (payload: any) => {
    //   dispatch({ type: 'workPlayTrack/refreshData', payload })
    // }
  })
)(injectIntl(Index))
