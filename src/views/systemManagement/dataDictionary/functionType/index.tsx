import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import {
    postDictFunctionTypePage, postDictFunctionTypeDisableId, postDictFunctionTypeEnableId, postDictFunctionTypeDisable,
    deleteDictFunctionType
} from '@/server/dataDictionary';
import EditFunctionType from './editFunctionType';
import FunctionTypeDetail from './functionTypeDetail';
import { getCurrentUserPermission } from '@/framework/utils/function';
import moment from 'moment';
import styles from '../index.module.less';
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
    rowId: string;
    curRow: any;
    functionTypeInfo: Record<string, any>,
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

class FunctionType extends Component<Iprops, IState> {
    tableRef: any = React.createRef();
    newData: any = {
        identify: '',//功能ID
        name: '', //功能类型 
        remark: '', //备注
        stateOne: '', //状态1 
        stateTwo: '' //状态2
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
            title: '功能ID',
            dataIndex: 'identify',
            width: 150,
            key: 'identify',
        },

        {
            title: '功能类型',
            width: 150,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '状态1',
            width: 150,
            dataIndex: 'stateOne',
            key: 'stateOne',
        },
        {
            title: '状态2',
            width: 150,
            dataIndex: 'stateTwo',
            key: 'stateTwo',
        },
        {
            title: '备注',
            width: 150,
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
            rowId: '',
            curRow: '',
            functionTypeInfo: {},
            refreshCount: 0,
        };
    }
    componentDidMount() {

    }


    /*
    删除
    */
    reqJobsTypeDelete = (id: string) => {
        deleteDictFunctionType({ id: id }).then((res: any) => {
            if (res) {
                console.log(res)
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
            functionTypeInfo: { ...this.newData }
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
            functionTypeInfo: { ...record }
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
            functionTypeInfo: { ...record }
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
        const { selectedRowKeys } = this.state;
        // let ids: string[] = [];
        // let names: string[] = [];
        // selectedRows.forEach((v: any) => {
        //     ids.push(v.id)
        //     names.push(v.name)
        // })
        const datas: number | any = await postDictFunctionTypeDisable(selectedRowKeys);

        if (!datas) {
            message.success('冻结失败！');
        } else {
            // message.success(`冻结成功!`);
            message.success(`冻结成功, 已冻结${datas}条数据, ${selectedRowKeys.length - datas}冻结失败!`);
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
            this.checkIsDisable(record.id)
        } else {// 请求恢复
            this.checkIsEnable(record.id)
        }
    }

    /**
     * 单个类型取消冻结
     * @param id
     */

    async checkIsEnable(id: string) {
        const params = {
            id: id,
        };
        const datas = await postDictFunctionTypeEnableId(params);
        if (datas) {
            message.success('恢复成功');
            this.reload();
        }
    }
    /*
    单个类型冻结
    */
    async checkIsDisable(id: string) {
        const params = {
            id: id,
        };
        const datas = await postDictFunctionTypeDisableId(params);
        if (datas) {
            message.success('冻结成功');
            this.reload();
        }
    }




    /**
     * 批量冻结
     */
    getDelPop = () => {
        const { selectedRowKeys } = this.state;

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
        const { addVisible, type, selectedRowKeys, detailVisible, rowId, functionTypeInfo } = this.state;
        return (
            <div className={styles['page-wrapper']} >
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
                    // tree={<LeftTree onNodeSelect={this.onNodeSelect} />}
                    showTree={false}
                    btnGroup={[
                        <Button key={Math.random()}
                            // disabled={!this.hasPermission('新增')}
                            type="primary" onClick={this.addFun.bind(this)}>
                            新增
                        </Button>,
                        this.getDelPop(),
                    ]}
                    queryAjax={postDictFunctionTypePage}
                    settingQuery={{
                        key: 'keyword', //模糊查询参数
                        placeholder: '请输入功能类型',
                    }}
                    settingQueryStyle={{ width: 270 }}
                    // queryArgs={queryArgs}
                    rowClick={this.rowClickFun.bind(this)}
                    scroll={{ y: 'calc(100vh - 340px)' }}
                />

                {/* 新增、修改 抽屉 */}
                {addVisible !== undefined && (
                    <EditFunctionType
                        visible={addVisible}
                        type={type}
                        closeDrawer={this.closeAddDrawer}
                        rowId={rowId}
                        reload={this.reload}
                        functionTypeInfo={functionTypeInfo}
                    />
                )}

                {detailVisible && (
                    <FunctionTypeDetail
                        visible={detailVisible}
                        functionTypeInfo={functionTypeInfo}
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

export default FunctionType;
