import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import { getContractList, deleteContractBatch, deleteContract, updateState } from '@/server/enterpriseAndContract';
import ContractAddDrawer from './drawer/add';
import ContractDetailDrawer from './drawer/detail';
import { getCurrentUserPermission } from '@/framework/utils/function';
import moment from 'moment';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_contract_section_list');

interface IState {
    addVisible: boolean;
    orgList: [];
    type: number; //抽屉类型(0:新增，1:修改)
    selectedRowKeys: [];
    orgId: string; //当前选中节点id
    orgName: string; //当前选中节点name
    rootId: string; //组织树根节点
    queryArgs: { enterpriseIds?: string[] }; //组织管理列表请求参数
    detailVisible: boolean;
    rowId: string;
    curRow: any;
    refreshCount: number;
}

interface IRecord {
    id: string;
    selectedRowKeys?: [];
}
interface Iprops {
    id?: string;
}

class ContractList extends Component<Iprops, IState> {
    tableRef: any = React.createRef();
    findLatestTd = (node: any): any => {
        if (node.nodeName == 'TD') return node;
        if (node.nodeName == 'HTML') return node;
        return this.findLatestTd(node.parentNode);
    };
    columns: any[] = [
        {
            title: '操作',
            key: 'opra',
            width: 150,
            render: (value: any, record: any) => {
                return (
                    <>
                        <Button
                            disabled={!this.hasPermission('修改')}
                            type="link"
                            onClick={(event) => this.updateOrgClick(event, record)}
                            className="table-link-btn"
                        >
                            修改
                        </Button>
                        |
                        {record.id != this.state.rootId && this.hasPermission('删除') ? (
                            <>
                                <Popconfirm
                                    key={record.id}
                                    title="删除后无法找回！确认是否删除？"
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
                                        删除
                                    </Button>
                                </Popconfirm>
                            </>
                        ) : (
                            <Button type="link" disabled className="table-link-btn">
                                {' '}
                                删除
                            </Button>
                        )}
                        |
                        {!record.status
                            ? this.renderStart(record)
                            : // <Popconfirm key={record.id} title="确认操作？" onConfirm={() => this.startConfirm(record, 1)} cancelText="取消" okText="确定">
                              //     <Button
                              //         className="table-link-btn"
                              //         type="link"
                              //         disabled={!this.hasPermission('删除')}
                              //         onClick={(event: React.MouseEvent) => {
                              //             event.stopPropagation();
                              //             this.setState({ detailVisible: false });
                              //         }}
                              //     >
                              //         启用
                              //     </Button>
                              // </Popconfirm>
                              this.renderStop(record)}
                    </>
                );
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (value: number) => {
                if (value == 1) {
                    /* 需要转发点击事件给table组件*/
                    return (
                        <span onClick={(e) => this.findLatestTd(e.target).click()}>
                            <Badge color="green" text="在用" />
                        </span>
                    );
                }
                return (
                    <span onClick={(e) => this.findLatestTd(e.target).click()}>
                        <Badge color="red" text="停用" />
                    </span>
                );
            },
        },
        {
            title: '合同编号',
            dataIndex: 'contractNo',
            width: 150,
            key: 'contractNo',
        },
        {
            title: '合同名称',
            dataIndex: 'contractName',
            width: 150,
            key: 'contractName',
        },
        {
            title: '主管单位',
            dataIndex: 'orgName',
            key: 'orgName',
            width: 150,
        },
        {
            title: '中标企业',
            dataIndex: 'enterpriseName',
            key: 'enterpriseName',
            width: 150,
        },
        {
            title: '标段编号',
            width: 150,
            dataIndex: 'sectionNo',
            key: 'sectionNo',
        },
        {
            title: '标段名称',
            width: 200,
            dataIndex: 'sectionName',
            key: 'sectionName',
        },
        {
            title: '项目负责人',
            width: 150,
            dataIndex: 'leader',
            key: 'leader',
        },
        {
            title: '负责人电话',
            width: 150,
            dataIndex: 'leaderPhone',
            key: 'leaderPhone',
        },
        {
            title: '创建日期',
            width: 120,
            dataIndex: 'createDataTime',
            key: 'createDataTime',
            sorterKey: 'createDataTime',
        },
        {
            title: '最后修改时间',
            width: 150,
            dataIndex: 'updateDataTime',
            key: 'updateDataTime',
            sorterKey: 'updateDataTime',
            render: (value: string) => {
                return value;
                return moment(value, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm');
            },
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
            addVisible: false,
            detailVisible: false,
            orgList: [],
            type: 0,
            selectedRowKeys: [],
            orgId: '',
            rootId: '',
            queryArgs: {
                enterpriseIds: [],
            },
            rowId: '',
            curRow: '',
            refreshCount: 0,
            orgName: '',
        };
    }

    /**
     * 判断按钮权限
     * @param title 按钮名称
     */
    hasPermission = (title: string) => {
        return permission.indexOf(title) !== -1;
    };

    renderStart = (record: any) => {
        if (this.hasPermission('删除')) {
            return (
                <Popconfirm key={record.id} title="确认操作？" onConfirm={() => this.startConfirm(record, 1)} cancelText="取消" okText="确定">
                    <Button
                        className="table-link-btn"
                        type="link"
                        onClick={(event: React.MouseEvent) => {
                            event.stopPropagation();
                            this.setState({ detailVisible: false });
                        }}
                    >
                        启用
                    </Button>
                </Popconfirm>
            );
        } else {
            return (
                <Button className="table-link-btn" type="link" disabled={true}>
                    启用
                </Button>
            );
        }
    };

    renderStop = (record: any) => {
        if (this.hasPermission('删除')) {
            return (
                <Popconfirm key={record.id} title="确认操作？" onConfirm={() => this.stopConfirm(record, 0)} cancelText="取消" okText="确定">
                    <Button
                        className="table-link-btn"
                        type="link"
                        disabled={!this.hasPermission('删除')}
                        onClick={(event: React.MouseEvent) => {
                            event.stopPropagation();
                            this.setState({ detailVisible: false });
                        }}
                    >
                        <span style={{ color: 'red' }}>停用</span>
                    </Button>
                </Popconfirm>
            );
        } else {
            return (
                <Button className="table-link-btn" type="link" disabled={true}>
                    停用
                </Button>
            );
        }
    };

    /**
     * 新增
     */
    addFun() {
        this.setState({
            detailVisible: false,
            addVisible: true,
            type: 0,
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
        });
    };

    /**
     * 修改
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
        });
    };

    /**
     * 多选框改变
     */
    rowChange = (selectedRowKeys: []) => {
        this.setState({
            selectedRowKeys,
            detailVisible: false,
        });
    };

    /**
     * 关闭抽屉
     */
    closeAddDrawer = () => {
        this.setState({
            addVisible: false,
        });
    };
    closeDetailDrawer = () => {
        this.setState({
            detailVisible: false,
        });
    };
    /**
     * 显示修改抽屉
     */
    showUpdateDawer = () => {
        this.setState({
            type: 1,
            // detailVisible: true,
        });
    };

    /**
     * 批量删除确定
     */
    delMoreConfirm = () => {
        this.delMore();
    };
    async delMore() {
        const { selectedRowKeys } = this.state;
        const params = selectedRowKeys;
        const result = await deleteContractBatch<any>(params);
        if (result) {
            if (result.faileAmount > 0) {
                message.success(`删除成功, 已删除${result.successAmount}条数据,${result.faileAmount}条数据删除失败`);
            } else {
                message.success(`删除成功, 已删除${result.successAmount}条数据`);
            }
            this.reload();
            this.setState({
                selectedRowKeys: [],
            });
        }
    }

    /**
     * 单个删除确定
     */
    delConfirm(record: IRecord) {
        this.checkIsDel(record.id);
    }

    /**
     * 启用合同确认
     */
    async startConfirm(record: IRecord, status: number) {
        const params = {
            id: record.id,
            status: status,
        };
        const data = await updateState(params);
        if (data) {
            message.success('操作成功');
            this.reload();
        }
    }
    /**
     * 停用合同确认
     */
    async stopConfirm(record: IRecord, status: number) {
        const params = {
            id: record.id,
            status: status,
        };
        const data = await updateState(params);
        if (data) {
            message.success('操作成功');
            this.reload();
        }
    }

    /**
     * 单个组织删除
     * @param id
     */
    async checkIsDel(id: string) {
        if (true) {
            this.delOne(id);
        }
    }
    async delOne(id: string) {
        const { selectedRowKeys } = this.state;
        const datas = await deleteContract(id);
        if (datas) {
            message.success('删除成功');
            if (this.state.orgId == id) {
                if (this.state.detailVisible) {
                    this.closeDetailDrawer();
                }
                this.setState({
                    orgId: this.state.rootId,
                });
            }
            this.setState({
                selectedRowKeys: selectedRowKeys.filter((item) => item != id) as [],
            });
            this.reload();
        }
    }

    /**
     * 详情抽屉删除组织
     */
    detailDel = async (id: string) => {
        const datas = await deleteContract(id);
        if (datas) {
            this.closeDetailDrawer();
            this.reload();
        }
    };

    /**
     * 批量删除
     */
    getDelPop = () => {
        const { selectedRowKeys } = this.state;

        if (!this.hasPermission('删除')) {
            return <Button disabled>批量删除</Button>;
        }

        if (selectedRowKeys.length > 0) {
            return (
                <Popconfirm
                    key={'record1'}
                    title={`删除后无法找回！确认是否删除${selectedRowKeys.length}条记录？`}
                    onConfirm={this.delMoreConfirm}
                    cancelText="取消"
                    okText="确定"
                    showOk={true}
                >
                    <Button>批量删除</Button>
                </Popconfirm>
            );
        } else {
            return (
                <Popconfirm key={'record2'} title="请勾选需要删除的行！" cancelText="取消" showOk={false}>
                    <Button>批量删除</Button>
                </Popconfirm>
            );
        }
    };

    /**
     * 刷新列表
     */
    reload = () => (this.tableRef.current as any).reload();

    render() {
        const { addVisible, type, selectedRowKeys, detailVisible, orgId, rootId, rowId, orgName, queryArgs } = this.state;

        return (
            <div style={{ height: 'calc(100% - 196px)' }}>
                <Table
                    ref={this.tableRef}
                    columns={this.columns}
                    showTree={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: this.rowChange,
                        getCheckboxProps: (record: any) => ({
                            disabled: record.id === rootId,
                        }),
                    }}
                    btnGroup={[
                        <Button key={Math.random()} disabled={!this.hasPermission('新增')} type="primary" onClick={this.addFun.bind(this)}>
                            新增
                        </Button>,
                        this.getDelPop(),
                    ]}
                    queryAjax={getContractList}
                    settingQuery={{
                        key: 'keyword', //模糊查询参数
                        placeholder: '请输入标段名称',
                    }}
                    pageCallback={() => {
                        this.setState({
                            selectedRowKeys: [],
                        });
                    }}
                    queryCallback={() => this.setState({ selectedRowKeys: [] })}
                    settingQueryStyle={{ width: 270 }}
                    queryArgs={queryArgs}
                    rowClick={this.rowClickFun.bind(this)}
                    scroll={{ y: 'calc(100vh - 340px)' }}
                />

                {/* 新增、修改 抽屉 */}
                {addVisible && (
                    <ContractAddDrawer
                        visible={addVisible}
                        type={type}
                        closeDrawer={this.closeAddDrawer}
                        orgId={orgId}
                        orgName={orgName}
                        rowId={rowId}
                        reload={this.reload}
                        key={type == 1 ? rowId : Math.random()}
                    />
                )}
                {/* 详情 抽屉 */}
                {detailVisible && (
                    <ContractDetailDrawer
                        visible={detailVisible}
                        key={Math.random()}
                        closeDrawer={this.closeDetailDrawer}
                        rowId={rowId}
                        delOrg={this.detailDel}
                        reload={this.reload}
                        hasPermission={this.hasPermission}
                        // hasPermission={() => true}
                        rootId={rootId}
                    />
                )}
            </div>
        );
    }
}

export default ContractList;
