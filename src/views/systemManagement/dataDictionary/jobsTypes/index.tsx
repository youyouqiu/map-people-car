import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import {
    postDictJobsTypePage, postDictJobsTypeDisableId, postDictJobsTypeEnableId, postDictJobsTypeDisable,
    getDictIndustryDropdown, postDictJobsTypeDelete
} from '@/server/dataDictionary';
import EditJobsTypes from './editJobsTypes';
import JobsTypesDetail from './jobsTypesDetail';
import { getCurrentUserPermission } from '@/framework/utils/function';
import moment from 'moment';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_road_list');

interface IState {
    addVisible: boolean | undefined;
    type: number; //抽屉类型(0:新增，1:修改)
    selectedRowKeys: [];
    selectedRows: [];
    // queryArgs: { keyword?: string }; //管理列表请求参数
    detailVisible: boolean | undefined;
    industryCategoryList: [],//行业类别-下拉列表
    rowId: string;
    curRow: any;
    jobsTypesInfo: Record<string, any>,
    refreshCount: number;
}

interface IRecord {
    id: string;
    enabled: boolean;
    selectedRowKeys?: [];
    [key: string]: any
}
interface Iprops {
    id?: string;
}
interface Icategory {// 行业类别
    id: string,
    name: string
}
class JobsTypes extends Component<Iprops, IState> {
    tableRef: any = React.createRef();
    newData: any = {
        id: '',
        name: '', //岗位类型
        pid: '7', //行业类别
        remark: '', //备注
        iconId: '-1', //图标-选中的图标id   
        iconUrl: ''
    };

    columns: any[] = [
        {
            title: '操作',
            key: 'opra',
            width: 100,
            render: (value: any, record: any) => {
                //enabled 是否启用 true：启用，false：停用
                const { enabled, enableEdit } = record;
                return (
                    <>
                        {/* enableEdit */}
                        <Button
                            // disabled={!enableEdit}
                            type="link"
                            onClick={(event) => this.updateOrgClick(event, record)}
                            className="table-link-btn"
                        >
                            修改
                </Button>
                |

                        <>
                            <Popconfirm
                                key={record.id}
                                title={enabled ? "确认是否冻结此行？" : "确认是否恢复此行？"}
                                onConfirm={() => this.delConfirm(record)}
                                cancelText="取消"
                                okText="确定"
                            >
                                <Button
                                    className="table-link-btn"
                                    type="link"
                                    onClick={(event: React.MouseEvent) => {
                                        event.stopPropagation();
                                        this.setState({ detailVisible: false });
                                    }}
                                >
                                    {' '}
                                    {enabled && '冻结'}
                                    {!enabled && '恢复'}

                                </Button>
                            </Popconfirm>
                        </>

                    </>
                );
            },
        },
        {
            title: '状态',
            dataIndex: 'enabled',
            key: 'enabled',
            filter: {
                type: false,
                key: 'enabled',
                domData: [
                    {
                        value: true, label: '正常'
                    },
                    {
                        value: false, label: '冻结'
                    }
                ]
            },
            width: 100,
            render: (value: number,) => {
                //enabled 是否启用 true：启用，false：停用 
                if (value) {
                    return <Badge color="green" text="正常" />;
                } else {
                    return <Badge color="red" text="冻结" />;
                }

            },
        },
        {
            title: '岗位类型',
            dataIndex: 'name',
            width: 200,
            key: 'name',
        },
        {
            title: '图标',
            dataIndex: 'iconUrl',
            width: 200,
            key: 'iconUrl',
            render: (value: string, record: IRecord) => {
                // -1 等于不选
                if (value === '-1' || !value) {
                    return '--'
                }
                if (value) {
                    return <img src={value} width='45' height='45' alt="岗位类型图标" />
                }


            },
        },
        {
            title: '所属行业',
            dataIndex: 'parentName',
            key: 'parentName',
            width: 150,
        },
        {
            title: '备注',
            width: 200,
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: '创建日期',
            width: 150,
            dataIndex: 'createDataTime',
            sorterKey: 'createDataTime',
            key: 'createDataTime',
            render: (value: string) => {
                return moment(value).format('YYYY-MM-DD');
            }
        },
        {
            title: '最后修改时间',
            width: 150,
            dataIndex: 'updateDataTime',
            key: 'updateDataTime',
            sorterKey: 'updateDataTime',
            render: (value: string) => {
                return moment(value).format('YYYY-MM-DD HH:mm');
            }
        },
        {
            title: '修改人',
            width: 120,
            dataIndex: 'updateDataUsername',
            key: 'updateDataUsername',
        },
    ];

    constructor(props: any) {
        super(props);
        this.state = {
            addVisible: undefined,
            detailVisible: undefined,
            type: 0,
            selectedRowKeys: [],
            selectedRows: [],
            industryCategoryList: [],
            rowId: '',
            curRow: '',
            jobsTypesInfo: {},
            refreshCount: 0,
        };
    }
    componentDidMount() {
        this.reqDictIndustryDropdown();
    }

    /*
    行业类别-下拉列表
    */
    async reqDictIndustryDropdown() {

        const datas: any = await getDictIndustryDropdown(null);
        if (datas) {
            const arr: any = datas.map((e: Icategory) => {
                return { value: e.id, label: e.name }
            })
            console.log(arr)
            this.setState({
                industryCategoryList: arr
            })
        } else {
            return []
        }

    }

    /*
    删除
    */
    reqJobsTypeDelete = (id: string, name: string) => {
        postDictJobsTypeDelete({ id, name }).then((res: any) => {
            if (res) {
                message.success('删除成功！');
                this.setState({
                    detailVisible: false
                });
                this.reload();
            }

        })
    }

    /**
     * 判断按钮权限
     * @param title 按钮名称
     */
    hasPermission = (title: string) => {
        return permission.indexOf(title) !== -1;
    };

    /**
     * 新增
     */
    addFun() {
        this.setState({
            detailVisible: false,
            addVisible: true,
            type: 0,
            jobsTypesInfo: { ...this.newData }
        });
    }

    /**
     * table行点击
     */
    rowClickFun = (record: any, event: any) => {
        event.stopPropagation();
        this.setState({
            detailVisible: true,
            rowId: record.id,
            curRow: record,
            jobsTypesInfo: { ...record }
        });
    };

    /**
     * 修改按钮
     */
    updateOrgClick = (event: any, record: IRecord) => {
        event.stopPropagation();
        const id = record.id;
        this.setState({
            rowId: id,
            type: 1,
            detailVisible: false,
            addVisible: true,
            curRow: record,
            jobsTypesInfo: { ...record }
        });

    };

    /**
     * 表格checkBox多选框改变
     */
    rowChange = (selectedRowKeys: [], rows: []) => {
        this.setState({
            selectedRowKeys,
            selectedRows: rows,
            detailVisible: false,
        });
    };



    /**
     * 关闭修改抽屉
     */
    closeAddDrawer = () => {
        this.setState({
            addVisible: false,
        });
    };
    /*
    关闭详情抽屉
    */
    closeDetailDrawer = () => {
        this.setState({
            detailVisible: false,
        });
    };

    /*
    请求详情
    */
    // async reqDetail(id: string, callback: any) {
    //     const data = await getDictJobsTypeInfo<any>({ id: id });
    //     if (data) {
    //         callback && callback(data);
    //     }
    // }
    /**
     * 批量冻结确定
     */
    delMoreConfirm = async () => {
        // const { selectedRowKeys } = this.state;
        const { selectedRows } = this.state;
        const ids: string[] = [];
        const names: string[] = [];
        selectedRows.forEach((v: any) => {
            ids.push(v.id)
            names.push(v.name)
        })
        const datas: number | any = await postDictJobsTypeDisable({ ids, names });
        // console.log(datas) 
        if (!datas) {
            message.success('冻结失败！');
        } else {
            // message.success(`冻结成功!`);
            message.success(`冻结成功, 已冻结${datas}条数据, ${selectedRows.length - datas}冻结失败!`);
            this.setState({
                selectedRowKeys: [],
                selectedRows: []
            });
            this.reload();
        }

    }

    /**
     * 单个冻结或者恢复确定
     */
    delConfirm = (record: IRecord) => {
        if (record.enabled) {//请求冻结
            this.checkIsDisable(record.id, record.name)
        } else {// 请求恢复
            this.checkIsEnable(record.id, record.name)
        }
    }

    /**
     * 单个类型取消冻结
     * @param id
     */
    async checkIsEnable(id: string, name: string) {
        const params = {
            id, name
        };
        const datas = await postDictJobsTypeEnableId(params);
        if (datas) {
            message.success('恢复成功');
            this.reload();
        }
    }
    /*
    单个类型冻结
    */
    async checkIsDisable(id: string, name: string) {
        const params = {
            id, name
        };
        const datas = await postDictJobsTypeDisableId(params);
        if (datas) {
            message.success('冻结成功');
            this.reload();
        }
    }
    /**
     * 批量冻结-气泡
     */
    getDelPop = () => {
        const { selectedRowKeys } = this.state;

        // if (!this.hasPermission('删除')) {
        //     return <Button disabled>批量冻结</Button>;
        // }

        if (selectedRowKeys.length > 0) {
            return (
                <Popconfirm
                    key={'record1'}
                    title={`你确定要冻结${selectedRowKeys.length}条记录吗？`}
                    onConfirm={this.delMoreConfirm}
                    cancelText="取消"
                    okText="确定"
                    showOk={true}
                >
                    <Button>批量冻结</Button>
                </Popconfirm>
            );
        } else {
            return (
                <Popconfirm key={'record2'} title="请勾选需要冻结的行！" cancelText="取消" showOk={false}>
                    <Button>批量冻结</Button>
                </Popconfirm>
            );
        }
    };

    /**
     * 刷新列表
     */
    reload = () => {
        (this.tableRef.current as any).reload();
        this.setState({
            detailVisible: false,
            addVisible: false
        })
    };


    render() {
        const { addVisible, type, selectedRowKeys, detailVisible, rowId, industryCategoryList, jobsTypesInfo } = this.state;
        return (
            <div  >
                <Table
                    ref={this.tableRef}
                    columns={this.columns}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: this.rowChange,
                    }}
                    pageCallback={() => this.setState({
                        selectedRowKeys: [],
                        selectedRows: []
                    })}
                    showTree={false}
                    btnGroup={[
                        <Button key={Math.random()}
                            // disabled={!this.hasPermission('新增')}
                            type="primary" onClick={this.addFun.bind(this)}>
                            新增
                        </Button>,
                        this.getDelPop(),
                    ]}
                    queryAjax={postDictJobsTypePage}
                    settingQuery={{
                        key: 'keyword', //模糊查询参数
                        placeholder: '请输入岗位类型',
                    }}
                    settingQueryStyle={{ width: 270 }}
                    // queryArgs={queryArgs}
                    rowClick={this.rowClickFun.bind(this)}
                    scroll={{ y: 'calc(100vh - 340px)' }}
                />

                {/* 新增、修改 抽屉 */}
                {addVisible !== undefined && (
                    <EditJobsTypes
                        visible={addVisible}
                        industryCategoryList={industryCategoryList}
                        type={type}
                        closeDrawer={this.closeAddDrawer}
                        rowId={rowId}
                        reload={this.reload}
                        jobsTypesInfo={jobsTypesInfo}
                    />
                )}

                {detailVisible && (
                    <JobsTypesDetail
                        visible={detailVisible}
                        industryCategoryList={industryCategoryList}
                        jobsTypesInfo={jobsTypesInfo}
                        closeDetailDrawer={this.closeDetailDrawer}
                        reload={this.reload}
                        buttonEventFun={{
                            disableOrEnable: this.delConfirm,
                            update: this.updateOrgClick,
                            delete: this.reqJobsTypeDelete
                        }}
                    // hasPermission={this.hasPermission}
                    // hasPermission={() => true}
                    // rootId={rootId}
                    />
                )}

            </div>
        );
    }
}

export default JobsTypes;
