
/**
 * 作业详情
 */
import React, { useEffect, useState } from "react";
import { Empty, Progress, Select, Spin, Timeline } from "antd";
const { Option } = Select;

import styles from './index.module.less'
import { CarOutlined, LeftOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { shallowEqual, useSelector } from "react-redux";
import { getShiftRecordDetail } from "@/server/workMonitoring";
import moment from "moment";
import { getSelectContainer } from "@/framework/utils/function";

interface IProps {
  changeVisible: Function,
  recordDropdown: any
}

const OperationDetail = (props: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownObj, setDropdownObj] = useState({ value: '', index: 0 });
  const [recordDetail, setRecordDetail] = useState<any>({});
  // 连接redux数据
  const { detailMonitorInfo } = useSelector(({
    workMonitoring: {
      detailMonitorInfo,
    }
  }: any) => {
    return {
      detailMonitorInfo
    }
  }, shallowEqual);

  useEffect(() => {
    getDropdownInfo();
  }, [props.recordDropdown])

  // 获取班次下拉项信息
  const getDropdownInfo = async () => {
    const { recordId } = detailMonitorInfo;
    const { recordDropdown } = props;
    if (recordDropdown && recordDropdown.length > 0) {
      const obj = {
        value: recordId ? recordId : recordDropdown[0].id,
        index: 1
      }
      recordDropdown.map((item: any, _index: number) => {
        item.index = _index + 1;
        if (item.id === recordId) {
          obj.index = _index + 1;
        }
      })
      setDropdownObj(obj);
      getRecordInfo(recordId ? recordId : recordDropdown[0].id)
    } else {
      setRecordDetail({});
      setDropdownObj({
        value: '',
        index: 0
      });
    }
  }

  // 获取作业详情信息
  const getRecordInfo = async (shiftRecordId: string) => {
    setLoading(true);
    const shiftRecordDetail: any = await getShiftRecordDetail({ shiftRecordId });
    if (shiftRecordDetail) {
      setRecordDetail(shiftRecordDetail);
    } else {
      setRecordDetail({});
    }
    setLoading(false);
  }

  // 获取班次作业进度状态
  const getShiftRecordStatus = (status: number) => {
    switch (status) {
      case 0:
        return <span style={{ color: '#666' }}>未开始</span>;
      case 1:
        return <span style={{ color: '#1890ff' }}>作业中</span>;
      case 2:
        return <span style={{ color: 'rgb(99,170,28)' }}>已完成</span>;
      case 3:
        return <span style={{ color: 'rgb(213,27,4)' }}>未完成</span>;
      default:
        return '';
    }
  }

  // 班次改变
  const recordChange = (id: string, data: any) => {
    getRecordInfo(id);
    setDropdownObj({
      value: id,
      index: data.index
    });
  }

  return <div id="operationDeatil" className={styles.operationDeatil}>
    <div className={styles.header}>
      <h4>
        <LeftOutlined onClick={() => props.changeVisible(false)} style={{ marginRight: 6 }} />
        {Object.keys(recordDetail).length > 0 && <>{recordDetail?.monitorType === 0 ?
          <><CarOutlined /><span style={{ marginLeft: 4 }}>{recordDetail?.monitorName}{recordDetail && recordDetail.type ? `(${recordDetail.type})` : ''}</span></> :
          <> <UserSwitchOutlined /><span style={{ marginLeft: 4 }}>{recordDetail?.monitorName}{recordDetail && recordDetail.name ? `(${recordDetail.name})` : ''}</span></>}
        </>}
      </h4>
      <div className={styles.rightSelect}>
        <span>{dropdownObj.index}/{props.recordDropdown.length}</span>
        <Select
          className={styles.blueSelect}
          value={dropdownObj.value}
          bordered={false}
          getPopupContainer={() => getSelectContainer('operationDeatil')}
          onChange={recordChange}
        >
          {props.recordDropdown.map((item: any) => <Option value={item.id} key={item.id} index={item.index}>
            {item.shiftName} {moment(item.shiftStart).format('HH:mm')}-{moment(item.shiftEnd).format('HH:mm')}
          </Option>
          )}
        </Select>
      </div>
    </div>
    <div className={styles.scrollContent}>
      <div className={styles.infoBox}>
        {recordDetail?.monitorType === 0 && <div>班次作业进度: {getShiftRecordStatus(recordDetail?.shiftRecordStatus)}</div>}
        <div>作业对象: <span className={styles.green}>{recordDetail?.workName}</span></div>
        <div>{recordDetail?.monitorType === 0 ? '里程:' : '行驶里程:'} <span>{recordDetail?.mile !== undefined && recordDetail?.mile !== null ? `${recordDetail?.mile}km` : '--'}</span></div>
        {/* 作业区域和清运区域，路径不展示 */}
        {recordDetail?.monitorType === 0 && recordDetail?.workType !== 2 && recordDetail?.workType !== 3 && <div>路径: <Progress
          type='line'
          percent={recordDetail?.roadFinishRate || 0}
          strokeColor='rgb(94,200,254)'
        /></div>}
      </div>
      <div className={styles.subHeader}>
        <h4>作业详情</h4>
      </div>
      <div className={styles.infoBox}>
        <Timeline mode='left'>
          {
            (!recordDetail.shiftDetailLogList || recordDetail.shiftDetailLogList.length === 0)
              ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              : recordDetail?.shiftDetailLogList.map((item: any) => <Timeline.Item key={item.id} label={item.eventTime}>{item.eventContent}</Timeline.Item>)
          }
        </Timeline>
      </div>
    </div>
    {/* 加载loading */}
    {loading && <Spin className={styles.spinning} spinning />}
  </div >
}

export default OperationDetail;