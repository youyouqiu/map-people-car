
// 增加平台输入框实用性
// 去除输入框的前后空格
import React,{ useState } from 'react';
import { Input } from 'antd';
const TrimInput = (props: any) => {
  const [ value, setValue ]= useState(props.value)
  const onChange = (e: any) => {
    let { value } = e.target;
    value = value.trim()
    setValue(value)
    if(props.onChange){
      props.onChange(value);
    }
  };
  return (
        <Input
          value={value}
          {...props}
          onChange={onChange}
        />
    );
}
export default TrimInput