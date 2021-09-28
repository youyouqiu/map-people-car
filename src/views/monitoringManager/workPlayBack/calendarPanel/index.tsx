/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from 'react';
// import { Moment } from 'moment';
import { DatePicker } from 'antd';
import { getSelectContainer } from '@/framework/utils/function'
import styles from './index.module.less';
interface IProps {
  intl?: any;
  [propName: string]: any;
}

function DatePickerModule(props: IProps) {
  const [datePickerFlag, setDatePickerFlag] = useState<boolean>(false);
  const dateTimeContainerRef: any = useRef();
  const { ...extra } = props;

  useEffect(() => {
    if (dateTimeContainerRef.current) {
      setDatePickerFlag(true);
    }
  }, [dateTimeContainerRef]);

  return (
    <div ref={dateTimeContainerRef} id='dateTimeContainer' className={styles['dateTime-pouple-container']}>
      <div style={{ width: 150, height: 50, background: '#fff', position: 'relative', top: 36 }}></div>
      {
        datePickerFlag ? <DatePicker
          style={{ marginLeft: 10 }}
          open={true}
          showToday={false}
          dropdownClassName={styles['dateTimeContainer-pouple']}
          getPopupContainer={() => {
            return getSelectContainer('dateTimeContainer')
          }}
          {...extra}
        /> : null
      }
    </div>

  )
}

export default DatePickerModule