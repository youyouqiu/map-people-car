import React, { Component, ReactNode } from 'react';
import { message, Select, DatePicker, Form, Input } from 'antd';
import { EditDrawer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import { addContract, getContractDetail, getEnterpriseByOrgId, modifyContract, isExists } from '@/server/enterpriseAndContract';
import TableForm from '@/common/tableForm';
import moment from 'moment';
import AddMap, {Lnglat} from '@/common/map/add';
import ModifyMap,{FenceType} from '@/common/map/modify';
import PublicTreeSelect from '@/common/publicTreeSelect';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { regularText } from '@/common/rules';
import styles from './index.module.less';
import { AllCode } from '@/common/map/Tools/DistrictModal';

const { Option } = Select;

interface IProps {
    type?: number; //抽屉类型(新增:0,修改:1,插入组织:2)
    visible: boolean;
    closeDrawer: Function;
    userMessage: any;
    orgId?: string; //当前选中上级组织id(新增的时候需要)
    orgName?: string; //当前选中上级组织name(新增的时候需要)
    rowId: string;
    reload: Function; //刷新列表
    getContainer?: 'body';
    closeDetailDrawer?: Function; //关闭详情抽屉
}

interface IState {
    cityCode: string;
    flag: boolean;
    loading: boolean;
    path: Lnglat | Lnglat[];
    area: number; //地图面积
    lngLat: Lnglat | Lnglat[];
    initValue: object;
    dataSource1: any[];
    dataSource2: any[];
    countyCode: string;
    organizationId: string; //选择组织的id
    currentEnterpriseId: string;
    initContractNum: string;
    initSectionNum: string;
    adCode:  { province: string, city: string, county: string}
    fenceType: FenceType; // 3普通多边形 4 行政区域
}

//合同信息
type IDataSource1 = {
    contractNo: string; //合同编号
    contractName: string; //合同名称
    orgId: string; //主管单位
    enterpriseId: number; //	中标企业
    biddingDate: string; //	中标日期
    contractSigningMethod: string; //	合同签订方式
    contractAmount: string; //	合同金额
    amountPayMethod: string; //	金额支付方式
};
//标段信息
type IDataSource2 = {
    sectionNo: string; //	标段编号
    sectionName: string; //	标段名称
    leader: string; // 	项目负责人
    leaderPhone: string; //	负责人电话
    needGroupLeaders: string; //	应配备小组长数
    requiredArea: string; //	要求面积(㎡)
    drawArea: string; //	绘制面积(㎡)
    requiredPerson: string; //	要求配置人数
    requiredVehicles: string; //	要求配置车辆数
    remark: string; //	备注
    createDataTime?: string; //	创建时间
    createDataUsername?: string; //	创建人
    updateDataTime?: string; //	更新数据时间
    updateDataUsername?: string; //	更新人
    fenceLongLat?: [number, number][]; //围栏经纬度信息
};
//Forrm表单值
interface IFormData extends IDataSource1, IDataSource2 {}

/** 合同信息 */

/** 标段信息 */

class ContractAddDrawer extends Component<IProps, IState> {
    static defaultProps = {
        type: 0,
    };
    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();

    constructor(props: IProps) {
        super(props);

        this.state = {
            cityCode: '',
            adCode: { province: '', city: '', county: ''},
            fenceType: 3,
            flag: false,
            initValue: {
                orgName: { value: this.props.userMessage.organizationId + '' },
            },
            loading: true,
            path: [],
            area: 0,
            lngLat: [],
            dataSource1: [
                {
                    name: '合同编号',
                    key: 'contractNo',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入合同编号',
                            },
                            {
                                pattern: /^[a-zA-Z0-9]{1,15}$/,
                                message: '格式不正确，应为1-15位的数字/字母',
                            },
                            this.validateContractNum,
                        ],
                    },
                    inputProps: {
                        maxLength: 15,
                        placeholder: '请输入合同编号',
                    },
                },
                {
                    name: '合同名称',
                    key: 'contractName',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入合同名称',
                            },
                            regularText,
                        ],
                    },
                    inputProps: {
                        maxLength: 20,
                        placeholder: '请输入合同名称',
                    },
                },
                {
                    name: '主管单位',
                    key: 'orgName',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入主管单位',
                            },
                        ],
                    },
                    component: (
                        <PublicTreeSelect
                            showSearch
                            bordered={false}
                            labelInValue={true}
                            onSelect={(value: any) => {
                                this.handleOrganizationChange(value);
                            }}
                            // treeData={this.props.orgTreeData}
                            // disabled={this.props.type == 1}
                            treeType="organization"
                            placeholder="请勾选主管单位"
                        />
                    ),
                },
                {
                    name: '中标企业',
                    key: 'enterpriseId',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入中标企业',
                            },
                        ],
                    },
                    component: (
                        <Select
                            bordered={false}
                            placeholder="请选择"
                            disabled={this.props.type == 1}
                            onChange={(value: any) => {
                                this.handleEnterpriseChange(value);
                            }}
                        ></Select>
                    ),
                },
                {
                    name: '中标日期',
                    key: 'biddingDate',
                    component: () => {
                        return <DatePicker style={{ width: '100%' }} bordered={false} />;
                    },
                },
                {
                    name: '合同签订方式',
                    key: 'contractSigningMethod',
                    component: () => {
                        return (
                            <Select style={{ width: '100%' }} bordered={false}>
                                <Option value={0}>一年一签</Option>
                                <Option value={1}>三年一签</Option>
                            </Select>
                        );
                    },
                },
                {
                    name: '合同金额',
                    key: 'contractAmount',
                    colWidth: '180',
                    component: () => {
                        return (
                            <Input
                                className={styles.contract}
                                maxLength={10}
                                placeholder="请输入金额"
                                autoComplete="off"
                                addonBefore={
                                    <Form.Item name="amountPayMethod" style={{ width: '70px' }}>
                                        <Select className="select-before" defaultValue={0} bordered={false} style={{ width: '70px' }}>
                                            <Option value={0}>一年</Option>
                                            <Option value={1}>三年</Option>
                                        </Select>
                                    </Form.Item>
                                }
                            />
                        );
                    },
                },
                {
                    name: '服务开始日期',
                    key: 'serviceStartDate',
                    component: () => {
                        return <DatePicker style={{ width: '100%' }} bordered={false} />;
                    },
                    validate: {
                        rules: [this.validateStartDate],
                    },
                },
                {
                    name: '服务终止日期',
                    key: 'serviceEndDate',
                    component: () => {
                        return <DatePicker style={{ width: '176px' }} bordered={false} />;
                    },
                    validate: {
                        rules: [this.validateEndDate],
                    },
                },
            ],
            dataSource2: [
                {
                    name: '标段编号',
                    key: 'sectionNo',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入标段编号',
                            },
                            {
                                pattern: /^[a-zA-Z0-9]{1,15}$/,
                                message: '格式不正确，应为1-15位的数字/字母',
                            },
                            this.validateSectionNum,
                        ],
                    },
                    inputProps: {
                        maxLength: 15,
                        placeholder: '请输入标段编号',
                    },
                },
                {
                    name: '标段名称',
                    key: 'sectionName',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入标段名称',
                            },
                            regularText,
                        ],
                    },
                    inputProps: {
                        maxLength: 20,
                        placeholder: '请输入标段名称',
                    },
                },
                {
                    name: '项目负责人',
                    key: 'leader',
                    inputProps: {
                        maxLength: 10,
                        placeholder: '请输入项目负责人',
                    },
                },
                {
                    name: '负责人电话',
                    key: 'leaderPhone',
                    validate: {
                        rules: [
                            {
                                pattern: /^[0-9]{1,11}$/,
                                message: '格式不正确,请输入1-11位数字',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 11,
                        placeholder: '请输入负责人电话',
                    },
                },
                {
                    name: '应配小组长数',
                    key: 'needGroupLeaders',
                    validate: {
                        rules: [
                            {
                                pattern: /^[0-9]{1,10}$/,
                                message: '格式不正确,请输入1-10位数字',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 10,
                        placeholder: '请输入应配小组长数',
                    },
                },
                {
                    name: '要求面积(㎡)',
                    key: 'requiredArea',
                    validate: {
                        rules: [
                            {
                                pattern: /^[0-9]{1,10}$/,
                                message: '格式不正确,请输入1-10位数字',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 10,
                        placeholder: '请输入要求面积',
                    },
                },
                {
                    name: '绘制面积(㎡)',
                    key: 'drawArea',
                    inputProps: {
                        disabled: true,
                    },
                },
                {
                    name: '要求配置人数',
                    key: 'requiredPerson',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入要求配置人数',
                            },
                            {
                                pattern: /^[0-9]{0,10}$/,
                                message: '格式不正确,请输入1-10位数字',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 10,
                        placeholder: '请输入要求配置人数',
                    },
                },
                {
                    name: '配置车辆数',
                    key: 'requiredVehicles',
                    validate: {
                        rules: [
                            {
                                required: true,
                                message: '请输入车辆数',
                            },
                            {
                                pattern: /^[0-9]{0,10}$/,
                                message: '格式不正确,请输入1-10位数字',
                            },
                        ],
                    },
                    inputProps: {
                        maxLength: 10,
                        placeholder: '请输入车辆数',
                    },
                },
                {
                    name: '备注',
                    key: 'remark',
                    inputProps: {
                        maxLength: 150,
                    },
                },
            ],
            countyCode: '',
            organizationId: this.props.userMessage?.organizationId,
            currentEnterpriseId: '',
            initContractNum: '',
            initSectionNum: '',
        };
    }
    //验证合同编号、标段编号重复和日期
    validateStartDate = () => {
        return {
            validator: (rule: any, value: string) => {
                const { serviceStartDate, serviceEndDate } = this.formRef.current?.getFieldsValue() as any;
                if (value && serviceStartDate && serviceEndDate) {
                    this.formRef.current?.setFieldsValue({ serviceEndDate: serviceEndDate.clone() }); //触发结束日期校验
                    if (moment(serviceStartDate).isBefore(serviceEndDate)) {
                        return Promise.resolve();
                    } else {
                        return Promise.reject('开始时间需小于结束时间');
                    }
                }
                return Promise.resolve();
            },
        };
    };
    validateEndDate = () => {
        return {
            validator: (rule: any, value: string) => {
                const { serviceStartDate, serviceEndDate } = this.formRef.current?.getFieldsValue() as any;
                if (value && serviceStartDate && serviceEndDate) {
                    this.formRef.current?.setFieldsValue({ serviceStartDate: serviceStartDate.clone() }); //触发开始日期校验
                    if (moment(serviceStartDate).isBefore(serviceEndDate)) {
                        return Promise.resolve();
                    } else {
                        return Promise.reject('开始时间需小于结束时间');
                    }
                }
                return Promise.resolve();
            },
        };
    };
    validateContractNum = () => {
        return {
            validator: async (rule: any, value: string) => {
                const { currentEnterpriseId, initContractNum } = this.state;
                if (value == initContractNum) return Promise.resolve();
                if (value && currentEnterpriseId) {
                    const params = {
                        enterpriseId: currentEnterpriseId,
                        contractNo: value,
                    };
                    const datas = await isExists(params);
                    if (!datas) {
                        return Promise.resolve();
                    } else {
                        return Promise.reject('合同编号已存在');
                    }
                }
                return Promise.resolve();
            },
        };
    };
    validateSectionNum = () => {
        return {
            validator: async (rule: any, value: string) => {
                const { currentEnterpriseId, initSectionNum } = this.state;
                if (value == initSectionNum) return Promise.resolve();
                if (value && currentEnterpriseId) {
                    const params = {
                        enterpriseId: currentEnterpriseId,
                        sectionNo: value,
                    };
                    const datas = await isExists(params);
                    if (!datas) {
                        return Promise.resolve();
                    } else {
                        return Promise.reject('标段编号已存在');
                    }
                }
                return Promise.resolve();
            },
        };
    };
    // 主管单位改变时，获取相对应的中标企业
    handleOrganizationChange = async (value: string) => {
        const { currentEnterpriseId } = this.state;
        this.setState({ organizationId: value });
        if (this.props.type == 1) return;
        const data = await getEnterpriseByOrgId<any>([value]);
        if (data) {
            const newOption = data.map((item: any) => {
                return <Option value={item.id}>{item.name}</Option>;
            });
            const newDataSource1 = this.state.dataSource1.map((item) => {
                if (item.name != '中标企业') {
                    return item;
                } else {
                    return {
                        ...item,
                        component: (
                            <Select
                                bordered={false}
                                placeholder="请选择"
                                onChange={(value: any) => {
                                    this.handleEnterpriseChange(value);
                                }}
                            >
                                {newOption}
                            </Select>
                        ),
                    };
                }
            });
            this.setState({
                dataSource1: [...newDataSource1],
                currentEnterpriseId: data[0]?.id || '',
            });
            this.formRef.current?.setFieldsValue({
                enterpriseId: data[0]?.id || '',
            });
        }
    };
    // 中标改变
    handleEnterpriseChange = (value: string) => {
        this.setState({
            currentEnterpriseId: value,
        });
    };
    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { type, visible, rowId } = nextPros;

        // 新增的设置上级组织机构
        if (type == 0 && visible) {
            this.setState({
                loading: false,
            });
        }

        // 修改回显表单数据
        if (type != 0 && visible && rowId != '') {
            this.setState({
                loading: true,
            });
            this.setInputValue(rowId);
        }
    }

    componentDidMount() {
        const { type, visible, rowId } = this.props;
        this.handleOrganizationChange(this.props.userMessage.organizationId);
        // 新增的时候设置上级组织机构
        if (type == 0 && visible) {
            this.setState({
                loading: false,
            });
        }

        // 修改回显表单数据
        if (type != 0 && visible && rowId != '') {
            this.setInputValue(rowId);
        }
    }

    setArea = (area: number) => {
        if (this.formRef.current) {
            this.formRef.current.setFieldsValue({
                drawArea: area,
            });
        }
        this.setState({
            area: area,
        });
    };

    setLngLat = (lngLat: Lnglat | Lnglat[]) => {
        this.setState({
            lngLat: lngLat,
        });
    };

    setFenceType = (fenceType: FenceType) => {
        this.setState({
            fenceType
        })
    }

    setAdCode = (adCode: AllCode) => {
        this.setState({
            adCode
        })
    }

    /**
     * 设置表单input值
     */
    async setInputValue(rowId: string) {
        const data: any = await getContractDetail(rowId);
        const optionData = await getEnterpriseByOrgId<any[]>([data.orgId]);
        if (optionData) {
            const newOption = optionData.map((item: any) => {
                return <Option value={item.id}>{item.name}</Option>;
            });
            const newDataSource1 = this.state.dataSource1.map((item) => {
                if (item.name != '中标企业') {
                    return item;
                } else {
                    if (this.props.type == 1) {
                        return {
                            ...item,
                            component: (
                                <Select disabled={true} bordered={false}>
                                    {newOption}
                                </Select>
                            ),
                        };
                    } else {
                        return {
                            ...item,
                            component: <Select bordered={false}>{newOption}</Select>,
                        };
                    }
                }
            });
            this.setState({
                dataSource1: [...newDataSource1],
                initContractNum: data.contractNo,
                initSectionNum: data.sectionNo,
            });
        }
        if (data) {
            //format 日期之后才能 自动填充到 form 表单中
            const createDataTime = data.createDataTime ? moment(data.createDataTime) : '';
            const serviceStartDate = data.serviceStartDate ? moment(data.serviceStartDate) : '';
            const biddingDate = data.biddingDate ? moment(data.biddingDate) : '';
            const serviceEndDate = data.serviceEndDate ? moment(data.serviceEndDate) : '';
            const updateDataTime = [
                data.updateDataTime ? moment(data.updateDataTime) : moment(),
                data.licenseValidityEndDate ? moment(data.licenseValidityEndDate) : moment(),
            ];
            this.formRef.current?.setFieldsValue({
                ...data,
                createDataTime,
                updateDataTime,
                serviceStartDate,
                serviceEndDate,
                biddingDate,
            });
            this.setState({
                loading: false,
                path: JSON.parse(data.fenceLongLat),
                lngLat: JSON.parse(data.fenceLongLat),
                countyCode: data.organization.countyCode,
                initContractNum: data.contractNo,
                initSectionNum: data.sectionNo,
                currentEnterpriseId: data.enterpriseId,
                adCode: {
                    province: data.province,
                    city: data.city,
                    county: data.county
                },
                fenceType: data.fenceType
            });
        }
    }

    /**
     * 关闭抽屉
     */
    closeDrawer = () => {
        const { closeDrawer } = this.props;
        this.setState({
            organizationId: this.props.userMessage.organizationId,
            initSectionNum: '',
            initContractNum: '',
        });
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
        return type == 0 ? '新增合同标段' : '修改合同标段';
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
        const handledValue = Object.assign({}, values, {
            serviceStartDate: values.serviceStartDate ? moment(values.serviceStartDate).format('YYYY-MM-DD') : '',
            serviceEndDate: values.serviceEndDate ? moment(values.serviceEndDate).format('YYYY-MM-DD') : '',
            biddingDate: values.biddingDate ? moment(values.biddingDate).format('YYYY-MM-DD') : '',
            fenceLongLat: JSON.stringify(this.state.lngLat),
            fenceType: this.state.fenceType,
            ...this.state.adCode
        });
        return handledValue;
    };

    /**
     * 新增
     * @param params
     */
    async addRequest() {
        let formData: any;
        if (this.formRef.current) {
            // 发送请求
            await this.formRef.current.validateFields().then((values: IFormData) => {
                formData = this.handleFormValue(values);
            });
        }
        if (this.state.lngLat.length == 0) {
            message.error('请绘制地图区域');
        } else {
            const datas = await addContract(formData);
            if (datas) {
                message.success('新增合同成功');
                this.closeDrawer(); //关闭抽屉
                this.props.reload();
            }
        }
    }

    /**
     * 修改
     * @param params
     */
    async upDateRequest() {
        let formData: any;
        if (this.formRef.current) {
            // 发送请求
            await this.formRef.current.validateFields().then((values: IFormData) => {
                formData = {
                    body: this.handleFormValue(values),
                    id: this.props.rowId,
                };
            });
        }
        if (this.state.lngLat.length == 0) {
            message.error('请绘制地图区域');
        } else {
            // 发送请求
            const datas = await modifyContract(formData);
            if (datas) {
                message.success('修改合同成功');
                this.closeDrawer(); //关闭抽屉
                const { reload, closeDetailDrawer } = this.props;
                reload();
                if (closeDetailDrawer) {
                    closeDetailDrawer();
                }
            }
        }
    }

    render() {
        const { visible, getContainer } = this.props;
        const { organizationId } = this.state;

        return (
            <EditDrawer
                title={this.getTitle()}
                onClose={this.closeDrawer}
                visible={visible}
                destroyOnClose={true}
                getContainer={getContainer}
                width={1100}
                onConfirm={this.formSubmit}
            >
                {/* <Form ref={this.formRef}> */}
                <Form ref={this.formRef} initialValues={this.state.initValue}>
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>合同信息</p>
                    <TableForm dataSource={this.state.dataSource1} column={8} />
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>标段信息</p>
                    <TableForm dataSource={this.state.dataSource2} column={8} />
                </Form>
                <div style={{height:'411px'}} id="originContainer">
                    <div style={{height:'100%',zIndex: 10,position: "relative"}} className="amap" id="amap">
                        {this.props.type == 0 ? (
                            <AddMap
                                type = {this.state.fenceType == 3 ? 'polygon' : 'district'}
                                toolOptions={['polygon','district']}
                                calcType={0}
                                setArea={this.setArea}
                                setLngLat={this.setLngLat}
                                setAdcode={this.setAdCode}
                                setFenceType={this.setFenceType}
                            />
                        ) : (
                            <ModifyMap
                                type = {this.state.fenceType == 3 ? 'polygon' : 'district'}
                                toolOptions={['polygon','district']}
                                path={this.state.path}
                                initAdCode = {this.state.adCode}
                                calcType={0}
                                setArea={this.setArea}
                                setLngLat={this.setLngLat}
                                setAdcode={this.setAdCode}
                                setFenceType={this.setFenceType}
                            />
                        )}
                    </div>
                </div>
            </EditDrawer>
        );
    }
}

export default connect((store: AllState) => ({
    userMessage: store.root.userMessage,
}))(ContractAddDrawer);
