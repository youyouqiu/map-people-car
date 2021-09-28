import React, { useRef, useState, useEffect } from 'react';
import TreeSelect from '../component/tree';
import styles from './index.module.less';
import { Form, Button, message } from 'antd';
import moment from 'moment';
import { Table } from '@/common';
import { vehiclePage } from "@/server/attendanceReport";
import DetailDrawer from './detailDrawer';
import MonthDate from '../component/monthDate';
import { downloadFile } from '@/framework/utils/function';
import { FileAnimation } from '@/common/exportManagement';
export interface IRecord {
  id: string;
  key: string;
  sort: number;
}

export default () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false); //考勤明细抽屉
  const [orgInfo, setOrgInfo] = useState<any>(null); //企业信息
  const [monitorInfo, setMonitorInfo] = useState<any>({});   //行详情参数
  const [isTable, setIsTable] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<any>({ status: false, tips: 0 });
  const formRef = useRef<any>();
  const tableRef = useRef<any>();
  const queryArgs = useRef({ enterpriseName: '', enterpriseId: "", month: "" })

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
      title: "车牌号",
      width: 120,
      dataIndex: "monitorName",
      key: "monitorName",
      fixed: 'left',
      align: 'center',
      render: (text: string, record: IRecord, index: number) => {
        return <div style={{ color: '#40a9ff', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={showDetailDrawer.bind(this, record)}>{text}</div>
      }
    },
    {
      title: '车辆类型',
      width: 100,
      dataIndex: "vehicleTypeName",
      key: "vehicleTypeName",
      align: 'center',
      fixed: 'left'
    },
    {
      title: '所属企业',
      width: 200,
      dataIndex: "orgName",
      key: "orgName",
      align: 'center',
      fixed: 'left'

    },
    {
      title: '起始日期',
      width: 150,
      dataIndex: "startTime",
      key: "startTime",
      align: 'center',
    },
    {
      title: '结束日期',
      width: 150,
      dataIndex: "endTime",
      key: "endTime",
      align: 'center',
    },
    {
      title: '计划作业周期(天)',
      width: 150,
      dataIndex: "plannedOperationCycle",
      key: "plannedOperationCycle",
      align: 'center',
    },
    {
      title: '实际作业周期(天)',
      width: 150,
      dataIndex: "actualOperationCycle",
      key: "actualOperationCycle",
      align: 'center',
    },
    {
      title: '考勤得分',
      width: 120,
      dataIndex: "assessmentScore",
      key: "assessmentScore",
      align: 'center',
    },
    {
      title: '是否合格',
      width: 120,
      dataIndex: "qualified",
      key: "qualified",
      align: 'center',
      render: (text: any) => {
        if (text == 0) {
          return '不合格'
        } else {
          return "合格"
        }
      }
    },
    {
      title: '晚到(次)',
      width: 120,
      dataIndex: "late",
      key: "late",
      align: 'center',
    },
    {
      title: '早退(次)',
      width: 120,
      dataIndex: "early",
      key: "early",
      align: 'center',
    },
    {
      title: '缺勤(次)',
      width: 120,
      dataIndex: "absence",
      key: "absence",
      align: 'center',
    },
    {
      title: '请假(次)',
      width: 120,
      dataIndex: "leave",
      key: "leave",
      align: 'center',
    },
    {
      title: '调休(次)',
      width: 120,
      dataIndex: "transfer",
      key: "transfer",
      align: 'center',
    },
  ];

  useEffect(() => {
    if (orgInfo) {
      const month = moment(formRef.current.getFieldValue('month')).format('YYYY-MM');
      formRef.current.setFieldsValue({ org: orgInfo.id });
      queryArgs.current = { enterpriseName: orgInfo.name, enterpriseId: orgInfo.id, month }
      if (!isTable) setIsTable(true);
    }
  }, [orgInfo]);

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
   * 查询
   */
  const onFinish = (value: any) => {
    queryArgs.current = {
      enterpriseId: value.org,
      month: moment(value.month).format('YYYY-MM'),
      enterpriseName: orgInfo.name
    }
    tableRef.current?.queryTable()
  }

  /**
   * 导出
   */
  const onExport = () => {
    const queryArgs = tableRef.current.getQueryArgs;
    const data = {
      enterpriseId: queryArgs.enterpriseId,
      enterpriseName: queryArgs.enenterpriseName,
      month: queryArgs.month,
      keyword: tableRef.current.state.queryValue,
    }

    downloadFile('/api/tool/offline/export/vehicle/attendance/stat', 'POST', '考勤明细', data, () => {
      message.success('已加入到导出队列，请在【导出管理】查看')
    }, true);
  }

  /**
   * 详情抽屉显示
   */
  const showDetailDrawer = (record: any) => {
    const month = moment(record.startTime).format('YYYY-MM')
    setMonitorInfo({
      monitorId: record.monitorId,
      monitorName: record.monitorName,
      orgId: tableRef.current.getQueryArgs.enterpriseId,
      month: month
    })
    setDrawerVisible(true);
  }


  return (
    <div style={{ height: '100%', padding: '15px', background: '#eee' }}>
      <div className={styles.queryData}>
        <Form
          layout='inline'
          ref={formRef}
          onFinish={onFinish}
        >
          <Form.Item label="企业" name="org"
            rules={[
              {
                required: true,
                message: '请选择企业'
              }
            ]}
          >
            <TreeSelect getOrgInfo={(data: string) => setOrgInfo(data)} />
          </Form.Item>
          <Form.Item label="月份" name="month"
            rules={[
              {
                required: true,
                message: '请选择月份'
              }
            ]}
          >
            <MonthDate formRef={formRef} />
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
        {
          isTable ? <Table
            ref={tableRef}
            columns={columns}
            settingQuery={{
              key: 'keyword', //模糊查询参数
              placeholder: '请搜索车牌号',
            }}
            settingQueryStyle={{ width: 270 }}
            queryAjax={(args: any) => {
              const { enterpriseId, enterpriseName, month } = queryArgs.current;
              if (enterpriseId && month && enterpriseName) {
                args.enterpriseId = enterpriseId;
                args.month = month;
                args.enenterpriseName = enterpriseName;
                return vehiclePage(args)
              }
            }}
            queryCallback={(data, res) => res.code == 200 ? setTotal(parseInt(res.total)) : setTotal(0)}
            scroll={{ y: 'calc(100vh - 400px)' }}
            showTree={false}
            showRow={false}
            rowKey='monitorId'
          /> : null
        }
      </div>
      {
        drawerVisible && <DetailDrawer monitorInfo={monitorInfo} onClose={() => setDrawerVisible(false)} />
      }

    </div >
  )
}