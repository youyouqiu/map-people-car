import React, { useEffect } from 'react'
import { FolderOutlined } from '@ant-design/icons'
import { Button, message, Pagination } from 'antd'
import { getMonitorShiftList, undoShift } from '@/server/workManagement'
import styles from './table.module.less'
import List from './list'

interface IParams {
  // enterpriseId: string;
  sectionId: string
  workId: string
}
interface IProps {
  params: IParams
  enterpriseId: string //企业id
  sectionId: string //标段id
  workId: string //作业id
  type: string //类型 work 机动组 monitor 监控对象
}

interface IState {
  schedulList: any[] // 排班列表信息
  workType: string // 作业类型
  reviewStatus: number // 审核状态
  motorizedInfo: { totalNum: number; shiftMonitorNum: number } // 机动组人数信息
  modeInfo: any[] // 作业模式信息
  workName: string // 作业名称
  page: number
  pageSize: number
  total: number
}

class SchedulTable extends React.Component<IProps, IState> {
  // const { params } = this.props;
  today = new Date().getDay()
  constructor(props: IProps) {
    super(props)
    this.state = {
      schedulList: [],
      workType: '',
      reviewStatus: 0,
      motorizedInfo: { totalNum: 0, shiftMonitorNum: 0 },
      modeInfo: [],
      workName: '',
      page: 1,
      pageSize: 10,
      total: 0,
    }
  }
  //撤销申请
  cancelShift = async () => {
    const { sectionId, workId } = this.props
    const data = await undoShift<boolean>({
      sectionId: sectionId,
      workId: workId,
    })
    if (data) {
      message.success('撤销成功')
      this.reload()
    }
  }
  //reload
  reload = async () => {
    const { params } = this.props
    const data = await getMonitorShiftList<any>(params)
    if (data) {
      const res = this.parserSchedul(data.monitorShiftRespList)
      this.setState({
        modeInfo: data.modeInfo,
        motorizedInfo: data.motorizedInfo,
        schedulList: res,
        reviewStatus: data.reviewStatus,
        workName: data.workName,
        // total: data.motorizedInfo?.totalNum,
        total: data.monitorShiftRespList.length,
      })
    }
  }
  //解析排班数据
  parserSchedul = (raw: any) => {
    const newData: any[] = []
    if (Array.isArray(raw)) {
      raw.forEach((item: any) => {
        const monday = item.mondayShow ? item.mondayShow : []
        const tuesdayShow = item.tuesdayShow ? item.tuesdayShow : []
        const wednesdayShow = item.wednesdayShow ? item.wednesdayShow : []
        const thursdayShow = item.thursdayShow ? item.thursdayShow : []
        const fridayShow = item.fridayShow ? item.fridayShow : []
        const saturdayShow = item.saturdayShow ? item.saturdayShow : []
        const sundayShow = item.sundayShow ? item.sundayShow : []
        // if (item.id) {
        newData.push({
          ...item,
          schedul: [
            [...monday],
            [...tuesdayShow],
            [...wednesdayShow],
            [...thursdayShow],
            [...fridayShow],
            [...saturdayShow],
            [...sundayShow],
          ],
        })
        // }
      })
    }
    return newData
  }
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { params, workId } = nextProps
    if (this.props.workId != workId || params != this.props.params) {
      if (params.sectionId) {
        ;(async () => {
          const data = await getMonitorShiftList<any>(params)
          if (data) {
            const res = this.parserSchedul(data.monitorShiftRespList)
            this.setState({
              modeInfo: data.modeInfo,
              motorizedInfo: data.motorizedInfo,
              schedulList: res,
              workName: data.workName,
              reviewStatus: data.reviewStatus,
              page: 1,
              total: data.monitorShiftRespList.length || 0,
            })
          }
        })()
      }
    }
  }

  renderStatus(status: number) {
    if (status == 0)
      return (
        <p className={styles.tobepass}>
          当前排班待审核
          <Button
            type="link"
            onClick={() => {
              this.cancelShift()
            }}
            style={{ padding: 0, marginLeft: '5px' }}
          >
            撤销申请
          </Button>
        </p>
      )
    if (status == 1) return <p className={styles.pass}>排班审核通过</p>
    return (
      <p className={styles.nopass}>
        当前排班审核不通过
        <Button
          type="link"
          onClick={() => {
            this.cancelShift()
          }}
          style={{ padding: 0, marginLeft: '5px' }}
          disabled={!this.props.sectionId && !this.props.workId}
        >
          撤销申请
        </Button>
      </p>
    )
  }

  onPageChange = (page: number, pageSize: number) => {
    this.setState({
      page,
      pageSize,
    })
  }
  onShowSizeChange = (current: number, size: number) => {
    this.setState({
      page: current,
      pageSize: size,
    })
  }

  getReviewStatus = () => {
    return this.state.schedulList.every(item => item.passFlag == 1) ? 1 : 0
  }
  render() {
    const {
      motorizedInfo,
      schedulList,
      workType,
      workName,
      page,
      pageSize,
      total,
      modeInfo
    } = this.state
    const { sectionId, workId, enterpriseId, type } = this.props
    return (
      <div>
        <div className={styles.head}>
          <div className={styles.p1} style={{flexShrink: 0,marginRight: '40px'}}>
            <FolderOutlined style={{ marginRight: '5px' }} />
            {this.state.workName}
            {this.state.workName != '机动组'
              // ? this.renderStatus(this.state.reviewStatus)
              ? this.renderStatus(this.getReviewStatus())
              : null}
          </div>
          <p className={styles.p1} style={{width: '100%', overflow: 'auto hidden'}}>
            {this.state.workName == '机动组' ? (
              <>
                <span style={{flexShrink: 0, marginLeft: 'auto'}}>作业模式:</span>
                <span style={{ margin: '0 15px' }}>
                  <span
                    style={
                      motorizedInfo.shiftMonitorNum >= motorizedInfo.totalNum
                        ? { color: '#16b913' }
                        : {}
                    }
                  >
                    ({motorizedInfo.shiftMonitorNum}/{motorizedInfo.totalNum})
                  </span>
                </span>
              </>
            ) : (
              <>
                <span style={{flexShrink: 0, marginLeft: 'auto'}}>作业模式:</span>
                {this.state.modeInfo?.map((item: any, index: number) => {
                  return (
                    <span style={{ margin: '0 15px', flexShrink: 0 }} key={index}>
                      <span
                        style={
                          item.shiftMonitorNum >= item.totalNum
                            ? { color: '#16b913' }
                            : {}
                        }
                      >
                        {item.workModeName}({item.shiftMonitorNum}/
                        {item.totalNum})
                      </span>
                    </span>
                  )
                })}
              </>
            )}
          </p>
        </div>
        <div style={{ height: 'calc(100vh - 280px)', overflowY: 'scroll' }}>
          <table className={styles.table} id="table_tl">
            <thead>
              <tr>
                <th>监控对象</th>
                {['一', '二', '三', '四', '五', '六', '日'].map(
                  (item: string, index: number) => {
                    return (
                      <th
                        key={index}
                        style={
                          this.today == index + 1 ? { color: '#009100' } : {}
                        }
                      >
                        星期{item}
                      </th>
                    )
                  }
                )}
              </tr>
            </thead>
            <tbody>
              <List
                workMode={modeInfo}
                schedulList={schedulList}
                workType={workType}
                currentWorkName={workName}
                sectionId={sectionId}
                workId={workId}
                enterpriseId={enterpriseId}
                reload={this.reload}
                type={type}
                page={page}
                pageSize={pageSize}
              />
            </tbody>
          </table>
          {schedulList.length == 0 ? (
            <p className={styles.noData}>当前对象没有排班！</p>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <Pagination
              style={{ marginTop: '14px' }}
              showSizeChanger
              current={page}
              onChange={this.onPageChange}
              onShowSizeChange={this.onShowSizeChange}
              total={total}
              hideOnSinglePage
            />
          </div>
        </div>
      </div>
    )
  }
}

export default SchedulTable
