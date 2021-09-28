/**
 * 参考对象组件
 */
import React, { Component } from 'react';
import { Select } from 'antd';
const { Option } = Select;

import { getMonitorDropdown, getIoSetTMonitorDropdown } from '@/server/monitorManager';

interface IProps {
    monitorId: string;
    type?: 'pollling' | 'ioSet';
    [propertys: string]: any
}
interface IState {
    monitorData: Array<IItem>
}
interface IItem {
    monitorId: number,
    monitorName: string
}

class ReferenceMonitor extends Component<IProps, IState, any> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            monitorData: [],// 参考对象下拉项信息
        };
    }

    componentDidMount() {
        this.getMonitorDropdownFun('');
    }

    getMonitorDropdownFun = async (param: string) => {
        const { monitorId, type } = this.props;
        if (type && type === 'ioSet') {// 传感器设置
            const result = await getIoSetTMonitorDropdown<Array<IItem>>({ keyword: param, monitorId });
            if (result) {
                this.setState({
                    monitorData: result
                })
            }
        } else {// 外设轮询
            const result = await getMonitorDropdown<Array<IItem>>({ keyword: param, monitorId });
            if (result) {
                this.setState({
                    monitorData: result
                })
            }
        }
    }

    render() {
        const { monitorId, type, ...otherProps } = this.props;
        const { monitorData } = this.state;
        return (
            <Select {...otherProps} showSearch allowClear onSearch={this.getMonitorDropdownFun}>
                {
                    monitorData.map(item =>
                        <Option key={item.monitorId} value={item.monitorId}>{item.monitorName}</Option>
                    )
                }
            </Select>
        );
    }
}
export default ReferenceMonitor;
