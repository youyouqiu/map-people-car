import React, { useEffect, useState } from 'react';
import Checkbox from 'antd/es/checkbox';
import Radio from 'antd/es/radio';
import Button from 'antd/es/button';
import styles from './index.module.less'

export interface IFilterProps {
    filter: IFilterItemProps;
    pId?: string;
    onReset?: () => void;
    onConfirm?: (selectedKeys: any[]) => void;
    [propsName: string]: any;
}

export interface IFilterItemProps {
    /**
     * true 复选框 false 单选框
     */
    type?: boolean;
    key: string;
    pId?: string;
    domData?: Array<{ [name: string]: any }> | Function;
    style?: object;
    reloadType?: any;
}

/**
 * @param selectedKeys Array 为antd提供参数 自定义过滤获取值
 * @param setSelectedKeys 为antd提供方法 自定义过滤设置值 必须为数组
 * */
export default function filter(props: IFilterProps) {
    const { setSelectedKeys, selectedKeys, confirm, clearFilters } = props

    const [type, setType] = useState(true)

    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
    }

    useEffect(() => {
        if ('type' in props.filter && !props.filter.type) {
            setType(false)
        }
    }, [props.filter.type])

    // 重置方法
    function reload(e?: any): void {
        e.stopPropagation()
        clearFilters()
        if (props.onReset) {
            props.onReset()
        }
    }

    // 确认提交方法
    function submit(e: any): void {
        e.stopPropagation()
        confirm()
        if (props.onConfirm) {
            props.onConfirm(selectedKeys)
        }
    }

    /**
     *  处理domData为函数的情况
     * */
    function handlDomData(): any[] {

        const arr = typeof props.filter.domData === 'function' ? props.filter.domData() : props.filter.domData
        return arr || []
    }

    // 针对 type 默认为true，导致在单选并且没有数据的时候 点击过滤 type变为true，selectedKeys[0]却又不是数组引起报错处理
    function handleCheckBoxValue(value: any[]): any[] {
        const val = value !== undefined ? value : ['']
        const isArray = Array.isArray(val)

        return isArray ? val : [val]
    }

    return (
        <div className={styles['table-filter']} >
            <div className={styles['table-filter-body']} style={props.filter.style} >
                {
                    type ?
                        <Checkbox.Group
                            value={handleCheckBoxValue(selectedKeys[0])}
                            onChange={(values: any) => { setSelectedKeys([values]) }}>
                            {
                                props.filter.domData && props.filter.domData.length ?
                                    handlDomData().map((item, index) => {
                                        return (
                                            <span key={`checkbox_${index}_key`}>
                                                <Checkbox key={`checkbox_${index}`} style={item.style} value={item.value}>{item.label}</Checkbox>
                                                <br />
                                            </span>
                                        )
                                    })
                                    : null
                            }
                        </Checkbox.Group>
                        :
                        <Radio.Group value={selectedKeys[0] !== undefined ? selectedKeys[0] : ''} onChange={(e: any) => { setSelectedKeys([e.target.value]) }}>
                            {
                                props.filter.domData && props.filter.domData.length ?
                                    handlDomData().map((item, index) =>
                                        <Radio key={`radio_${index}`} style={{
                                            ...radioStyle,
                                            ...item.style
                                        }} value={item.value}>{item.label}</Radio>
                                    )
                                    : null
                            }
                        </Radio.Group>
                }
            </div>
            <div className={styles['table-filter-btns']} >
                <Button size='small' type='link' onClick={reload}>重置</Button>
                <Button size='small' type='primary' onClick={submit}>确定</Button>

            </div>
        </div>
    )
}