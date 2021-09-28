import React, { useState } from 'react'
import { Calendar, Modal, message } from 'antd'
import { Moment } from 'moment'
import moment from 'moment'
import { connect } from 'react-redux'
import { AllState } from '@/model'
import {
  getMonitorShift,
  modifyShiftStatus,
  getLunar,
} from '@/server/workManagement'
import AddModal from './addModal/index'
import Header from './header'
import styles from './index.module.less'
import './fix.less'
interface IData {
  date: string //日期
  normalShift: number //正班上班 0
  restShift: number //正班调休 0
  askForLeaveShift: number //正班请假 0
  temporaryShift: number // 临班
  weekType: number // 星期几
}
const today = moment()

// 日历-日期格子点击事件
function calendarItemClick() {}

interface IProps {
  // isTemporary: boolean; //是否临班
  dataSource: any[] //排班列表
  enterpriseId: string //企业id
  sectionId: string //标段id
  workId: string // 作业对象id
  name: string //作业对象名字
  monitorId: string
  reload: Function
  setTimeStr: Function //设置日期
  workData: any[] //所有作业对象
  clickedDate: string
}
interface IState {
  addVisible: boolean
  dataSource: IData[]
  clickedDate: string //点击的日期
  modalValue: any
  schedulList: {
    //所有班次列表
    lastUpdateUser: string
    shifts: any[]
  }
  effectiveSchedulList: {
    //已生效所有班次列表
    lastUpdateUser: string
    shifts: any[]
  }
  lularData: any // 万年历数据
}

class WrapCalendar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      addVisible: false,
      dataSource: [],
      clickedDate: moment().format('YYYY-MM-DD'),
      modalValue: '',
      schedulList: {
        lastUpdateUser: '',
        shifts: [],
      },
      effectiveSchedulList: {
        lastUpdateUser: '',
        shifts: [],
      },
      lularData: '',
    }
  }
  timer: any = null //解决双击事件触发两次单击事件
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { dataSource, clickedDate } = nextProps
    if (dataSource && dataSource != this.props.dataSource) {
      this.setState({
        dataSource: dataSource,
      })
    }
    if (clickedDate != this.props.clickedDate) {
      this.renderRight(moment(clickedDate))
    }
  }
  handleDoubleClick = (date: Moment) => {
    clearTimeout(this.timer)
    this.setState({ clickedDate: date.format('YYYY-MM-DD') })
    const { sectionId, workId, monitorId } = this.props
    getMonitorShift({
      effectiveFlag: 1, //已生效数据
      sectionId: sectionId,
      shiftType: 2,
      time: moment(date).format('YYYYMMDD'),
      weekType: moment(date).day() == 0 ? 7 : moment(date).day(),
      workId: workId,
      monitorId: monitorId,
    }).then((data: any) => {
      if (data?.shifts?.length > 0) {
        this.setState({
          effectiveSchedulList: data,
        })
        this.setAddvisible(true)
      } else {
        message.warn('排班未生效不可调整')
      }
    })
  }
  // 渲染右侧内容
  renderRight = (date: Moment) => {
    clearTimeout(this.timer)
    const { sectionId, workId, monitorId } = this.props
    this.setState({ clickedDate: date.format('YYYY-MM-DD') })
    getLunar({ time: date.format('YYYYMMDD') }).then((value) => {
      this.setState({
        lularData: value,
      })
    })
    getMonitorShift({
      sectionId: sectionId,
      shiftType: 2,
      time: moment(date).format('YYYYMMDD'),
      weekType: moment(date).day() == 0 ? 7 : moment(date).day(),
      workId: workId,
      monitorId: monitorId,
    }).then((data: any) => {
      if (data) {
        this.setState({
          schedulList: data,
        })
      }
    })
  }
  //获取渲染内容
  getContent = (date: Moment) => {
    const value = date.format('YYYYMMDD')
    return this.state.dataSource.find((item: IData) => {
      return item.date == value
    })
  }
  dateFullCellRender = (date: Moment, setAddvisible: Function) => {
    const content = this.getContent(date)

    if (content) {
      if (date < today) {
        return (
          <div
            className={styles.item}
            style={
              moment(date, 'YYYYMMDD').format('YYYYMMDD') ==
              today.format('YYYYMMDD')
                ? { background: '#d1ffe5' }
                : {}
            }
            onClick={() => this.renderRight(date)}
          >
            {this.renderContent(content)}
          </div>
        )
      }
      //有排班内容时
      if (
        content.normalShift ||
        content.restShift ||
        content.askForLeaveShift ||
        content.temporaryShift
      ) {
        return (
          <div
            className={styles.item}
            style={
              moment(date, 'YYYYMMDD').format('YYYYMMDD') ==
              today.format('YYYYMMDD')
                ? { background: '#d1ffe5' }
                : {}
            }
            onClick={() => {
              clearTimeout(this.timer)
              this.timer = setTimeout(() => this.renderRight(date), 300)
            }}
            onDoubleClick={() => this.handleDoubleClick(date)}
          >
            {this.renderContent(content)}
          </div>
        )
      } else {
        //没有排班内容时
        return (
          <div
            className={styles.item}
            style={
              moment(date, 'YYYYMMDD').format('YYYYMMDD') ==
              today.format('YYYYMMDD')
                ? { background: '#d1ffe5' }
                : {}
            }
            onClick={() => this.renderRight(date)}
          >
            {this.renderContent(content)}
          </div>
        )
      }
    } else {
      if (date < today) {
        return (
          <div
            className={styles.item}
            style={
              moment(date, 'YYYYMMDD').format('YYYYMMDD') ==
              today.format('YYYYMMDD')
                ? { background: '#d1ffe5' }
                : {}
            }
          >
            {date.date()}
          </div>
        )
      }
      return (
        <div
          className={styles.item}
          style={
            moment(date, 'YYYYMMDD').format('YYYYMMDD') ==
            today.format('YYYYMMDD')
              ? { background: '#d1ffe5' }
              : {}
          }
        >
          {date.date()}
        </div>
      )
    }
  }
  handleSubmit = async () => {
    const { sectionId, workId } = this.props
    const data = this.state.modalValue.map((item: any) => {
      return {
        sectionId,
        workId,
        time: moment(this.state.clickedDate).format('YYYYMMDD'),
        weekType: moment(this.state.clickedDate).day(),
        ...item,
      }
    })
    this.setAddvisible(false)
    const res = await modifyShiftStatus(data)
    if (res) {
      message.success('修改成功')
      this.renderRight(moment(this.state.clickedDate))
      this.props.reload()
    }
  }
  renderContent = (content: IData) => {
    const {
      date,
      normalShift,
      restShift,
      askForLeaveShift,
      temporaryShift,
      // weekType,
    } = content
    return (
      <div>
        {moment(date, 'YYYYMMDD').date()}
        <div className={styles.popover}>
          <p
            className={styles.p1}
            style={normalShift == 0 ? { visibility: 'hidden' } : {}}
          >
            班
          </p>
          <p
            className={styles.p2}
            style={askForLeaveShift == 0 ? { visibility: 'hidden' } : {}}
          >
            假
          </p>
          <p
            className={styles.p3}
            style={restShift == 0 ? { visibility: 'hidden' } : {}}
          >
            休
          </p>
          <p
            className={styles.p4}
            style={temporaryShift == 0 ? { visibility: 'hidden' } : {}}
          >
            临
          </p>
        </div>
      </div>
    )
  }
  //设置模态框值到state
  setModalValue = (value: any) => {
    this.setState({
      modalValue: value,
    })
  }
  //新增抽屉
  setAddvisible = (value: boolean) => {
    this.setState({
      addVisible: value,
    })
  }

  render() {
    const { workId, sectionId } = this.props
    const { addVisible, lularData } = this.state
    return (
      <>
        <Calendar
          className={styles.calendar}
          style={{ display: 'flex' }}
          headerRender={({ value, type, onChange }) => (
            <Header
              setTimeStr={this.props.setTimeStr}
              value={value}
              type={type}
              onChange={onChange}
              date={this.state.clickedDate}
              workId={workId}
              sectionId={sectionId}
              schedulList={this.state.schedulList}
              groupBy={1}
              lularData={lularData}
            />
          )}
          dateFullCellRender={(date: Moment) =>
            this.dateFullCellRender(date, this.setAddvisible)
          }
        />
        <Modal
          title="班次调整"
          visible={addVisible}
          onOk={() => {
            this.handleSubmit()
          }}
          width={600}
          onCancel={() => this.setAddvisible(false)}
          okText="提交"
          cancelText="取消"
        >
          <AddModal
            schedulList={this.state.effectiveSchedulList}
            name={this.props.name}
            workData={this.props.workData}
            date={this.state.clickedDate}
            setModalValue={(value: any) => {
              this.setModalValue(value)
            }}
          />
        </Modal>
      </>
    )
  }
}
export default connect((state: AllState) => ({
  clickedDate: state.schedulCalendar.clickedDate,
}))(WrapCalendar)
