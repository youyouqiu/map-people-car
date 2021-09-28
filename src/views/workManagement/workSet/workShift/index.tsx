import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { Table, Popconfirm } from '@/common';
import { Button, message } from 'antd';
import { getShiftList, deleteShift, deleteShiftBatch } from '@/server/workManagement';
import WorkShiftAddDrawer from './drawer/add';
// import WorkShiftDetailDrawer from './drawer/detail'
import { getCurrentUserPermission } from '@/framework/utils/function';
import moment from 'moment';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_work_shift');

interface IState {
    addVisible: boolean | undefined;
    orgList: [];
    type: number; //抽屉类型(0:新增，1:修改)
    selectedRowKeys: [];
    orgId: string; //当前选中节点id
    orgName: string; //当前选中节点name
    rootId: string; //组织树根节点
    queryArgs: { enterpriseIds?: string[] }; //组织管理列表请求参数
    detailVisible: boolean | undefined;
    rowId: string;
    curRow: any;
    refreshCount: number;
}

interface IRecord {
    id: string;
    selectedRowKeys?: [];
    enterpriseId: string;
}
interface Iprops {
    id?: string;
    userType: number;
}

class WorkShift extends Component<Iprops, IState> {
    tableRef: any = React.createRef();
    columns: any[] = [
        {
            title: '操作',
            key: 'opra',
            width: 180,
            render: (value: any, record: any) => {
                return (
                    <>
                        <Button
                            disabled={!this.hasPermission('修改')}
                            type="link"
                            onClick={(event) => this.updateShiftClick(event, record)}
                            className="table-link-btn"
                        >
                            修改
                        </Button>
                        |
                        {record.id != this.state.rootId && this.hasPermission('删除') ? (
                            <>
                                <Popconfirm
                                    key={record.id}
                                    title={'删除后无法找回！确认是否删除？'}
                                    onConfirm={() => this.delConfirm(record)}
                                    cancelText={'取消'}
                                    okText="确定"
                                >
                                    <Button className="table-link-btn" type="link">
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
                    </>
                );
            },
        },
        {
            title: '班次名称',
            dataIndex: 'shiftName',
            width: 120,
            key: 'shiftName',
        },
        {
            title: '作业时间',
            dataIndex: 'shiftTime',
            width: 200,
            key: 'shiftTime',
        },
        {
            title: '备注',
            width: 200,
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: '所属企业',
            width: 150,
            dataIndex: 'enterpriseName',
            key: 'enterpriseName',
        },
        {
            title: '最后修改时间',
            width: 150,
            dataIndex: 'updateDataTime',
            key: 'updateDataTime',
            sorterKey: 'updateDataTime',
            render: (value: string) => {
                return moment(value).format('YYYY-MM-DD HH:mm');
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
            addVisible: undefined,
            detailVisible: undefined,
            orgList: [],
            type: 0,
            selectedRowKeys: [],
            orgId: '',
            rootId: '',
            queryArgs: {},
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
    updateShiftClick = (event: any, record: IRecord) => {
        event.stopPropagation();
        const id = record.id;
        this.setState({
            rowId: id,
            orgId: record.enterpriseId,
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
     * 获取当前选中组织树节点
     */
    getSelectTNode = (selectedNode: any) => {
        if (!selectedNode) {
            return;
        }
        // console.log(selectedNode);
        this.setState({
            orgId: selectedNode.id,
            orgName: selectedNode.name,
            queryArgs: {
                enterpriseIds: selectedNode.id,
            },
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
            detailVisible: true,
        });
    };

    /**
     * 批量删除
     */
    deleteBatchConfirm = () => {
        this.deleteBatch();
    };
    async deleteBatch() {
        const { selectedRowKeys } = this.state;
        const datas = await deleteShiftBatch<{ suceessNum: number; failNum: number }>(selectedRowKeys);
        if (datas) {
            message.success(`删除成功, 已删除${datas.suceessNum}条数据,${datas.failNum}条数据删除失败`);
            this.setState({
                orgId: this.state.rootId,
                queryArgs: {
                    enterpriseIds: [this.state.rootId],
                },
                selectedRowKeys: [],
            });
        }
    }

    /**
     * 单个删除确定
     */
    delConfirm(record: IRecord) {
        this.delOne(record.id);
    }

    /**
     * 单个组织删除
     * @param id number
     */
    async delOne(id: string) {
        const { selectedRowKeys } = this.state;
        const datas = await deleteShift(id);
        if (datas) {
            message.success('删除成功');
            if (this.state.orgId == id + '') {
                if (this.state.detailVisible) {
                    this.closeDetailDrawer();
                }
                this.setState({
                    orgId: this.state.rootId,
                    queryArgs: {
                        enterpriseIds: [this.state.rootId],
                    },
                });
            } else {
                this.reload();
            }
            this.setState({
                selectedRowKeys: selectedRowKeys.filter((item) => item != id) as [],
            });
            this.refreshOrgtTree();
        }
    }

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
                    onConfirm={this.deleteBatchConfirm}
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

    /**
     *刷新组织树
     */
    refreshOrgtTree = () => {
        this.setState({
            refreshCount: Math.random(),
        });
    };

    render() {
        const { addVisible, type, selectedRowKeys, queryArgs, orgId, rootId, rowId, orgName } = this.state;

        return (
            <div style={{ height: '100%' }}>
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
                            {/* <Button key={Math.random()} disabled={this.props.userType != 1} type="primary" onClick={this.addFun.bind(this)}> */}
                            新增
                        </Button>,
                        this.getDelPop(),
                    ]}
                    queryAjax={getShiftList}
                    settingQuery={{
                        key: 'keyword', //模糊查询参数
                        placeholder: '请输入班次名字',
                    }}
                    pageCallback={() => this.setState({ selectedRowKeys: [] })}
                    queryCallback={() => this.setState({ selectedRowKeys: [] })}
                    settingQueryStyle={{ width: 270 }}
                    queryArgs={queryArgs}
                    rowClick={this.rowClickFun.bind(this)}
                    scroll={{ y: 'calc(100vh - 340px)' }}
                />

                {/* 新增、修改 抽屉 */}
                {addVisible !== undefined && (
                    <WorkShiftAddDrawer
                        key={type == 1 ? rowId : Math.random()}
                        visible={addVisible}
                        type={type}
                        closeDrawer={this.closeAddDrawer}
                        orgId={orgId}
                        orgName={orgName}
                        rowId={rowId}
                        reload={this.reload}
                    />
                )}
            </div>
        );
    }
}

export default connect((state: AllState) => ({
    userType: state.root.userMessage.userType,
}))(WorkShift);
