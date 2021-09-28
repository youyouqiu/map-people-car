import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { message, Form, Spin, Select } from 'antd';
import { addMode, updateMode, getModeDetailById, positionTypeList, vehicleTypeList, vehicleTypeList2 } from '@/server/workManagement';

import { EditDrawer, PublicTreeSelect, TableForm } from '@/common';

import { FormInstance } from 'antd/lib/form';
import { regularText } from '@/common/rules';
import styles from './index.module.less';

// import { getSelectContainer } from '@/framework/utils/function'

const { Option } = Select;

interface IProps {
    type?: number; //抽屉类型(新增:0,修改:1)
    visible: boolean;
    closeDrawer: Function;
    orgId?: string; //当前选中上级组织id(新增的时候需要)
    orgName?: string; //当前选中上级组织name(新增的时候需要)
    rowId: string;
    reload: Function; //刷新列表
    getContainer?: 'body';
    closeDetailDrawer?: Function; //关闭详情抽屉
    enterpriseId?: string; // 用户企业Id
    organizationId: string;
    userType: number;
    userName: string; //用户名
}

interface IState {
    loading: boolean;
    workType: number;
    posotionType: string[];
    vehicelType: string[];
    dataSource: any[];
    dataSource2: any[];
    dataSource3: any[];
    isBind: boolean;
}

class ModeAddDrawer extends Component<IProps, IState> {
    static defaultProps = {
        type: 0,
    };

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            loading: true,
            workType: 1, //0 车辆作业 1 人工作业 2垃圾清运 3垃圾转运
            posotionType: [],
            vehicelType: [],
            isBind: false,
            dataSource: [
                {
                    name: '作业模式',
                    key: 'modeName',
                    nameWidth: 140,
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入作业模式',
                            },
                            regularText,
                        ],
                    },
                    inputProps: {
                        maxLength: 30,
                        placeholder: '请输入作业模式',
                    },
                },
                {
                    name: '作业类型',
                    key: 'modeType',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请选择作业类型',
                            },
                        ],
                    },

                    component: (
                        <Select bordered={false} onChange={(value: number) => this.handleWorkTypeChange(value)} placeholder={'请选择'}>
                            <Option value={0}>机器作业</Option>
                            <Option value={1}>人工作业</Option>
                            <Option value={2}>垃圾清运</Option>
                            <Option value={3}>垃圾转运</Option>
                        </Select>
                    ),
                },
            ],
            dataSource2: [
                {
                    name: '关联车辆类型',
                    key: 'monitorCategory',
                    nameWidth: 140,
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入关联车辆类型',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 10,
                        placeholder: '请输入关联车辆类型',
                    },
                    component: <Select bordered={false} placeholder="请选择"></Select>,
                },
            ],
            dataSource3: [
                {
                    name: '关联岗位类型',
                    key: 'monitorCategory',
                    nameWidth: 140,
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '关联岗位类型',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 10,
                        placeholder: '关联岗位类型',
                    },
                    component: <Select bordered={false} placeholder="请选择"></Select>,
                },
            ],
        };
    }

    /**
     * 作业类型改变
     */
    handleWorkTypeChange = (value: number) => {
        this.setState({
            workType: value,
        });
        this.formRef.current?.setFieldsValue({
            monitorCategory: '',
            workSpeed: '',
        });
    };

    /**
     * 获取岗位类型和车辆类型
     */
    getPositionAndVehicleType = async () => {
        const position = positionTypeList<string[]>(this.props.enterpriseId || '');
        const vehicle = vehicleTypeList2<string[]>(this.props.enterpriseId || '');
        const [positionRes, vehicelRes] = await Promise.all([position, vehicle]);
        if (positionRes && vehicelRes) {
            this.setState({
                posotionType: positionRes,
                vehicelType: vehicelRes,
            });
        }
        const newDataSource2 = [
            {
                name: '关联车辆类型',
                key: 'monitorCategory',
                nameWidth: 140,
                validate: {
                    rules: [
                        {
                            required: true,
                            message: '请输入关联车辆类型',
                        },
                    ],
                },
                inputProps: {
                    maxLength: 10,
                    placeholder: '请输入关联车辆类型',
                },
                component: (
                    <Select bordered={false} placeholder="请选择" disabled={this.state.isBind}>
                        {vehicelRes?.map((item: any) => {
                            return (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            );
                        })}
                    </Select>
                ),
            },
        ];
        const newDataSource3 = [
            {
                name: '关联岗位类型',
                key: 'monitorCategory',
                nameWidth: 140,
                validate: {
                    rules: [
                        {
                            required: true,
                            message: '关联岗位类型',
                        },
                    ],
                },
                inputProps: {
                    maxLength: 10,
                    placeholder: '关联岗位类型',
                },
                component: (
                    <Select bordered={false} placeholder="请选择" disabled={this.state.isBind}>
                        {positionRes?.map((item: any) => {
                            return (
                                <Option key={item.id} value={item.id} disabled={item.name == '管理组长'}>
                                    {item.name}
                                </Option>
                            );
                        })}
                    </Select>
                ),
            },
        ];
        this.setState({
            dataSource2: newDataSource2,
            dataSource3: newDataSource3,
        });
    };

    /** 数据源格式示例 */

    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { type, visible, rowId, userType, userName } = nextPros;

        // 新增的设置上级组织机构
        if (type == 0 && visible) {
            this.setState(
                {
                    loading: false,
                },
                () => {
                    //设置默认主管单位
                    if (userName !== 'admin' && userType == 1) {
                        this.formRef.current?.setFieldsValue({
                            enterpriseId: nextPros.organizationId,
                        });
                    }
                }
            );
        }

        // 修改回显表单数据
        if (type != 0 && visible && rowId + '' != '') {
            this.setState({
                loading: true,
            });
            (async () => {
                await this.setInputValue(rowId);
                this.getPositionAndVehicleType();
            })();
        }
    }

    componentDidMount() {
        const { type, visible, rowId, organizationId, userType, userName } = this.props;
        this.getPositionAndVehicleType();
        // 新增的时候设置上级组织机构
        if (type == 0 && visible) {
            this.setState({
                loading: false,
            });
            if (userName !== 'admin' && userType == 1) {
                this.formRef.current?.setFieldsValue({
                    enterpriseId: organizationId,
                });
            }
        }

        // 修改回显表单数据
        if (type != 0 && visible && rowId + '' != '') {
            (async () => {
                await this.setInputValue(rowId);
                this.getPositionAndVehicleType();
            })();
            this.formRef.current?.setFieldsValue({
                enterpriseId: organizationId,
            });
        }
    }

    /**
     * 设置表单input值
     */
    async setInputValue(rowId: string) {
        this.setState({ loading: true });
        const { dataSource } = this.state;
        const data: any = await getModeDetailById(rowId);
        if (data) {
            this.formRef.current?.setFieldsValue({
                ...data,
                organizationId: this.props.organizationId,
            });
            this.setState({
                workType: data.modeType,
                isBind: data.isBind,
            });
            const newDataSource = dataSource.map((item) => {
                if (item.name == '作业类型') {
                    return {
                        name: '作业类型',
                        key: 'modeType',
                        validate: {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择作业类型',
                                },
                            ],
                        },
                        component: (
                            <Select
                                disabled={data.isBind}
                                bordered={false}
                                onChange={(value: number) => this.handleWorkTypeChange(value)}
                                placeholder={'请选择'}
                            >
                                <Option value={0}>机器作业</Option>
                                <Option value={1}>人工作业</Option>
                                <Option value={2}>垃圾清运</Option>
                                <Option value={3}>垃圾转运</Option>
                            </Select>
                        ),
                    };
                }
                return item;
            });
            this.setState({
                dataSource: newDataSource,
            });
        }
        this.setState({ loading: false });
    }

    /**
     * 关闭抽屉
     */
    closeDrawer = () => {
        const { closeDrawer } = this.props;
        this.resetForm();
        closeDrawer();
    };

    /**
     * 重置表单
     */
    resetForm = () => {
        if (this.formRef.current) {
            this.formRef.current.resetFields();
        }
    };

    /**
     * 获取抽屉标题
     */
    getTitle = () => {
        const { type } = this.props;
        return type == 0 ? '新增作业模式' : '修改作业模式';
    };

    /**
     * 表单提交
     */

    formSubmit = () => {
        const { type } = this.props;
        switch (type) {
            case 0: //新增
                this.addRequest();
                break;
            case 1: //修改
                this.upDateRequest();
                break;
            default:
                break;
        }
    };

    /**
     *
     * @param values 格式化表单数据
     */
    handleFormValue = (values: any) => {
        return {
            ...values,
            monitorCategoryType: this.state.workType == 0 ? 'VEHICLE_TYPE' : 'POSITION_TYPE',
        };
    };

    /**
     * 新增
     * @param params
     */
    async addRequest() {
        // 发送请求
        let handledValue = {};
        await this.formRef.current?.validateFields().then((values: any) => {
            handledValue = this.handleFormValue(values);
        });
        const datas = await addMode(handledValue);
        if (datas) {
            message.success('新增模式成功');
            this.closeDrawer(); //关闭抽屉
            this.props.reload();
        }
    }

    /**
     * 修改
     * @param params
     */
    async upDateRequest() {
        // 发送请求
        let handledValue = {};
        await this.formRef.current?.validateFields().then((values: any) => {
            handledValue = this.handleFormValue(values);
        });
        // 发送请求
        const datas = await updateMode({ ...handledValue, id: this.props.rowId });
        if (datas) {
            message.success('修改模式成功');
            this.closeDrawer(); //关闭抽屉
            const { reload, closeDetailDrawer } = this.props;
            reload();
            if (closeDetailDrawer) {
                closeDetailDrawer();
            }
        }
    }
    render() {
        const { visible, getContainer } = this.props;
        const { dataSource, dataSource2, dataSource3 } = this.state;
        return (
            <EditDrawer
                title={this.getTitle()}
                onClose={this.closeDrawer}
                visible={visible}
                destroyOnClose={true}
                getContainer={getContainer}
                width={500}
                onConfirm={this.formSubmit}
            >
                <Form ref={this.formRef} key={`form_${visible}`}>
                    <Spin spinning={this.state.loading}>
                        <TableForm className={styles.noMargin} dataSource={dataSource} />
                        {this.state.workType != 1 ? (
                            <TableForm className={styles.noMargin} dataSource={dataSource2} />
                        ) : (
                            <TableForm className={styles.noMargin} dataSource={dataSource3} />
                        )}
                        <TableForm
                            dataSource={[
                                {
                                    name: '备注',
                                    key: 'remark',
                                    nameWidth: 140,
                                    inputProps: {
                                        maxLength: 150,
                                        placeholder: '请输入备注最多150字',
                                    },
                                    validate: {
                                        rules: [regularText],
                                    },
                                },
                            ]}
                        />
                    </Spin>
                </Form>
            </EditDrawer>
        );
    }
}

export default connect((state: AllState) => ({
    userType: state.root.userMessage.userType,
    organizationId: state.root.userMessage.organizationId,
    userName: state.root.userMessage.username,
}))(ModeAddDrawer);
