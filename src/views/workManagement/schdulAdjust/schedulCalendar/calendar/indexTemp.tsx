import React from 'react'
import { Calendar, Modal, message } from 'antd'
import { connect } from 'react-redux'
import { AllState } from '@/model'
import { Moment } from 'moment'
import moment from 'moment'
import ContextMenu from './contextMenu'
import { getWorkShift, clearTemporary, getLunar } from '@/server/workManagement'
import Header from './header'
import styles from './index.module.less'
import './fix.less'
import TemporarySchedul from './temporarySchedul'
import { StateType } from '@/model/schedulCalendar'
interface IData {
  date: string //日期
  normalShift: number //正班上班 0
  restShift: number //正班调休 0
  askForLeaveShift: number //正班请假 0
  temporaryShift: number // 临班
  weekType: number // 星期几
}
const today = moment()

const cureentId = 1

// 日历-日期格子点击事件
function calendarItemClick() {}

interface IProps {
  // isTemporary: boolean; //是否临班
  dataSource: any[] //排班列表
  enterpriseId: string //企业id
  sectionId: string //标段id
  workId: string // 作业对象id
  name: string //作业对象名字
  monitorId: string //作业对象id
  setTimeStr: Function //设置日期
  dispatch: (action: { type: string; payload: Partial<StateType> }) => void
  reload: Function
  canTemp: boolean //能否设置临班
  clickedDate: string
}
interface IState {
  addVisible: boolean
  temporaryDrawer: boolean
  dataSource: IData[]
  clickedDate: string //点击的日期
  modalValue: any
  closeContextMenu: boolean
  schedulList: {
    lastUpdateUser: string
    shifts: any[]
  }
  normalSchedulList: {
    //正班数据
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
      temporaryDrawer: false,
      dataSource: [],
      clickedDate: moment().format('YYYY-MM-DD'),
      modalValue: '',
      closeContextMenu: false,
      schedulList: {
        lastUpdateUser: '',
        shifts: [],
      },
      normalSchedulList: {
        lastUpdateUser: '',
        shifts: [],
      },
      lularData: '',
    }
  }
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
  getContent = (date: Moment) => {
    const value = date.format('YYYYMMDD')
    return this.state.dataSource.find((item: IData) => {
      return item.date == value
    })
  }
  //清除临班
  clearTemp = async () => {
    const { sectionId, workId } = this.props
    const params = {
      sectionId: sectionId,
      time: moment(this.state.clickedDate).format('YYYYMMDD'),
      workId: workId,
    }
    this.setState({
      closeContextMenu: true,
    })
    const data = await clearTemporary(params)
    if (data) {
      message.success('清除成功')
      this.props.reload()
      this.setState({
        closeContextMenu: false,
      })
    }
  }
  // 渲染右侧内容
  renderRight = (date: Moment) => {
    const { sectionId, workId } = this.props
    this.setState({ clickedDate: date.format('YYYY-MM-DD') })
    this.props.dispatch({
      type: 'schedulCalendar/setBaseData',
      payload: {
        clickedDate: date.format('YYYYMMDD'),
      },
    })
    getLunar({ time: date.format('YYYYMMDD') }).then((value) => {
      this.setState({
        lularData: value,
      })
    })
    getWorkShift({
      sectionId: sectionId,
      shiftType: 2,
      time: moment(date).format('YYYYMMDD'),
      weekType: moment(date).day() == 0 ? 7 : moment(date).day(),
      workId: workId,
    }).then((data: any) => {
      if (data) {
        this.setState({
          schedulList: data,
        })
      }
    })
  }
  dateFullCellRender = (date: Moment, setTemporaryDrawer: Function) => {
    const content = this.getContent(date)
    if (content) {
      if (date < today) {
        return (
          <div className={styles.item} onClick={() => this.renderRight(date)}>
            {this.renderContent(content)}
          </div>
        )
      }
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
            onClick={() => this.renderRight(date)}
            onContextMenu={() => {
              this.setState({ clickedDate: date.format('YYYY-MM-DD') })
              if (!this.props.canTemp) {
                message.warn('当前作业对象未审核生效')
              }
              this.props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                  clickedDate: date.format('YYYYMMDD'),
                },
              })
              this.props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                  time: date.format('YYYYMMDD'),
                  weekType: date.day() == 0 ? 7 : date.day(),
                },
              })
            }}
          >
            {this.props.canTemp ? (
              <ContextMenu close={this.state.closeContextMenu}>
                <div
                  className={styles.menu}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p onClick={() => this.clearTemp()}>清除临班</p>
                  <p onClick={() => setTemporaryDrawer(true)}>设置临班</p>
                </div>
              </ContextMenu>
            ) : null}

            {this.renderContent(content)}
          </div>
        )
      } else {
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
            onContextMenu={() => {
              this.setState({ clickedDate: date.format('YYYY-MM-DD') })
              if (!this.props.canTemp) {
                message.warn('当前作业对象为审核生效')
              }
              this.props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                  clickedDate: date.format('YYYYMMDD'),
                },
              })
              this.props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                  time: date.format('YYYYMMDD'),
                  weekType: date.day() == 0 ? 7 : date.day(),
                },
              })
            }}
          >
            {this.props.canTemp ? (
              <ContextMenu>
                <div
                  className={styles.menu}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p onClick={() => setTemporaryDrawer(true)}>设置临班</p>
                </div>
              </ContextMenu>
            ) : null}

            {this.renderContent(content)}
          </div>
        )
      }
    } else {
      if (date < today) {
        return <div className={styles.item}>{date.date()}</div>
      }
      return (
        <div className={styles.item}>
          <ContextMenu>
            <div className={styles.menu}>
              <p onClick={() => setTemporaryDrawer(true)}>设置临班</p>
            </div>
          </ContextMenu>
          {date.date()}
        </div>
      )
    }
  }
  handleSubmit = () => {
    const { sectionId, workId } = this.props
    const data = {
      sectionId,
      workId,
      time: this.state.clickedDate,
      weekType: moment(this.state.clickedDate).day(),
    }
    this.setAddvisible(false)
    console.log(data)
    console.log(this.state.modalValue)
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
  reGetData = () => {
    this.setTemporaryDrawer(true)
  }

  //设置临班抽屉
  setTemporaryDrawer = async (value: boolean) => {
    const { sectionId, workId } = this.props
    this.setState({
      temporaryDrawer: value,
    })
    const { enterpriseId, monitorId } = this.props
    const [data1, data2, data3]: any = await Promise.all([
      getWorkShift({
        sectionId: sectionId,
        shiftType: 0,
        shiftTime: '', //为空时获取所有
        time: moment(this.state.clickedDate).format('YYYYMMDD'),
        weekType: moment(this.state.clickedDate).day(),
        workId: workId,
      }),
    ])
    if (data1) {
      this.setState({
        normalSchedulList: data1,
      })
    }
  }
  componentDidMount() {
    getLunar({ time: moment().format('YYYYMMDD') }).then((value) => {
      this.setState({
        lularData: value,
      })
    })
  }
  render() {
    const { workId, sectionId } = this.props
    const { temporaryDrawer, lularData } = this.state

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
              lularData={lularData}
            />
          )}
          dateFullCellRender={(date: Moment) =>
            this.dateFullCellRender(date, this.setTemporaryDrawer)
          }
        />
        {/* 新增、修改 抽屉 */}
        {temporaryDrawer !== undefined && (
          <TemporarySchedul
            normalSchedulList={this.state.normalSchedulList}
            visible={temporaryDrawer}
            closeDrawer={() =>
              this.setState({
                temporaryDrawer: false,
              })
            }
            reload={this.props.reload}
            reGetData={this.reGetData}
          />
        )}
      </>
    )
  }
}

export default connect((state: AllState) => ({
  monitorId: state.schedulCalendar.monitorId,
  canTemp: state.schedulCalendar.canTemp,
  clickedDate: state.schedulCalendar.clickedDate,
}))(WrapCalendar)
