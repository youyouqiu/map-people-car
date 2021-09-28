import React, { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import styles from './index.module.less';
import moment from 'moment';

interface IProps {
  formRef: any;
  monitorInfo?: any;
}

export default (props: IProps) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const monthFormat = 'YYYY-MM';
  const [value, setValue] = useState(moment(`${year}-${month}`, monthFormat)) //月
  const { formRef, monitorInfo } = props;

  useEffect(() => {
    formRef.current.setFieldsValue({ month: moment(`${year}-${month}`, monthFormat) });
  }, [])

  useEffect(() => {
    if (monitorInfo) {
      const month = moment(monitorInfo.month, monthFormat)
      setValue(month);
      formRef.current.setFieldsValue({ month: month });
    }
  }, [monitorInfo])


  /**
   * 上月
   */
  const changePrevMonth = () => {
    setValue(moment(value).subtract(1, 'months'));
    formRef.current.setFieldsValue({
      month: moment(value).subtract(1, 'months')
    });
  }

  /**
   * 本月
   */
  const changeCurrentMonth = () => {
    setValue(moment(`${year}-${month}`, monthFormat));
    formRef.current.setFieldsValue({
      month: moment(`${year}-${month}`, monthFormat)
    });
  }

  /**
   * 月切换
   */
  const changeMonth = (date: any, dateString: string) => {
    setValue(date);
    formRef.current.setFieldsValue({
      month: date
    });
  }

  return (
    <DatePicker
      style={{ width: '280px' }}
      picker="month"
      format={monthFormat}
      onChange={changeMonth}
      value={value}
      renderExtraFooter={() => {
        return (
          <div>
            <span className={styles.monthCls} style={{ marginRight: 5 }} onClick={changePrevMonth}><a>上月</a></span>
            <span className={styles.monthCls} onClick={changeCurrentMonth}><a>本月</a></span>
          </div>
        )
      }}
    />
  )
}