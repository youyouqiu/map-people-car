import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { getUnknownDevice, monitorSpeedEntry } from '@/server/monitorManager';

import Form from "antd/es/form";
import Button from "antd/es/button";
import Row from "antd/es/row";
import Col from "antd/es/col";
import { Select } from 'antd';
const { Option } = Select;
import Input from "antd/es/input";
import { message } from 'antd';

import { getCurrentUserPermission } from '@/framework/utils/function';
import SearchSelect from '@/common/searchSelect';
import ProtocolType from '../../public/protocolType';
import styles from '../../index.module.less';
import { IOption } from "@/model/monitorMananger";
import { repeatFacilityNameFun } from "../../public/publicFun";

interface IDeviceData {
    deviceId: string;
    deviceType: string;
    id: string;
    monitorNumber: string;
    simNumber: string;
    status: number;
    uniqueNumber: string;
}

interface ISpeedParam {
    deviceId: string;
    deviceNumber: string;
    deviceType: string;
    moType: string;
    monitorId: string;
    monitorNumber: string;
    simCardId: string;
    simCardNumber: string;
    uniqueNumber: string;
}

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
    unknownDeviceData: Array<any>;
    editStatus: boolean;
    checkFacilityId: null | string;
    checkDeviceId: null | string;
    btnLoading: boolean;
}



// 当前页面权限
const permission = getCurrentUserPermission('4_facility_list');
let searchTimer: any = null;// 未注册设备模糊搜索定时器
class SpeedEntryForm extends Component<IProps, IState, any>{
    formRef: any = React.createRef();

    constructor(props: IProps) {
        super(props);
        this.state = {
            unknownDeviceData: [],
            editStatus: false,//是否可编辑
            checkFacilityId: null,
            checkDeviceId: null,
            btnLoading: false, // 提交按钮加载状态
        }
    }

    componentDidMount() {
        this.getUnknownDeviceData();
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { facilityTypeData } = nextProps;
        if (facilityTypeData.length > 0) {
            this.formRef.current.setFieldsValue({
                typeId: facilityTypeData[0].id,
            });
        }
    }

    /**
     * 获取未注册设备数据
     * @param keyword 模糊搜索参数
     */
    getUnknownDeviceData = async (keyword?: string) => {
        if (keyword === undefined) {
            const result = await getUnknownDevice<Array<Record<string, any>>>({ keyword: keyword || '' });
            if (result) {
                this.setState({
                    unknownDeviceData: result
                })
            }
        } else {
            if (searchTimer) clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                const result = await getUnknownDevice<Array<Record<string, any>>>({ keyword: keyword || '' });
                if (result) {
                    this.setState({
                        unknownDeviceData: result
                    })
                }
            }, 500);
        }
    }

    /**
     * 获取未注册数据信息
     */
    dropdownVisibleChange = (open: boolean) => {
        if (open) {
            this.getUnknownDeviceData();
        }
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
     * 极速录入
     */
    speedEntryFun = (values: ISpeedParam) => {
        const { checkFacilityId, checkDeviceId } = this.state;

        this.setState({
            btnLoading: true
        }, async () => {
            const param = values;
            param.moType = '3';
            param.deviceId = checkDeviceId || '';
            param.monitorId = checkFacilityId || '';

            const result = await monitorSpeedEntry<boolean>(param);
            if (result) {
                const { getBindData, currentTable } = this.props;
                getBindData();
                currentTable.current.reload();
                this.getUnknownDeviceData();
                this.formRef.current.resetFields();
                message.success('绑定新增成功!');
                this.setState({
                    checkDeviceId: null,
                    checkFacilityId: null,
                })
            }
            this.setState({
                btnLoading: false,
            })
        })
    }

    renderUnregisteredData = () => {
        const { unknownDeviceData } = this.state;
        return unknownDeviceData.map((item: IDeviceData) => {
            if (item.status === 0) {
                return <Option value={item.id} key={`${item.id}_${item.uniqueNumber}`} className={styles.noBindOptoion} item={item}>{item.uniqueNumber}</Option>
            }
            return <Option value={item.id} key={`${item.id}_${item.uniqueNumber}`} className={styles.bindOptoion} item={item}>{item.uniqueNumber}</Option>
        })
    }

    /**
     * 未注册设备点击事件
     */
    unregisteredItemClick = (value: string, node: any) => {
        console.log('value, node, extra', value, node);
        const { item } = node;
        const itemObj = {
            number: item.monitorName,
            deviceType: parseInt(item.deviceType),
            deviceNumber: item.deviceNumber,
            monitorNumber: item.monitorName,
            simCardNumber: item.simCardNumber,
        }
        this.formRef.current.setFieldsValue(itemObj);
        this.setState({ editStatus: true, });
    }

    /**
     * 车牌号切换
     */
    vehicleSelect = (item: null | { id: string; plateColor: number }) => {
        this.setState({
            checkFacilityId: item ? item.id : null
        }, () => {
            if (item) {
                this.formRef.current.setFieldsValue({
                    plateColor: item.plateColor
                });
            }
        })
    }

    render() {
        const { facilityTypeData, unbindData: { thingList, deviceList, facilityList } } = this.props;
        const { editStatus, btnLoading } = this.state;

        return (
            <Form
                ref={this.formRef as any}
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
                onFinish={this.speedEntryFun}
                id='editFacilityBandForm'
            >
                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item
                            label="未注册设备"
                            name="uniqueNumber"
                            rules={[{ required: true, message: '未注册设备不能为空' }]}
                        >
                            <Select
                                showSearch
                                placeholder="平台已接收的信息"
                                optionFilterProp="children"
                                allowClear
                                onSelect={this.unregisteredItemClick}
                                onSearch={this.getUnknownDeviceData}
                                onDropdownVisibleChange={this.dropdownVisibleChange}
                                filterOption={(input, option: any) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {this.renderUnregisteredData()}
                            </Select>
                        </Form.Item>
                    </Col>
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
                                optionClick={this.vehicleSelect}
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
                                    disabled: !editStatus,
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
                            <Select>
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
                    <Col span={6}><ProtocolType disabled /></Col>
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
                                ]}
                                inputProps={{
                                    maxLength: 30,
                                    disabled: !editStatus,
                                    placeholder: '请新增或选择终端号'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="终端手机号"
                            name="simCardNumber"
                            rules={[{ required: true, message: '终端手机号不能为空' }]}
                        >
                            <Input type='text' disabled />
                        </Form.Item>
                    </Col>
                    <Col span={6} push={4}>
                        <Button
                            disabled={permission.indexOf('绑定') === -1}
                            loading={btnLoading}
                            type="primary"
                            htmlType='submit'
                        >提交</Button>
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
)(injectIntl(SpeedEntryForm as any));