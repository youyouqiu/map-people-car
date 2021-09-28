import React, { useMemo, useState } from "react";
import Button from "antd/es/button";
import Input from "antd/es/input";
import DatePicker from "antd/es/date-picker";
import Form from "antd/es/form";
import styles from "./index.module.less";
import moment from "moment";
import PrintInfo from "../printInfo";
import { IColumnData } from "../tableContent";
import { downloadFile } from "@/framework/utils/function";
import { RangeValue } from 'node_modules/rc-picker/lib/interface'
import { regularText } from "@/common/rules";

const { RangePicker } = DatePicker;

interface INavProps {
  setParams: (param: object) => void;
  loading: boolean;
  moduleName: string;
  dataSource: IColumnData[];
}

export default (props: INavProps) => {
  // 控制打印显示
  const [printVisible, setPrintVisible] = useState(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [dates, setDates] = useState<RangeValue<moment.Moment>>([null, null]);
  const marginStyle = {
    marginRight: 35,
    marginBottom: 0,
  };

  const initialValue = useMemo(() => {
    return {
      eventDate: [moment().startOf("day"), moment().endOf("day")],
    };
  }, []);

  const [form] = Form.useForm();

  // 点击查询后设置请求参数
  async function handleSearch() {
    console.log('res')
    let res = await form.validateFields();

    if (res) {
      if (res.eventDate) {
        res = {
          ...res,
          startTime: res.eventDate[0].format("YYYY-MM-DD HH:mm:ss"),
          endTime: res.eventDate[1].format("YYYY-MM-DD HH:mm:ss"),
          orderField: 'eventDate',
          random: Math.random()
        };
        delete res.eventDate;
      }
      props.setParams(res);
    }
  }

  // 选中前几天这类按钮时，先设置起始日期，然后再搜索
  function setDateBeforeSearch(beforDay: number) {
    const nowEnd = beforDay === 0 ? 0 : 1;
    const startTime = moment().startOf("day").subtract(beforDay, "day");
    const endTime = moment().endOf("day").subtract(nowEnd, "day");
    form.setFieldsValue({
      eventDate: [startTime, endTime],
    });
    handleSearch();
  }

  // 导出
  async function handleExport() {
    const res = await form.validateFields();
    if (res) {
      if (res.eventDate) {
        const queryArgs = {
          ...res,
          startTime: res.eventDate[0].format("YYYY-MM-DD HH:mm:ss"),
          endTime: res.eventDate[1].format("YYYY-MM-DD HH:mm:ss"),
          orderField: 'eventDate',
        };
        setExporting(true)
        downloadFile('/api/tool/logger/export', 'POST', '日志.xls', queryArgs, () => { setExporting(false) });
      }
    }
  }

  // 打印
  function handlePrint() {
    setPrintVisible(true);
  }

  const disabledDate = (current: moment.Moment) => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] !== null && current.diff(dates[0], 'days') > 31;
    const tooEarly = dates[1] !== null && (dates[1] as any).diff(current, 'days') > 31;
    return tooEarly || tooLate;
  };

  return (
    <div>
      <Form
        className={styles["arrange"]}
        form={form}
        layout="inline"
        initialValues={initialValue}
      >
        <Form.Item
          name="username"
          label="操作用户"
          className={styles["nav-item"]}
          style={marginStyle}
          rules={[regularText]}
        >
          <div style={{ width: '120px' }}>
            <Input
              placeholder="请输入操作用户"

              allowClear
              maxLength={30}
            />
          </div>

        </Form.Item>
        <Form.Item
          name="ipAddress"
          label="IP地址"
          className={styles["nav-item"]}
          style={marginStyle}
          rules={[regularText]}
        >
          <Input placeholder="请输入IP地址" style={{ width: '120px' }} maxLength={30} allowClear />
        </Form.Item>
        <Form.Item
          name="keyword"
          label="监控对象"
          className={styles["nav-item"]}
          style={marginStyle}
          rules={[regularText]}
        >
          <Input placeholder="请输入监控对象" style={{ width: '120px' }} maxLength={30} allowClear />
        </Form.Item>
        <Form.Item name="eventDate" label="操作时间" style={marginStyle} className={styles["nav-item"]}>
          <RangePicker
            style={{ marginRight: '20px', width: '380px' }}
            showTime={{ format: "YYYY-MM-DD HH:mm:ss" }}
            format="YYYY-MM-DD HH:mm:ss"
            disabledDate={disabledDate}
            ranges={{
              '今天': [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
              '近三天': [moment('00:00:00', 'HH:mm:ss').subtract('days', 2), moment('11:59:59', 'HH:mm:ss')],
              '近七天': [moment('00:00:00', 'HH:mm:ss').subtract('days', 6), moment('11:59:59', 'HH:mm:ss')],
              '近三十天': [moment('00:00:00', 'HH:mm:ss').subtract('days', 29), moment('11:59:59', 'HH:mm:ss')],
            }}
            onCalendarChange={value => {
              setDates(value as any);
            }}
          />
        </Form.Item>
        {/* <Button
          onClick={() => setDateBeforeSearch(0)}
          loading={props.loading}
          className={styles["day"]}
        >
          今天
        </Button> */}
        {/* <Button
          onClick={() => setDateBeforeSearch(1)}
          loading={props.loading}
          className={styles["day"]}
        >
          前一天
        </Button> */}
        {/* <Button
          onClick={() => setDateBeforeSearch(3)}
          loading={props.loading}
          className={styles["day"]}
        >
          前三天
        </Button> */}
        {/* <Button
          onClick={() => setDateBeforeSearch(7)}
          loading={props.loading}
          className={styles["day"]}
        >
          前七天
        </Button> */}
        <Button
          onClick={handleSearch}
          loading={props.loading}
          className={styles["day"]}
          type="primary"
        >
          查询
        </Button>
        <Button
          onClick={handleExport}
          loading={exporting}
          className={styles["operate"]}
        >
          导出
        </Button>
        <Button
          onClick={handlePrint}
          loading={props.loading}
          className={styles["operate"]}
        >
          打印
        </Button>
        <div style={{ clear: 'both' }} ></div>
      </Form>
      <PrintInfo
        moduleName={props.moduleName}
        visible={printVisible}
        setVisible={setPrintVisible}
        dataSource={props.dataSource}
      />
    </div>
  );
};
