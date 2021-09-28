import React, { useEffect, useState } from 'react'
import { Select, Col, Row } from 'antd'
import { Moment } from 'moment'
import { connect } from 'react-redux'
import moment from 'moment'
import styles from './index.module.less'
import { StateType } from '@/model/schedulCalendar'
const { Option } = Select
interface IProps {
  value: Moment
  type: string
  onChange: Function
  date: string
  sectionId: string
  workId: string
  schedulList: {
    lastUpdateUser: string
    shifts: any[]
  }
  setTimeStr: Function
  groupBy?: 0 | 1 //通过什么归类  0 通过班次时间归类 1 通过作业对象名字归类
  lularData: any //万年历数据
  dispatch: (action: { type: string; payload: Partial<StateType> }) => void
}

const Header = (props: IProps) => {
  const { value, onChange, date, schedulList, setTimeStr, groupBy } = props
  useEffect(() => {
    return setTimeStr(moment().format('YYYY-MM'))
  })
  const renderShiftStatus = (value: number) => {
    switch (value) {
      case 0:
        return <span style={{ color: '#00c53d' }}>上班</span>
      case 1:
        return <span style={{ color: '#0071e6' }}>调休</span>
      case 2:
        return <span style={{ color: '#ac00c1' }}>请假</span>
    }
  }
  const renderList = (data: any) => {
    const level1: any[] = []
    for (let key in handledSchedulList) {
      const ss = React.createElement(
        'div',
        {
          key: Math.random(),
        },
        <>
          <p className={styles.title}>{handledSchedulList[key][0]?.name}</p>
          <ul>
            {handledSchedulList[key].map((item: any) => {
              return (
                <li>
                  {groupBy == 1 ? (
                    <>
                      <div
                        style={
                          item?.data?.shiftStatus != 0
                            ? { color: '#afafaf' }
                            : {}
                        }
                      >
                        <span>{item?.data?.shiftName}</span>
                      </div>
                      <div
                        style={
                          item?.data?.shiftStatus != 0
                            ? { color: '#afafaf' }
                            : {}
                        }
                      >
                        {item?.data?.shiftTime}
                      </div>
                      <div>
                        <span style={{ color: '#ac00c1' }}>
                          {renderShiftStatus(item?.data?.shiftStatus)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span>{item?.data?.monitorName}</span>
                      </div>
                      <div>{renderStatus(item?.data?.shiftType)}</div>
                      <div>
                        <span>{item?.data?.monitorCategoryStr}</span>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )
      level1.push(ss)
    }
    return level1
  }
  const handledSchedulList: any = {} //通过班次时间归类
  if (groupBy == 1) {
    schedulList.shifts.forEach((item: any) => {
      if (!handledSchedulList[item.workName]) {
        handledSchedulList[item.workName] = []
      }
    })
    for (let key in handledSchedulList) {
      schedulList.shifts.forEach((item: any) => {
        if (key == item.workName) {
          handledSchedulList[item.workName].push({
            name: item.workName,
            data: item,
          })
        }
      })
    }
  } else {
    schedulList.shifts.forEach((item: any) => {
      if (!handledSchedulList[item.shiftTime]) {
        handledSchedulList[item.shiftTime] = []
      }
    })
    for (let key in handledSchedulList) {
      schedulList.shifts.forEach((item: any) => {
        if (key == item.shiftTime) {
          handledSchedulList[item.shiftTime].push({
            name: item.shiftTime,
            data: item,
          })
        }
      })
    }
  }
  // console.log('handledSchedulList', handledSchedulList);
  const [year, setYear] = useState(moment().year())
  const [month, setMonth] = useState(moment().month() + 1)
  const momentData = moment()
  const currentYear = momentData.year()
  const startDate = momentData.clone().subtract(1, 'month') //当前月往前一个月的moment对象
  const endDate = momentData.clone().add(10, 'month') //当前月往后10个月的moment对象
  //这样计算后 加上当前月，刚好12个月
  const startYear = startDate.year() //从0开始
  const startMonth = startDate.month()
  const endYear = endDate.year()
  const endMonth = endDate.month()
  const yearList = []
  const monthList = []
  if (startYear == endYear) {
    //前一个月年份和后10个月年份在同一年，那么当前月份只能是二月份
    yearList.push(currentYear)
    for (let i = 0; i < 12; i++) {
      monthList.push(i)
    }
  } else if (startYear == currentYear) {
    //前一个月的年份等于当前月份所在年份
    yearList.push(currentYear, currentYear + 1)
    if (year == currentYear) {
      for (let i = startMonth; i < 12; i++) {
        monthList.push(i)
      }
    } else {
      for (let i = 0; i < endMonth + 1; i++) {
        monthList.push(i)
      }
    }
  } else if (startYear <= currentYear) {
    //前一个月的年份小于当前月份所在年份
    yearList.push(currentYear - 1, currentYear)
    if (year == currentYear - 1) {
      monthList.push(12)
    } else {
      for (let i = 0; i < 11; i++) {
        monthList.push(i)
      }
    }
  }

  const monthString: string[] = []
  for (let i = 0; i < 12; i++) {
    monthString.push(`${i + 1}月`)
  }

  const renderStatus = (value: number) => {
    if (value == 0) {
      return <span className={styles.status1}>正班</span>
    } else {
      return (
        <span className={styles.status2} style={{ color: 'red' }}>
          临班
        </span>
      )
    }
  }
  return (
    <div className={styles.box}>
      <Row gutter={8} className={styles.dateselect}>
        <Col>
          <Select
            size="small"
            dropdownMatchSelectWidth={false}
            className={styles.select}
            onChange={(newYear) => {
              const now = value.clone().year(newYear)
              setYear(newYear)
              if (newYear < year) {
                setMonth(12)
                setTimeStr(moment(`${newYear}-12`).format('YYYY-MM'))
              } else if (newYear > year) {
                setMonth(1)
                setTimeStr(moment(`${newYear}-01`).format('YYYY-MM'))
              } else {
                setTimeStr(now.format('YYYY-MM'))
              }
              props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                  clickedDate: now.format('YYYYMM') + '01',
                },
              })
              onChange(now)
            }}
            value={year}
          >
            {yearList.map((item) => {
              return (
                <Select.Option key={item} value={item} className="year-item">
                  {item}
                </Select.Option>
              )
            })}
          </Select>
        </Col>
        <Col>
          <Select
            size="small"
            dropdownMatchSelectWidth={false}
            className={styles.select}
            value={String(month) + '月'}
            onChange={(selectedMonth) => {
              const newValue = value.clone()
              newValue.month(parseInt(selectedMonth, 10))
              setMonth(parseInt(selectedMonth, 10) + 1)
              setTimeStr(newValue.format('YYYY-MM'))
              if (moment().format('YYYY-MM') == newValue.format('YYYY-MM')) {
                //当前月
                props.dispatch({
                  type: 'schedulCalendar/setBaseData',
                  payload: {
                    clickedDate: moment().format('YYYYMMDD'),
                  },
                })
              } else {
                props.dispatch({
                  type: 'schedulCalendar/setBaseData',
                  payload: {
                    clickedDate: newValue.format('YYYYMM') + '01',
                  },
                })
              }

              onChange(newValue)
            }}
          >
            {monthList.map((item) => {
              return (
                <Option key={item} value={item}>
                  {monthString[item]}
                </Option>
              )
            })}
          </Select>
        </Col>
      </Row>
      <Row className={styles.date}>
        <p className={styles.d1}>
          {date} {moment(date).format('dddd')}
        </p>
        <p className={styles.d2}>{moment(date).date()}</p>
        {props.lularData ? (
          <>
            <p
              className={styles.d3}
            >{`${props.lularData?.oldMonthChinese}月${props.lularData?.oldDayChinese}`}</p>
            <p className={styles.d4}>
              <span>{`${props.lularData?.gzYear}【${props.lularData?.zodiac}年】`}</span>
              <span>{`${props.lularData?.gzMonth}月 ${props.lularData?.gzDay}日`}</span>
            </p>
          </>
        ) : null}
      </Row>
      <div className={styles.paiban}>{renderList(handledSchedulList)}</div>
      <p className={styles.operator}>
        操作员：<span>{schedulList.lastUpdateUser}</span>
      </p>
    </div>
  )
}
export default connect()(Header)
