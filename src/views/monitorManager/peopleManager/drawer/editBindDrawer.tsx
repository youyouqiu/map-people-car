/**
 * 修改车辆绑定信息
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import moment from 'moment';
import {
    Form, Select, DatePicker, Spin
} from 'antd';
const { Option } = Select;
import { EditDrawer } from '@/common/';

import {
    getPeopleBindInfo, updateMonitorBindInfo, repeatMonitorNumber, repeatPeopleName, checkShiftByMonitorId,
} from '@/server/monitorManager';

import PublicTreeSelect from '@/common/publicTreeSelect';
import SearchSelect from '@/common/searchSelect';


import styles from '../../index.module.less';
import { message } from 'antd';
// import { regularText } from '@/common/rules';
import { getSelectContainer } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';
import { IOption } from '@/model/monitorMananger';
import { realNameReg } from '@/framework/utils/regExp';
import { getStore } from '@/framework/utils/localStorage';

interface IProps {
    monitorInfo: any;
    drawerVisible: {
        editBindInfo: boolean;
        detailVisible: boolean | undefined | 'synthesisSet';
    };
    changeDrawer: Function;
    unbindData: {
        vehicleList: Array<object>;
        deviceList: Array<object>;
        simCardList: Array<object>;
    };
    protocolTypeData: Array<IOption>;
    getBindData: Function;
    postTypeData: Array<IOption>;
    groupTreeData: Array<object>;
    currentTable: any;
}

interface IState {
    monitorId: string;
    bindInfo: any;
    simCardId: string | null;
    deviceId: string | null;
    loading: boolean;
    disabledStatus: boolean;
}

const dateArr = ['billingDate', 'expireDate'];// 需要转换日期格式的字段

class EditBindDrawer extends Component<IProps, IState, any> {
    formRef: any = React.createRef();
    constructor(props: IProps) {
        super(props);
        this.state = {
            monitorId: '',
            bindInfo: {},
            loading: true,
            disabledStatus: false,// 字段禁用控制
            simCardId: '',// SIM卡id
            deviceId: '',// 终端id
        };
    }

    componentDidMount() {
        const { monitorInfo: { id }, drawerVisible: { editBindInfo } } = this.props;
        if (editBindInfo) {
            this.setState({
                loading: true
            }, () => {
                this.getBindInfo(id);
            })
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { monitorInfo, drawerVisible: { editBindInfo } } = nextProps;
        const { monitorId } = this.state;
        if (editBindInfo && monitorInfo) {
            const { monitorInfo: { id } } = nextProps;
            if (monitorId === '' || id && monitorId !== id) {
                this.setState({
                    loading: true
                }, () => {
                    this.getBindInfo(id);
                })
            }
        }
    }

    /**
     * 获取绑定信息并对页面表单元素赋值
     * @param monitorId 车辆Id
     */
    getBindInfo = async (monitorId: string) => {
        const resultData: any = await getPeopleBindInfo<Record<string, any>>(monitorId);
        const checkStatus = await checkShiftByMonitorId<boolean>(monitorId);
        if (resultData) {
            const result = JSON.parse(JSON.stringify(resultData));
            dateArr.map(key => {
                result[key] = result[key] ? moment(result[key]) : '';
            })
            this.setState({
                monitorId,
                bindInfo: resultData,
                simCardId: resultData.simCardId,
                deviceId: resultData.deviceId,
                loading: false,
                disabledStatus: checkStatus === undefined ? false : checkStatus,
            }, () => {
                // 重新组装所属企业下拉项值
                if (result.orgName) {
                    result.orgId = { label: result.orgName, value: result.orgId };
                }
                if (result.simCardOrgName) {
                    result.simCardOrgId = { label: result.simCardOrgName, value: result.simCardOrgId };
                }
                if (result.deviceOrgName) {
                    result.deviceOrgId = { label: result.deviceOrgName, value: result.deviceOrgId };
                }
                result.positionTypeId = { label: result.positionType, value: result.positionTypeId }
                this.formRef.current.setFieldsValue(result);
            })
        } else {
            this.setState({
                loading: false,
                disabledStatus: checkStatus === undefined ? false : checkStatus,
            });
        }
    }

    /**
     * 渲染下拉选项
     */
    renderSelectOption = (data: Array<IOption>, key?: string) => {
        return data.map((item: any) => (
            <Option
                value={key ? item[key] : item.id}
                key={`${item.name}_${item.id}`}
            >
                {item.name}
            </Option>
        ))
    }

    /**
     * 改变抽屉显示状态
     */
    changeDrawerVisible = (param: object) => {
        const { changeDrawer } = this.props;
        this.setState({
            monitorId: ''
        }, () => {
            this.formRef.current.resetFields();
            changeDrawer(param);
        })
    };

    /**
     * 校验终端或者SIM卡是否变动
     */
    checkIsChange = (newData: any) => {
        const { bindInfo } = this.state;
        let change = false;
        Object.keys(newData).map(key => {
            if (newData[key] !== bindInfo[key]) {
                change = true;
            }
        })
        return change;
    }

    /**
     * 表单提交
     */
    formSubmit = async (values: any) => {
        const { bindInfo, simCardId, deviceId, monitorId } = this.state;

        console.log('提交参数', values);
        dateArr.map(key => {
            values[key] = values[key] ? moment(values[key]).format('YYYY-MM-DD') : '';
        })

        // 组装旧的绑定信息
        values.oldDeviceId = bindInfo.deviceId;
        values.oldMonitorId = bindInfo.monitorId;
        values.oldSimCardId = bindInfo.simCardId;

        // 组装更改后的绑定信息
        values.aliases = values.name;
        values.typeId = values.positionTypeId.value;
        values.monitorId = monitorId;
        values.moType = 1;
        values.simCardId = simCardId;
        values.deviceId = deviceId;

        if (values.orgId && typeof values.orgId === 'object') {
            values.orgName = values.orgId.label;
            values.orgId = values.orgId.value;
        }
        // 终端,SIM卡所属企业与监控对象所属企业一致
        values.simCardOrgName = values.orgName;
        values.simCardOrgId = values.orgId;
        values.deviceOrgName = values.orgName;
        values.deviceOrgId = values.orgId;

        // 监控对象信息是变更(0:没变,1:修改,2:变更)
        const newData = {
            monitorNumber: values.monitorNumber,
            name: values.name,
            positionType: values.positionTypeId.label,
            orgId: values.orgId,
            billingDate: values.billingDate,
            expireDate: values.expireDate,
        }
        values.monitorUpdateOrChange = this.checkIsChange(newData) ? 1 : 0;

        // 终端信息是变更(0:没变,1:修改,2:变更)
        if (values.deviceId) {
            if (values.deviceId === values.oldDeviceId) {
                const newData = {
                    deviceType: values.deviceType,
                    deviceOrgId: values.deviceOrgId
                }
                values.deviceUpdateOrChange = this.checkIsChange(newData) ? 1 : 0;
            } else {
                values.deviceUpdateOrChange = 2;
            }
        } else {
            values.deviceUpdateOrChange = 1;
        }

        // SIM卡信息是变更(0:没变,1:修改,2:变更)
        if (values.simCardId) {
            if (values.simCardId === values.oldSimCardId) {
                const newData = {
                    iccid: values.iccid,
                    operator: values.operator,
                    realNumber: values.realNumber,
                    simCardOrgId: values.simCardOrgId
                }
                values.simCardUpdateOrChange = this.checkIsChange(newData) ? 1 : 0;
            } else {
                values.simCardUpdateOrChange = 2;
            }
        } else {
            values.simCardUpdateOrChange = 1;
        }

        // if (values.simCardOrgId && typeof values.simCardOrgId === 'object') {
        //     values.simCardOrgName = values.simCardOrgId.label;
        //     values.simCardOrgId = values.simCardOrgId.value;
        // }
        // if (values.deviceOrgId && typeof values.deviceOrgId === 'object') {
        //     values.deviceOrgName = values.deviceOrgId.label;
        //     values.deviceOrgId = values.deviceOrgId.value;
        // }

        const result: any = await updateMonitorBindInfo<boolean>(values);
        if (result) {
            const { currentTable } = this.props;
            this.changeDrawerVisible({ editBindInfo: false, detailVisible: false });
            message.success('修改成功');
            currentTable.current.reload();
        }
    }

    /**
     * 关闭抽屉
     */
    closeDrawer = () => {
        this.setState({
            monitorId: ''
        }, () => {
            const { changeDrawer } = this.props;
            this.formRef.current.resetFields();
            changeDrawer({ editBindInfo: false });
        })
    }

    /**
    * 校验工号是否已存在
    */
    repeatMonitorNumberFun = (rule: any, value: string, callback: Function) => {
        if (!value) {
            callback();
            return;
        }
        const param = new URLSearchParams();
        param.set('number', value);
        const { monitorInfo: { id } } = this.props;
        param.set('id', id);

        repeatMonitorNumber<boolean>(param).then(res => {
            if (res) {
                callback();
            } else {
                callback('车牌号已存在');
            }
        });
    }

    /**
     * 控制日期可选范围
     * 到期日期必须大于等于计费日期
     */
    dateDisabled = (currentDate: any, key: string) => {
        const startDate = this.formRef.current.getFieldValue('billingDate');
        const endDate = this.formRef.current.getFieldValue('expireDate');
        if (key === 'billingDate' && endDate) {// 计费日期
            return currentDate >= endDate;
        } else if (key === 'expireDate' && startDate) {// 到期日期
            return currentDate < startDate;
        }
        return false;
    }

    /**
     * 校验人员工号是否重复
     */
    repeatPeopleNumberFun = (rule: any, value: string, callback: Function) => {
        if (!value) {
            callback();
            return;
        }
        const { monitorInfo: { id } } = this.props;
        const param: any = {
            jobNumber: value,
            id: id,
            orgId: getStore('orgId') || ''
        };

        const orgId = this.formRef.current.getFieldValue('orgId');
        if (orgId) {
            param.orgId = orgId.value ? orgId.value : orgId;
        }
        console.log('orgId', orgId, param);

        repeatPeopleName<boolean>(param).then(res => {
            if (res) {
                callback();
            } else {
                callback('工号已存在');
            }
        });
    }

    /**
     * 获取表单显示列信息
     */
    getTableColumn = () => {
        const {
            groupTreeData, postTypeData, protocolTypeData, unbindData: { simCardList, deviceList },
        } = this.props;
        const { disabledStatus } = this.state;

        // 对象详情
        const monitorInfoColumn = [{
            name: '工号',
            key: 'monitorNumber',
            validate: {
                rules: [
                    { required: true, message: '工号不能为空' },
                    {
                        pattern: new RegExp(/^[A-Za-z0-9]{1,20}$/),
                        message: '请输入字母/数字',
                    },
                    {
                        validator: this.repeatPeopleNumberFun,
                    }
                ]
            },
            inputProps: {
                maxLength: 20,
            },
        }, {
            name: '姓名',
            key: 'name',
            validate: {
                rules: [
                    { required: true, message: '姓名不能为空' },
                    {
                        validator: async (rule: any, value: string) => {
                            if (value) {
                                if (value.length != value.trim().length || value.length < 2 || !realNameReg.test(value)) {
                                    return Promise.reject('格式为中文/字母/原点/非首尾的空格,长度2-25位');
                                }
                                return Promise.resolve();
                            }
                        }
                    }
                ]
            },
            inputProps: {
                maxLength: 25,
            },
        }, {
            name: '岗位类型',
            key: 'positionTypeId',
            colWidth: 200,
            validate: {
                rules: [{ required: true, message: '请选择岗位类型' }]
            },
            component: <Select disabled={disabledStatus} bordered={false} labelInValue>
                {this.renderSelectOption(postTypeData)}
            </Select>
        }, {
            name: '所属企业',
            key: 'orgId',
            validate: {
                rules: [{ required: true, message: '请选择所属企业' }]
            },
            component: <PublicTreeSelect
                bordered={false}
                treeData={groupTreeData}
                treeType='enterprise'
                placeholder='请勾选企业'
                disabled={disabledStatus}
                getPopupContainer={() => getSelectContainer('peopleBindSelectContainer')}
            />
        }];

        // 终端详情
        const deviceInfoColumn = [{
            name: '终端号',
            key: 'deviceNumber',
            validate: {
                rules: [{ required: true, message: '终端号不能为空' }]
            },
            component: <SearchSelect
                menuData={deviceList}
                titleKey='deviceNumber'
                formRef={this.formRef}
                itemName="deviceNumber"
                linkageField='deviceId'
                optionClick={(item: null | { id: string }) => {
                    this.setState({
                        deviceId: item ? item.id : null,
                    })
                }}
                itemRules={[
                    { required: true, message: '终端号不能为空' },
                    {
                        pattern: new RegExp(/^[a-zA-Z0-9]{7,30}$/),
                        message: '请输入字母、数字,长度7~30位',
                    }
                ]}
                inputProps={{
                    maxLength: 30,
                    placeholder: '请输入或选择终端号'
                }}
            />
        }, {
            name: '终端厂商',
            key: 'terminalManufacturer',
            validate: {
                rules: [{ required: true, message: '请选择终端厂商' }]
            },
            component: <Select
                bordered={false}
                getPopupContainer={() => getSelectContainer('vehBindSelectContainer')}
            >
                <Option value="[f]F3">[f]F3</Option>
            </Select>
        }, {
            name: '终端型号',
            key: 'terminalTypeId',
            colWidth: 205,
            validate: {
                rules: [{ required: true, message: '请选择终端型号' }]
            },
            component: <Select bordered={false}>
                <Option value="-1">F3-default</Option>
            </Select>
        }, {
            name: '通讯类型',
            key: 'deviceType',
            validate: {
                rules: [{ required: true, message: '请选择通讯类型' }]
            },
            component: <Select bordered={false} placeholder="请选择通讯类型">
                {
                    protocolTypeData.map((item: any) =>
                        <Option key={item.val} value={item.val}>{item.name}</Option>
                    )
                }
            </Select>
        }, {
            name: '所属企业',
            key: 'orgId',
            validate: {
                rules: [{ required: true, message: '请选择所属企业' }]
            },
            component: <PublicTreeSelect
                bordered={false}
                treeData={groupTreeData}
                treeType='enterprise'
                placeholder='请勾选企业'
                disabled={disabledStatus}
                getPopupContainer={() => getSelectContainer('peopleBindSelectContainer')}
            />
        }];

        // SIM卡详情
        const simInfoColumn = [{
            name: '终端手机号',
            key: 'simCardNumber',
            validate: {
                rules: [{ required: true, message: '终端手机号不能为空' }]
            },
            component: <SearchSelect
                menuData={simCardList}
                titleKey='simCardNumber'
                formRef={this.formRef}
                itemName="simCardNumber"
                linkageField='simCardId'
                optionClick={(item: null | { id: string }) => {
                    this.setState({
                        simCardId: item ? item.id : null
                    })
                }}
                itemRules={[
                    { required: true, message: '终端手机号不能为空' },
                    {
                        pattern: new RegExp(/^[0-9]{7,20}$/),
                        message: '请输入字母、数字,长度7~20位',
                    }
                ]}
                inputProps={{
                    maxLength: 20,
                    placeholder: '请输入或选择终端手机号'
                }}
            />
        }, {
            name: 'ICCID',
            key: 'iccid',
            validate: {
                rules: [{
                    pattern: new RegExp(/^[0-9A-Z]{0,20}$/),
                    message: '请输入数字/大写字母',
                }]
            },
            inputProps: {
                maxLength: 20,
            }
        }, {
            name: '真实SIM卡号',
            key: 'realNumber',
            colWidth: 200,
            validate: {
                rules: [{
                    pattern: new RegExp(/^[0-9]{7,20}$/),
                    message: '请输入数字,长度7-20位',
                }]
            },
            inputProps: {
                maxLength: 20,
            }
        }, {
            name: '运营商',
            key: 'operator',
            validate: {
                rules: [{ required: true, message: '请选择运营商' }]
            },
            component: <Select bordered={false} placeholder="请选择运营商" getPopupContainer={() => getSelectContainer('peopleBindSelectContainer')}>
                <Option value='中国移动'>中国移动</Option>
                <Option value='中国联通'>中国联通</Option>
                <Option value='中国电信'>中国电信</Option>
            </Select>
        }, {
            name: '所属企业',
            key: 'orgId',
            validate: {
                rules: [{ required: true, message: '请选择所属企业' }]
            },
            component: <PublicTreeSelect
                bordered={false}
                treeData={groupTreeData}
                treeType='enterprise'
                placeholder='请勾选企业'
                disabled={disabledStatus}
                getPopupContainer={() => getSelectContainer('peopleBindSelectContainer')}
            />
        }];

        // 服务期限
        const dateInfoColumn = [{
            name: '计费日期',
            key: 'billingDate',
            component: <DatePicker
                bordered={false}
                style={{ width: '100%' }}
                disabledDate={(current: any) => { return this.dateDisabled(current, 'billingDate') }}
                getPopupContainer={() => getSelectContainer('peopleBindSelectContainer')} />
        }, {
            name: '到期日期',
            key: 'expireDate',
            component: <DatePicker
                bordered={false}
                style={{ width: '100%' }}
                disabledDate={(current: any) => { return this.dateDisabled(current, 'expireDate') }}
                getPopupContainer={() => getSelectContainer('peopleBindSelectContainer')} />
        }]
        return { monitorInfoColumn, deviceInfoColumn, simInfoColumn, dateInfoColumn };
    }

    render() {
        const { drawerVisible: { editBindInfo } } = this.props;
        const { loading } = this.state;
        const { monitorInfoColumn, deviceInfoColumn, simInfoColumn, dateInfoColumn } = this.getTableColumn();


        return (
            <EditDrawer
                title="修改绑定信息"
                width={1060}
                onClose={this.closeDrawer}
                visible={editBindInfo}
                getContainer="body"
                onConfirm={() => {
                    this.formRef.current.submit()
                }}
            >
                <div className={styles.editForm}>
                    <Form
                        ref={this.formRef}
                        initialValues={{
                            deviceType: 101100,
                            operator: '中国移动',
                            terminalManufacturer: '[f]F3',
                            terminalTypes: 'F3-default'
                        }}
                        onFinish={this.formSubmit}
                        className={styles.publicDrawer}
                        id="peopleBindSelectContainer"
                        style={{ position: 'relative' }}
                    >
                        <div className={styles.innerBox}>
                            <TableForm dataSource={monitorInfoColumn} column={6} header='对象详情' />
                            <TableForm dataSource={deviceInfoColumn} column={6} header='终端详情' />
                            <TableForm dataSource={simInfoColumn} column={6} header='SIM卡详情' />
                            <TableForm dataSource={dateInfoColumn} column={6} header='服务期限' />
                        </div>
                    </Form>
                    {/* 加载loading */}
                    {loading && <Spin className={[styles.spinning, styles.loading].join(' ')} spinning />}
                </div>
            </EditDrawer>
        );
    }
}
export default connect(
    (state: AllState) => ({
        unbindData: state.monitorMananger.unbindData,
        groupTreeData: state.monitorMananger.groupTreeData,
        protocolTypeData: state.monitorMananger.protocolTypeData,
        postTypeData: state.monitorMananger.postTypeData,
    }),
    dispatch => ({
        getBindData: (payload: any) => {
            dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
        },
    }),
)(EditBindDrawer);