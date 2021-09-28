/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { DetailDrawer as Drawer } from '@/common/';
import { Button, Progress, DatePicker, Table, message } from 'antd';
import st from './detailDrawer.module.less'
import moment from 'moment';
import { getWorkDetailList, exportPeopleWorkDetail, WorkDetailList } from '@/server/statistics'
import { FolderOpenOutlined } from '@ant-design/icons';
import AnimationNode, { RefProps } from '@/common/animationNode'
type Moment = moment.Moment
interface IProps {
  visible: boolean,
  monitorId: string,
  startTime: string,
  endTime: string,
  monitorName: string,
  enterpriseId: string
  workName: string
  onClose: () => void
}
type Pagenation = {
  total: number,
  page: number,
  pageSize: number
}
const datePickerRanges = {
  '今天': [moment(), moment()],
  '近三天': [moment().subtract(2, 'days'), moment()],
  '近七天': [moment().subtract(6, 'days'), moment()],
  '近30天': [moment().subtract(29, 'days'), moment()],
  '本周': [moment().startOf('week'), moment().endOf('week')],
  '上周': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
  '本月': [moment().startOf('month'), moment().endOf('month')],
  '上月': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
}
const columns: any[] = [
  {
    title: "序号",
    dataIndex: "a",
    align: 'center',
    width: 60,
    disabled: true,
    fixed: 'left',
    render: (text: string, record: any, index: number) => (
      <div>{index + 1}</div>
    ),
  },
  {
    title: '日期',
    width: 120,
    dataIndex: 'time',
    key: 'time',
    fixed: 'left',
  },
  {
    title: '排班计划',
    dataIndex: null,
    width: 220,
    fixed: 'left',
    render: (value: number, record: any) => `${record.shiftName}(${record.shiftStartTime} - ${record.shiftEndTime})`
  },
  {
    title: '所属标段',
    dataIndex: 'sectionName',
    width: 120,
    key: 'sectionName',
    fixed: 'left',
  },
  {
    title: '作业对象',
    dataIndex: 'workName',
    key: 'workName',
    width: 120,
  },
  {
    title: '作业模式',
    width: 120,
    dataIndex: 'modeName',
    key: 'modeName',
  },
  {
    title: '报警(次)',
    width: 150,
    dataIndex: 'alarmTimes',
    key: 'alarmTimes',
  },
  {
    title: '里程(km)',
    width: 120,
    dataIndex: 'mile',
    key: 'mile',
    render: (value: string) => {
      return value ? value + 'km' : value;
    },
  },
  {
    title: '作业耗时',
    width: 120,
    dataIndex: 'workTimeStr',
    key: 'workTimeStr',
  }
];

const DetailDrawer: React.FC<IProps> = (props) => {
  const { onClose, visible, monitorId, startTime, endTime, monitorName, enterpriseId } = props
  const [pagenation, setPagenation] = useState<Pagenation>({
    total: 0,
    page: 1,
    pageSize: 50
  })
  const [dates, setDates] = useState<[Moment | null, Moment | null]>([moment(startTime), moment(endTime)]); // 选中的日期
  const [detail, setDetail] = useState<WorkDetailList>({
    total: 0,
    data: []
  })
  const animateRef = useRef<RefProps | null>(null)
  useEffect(() => {
    if (monitorId) {
      query()
    }
  }, [monitorId])
  useEffect(() => {
    setDates([moment(startTime), moment(endTime)])
  }, [startTime, endTime])

  // 查询
  const query = async () => {
    const params = getParams()
    if (!params) return
    const res = await getWorkDetailList(params)
    if (res) {
      setDetail(res)
      setPagenation({
        ...pagenation,
        total: res.total
      })
    }
  }
  // 导出
  const exportData = async () => {
    const params = getParams()
    if (!params) return
    if(pagenation.total <= 0){
      return message.warning('导出失败，暂无可导出的数据')
    }
    animateRef.current?.run && animateRef.current.run()
    const res = await exportPeopleWorkDetail({
      endTime: params.endTime,
      startTime: params.startTime,
      monitorId: monitorId,
      monitorName: monitorName,
      enterpriseId: enterpriseId
    })
    if (res) {
      message.success('已加入到导出队列，请在【导出管理】查看')
    }
  }
  // 控制最大选择日期范围
  const isDateDisabled = (current: Moment) => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 31;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 31;
    return Boolean(tooEarly || tooLate);
  };
  const getParams = () => {
    if (dates[0] && dates[1]) {
      return {
        monitorId: monitorId,
        startTime: dates[0]?.format('yyyy-MM-DD'),
        endTime: dates[1]?.format('yyyy-MM-DD'),
        page: pagenation.page,
        size: pagenation.pageSize,
        orderField: "shiftStart",
        orderType: "DESC"
      }
    }
  }

  const onChange = async (page: number, size: number) => {
    setPagenation({
      ...pagenation,
      page,
      pageSize: size
    })
    const params = getParams()
    if (!params) return
    const res = await getWorkDetailList({
      ...params,
      page,
      size
    })
    if (!res) return
    setDetail(res)
    setPagenation({
      ...pagenation,
      total: res.total
    })
  }
  return (
    <Drawer
      title={`${props.workName + '作业明细'}`}
      width={1440}
      onClose={onClose}
      visible={visible}
    >
      <div style={{ height: '100%' }}>
        <div className={st.search}>
          <div>
            <span className={st.red}>*</span>
            <span className={st.name}>日期</span>
            <DatePicker.RangePicker
              key='date'
              value={dates}
              ranges={datePickerRanges as any}
              disabledDate={isDateDisabled}
              onCalendarChange={(value: any) => {
                setDates(value);
              }}
            />
          </div>
          <div>
            <Button key='query' type='primary' onClick={query} style={{ marginRight: '12px' }}>查询</Button>
            <AnimationNode
              ref={animateRef}
              to={document.querySelector('#badgeContainer')}
              content={<FolderOpenOutlined
                style={{
                  fontSize: '20px',
                  color: '#4590f7'
                }} />
              }>
              <Button onClick={exportData}>导出</Button>
            </AnimationNode>
          </div>
        </div>

        <div className={st.tableBox}>
          <Table
            rowKey={'id'}
            columns={columns}
            dataSource={detail.data}
            scroll={{ y: 'calc(100vh - 370px)' }}
            pagination={{
              ...pagenation,
              defaultPageSize: 50,
              showSizeChanger: true,
              onChange: onChange
            }}
          />
        </div>
      </div>
    </Drawer>
  )
}
export default DetailDrawer