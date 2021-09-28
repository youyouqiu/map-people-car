import React, { useState, useRef } from "react";
import { Table, GroupTree } from "@/common";
import NavBar from "./components/navBar";
import DetailInfo from "./components/detailInfo";
import moment from "moment";
import { postDictLogPage } from "@/server/log";

export interface IColumnData {
  id: string;
  key: string;
  monitorName: string;
  plateColor: string;
  message: string;
  ipAddress: string;
  eventDate: string;
  username: string;
  logSource: number
}

export default function () {
  // 请求参数
  const [queryArgs, setQueryArgs] = useState({
    startTime: moment().format("YYYY-MM-DD 00:00:00"),
    endTime: moment().format("YYYY-MM-DD 23:59:59"),
    orderField: 'event_date',
  });
  // 数据源
  const [dataSource, setDataSource] = useState([]);
  // 控制详情显示
  const [drawerDetailVisible, setDrawerDetailVisible] = useState<boolean | undefined>(
    undefined
  );
  // 选中项
  const [selectedRec, setSelectedRec] = useState<IColumnData>();
  const table: any = useRef()

  const columns = [
    {
      title: "序号",
      dataIndex: "a",
      align: 'center',
      width: 80,
      disabled: true,
      render: (text: string, record: IColumnData, index: number) => (
        <div>{index + 1}</div>
      ),
    },
    {
      title: "操作时间",
      dataIndex: "eventDate",
      width: 110,
      sorterKey: "eventDate",
    },
    {
      title: "操作用户",
      dataIndex: "username",
      width: 100,
    },
    {
      title: "日志类型",
      dataIndex: "logSource",
      width: 340,
      render: (text: string, record: IColumnData,) => {
        const arr = ['1-终端上报', '2-平台下发', '3-平台操作', '4-APP操作'];
        const logSource: number = record.logSource;
        for (let i = 0; i < arr.length; i++) {
          // const 
          if (logSource === Number(arr[i].split('-')[0])) {
            return arr[i].split('-')[1]
          }

        }
        return '--'
      }
    },
    {
      title: "IP地址",
      dataIndex: "ipAddress",
      width: 110,
    },
    {
      title: "日志内容",
      dataIndex: "operationContent",
      width: 340,
    },
    {
      title: "关联业务模块",
      dataIndex: "moduleName",
      width: 80,
    },
    {
      title: "关联监控对象",
      dataIndex: "monitorName",
      width: 150,
    },
  ];

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%' }} >
      <NavBar
        loading={false}
        moduleName="11"
        dataSource={dataSource}
        setParams={(res: any) => {
          console.log('res:', res);
          setQueryArgs(res)
        }}
      />
      <Table
        ref={table}
        showRow={false}
        showTree={false}
        columns={columns as any}
        queryArgs={queryArgs}
        queryCallback={setDataSource}
        // tree={<GroupTree />}
        queryAjax={postDictLogPage}
        rowClick={(record: IColumnData, e: Event) => {
          e.stopPropagation();
          setSelectedRec(record);
          setDrawerDetailVisible(true);
        }}
        scroll={{ y: "calc(100vh - 390px)" }}
        showSettingQuery={false}
      // settingQueryStyle={{ width: 300 }}
      // settingQuery={{
      //   placeholder: "请输入监控对象",
      //   key: "keyword",
      // }}

      />
      {selectedRec && drawerDetailVisible !== undefined && (
        // <DetailInfo
        //   record={selectedRec}
        //   onClose={() => setDrawerDetailVisible(false)}
        //   visible={drawerDetailVisible}
        // />
        <DetailInfo
          logInfo={selectedRec}
          closeDetailDrawer={() => setDrawerDetailVisible(false)}
          visible={drawerDetailVisible}
        />
      )}
    </div>
  );
}
