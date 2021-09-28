/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Table from "antd/es/table";
import SearchBar from "@/common/searchBar";
import event from "@/framework/utils/event";
// import { PaginationConfig } from "antd/lib/pagination";
import { SorterResult } from "antd/lib/table/interface";

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

interface IDataProps {
  dataSource: IColumnData[];
  loading: boolean;
  moduleName: string;
  setParams?: Function;
  tableParams?: Record<string, any>;
  // 有showSearch说明是正常显示，无showSearch说明是打印显示
  showSearch: boolean;
}

export default (props: IDataProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [drawerDetailVisible, setDrawerDetailVisible] = useState<boolean>(
    false
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRec, setSelectedRec] = useState<IColumnData>();

  // 排序项
  const [sortedInfo, setSortedInfo] = useState<Record<string, any> | null>(
    null
  );
  const columns = [
    {
      title: "序号",
      dataIndex: "a",
      align: 'center',
      width: 80,
      disabled: true,
      render: (text: string, record: IColumnData, index: number) => (
        <span>{index + 1}</span>
      ),
    },
    {
      title: "操作时间",
      dataIndex: "eventDate",
      width: 160,
      sorter: props.showSearch ? true : false,
      sortOrder:
        sortedInfo && sortedInfo.field === "eventDate" && sortedInfo.order,
    },
    {
      title: "IP地址",
      dataIndex: "ipAddress",
      width: 110,
    },
    {
      title: "操作人",
      dataIndex: "username",
      width: 100,
    },
    {
      title: "日志内容",
      dataIndex: "operationContent",
      width: 340,
    },
    // logSource ‘日志来源：1：终端上报，2：平台下发，3：平台操作，4：APP操作
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

  function handleOnRow(record: IColumnData) {
    return {
      onClick: () => {
        setDrawerDetailVisible(true);
        setSelectedRec(record);
      }, // 点击行
    };
  }
  function handleTableChange(
    pagination: any,
    filters: any,
    sorter: SorterResult<IColumnData>
  ) {
    setSortedInfo(sorter);
    if (props.setParams) {
      // 排序回传值
      if (sorter.column) {
        props.setParams((prev: object) => {
          return {
            ...prev,
            orderField: sorter.field,
            orderType: sorter.order === "ascend" ? "ASC" : "DESC",
          };
        });
      } else {
        props.setParams((prev: object) => {
          return {
            ...prev,
            orderField: "eventDate",
            orderType: "DESC",
          };
        });
      }
    }
  }

  // 事件监听清空筛选项
  useEffect(() => {
    // 清空table和搜索栏的筛选项
    function resetAllFilterAndOrder() {
      setSortedInfo(null);
      if (props.setParams) {
        props.setParams({});
      }
    }
    event.on(props.moduleName, resetAllFilterAndOrder);
    return () => {
      event.remove(props.moduleName, resetAllFilterAndOrder);
    };
  }, [props.moduleName]);

  const [selectColumns, setSelectColumns] = useState(columns);

  function handleSetColumns() {
    // 按照selectColumns的顺序，由于colums的筛选组件被重新赋值了。。所以要再回过来赋值一次
    return selectColumns.map((item) => {
      return columns.filter((subItem: any) => {
        // 设置没有值的时候"-""
        if (!subItem.render) {
          subItem.render = (text: string) => {
            if (!text) {
              return <span>--</span>;
            }
            return <span>{text}</span>;
          };
        }
        return subItem.dataIndex === item.dataIndex;
      })[0];
    });
  }

  return (
    <div>
      {props.showSearch && (
        <SearchBar
          baseColumns={columns}
          selectColumns={selectColumns}
          handleColumnsChange={setSelectColumns}
          moduleName={props.moduleName}
          placeholder="请输入监控对象"
        />
      )}
      <Table
        columns={handleSetColumns() as any}
        dataSource={props.dataSource.map((item) => {
          item.key = item.id;
          return item;
        })}
        style={{ maxHeight: "calc(100vh - 121px)" }}
        size={props.showSearch ? "middle" : "small"}
        onRow={handleOnRow}
        loading={props.loading}
        onChange={handleTableChange}
        pagination={false}
      />
      {/* {props.showSearch && (
        <Drawer
          title="日志详情"
          onClose={() => setDrawerDetailVisible(false)}
          visible={drawerDetailVisible}
          width={500}
          bodyStyle={{ padding: "0" }}
          drawerStyle={{ paddingTop: 60 }}
        >
          {selectedRec && (
            <DetailInfo
              record={selectedRec}
              onClose={() => setDrawerDetailVisible(false)}
            />
          )}
        </Drawer>
      )} */}
    </div>
  );
};
