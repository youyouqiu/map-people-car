/**
 * 通讯类型下拉框
 */
import React, { Component } from "react";
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { Select, Form } from 'antd';
const { Option } = Select;
import { IOption } from "@/model/monitorMananger";

interface IProps {
    disabled?: boolean,
    protocolTypeData: Array<IOption>;
}

class ProtocolType extends Component<IProps, any, any>{
    constructor(props: IProps) {
        super(props);
    }

    render() {
        const { protocolTypeData, disabled } = this.props;

        return <Form.Item
            label="通讯类型"
            name="deviceType"
            rules={[{ required: true, message: '通讯类型不能为空' }]}
        >
            <Select disabled={disabled} placeholder="请选择通讯类型">
                {
                    protocolTypeData.map((item: any) =>
                        <Option key={item.val} value={item.val}>{item.name}</Option>
                    )
                }
            </Select>
        </Form.Item>
    }
}


export default connect(
    (state: AllState) => ({
        protocolTypeData: state.monitorMananger.protocolTypeData,
    }),
)(ProtocolType);