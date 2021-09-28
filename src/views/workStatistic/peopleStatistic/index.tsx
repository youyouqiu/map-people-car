import React, { useRef, useState, useEffect } from 'react'
import { Table } from '@/common';
import { Button, DatePicker, message, Form } from 'antd';
import TreeSelect from './tree';
import DetailDrawer from './detailDrawer'
import { getPeopleWorkList, PeopleList, getPeopleWorkSumary, exportPeopleWorkList } from '@/server/statistics'
import st from './index.module.less';
import moment from 'moment';
import Card from '../components/card'
import { FolderOpenOutlined } from '@ant-design/icons';
import AnimationNode, { RefProps } from '@/common/animationNode'
import icon1 from '@/static/image/statistic_alarm.png'
import icon2 from '@/static/image/statistic_work.png'

type Moment = moment.Moment
export interface IRecord {
  id: string;
  key: string;
  sort: number;
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

const List = () => {
  const [clickedRowKey, setClickedRowKey] = useState<string>('') // 选中行Id
  const queryArgs = useRef({
    startTime: moment().format('yyyy-MM-DD'),
    endTime: moment().format('yyyy-MM-DD'),
    enterpriseId: '',
  }) // 列表查询参数
  const tableRef = useRef<any>()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false) // 列表查询参数
  const [dates, setDates] = useState<[Moment | null, Moment | null]>([moment(), moment()]); // 选中的日期
  const [selectedTreeNodeKey, setSelectedTreeNodeKey] = useState<string>(''); // 选中的树节点id
  const [selectedTreeNodeName, setSelectedTreeNodeName] = useState<string>(''); // 选中的树节点名称
  const datesRef = useRef<[Moment | null, Moment | null]>()
  const [sumary, setSumary] = useState({
    peoplesNumber: 0,
    totalAlarmsNumber: 0,
    totalWorkTime: 0
  })
  const [workName, setWorkName] = useState<string>('');
  const animateRef = useRef<RefProps | null>(null)
  const [total, setTotal] = useState(0)
  const columns: any[] = [
    {
      title: "序号",
      dataIndex: "a",
      align: 'center',
      width: 80,
      disabled: true,
      render: (text: string, record: IRecord, index: number) => (
        <div>{record.sort}</div>
      ),
      fixed: 'left'
    },
    {
      title: '工号',
      dataIndex: 'monitorName',
      key: 'monitorName',
      width: 100,
      fixed: 'left',
      render: (monitorName: any, record: any) => {
        return <Button style={{ padding: 0 }} type='link' onClick={() => {
          setClickedRowKey(record.monitorId)
          setDrawerVisible(true)
          setWorkName(record.name)
        }}>{monitorName}</Button>
      }
    },
    {
      title: '所属企业',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      fixed: 'left'
    },
    {
      title: '岗位类型',
      dataIndex: 'positionTypeName',
      width: 200,
      key: 'positionTypeName',
      fixed: 'left',
    },
    {
      title: '起始日期',
      dataIndex: 'shiftStartTime',
      width: 200,
      render: () => {
        return datesRef.current && datesRef.current[0]?.format('yyyy-MM-DD')
      }
    },
    {
      title: '结束日期',
      width: 200,
      dataIndex: 'shiftEndTime',
      render: () => {
        return datesRef.current && datesRef.current[1]?.format('yyyy-MM-DD')
      }
    },
    {
      title: '计划作业周期(天)',
      width: 150,
      dataIndex: 'plannedOperationCycle',
      key: 'plannedOperationCycle',
    },
    {
      title: '实际作业周期(天)',
      width: 120,
      dataIndex: 'actualOperationCycle',
      key: 'actualOperationCycle',
    },
    {
      title: '报警(次)',
      width: 120,
      dataIndex: 'alarmTimes',
      key: 'alarmTimes',
    },
    {
      title: '行驶里程(km)',
      width: 150,
      dataIndex: 'workMile',
      key: 'workMile',
    },
    {
      title: '作业总耗时',
      width: 150,
      dataIndex: 'workTimeStr',
      key: 'workTimeStr',
    },
  ];
  const [formRef] = Form.useForm()
  // 查询
  const query = async (id?: string, name?: string) => {
    tableRef.current?.queryTable()
    const res = await getPeopleWorkSumary({
      endTime: dates[1]?.format('yyyy-MM-DD'),
      enterpriseId: selectedTreeNodeKey || id,
      enterpriseName: selectedTreeNodeName || name,
      keyword: tableRef.current.getQueryArgs.keyword,
      monitorType: 0,
      startTime: dates[0]?.format('yyyy-MM-DD')
    })
    setSumary(res.data)
  }
  // 导出
  const exportData = async () => {
    const params = getParams()
    if (!params) return
    const res = await exportPeopleWorkList({
      endTime: params.endTime,
      startTime: params.startTime,
      enterpriseName: selectedTreeNodeName,
      enterpriseId: selectedTreeNodeKey,
      keyword: tableRef.current.getQueryArgs.keyword,
      monitorType: 0
    })
    if (res) {
      message.success('已加入到导出队列，请在【导出管理】查看')
    }
  }
  // 获取参数
  const getParams = () => {
    if (dates[0] && dates[1] && tableRef.current) {
      return {
        startTime: dates[0]?.format('yyyy-MM-DD'),
        endTime: dates[1]?.format('yyyy-MM-DD'),
        enterpriseId: selectedTreeNodeKey,
        ...tableRef.current.getQueryArgs,
        monitorId: tableRef.current.state.queryValue
      }
    }
  }
  // 控制最大选择日期范围
  const disabledDate = (current: Moment) => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 31;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 31;
    return Boolean(tooEarly || tooLate);
  };

  return (
    <div style={{ height: '100%', padding: '15px', background: '#eee' }}>
      <div className={st.queryData}>
        <Form
          layout='inline'
          form={formRef}
          onFinish={() => {
            formRef.validateFields().then(() => {
              query()
            })
          }}
        >
          <Form.Item label="企业" name="org" rules={[
            {
              required: true,
              validator: () =>
                selectedTreeNodeKey ? Promise.resolve() : Promise.reject(new Error('请输入企业')),
            }
          ]}
          >
            <TreeSelect
              onChange={(a, node: any) => {
                setSelectedTreeNodeKey(a)
                setSelectedTreeNodeName(node[0])
              }}
              setSelectedTreeNodeKey={(key: string, name: string) => {
                setSelectedTreeNodeKey(key)
                setSelectedTreeNodeName(name)
                queryArgs.current.enterpriseId = key
                query(key, name)
              }}
            />
          </Form.Item>
          <Form.Item label="日期" name="date" initialValue={dates} rules={[
            {
              required: true,
              message: '请输入日期'
            }
          ]}
          >
            <DatePicker.RangePicker
              key='date'
              value={dates}
              ranges={datePickerRanges as any}
              disabledDate={disabledDate}
              onCalendarChange={(value: any) => {
                setDates(value);
                datesRef.current = value
                queryArgs.current.startTime = value && value[0].format('yyyy-MM-DD')
                queryArgs.current.endTime = value && value[1].format('yyyy-MM-DD')
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
          </Form.Item>
          <Form.Item >
            <AnimationNode
              ref={animateRef}
              to={document.querySelector('#badgeContainer')}
              content={<FolderOpenOutlined
                style={{
                  fontSize: '20px',
                  color: '#4590f7'
                }} />
              }>
              <Button onClick={() => {
                formRef.validateFields().then(() => {
                  if(total <= 0){
                    return message.warning('导出失败，暂无可导出的数据')
                  }
                  exportData()
                  animateRef.current?.run && animateRef.current.run()
                })
              }}>导出</Button>
            </AnimationNode>
          </Form.Item>
        </Form>
      </div>
      <div className={st.cardBox}>
        <Card
          title='报警概况'
          data1={sumary.peoplesNumber}
          data2={sumary.totalAlarmsNumber}
          name1='人数'
          name2='报警总数'
          icon={icon1}
          color1='#dbf5fa'
          color2='#d0f3f9'
        />
        <Card
          title='作业时长'
          data1={sumary.peoplesNumber}
          data2={sumary.totalWorkTime}
          name1='人数'
          name2='总作业时长'
          icon={icon2}
          color1='#e5f8e2'
          color2='#d6fbd0'
        />
      </div>

      <div className={st.tableBox}>
        <Table
          ref={tableRef as any}
          columns={columns}
          showRow={false}
          settingQuery={{
            key: 'keyword', //模糊查询参数
            placeholder: '请搜索工号',
          }}
          rowKey='monitorId'
          settingQueryStyle={{ width: 270 }}
          queryArgs={queryArgs.current}
          queryAjax={(args: any) => {
            if (selectedTreeNodeKey && dates[0]?.format('yyyy-MM-DD') && dates[1]?.format('yyyy-MM-DD')) {
              return getPeopleWorkList({
                ...args,
                enterpriseId: selectedTreeNodeKey,
                startTime: dates[0]?.format('yyyy-MM-DD'),
                endTime: dates[1]?.format('yyyy-MM-DD')
              })
            }
          }}
          queryCallback={(data, res) => setTotal(res.total)}
          scroll={{ y: 'calc(100vh - 538px)' }}
          showTree={false}
        />
      </div>
      <DetailDrawer
        startTime={(dates && dates[0]?.format('yyyy-MM-DD')) || moment().format('yyyy-MM-DD')}
        endTime={(dates && dates[1]?.format('yyyy-MM-DD')) || moment().format('yyyy-MM-DD')}
        enterpriseId={selectedTreeNodeKey}
        monitorName={selectedTreeNodeName}
        monitorId={clickedRowKey}
        visible={drawerVisible}
        workName={workName}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  )
}

export default List