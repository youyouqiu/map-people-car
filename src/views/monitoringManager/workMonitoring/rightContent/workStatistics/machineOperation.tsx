/**
 * 机器作业
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Progress, Row, Select, Table } from "antd";
const { Option } = Select;
import styles from './index.module.less'
import { CarOutlined, SwapOutlined } from "@ant-design/icons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getWorkProgressDetail, getModeList } from "@/server/workMonitoring";

interface IProps {
  goOperationDetail: Function;
  curWorkObj: {
    id: string,
    workType: number,
    sectionId: string,
  }
}
interface IList {
  id: number,// 监控对象ID
  number: string,// 监控对象名
  modeId: number,// 作业模式id，管理组长为0
  modeName: string,// 作业模式名称
  roadFinishRate: number,// 路径完成度(%)
  shiftEndTime: string,// 排班结束时间
  shiftName: string,// 排班名称
  shiftStartTime: string,// 排班开始时间
  taskStatus: number,// 任务状态 0:未开始 1:作业中 2:已完成 3:未完成
  workId: number,// 作业对象id，机动组为0
  workName: string,// 作业对象名称
  workType: number,// 1作业道路 2作业区域 3 清运区域 4 机动组
  vehicleType: string,// 车辆类型/职位类型
}

interface IWorkProgress {
  finishNum: number,// 已完成数
  notStartedNum: number,// 未开始的数量
  totalNum: number,// 总班次数
  unfinishedNum: number,// 未完成数
  workingNum: number,// 作业中数量
}

const MachineOperation = (props: IProps) => {
  const dispatch = useDispatch();
  const orderRefObj = useRef({
    orderField: '',// 排序字段:shiftStartTime,roadFinishRate
    orderType: ['ASC', 'ASC'],// 排序方式: ASC, DESC
    modeId: '',// 作业模式
  });
  const [loading, setLoading] = useState(false);
  const [curStatus, setCurStatus] = useState<string | number>('');
  const [workProgressStat, setWorkProgressStat] = useState<IWorkProgress>({ totalNum: 0, finishNum: 0, unfinishedNum: 0, workingNum: 0, notStartedNum: 0 });
  const [listData, setListData] = useState<Array<IList>>([]);
  const [modeData, setModeData] = useState<Array<IList>>([]);// 作业模式数据

  // 连接redux数据
  const { isFullScreen } = useSelector(({
    container: {
      isFullScreen
    }
  }: any) => {
    return {
      isFullScreen
    }
  }, shallowEqual);

  useEffect(() => {
    getModeListFun();
    getListData();
  }, [])

  // 获取作业模式数据
  const getModeListFun = async () => {
    const param: any = props.curWorkObj;
    param.workId = param.id;
    const result = await getModeList<Array<IList>>(param);
    if (result) {
      setModeData(result);
    }
  }

  // 获取作业进度详情列表
  const getListData = async (filterParam: any = {}) => {
    setLoading(true);
    const { id, workType, sectionId } = props.curWorkObj;
    const param = {
      taskStatus: curStatus,
      modeId: orderRefObj.current?.modeId,
      modeType: 0,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
      sectionId,// 标段Id
      workId: id,// 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
      workType,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
      ...filterParam
    }
    const result: any = await getWorkProgressDetail(param);
    if (result) {
      setListData(result.shiftRecordList);
      setWorkProgressStat(result.workProgressStat)
    } else {
      setListData([]);
    }
    setLoading(false);
  }

  // 跳转作业详情
  const goMonitorDetail = (payload: any) => {
    dispatch({ type: 'workMonitoring/changeDetailMonitorInfoEvery', payload });
    props.goOperationDetail(payload, true);
  }

  /**
   * 任务状态 0:未开始 1:作业中 2:已完成 3:未完成
   * @param taskStatus 
   */
  const getTaskStatu = (taskStatus: number) => {
    switch (taskStatus) {
      case 0:
        return <Col span={4} className={styles.leftBox} style={{ backgroundColor: 'rgb(216,216,216)' }}>未开始</Col>;
      case 1:
        return <Col span={4} className={styles.leftBox}>作业中</Col>;
      case 2:
        return <Col span={4} className={styles.leftBox} style={{ backgroundColor: 'rgb(99,170,28)' }}>已完成</Col>;
      case 3:
        return <Col span={4} className={styles.leftBox} style={{ backgroundColor: 'rgb(213,27,4)' }}>未完成</Col>;
    }
  }

  /**
   * 改变作业状态
   * @param status 
   */
  const taskStatusChange = (status: number | string) => {
    setCurStatus(status);
    getListData({
      taskStatus: status
    })
  }

  /**
   * 列表排序
   * @param orderField 
   */
  const orderFun = (orderField: string) => {
    const { orderType } = orderRefObj.current;
    orderRefObj.current.orderField = orderField;
    if (orderField === 'shiftStartTime') {
      orderType[0] = orderType[0] === 'ASC' ? 'DESC' : 'ASC';
    } else {
      orderType[1] = orderType[1] === 'ASC' ? 'DESC' : 'ASC';
    }
    orderRefObj.current.orderType = orderType;
    getListData({
      orderField,
      orderType: orderField === 'shiftStartTime' ? orderType[0] : orderType[1]
    })
  }

  /**
  * 改变作业模式
  * @param status 
  */
  const modeChange = (value: string) => {
    orderRefObj.current.modeId = value;
    getListData({
      modeId: value
    })
  }

  const columns = [
    {
      title: '',
      key: '',
      render: (text: any, item: IList,) => <Row className={styles.listItem} key={item.id}>
        {getTaskStatu(item.taskStatus)}
        <Col span={20} style={{ paddingLeft: 10 }}>
          <div>
            <CarOutlined /> <strong>{item.number}({item.vehicleType})</strong>
            <span className={styles.blue} style={{ marginLeft: 15 }}>
              {item.shiftName} {item.shiftStartTime.substring(0, 5)}-{item.shiftEndTime.substring(0, 5)}
            </span>
          </div>
          {/* 作业区域和清运区域，路径不展示 */}
          {item?.workType !== 2 && item?.workType !== 3 ? <Row>
            <Col span={4}>路径:</Col>
            <Col span={16} style={{ paddingRight: 15 }}>
              <Progress
                type='line'
                percent={item.roadFinishRate || 0}
                strokeColor='rgb(94,200,254)'
              />
            </Col>
            <Col span={4}>
              <Button type='primary' ghost size='small' onClick={() => goMonitorDetail(item)}>详情</Button>
            </Col>
          </Row>
            : <Row>
              <Col span={4} push={20}>
                <Button type='primary' ghost size='small' onClick={() => goMonitorDetail(item)}>详情</Button>
              </Col>
            </Row>
          }
          <div>作业对象: {item.workName}</div>
        </Col>
      </Row>
    },
  ];

  /**
  * 渲染机器作业列表
  */
  const renderTabs = useMemo(() => {
    return <>
      <div className={styles.subHeader}>
        <h4>机器作业</h4>
      </div>
      <div className={styles.statusTabs} style={{ marginTop: 10, backgroundColor: '#fafafa' }}>
        <div
          className={[styles.statusTab, curStatus === '' && styles.active].join(' ')}
          onClick={() => { taskStatusChange('') }}
        >
          全部({workProgressStat.totalNum})
      </div>
        <div
          className={[styles.statusTab, curStatus === 2 && styles.active].join(' ')}
          onClick={() => { taskStatusChange(2) }}
        >
          已完成({workProgressStat.finishNum})
      </div>
        <div
          className={[styles.statusTab, curStatus === 1 && styles.active].join(' ')}
          onClick={() => { taskStatusChange(1) }}
        >
          作业中({workProgressStat.workingNum})
      </div>
        <div
          className={[styles.statusTab, curStatus === 0 && styles.active].join(' ')}
          onClick={() => { taskStatusChange(0) }}
        >
          未开始({workProgressStat.notStartedNum})
      </div>
        <div
          className={[styles.statusTab, curStatus === 3 && styles.active].join(' ')}
          onClick={() => { taskStatusChange(3) }}
        >
          未完成({workProgressStat.unfinishedNum})
      </div>
      </div>
    </>
  }, [workProgressStat, curStatus])

  /**
  * 渲染作业模式
  */
  const renderWorkMode = useMemo(() => {
    return <div className={styles.betweenFlexBox} style={{ marginTop: 10, padding: '4px 10px', backgroundColor: '#e4e4e4' }}>
      <div>
        作业模式：
      <Select
          size='small'
          className={styles.leftMarginSix}
          defaultValue=''
          style={{ minWidth: 100 }}
          onChange={modeChange}
        >
          <Option value=''>全部</Option>
          {modeData.map(item => <Option key={item.id} value={item.id}>{item.modeName}</Option>)}
        </Select>
      </div>
      <div>
        <span style={{ marginRight: 20 }}>班次 <SwapOutlined className={styles.rotate} onClick={() => orderFun('shiftStartTime')} /></span>
        <span className={styles.leftMarginSix}>作业进度 <SwapOutlined className={styles.rotate} onClick={() => orderFun('roadFinishRate')} /></span>
      </div>
    </div>
  }, [modeData, curStatus])

  /**
   * 渲染机器作业列表
   */
  const renderList = useMemo(() => {
    return <Table
      bordered
      loading={loading}
      className={styles.customTable}
      columns={columns}
      dataSource={listData}
      showHeader={false}
      pagination={false}
      scroll={{ y: `calc(100vh - ${!isFullScreen ? '320px' : '259px'})` }}
    />
  }, [loading, listData, isFullScreen])

  return <div className={styles.machineOperation}>
    {renderTabs}
    {renderWorkMode}
    {renderList}
  </div>
}

export default MachineOperation;