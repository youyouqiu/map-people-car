import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { quickEntry, getVehicleType, getVehicleTypeValue } from '@/server/monitorManager';
import { repeatMonitorNumberFun, repeatDeviceNumberFun, repeatSimNumberFun } from '../../public/publicFun';

import Form from "antd/es/form";
import Button from "antd/es/button";
import Row from "antd/es/row";
import Col from "antd/es/col";
import { Select } from 'antd';
const { Option } = Select;
import { message } from 'antd';
import { getCurrentUserPermission } from '@/framework/utils/function';
import SearchSelect from '@/common/searchSelect';
import { IOption } from "@/model/monitorMananger";

import ProtocolType from '../../public/protocolType';
import styles from '../../index.module.less';


interface IProps {
    currentTable: any;
    unbindData: {
        vehicleList: Array<object>;
        deviceList: Array<object>;
        simCardList: Array<object>;
    };
    vehicleTypeData: Array<IOption>;
    getBindData: Function;
}

interface IState {
    checkVehicleId: null | string;
    checkDeviceId: null | string;
    checkSimId: null | string;
    btnLoading: boolean;
}

interface IQuickEntryParam {
    deviceId: string;
    deviceNumber: string;
    deviceType: string;
    groupIds: string;
    moType: number;
    monitorId: string;
    monitorNumber: string;
    simCardId: string;
    simCardNumber: string;
}

// 当前页面权限
const permission = getCurrentUserPermission('4_vehicle_list');
class QuickEntryForm extends Component<IProps, IState, any>{
    formRef: any = React.createRef();

    constructor(props: IProps) {
        super(props);
        this.state = {
            checkVehicleId: null,
            checkDeviceId: null,
            checkSimId: null,
            btnLoading: false, // 提交按钮加载状态
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { vehicleTypeData } = nextProps;
        if (vehicleTypeData.length > 0) {
            this.formRef.current.setFieldsValue({
                typeId: {
                    label: vehicleTypeData[0].name,
                    value: vehicleTypeData[0].id
                },
            });
        }
    }

    /**
    * 车牌号切换
    */
    vehicleSelect = async (item: null | { id: string }) => {
        if (item) {
            const result: any = await getVehicleTypeValue(item.id);
            if (result) {
                const key = Object.keys(result)[0];
                this.formRef.current.setFieldsValue({
                    typeId: {
                        label: result[key],
                        value: Object.keys(result)[0]
                    }
                });
            }
        }
        this.setState({
            checkVehicleId: item ? item.id : null
        })
    }

    /**
     * 渲染下拉选项
     */
    renderSelectOption = (data: Array<IOption>) => {
        return data.map((item: any) => (
            <Option value={item.id ? item.id : item.val} key={`${item.name}_${item.id}`}>{item.name}</Option>
        ))
    }

    /**
     * 选择终端号,联动显示通讯类型
     * @param item 
     */
    deviceSelect = (item: null | { id: string, deviceType: number }) => {
        this.setState({
            checkDeviceId: item ? item.id : null
        }, () => {
            if (item) {
                this.formRef.current.setFieldsValue({
                    deviceType: item.deviceType
                });
            }
        })
    }

    /**
     * 快速录入
     */
    quickEntryFun = (values: IQuickEntryParam) => {
        const { checkVehicleId, checkDeviceId, checkSimId } = this.state;
        this.setState({
            btnLoading: true,
        }, async () => {
            const param: any = values;
            param.moType = 0;
            param.monitorId = checkVehicleId || '';
            param.deviceId = checkDeviceId || '';
            param.simCardId = checkSimId || '';
            param.typeId = param.typeId.value;

            const result = await quickEntry<boolean>(param);
            if (result) {
                const { getBindData, currentTable } = this.props;
                getBindData();
                currentTable.current.reload();
                this.formRef.current.resetFields();
                message.success('绑定新增成功!');
                this.setState({
                    checkDeviceId: null,
                    checkVehicleId: null,
                    checkSimId: null,
                })
            }
            this.setState({
                btnLoading: false,
            })
        })
    }

    render() {
        const { vehicleTypeData, unbindData: { vehicleList, simCardList, deviceList } } = this.props;
        const { btnLoading, checkVehicleId, checkDeviceId } = this.state;

        return (
            <Form
                ref={this.formRef}
                labelCol={{
                    xxl: { span: 6 },
                    xl: { span: 9 },
                    lg: { span: 12 },
                    md: { span: 24 },
                }}
                wrapperCol={{
                    xxl: { span: 18 },
                    xl: { span: 15 },
                    lg: { span: 12 },
                    md: { span: 24 },
                }}
                initialValues={{ deviceType: 101100 }}
                onFinish={this.quickEntryFun}
            >
                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item
                            label={<span className={styles.hasRedIcon}>车牌号</span>}
                            name="monitorNumber"
                            className={styles.formItemCol}
                        >
                            <SearchSelect
                                menuData={vehicleList}
                                titleKey='number'
                                formRef={this.formRef}
                                itemName="monitorNumber"
                                optionClick={this.vehicleSelect}
                                itemRules={[
                                    { required: true, message: '车牌号不能为空' },
                                    {
                                        pattern: new RegExp(/^[\u4e00-\u9fa5-a-zA-Z0-9]{2,20}$/),
                                        message: '请输入汉字、字母、数字或短横杠,长度为2-20',
                                    },
                                    {
                                        validator: (rule: any, value: string, callback: Function) => {
                                            const { checkVehicleId } = this.state;
                                            if (!checkVehicleId) {
                                                repeatMonitorNumberFun(rule, value, callback)
                                            } else {
                                                callback();
                                            }
                                        },
                                    }
                                ]}
                                inputProps={{
                                    maxLength: 20,
                                    placeholder: '请新增或选择车牌号'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="车辆类型"
                            name="typeId"
                            rules={[{ required: true, message: '车辆类型不能为空' }]}
                        >
                            <Select
                                labelInValue
                                placeholder="请选择车辆类型"
                                disabled={checkVehicleId ? true : false}
                            >
                                {this.renderSelectOption(vehicleTypeData)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={6}><ProtocolType disabled={!!checkDeviceId} /></Col>
                    <Col span={6}>
                        <Form.Item
                            label={<span className={styles.hasRedIcon}>终端号</span>}
                            name="deviceNumber"
                            className={styles.formItemCol}
                        >
                            <SearchSelect
                                menuData={deviceList}
                                titleKey='deviceNumber'
                                formRef={this.formRef}
                                itemName="deviceNumber"
                                optionClick={this.deviceSelect}
                                itemRules={[
                                    { required: true, message: '终端号不能为空' },
                                    {
                                        pattern: new RegExp(/^[a-zA-Z0-9]{7,30}$/),
                                        message: '请输入字母、数字,长度7~30位',
                                    },
                                    {
                                        validator: (rule: any, value: string, callback: Function) => {
                                            const { checkDeviceId } = this.state;
                                            if (!checkDeviceId) {
                                                repeatDeviceNumberFun(rule, value, callback)
                                            } else {
                                                callback();
                                            }
                                        },
                                    }
                                ]}
                                inputProps={{
                                    maxLength: 30,
                                    placeholder: '请新增或选择终端号'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label={<span className={styles.hasRedIcon}>终端手机号</span>}
                            name="simCardNumber"
                            className={styles.formItemCol}
                        >
                            <SearchSelect
                                menuData={simCardList}
                                titleKey='simCardNumber'
                                formRef={this.formRef}
                                itemName="simCardNumber"
                                optionClick={(item: null | { id: string }) => {
                                    this.setState({
                                        checkSimId: item ? item.id : null
                                    })
                                }}
                                itemRules={[
                                    { required: true, message: '终端手机号不能为空' },
                                    {
                                        pattern: new RegExp(/^[0-9]{7,20}$/),
                                        message: '请输入数字,长度7~20位',
                                    },
                                    {
                                        validator: (rule: any, value: string, callback: Function) => {
                                            const { checkSimId } = this.state;
                                            if (!checkSimId) {
                                                repeatSimNumberFun(rule, value, callback)
                                            } else {
                                                callback();
                                            }
                                        },
                                    }
                                ]}
                                inputProps={{
                                    maxLength: 20,
                                    placeholder: '请新增或选择终端手机号'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Button disabled={permission.indexOf('绑定') === -1} loading={btnLoading} type="primary" htmlType="submit">提交</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}


export default connect(
    (state: AllState) => ({
        unbindData: state.monitorMananger.unbindData,
        vehicleTypeData: state.monitorMananger.vehicleTypeData,
    }),
    dispatch => ({
        getBindData: (payload: any) => {
            dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
        },
    }),
)(injectIntl(QuickEntryForm as any));