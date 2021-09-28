import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { monitorQuickEntry } from '@/server/monitorManager';
import { repeatDeviceNumberFun, repeatSimNumberFun } from '../publicFun';

import Form from "antd/es/form";
import Button from "antd/es/button";
import Row from "antd/es/row";
import Col from "antd/es/col";
import { Select } from 'antd';
const { Option } = Select;
import { message } from 'antd';
import { getCurrentUserPermission } from '@/framework/utils/function';
import SearchSelect from '@/common/searchSelect';
import ProtocolType from '../../public/protocolType';
import { IOption } from "@/model/monitorMananger";

import styles from '../../index.module.less';
import { repeatFacilityNameFun } from "../../public/publicFun";

interface IProps {
    currentTable: any;
    unbindData: {
        thingList: Array<object>;
        deviceList: Array<object>;
        simCardList: Array<object>;
        facilityList: Array<object>;
    };
    facilityTypeData: Array<IOption>;
    getBindData: Function;
}

interface IState {
    checkFacilityId: null | string;
    checkDeviceId: null | string;
    checkSimId: null | string;
    btnLoading: boolean;
}

interface IQuickEntryParam {
    deviceId: string;
    deviceNumber: string;
    deviceType: string;
    moType: number;
    monitorId: string;
    monitorNumber: string;
    simCardId: string;
    simCardNumber: string;
}

// 当前页面权限
const permission = getCurrentUserPermission('4_facility_list');
class QuickEntryForm extends Component<IProps, IState, any>{
    formRef: any = React.createRef();

    constructor(props: IProps) {
        super(props);
        this.state = {
            checkFacilityId: null,
            checkDeviceId: null,
            checkSimId: null,
            btnLoading: false, // 提交按钮加载状态
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { facilityTypeData } = nextProps;
        if (facilityTypeData.length > 0) {
            this.formRef.current.setFieldsValue({
                typeId: { value: facilityTypeData[0].id, label: facilityTypeData[0].name },
            });
        }
    }

    /**
    * 设施编号切换
    */
    facilitySelect = (item: null | { id: string; typeId: number, typeName: string }) => {
        this.setState({
            checkFacilityId: item ? item.id : null
        }, () => {
            if (item) {
                this.formRef.current.setFieldsValue({
                    typeId: { id: item.typeId, label: item.typeName }
                });
            }
        })
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
        const { checkFacilityId, checkDeviceId, checkSimId } = this.state;
        this.setState({
            btnLoading: true,
        }, async () => {
            const param: any = values;
            param.moType = 3;
            param.deviceId = checkDeviceId || '';
            param.monitorId = checkFacilityId || '';
            param.simCardId = checkSimId || '';
            param.typeId = param.typeId.value;

            console.log('param', param);

            const result = await monitorQuickEntry<boolean>(param);
            if (result) {
                const { getBindData, currentTable } = this.props;
                getBindData();
                currentTable.current.reload();
                this.formRef.current.resetFields();
                message.success('绑定新增成功!');
                this.setState({
                    checkDeviceId: null,
                    checkFacilityId: null,
                    checkSimId: null,
                })
            }
            this.setState({
                btnLoading: false,
            })
        })
    }

    render() {
        const { facilityTypeData, unbindData: { simCardList, deviceList, facilityList } } = this.props;
        const { btnLoading, checkFacilityId, checkDeviceId } = this.state;


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
                            label={<span className={styles.hasRedIcon}>设施编号</span>}
                            name="monitorNumber"
                            className={styles.formItemCol}
                        >
                            <SearchSelect
                                menuData={facilityList}
                                titleKey='number'
                                formRef={this.formRef}
                                itemName="monitorNumber"
                                optionClick={this.facilitySelect}
                                itemRules={[
                                    { required: true, message: '设施编号不能为空' },
                                    {
                                        pattern: new RegExp(/^[\u4e00-\u9fa5-a-zA-Z0-9]{2,20}$/),
                                        message: '请输入汉字、字母、数字或短横杠,长度2-20位',
                                    },
                                    {
                                        validator: (rule: any, value: string, callback: Function) => {
                                            const { checkFacilityId } = this.state;
                                            if (!checkFacilityId) {
                                                repeatFacilityNameFun(rule, value, callback)
                                            } else {
                                                callback();
                                            }
                                        },
                                    }
                                ]}
                                inputProps={{
                                    maxLength: 20,
                                    placeholder: '请新增或选择设施编号'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="设施类型"
                            name="typeId"
                            rules={[{ required: true, message: '设施类型不能为空' }]}
                        >
                            <Select labelInValue disabled={checkFacilityId ? true : false}>
                                {
                                    facilityTypeData.map(item =>
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                    )
                                }
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
        facilityTypeData: state.monitorMananger.facilityTypeData
    }),
    dispatch => ({
        getBindData: (payload: any) => {
            dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
        },
    }),
)(injectIntl(QuickEntryForm as any));