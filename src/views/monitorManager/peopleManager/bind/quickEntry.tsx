import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { monitorQuickEntry, getPeoplePositionType } from '@/server/monitorManager';

import Form from "antd/es/form";
import Button from "antd/es/button";
import Row from "antd/es/row";
import Col from "antd/es/col";
import { Select, Input } from 'antd';
const { Option } = Select;
import { message } from 'antd';
import { getCurrentUserPermission } from '@/framework/utils/function';
import SearchSelect from '@/common/searchSelect';
import { realNameReg } from "@/framework/utils/regExp";
import { IOption } from "@/model/monitorMananger";
import ProtocolType from '../../public/protocolType';
import { repeatSimNumberFun, repeatDeviceNumberFun, repeatPeopleNumberFun } from "../../public/publicFun";
import styles from '../../index.module.less';


interface IProps {
    currentTable: any;
    unbindData: {
        peopleList: Array<object>;
        deviceList: Array<object>;
        simCardList: Array<object>;
    };
    postTypeData: Array<IOption>;
    getBindData: Function;
}

interface IState {
    checkNumberId: null | string;
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
const permission = getCurrentUserPermission('4_people_list');
class QuickEntryForm extends Component<IProps, IState, any>{
    formRef: any = React.createRef();

    constructor(props: IProps) {
        super(props);
        this.state = {
            checkNumberId: null,
            checkDeviceId: null,
            checkSimId: null,
            btnLoading: false, // 提交按钮加载状态
        }
    }

    /**
    * 工号切换
    */
    peopleNumberSelect = async (item: null | { id: string, name: string, number: string }) => {
        if (item) {
            const result = await getPeoplePositionType<{ id: number, professionalsType: string }>(item.id);
            if (result) {
                this.formRef.current.setFieldsValue({
                    aliases: item.name,
                    typeId: { value: result.id, label: result.professionalsType }
                });
            }
        }
        this.setState({
            checkNumberId: item ? item.id : null
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
        const { checkNumberId, checkDeviceId, checkSimId } = this.state;
        this.setState({
            btnLoading: true,
        }, async () => {
            const param: any = values;
            param.moType = 1;
            param.deviceId = checkDeviceId || '';
            param.monitorId = checkNumberId || '';
            param.simCardId = checkSimId || '';
            param.typeId = param.typeId.value;

            const result = await monitorQuickEntry<boolean>(param);
            if (result) {
                const { getBindData, currentTable } = this.props;
                getBindData();
                currentTable.current.reload();
                this.formRef.current.resetFields();
                message.success('绑定新增成功!');
                this.setState({
                    checkDeviceId: null,
                    checkNumberId: null,
                    checkSimId: null,
                })
            }
            this.setState({
                btnLoading: false,
            })
        })
    }

    render() {
        const { postTypeData, unbindData: { peopleList, simCardList, deviceList } } = this.props;
        const { btnLoading, checkNumberId, checkDeviceId } = this.state;

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
                initialValues={{
                    deviceType: 101100
                }}
                onFinish={this.quickEntryFun}
            >
                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item
                            label={<span className={styles.hasRedIcon}>工号</span>}
                            name="monitorNumber"
                            className={styles.formItemCol}
                        >
                            <SearchSelect
                                menuData={peopleList}
                                titleKey='number'
                                formRef={this.formRef}
                                itemName="monitorNumber"
                                optionClick={this.peopleNumberSelect}
                                itemRules={[
                                    { required: true, message: '工号不能为空' },
                                    {
                                        pattern: new RegExp(/^[A-Za-z0-9]{1,20}$/),
                                        message: '请输入字母/数字',
                                    },
                                    {
                                        validator: (rule: any, value: string, callback: Function) => {
                                            const { checkNumberId } = this.state;
                                            if (!checkNumberId) {
                                                repeatPeopleNumberFun(rule, value, callback)
                                            } else {
                                                callback();
                                            }
                                        },
                                    }
                                ]}
                                inputProps={{
                                    maxLength: 20,
                                    placeholder: '请新增或选择工号'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="姓名"
                            name="aliases"
                            rules={[
                                { required: true, message: '姓名不能为空' },
                                {
                                    validator: async (rule: any, value: string) => {
                                        if (value) {
                                            console.log('姓名不能为空', value);

                                            if (value.length != value.trim().length || value.length < 2 || !realNameReg.test(value)) {
                                                return Promise.reject('格式为中文/字母/原点/非首尾的空格,长度2-25位');
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                }
                            ]}
                        >
                            <Input maxLength={25} placeholder='请输入姓名' autoComplete='off' allowClear />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="岗位类型"
                            name="typeId"
                            rules={[{ required: true, message: '岗位类型不能为空' }]}
                        >
                            <Select labelInValue disabled={checkNumberId ? true : false} placeholder="请选择岗位类型">
                                {
                                    postTypeData.map(item =>
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
        postTypeData: state.monitorMananger.postTypeData
    }),
    dispatch => ({
        getBindData: (payload: any) => {
            dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
        },
    }),
)(injectIntl(QuickEntryForm as any));