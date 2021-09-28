import React, { useState, useEffect } from 'react';
import { Select } from 'antd'
import { query } from '@/server/province';
interface IProvinceProps {
    value?: string;
    pid: string;
    [propName: string]: any;
}

export default function (props: IProvinceProps) {

    const [sValue, setSValue] = useState('')
    const [data, setData] = useState([])
    const { value, onChange, pid, ...extra } = props

    async function queryCity() {
        const res: any = await query({ level: 3, areaCode: pid })
        if (res) {
            setData(res)
        }
    }

    useEffect(() => {
        setSValue('')
        if (pid) {
            queryCity()
        } else {
            if (onChange) {
                onChange('', [])
            }
            setData([])
        }
    }, [pid])

    useEffect(() => {
        setSValue(value || '')
    }, [value])


    function onchange(value: string, option: Array<any>) {
        setSValue(value)
        if (props.onChange) {
            props.onChange(value === '' ? null : value, option)
        }
    }

    return (
        <Select bordered={false} value={value || sValue} onChange={onchange} {...extra}>
            <Select.Option value='' id={0}>全部</Select.Option>
            {
                data.map((item: any) => {
                    return (<Select.Option key={item.areaCode} value={item.areaCode} id={item.id}> {item.areaName}</Select.Option>)
                })
            }
        </Select>
    )
}