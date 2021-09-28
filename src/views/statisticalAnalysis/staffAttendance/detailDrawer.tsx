/* eslint-disable react/prop-types */
import React, { useState, memo, useRef, useEffect } from 'react';
import { DetailDrawer as Drawer } from '@/common/';
import { Button, Table, Form, message } from 'antd';
import styles from './detailDrawer.module.less';
import MonthDate from '../component/monthDate';
import moment from 'moment';
import { detailList } from '@/server/attendanceReport';
import { downloadFile } from '@/framework/utils/function';
import { FileAnimation } from '@/common/exportManagement';

interface IProps {
  onClose: Function;
  monitorInfo: any;
}

const DetailDrawer = memo((props: IProps) => {
  const { onClose, monitorInfo } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<any>({ status: false, tips: 0 });
  const [parameter, setParameter] = useState<any>({ page: 1, size: 50 });
  const fromRef = useRef<any>();

  const columns: any[] = [
    {
      title: "序号",
      dataIndex: "a",
      align: 'center',
      width: 65,
      disabled: true,
      fixed: 'left',
      render: (text: string, record: any, index: number) => {
        return <div>{index + 1 + parameter.size * (parameter.page - 1)}</div>
      },
    },
    {
      title: '日期',
      width: 120,
      dataIndex: 'time',
      key: 'time',
      fixed: 'left',
      align: 'center',
    },
    {
      title: '排班计划',
      dataIndex: 'workName',
      width: 180,
      key: 'workName',
      fixed: 'left',
      align: 'center',
      render: (text: any, record: any) => {
        return <div>{`${record.shiftName}(${record.shiftStartTime}-${record.shiftEndTime})`}</div>
      }
    },
    {
      title: '所属标段',
      dataIndex: 'sectionName',
      width: 120,
      key: 'sectionName',
      fixed: 'left',
      align: 'center',
    },
    {
      title: '作业对象',
      dataIndex: 'workName',
      key: 'workName',
      width: 120,
      align: 'center',
    },
    {
      title: '签到时间',
      width: 150,
      dataIndex: 'signInTime',
      key: 'signInTime',
      align: 'center',
      render: (text: any, record: any, index: any) => {
        if (record.signInTime) {
          return <div>{record.signInStateName + `(${record.signInTime})`}</div>
        } else {
          return <div>{record.signInStateName}</div>
        }
      }
    },
    {
      title: '签退时间',
      width: 150,
      dataIndex: 'signOutTime',
      key: 'signOutTime',
      align: 'center',
      render: (text: any, record: any, index: any) => {
        if (record.signOutTime) {
          return <div>{signState(record.signOutState) + `(${record.signOutTime})`}</div>
        } else {
          return <div>{signState(record.signOutState)}</div>
        }
      }
    }
  ];

  useEffect(() => {
    setTableData([]);
    setTotal(0);
    const parameter = {
      month: monitorInfo.month,
      enterpriseId: monitorInfo.orgId,
      monitorId: monitorInfo.monitorId,
      orderField: 'shiftStart',
      orderType: 'DESC',
      page: 1,
      size: 50,
    }
    getDetailList(parameter);
  }, [monitorInfo]);

  useEffect(() => {
    if (total == 0) {
      setExportStatus({ status: false, tips: 0 });
      return;
    }
    if (total > 1000000) {
      setExportStatus({ status: false, tips: 1 });
      return;
    }
    setExportStatus({ status: true, tips: 0 });
  }, [total]);

  /**
   * 详情数据列表
   */
  const getDetailList = async (data?: any,) => {
    const result: any = await detailList(data);
    if (result && result.code == 200) {
      setParameter(data);
      setTotal(parseInt(result.total));
      setTableData(result.data);
    };
  }


  /**
   * 查询
   */
  const onFinish = async (value: any) => {
    const parameter = {
      month: moment(value.month).format('YYYY-MM'),
      enterpriseId: monitorInfo.orgId,
      monitorId: monitorInfo.monitorId,
      orderField: 'shiftStart',
      orderType: 'DESC',
      page: 1,
      size: 50,
    }
    getDetailList(parameter);
  }

  /**
   * 导出
   */
  const onExport = () => {
    const data = {
      enterpriseId: monitorInfo.orgId,
      monitorName: monitorInfo.monitorName,
      monitorId: parameter.monitorId,
      month: parameter.month
    }
    downloadFile('/api/tool/offline/export/attendance/detail', 'POST', '考勤明细', data, () => {
      message.success('已加入到导出队列，请在【导出管理】查看')
    }, true)
  }

  /**
   * 分页 
   */
  const fetchData = (page: any, pageSize: any) => {
    parameter.page = page;
    parameter.size = pageSize;
    getDetailList(parameter);
  }

  /**
   * 签退状态
   */
  const signState = (state: number) => {
    switch (state) {
      case 1:
        return '调休'
      case 2:
        return '请假'
      case 6:
        return '早退'
      case 7:
        return '正常签退'
      case 8:
        return '缺勤'
    }
  }


  return (
    <Drawer
      title={monitorInfo.monitorName + ' 考勤明细'}
      width={1200}
      onClose={onClose}
      visible={true}
    >
      <div className={styles.queryData}>
        <Form
          layout='inline'
          ref={fromRef}
          onFinish={onFinish}
          className={styles.formCls}
        >
          <Form.Item label="月份" name="month"
            rules={[
              {
                required: true,
                message: '请选择月份'
              }
            ]}
          >
            <MonthDate formRef={fromRef} monitorInfo={monitorInfo} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
          </Form.Item>
          <Form.Item >
            <FileAnimation onClick={onExport} status={exportStatus.status} tips={exportStatus.tips}>
              <Button>导出</Button>
            </FileAnimation>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.tableBox}>
        <Table
          columns={columns}
          dataSource={tableData}
          bordered={true}
          scroll={{ y: 'calc(100vh - 400px)' }}
          rowKey='id'
          pagination={{
            total: total,
            showSizeChanger: true,
            pageSize: parameter.size,
            current: parameter.page,
            onChange: fetchData
          }}
        />
      </div>
    </Drawer>
  )
})

export default DetailDrawer;