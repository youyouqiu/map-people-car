import React, { createRef, RefObject } from 'react';
import { Button } from 'antd';
import { message } from 'antd';
import { Table, Popconfirm as Popconfirms } from '@/common';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import styles from './index.module.less';
import { roleList, deleteRole, batchDeleteRole, saveRole, addRole, saveRoleUser, roleCanDelete, pagePermissions } from '@/server/systemManagement';
import Edit from './edit'
import Detail from './detail'
import Assign from './assign'
import { getCurrentUserPermission } from '@/framework/utils/function';
import { getStore } from '@/framework/utils/localStorage';

export interface IRole {
    code: string;
    createDataTime: string;
    createDataUsername: string;
    description: string;
    editable: number;
    id: string;
    name: string;
    owner: string;
    numOfUser: number;
    priority: number;
    updateDataTime: string;
    updateDataUsername: string;

}

export interface IMenuTreeData { menu: object[]; home: object; permission: object }

interface IProps {
    intl: any;
}

interface IState {

    pageCode: string;
    tableRef: RefObject<any>;
    selectedRowKeys: string[];
    editId: string;
    detailItem: IRole | undefined;
    assignItem: IRole | undefined;
    detailId: string;
    editTitle: string;
    detailFlag: undefined | boolean;
    editFlag: undefined | boolean;
    assignFlag: undefined | boolean;
}

/**
* 当前页面权限
*/
const permission = getCurrentUserPermission('4_role_list');

class RolePermission extends React.Component<IProps, IState, any> {
    userId = getStore('user_id');
    userName = getStore('userName');
    menuPermissionData: any;
    constructor(props: IProps) {
        super(props);
        this.state = {
            pageCode: '4_role_list',
            tableRef: createRef(),
            selectedRowKeys: [], // 列表勾选行key
            editId: '', // 点击修改的角色
            assignItem: undefined, // 点击分配角色的角色
            detailId: '', // 点击详情的角色
            detailItem: undefined,
            editTitle: '',
            detailFlag: undefined, // 角色详情 抽屉展开状态
            editFlag: undefined,  // 修改 抽屉展开状态
            assignFlag: undefined, // 分配用户 抽屉展开状态
        }
    }

    componentDidMount() {
        this.menuPermission();
    }

    /**
     * 操作权限树
     */
    async menuPermission() {
        const requestResponse = await pagePermissions(null);
        if (requestResponse) {
            this.menuPermissionData = requestResponse.data.data;
        }
    }


    /**
     * 判断按钮权限
     * @param title 按钮名称
     */
    hasPermission = (title: string) => {
        return permission.indexOf(title) !== -1;
    }

    // 关闭抽屉
    closeDrawer = (flag: any) => {
        this.setState(flag)
    }

    /**
     * 关闭修改用户抽屉
     */
    closeEditDrawer = () => {
        this.setState({
            editFlag: false,
            editId: ''
        })
    }

    /**
     * 关闭分配用户抽屉
     */
    closeAssignDrawer = () => {
        this.setState({
            assignFlag: false
        })
    }

    /**
     * 关闭详情抽屉
     */
    closeDetailDrawer = () => {
        this.setState({
            detailFlag: false,
            detailId: ''
        })
    }
    /**
     * 点击修改或者新增  新增item为空   修改item为列表行数据
     * @param param 
     */
    openEditDrawer = (item?: any) => {

        // editTitle = item && (item.id || item.id == 0) ? messages.permission_role_modify_title : messages.permission_role_add_title;
        this.setState({
            editId: item ? item.id : '',
            editFlag: true,

        })
    }
    /**
     * 点击分配用户 弹出/关闭分配用户抽屉  关闭item为空   修改item为列表行数据
     * @param param 
     */
    assignDrawerFlag = (item?: any) => {
        const { assignFlag } = this.state;
        let { assignItem } = this.state;
        assignItem = item && (item.id || item.id == 0) ? item : null;
        this.setState({
            assignItem,
            assignFlag: !assignFlag,
        })
    }
    /**
     * 删除角色列表数据
     * @param param 
     */
    handleDataDelete = async (id: string) => {
        const { intl: { messages } } = this.props;
        const canDelete = await roleCanDelete<boolean>(id);
        if (canDelete !== undefined) {
            if (canDelete) {
                const requestResponse = await deleteRole({ id });

                if (requestResponse) {
                    message.success(messages.request_delete_success_text_message);
                    this.setState({
                        detailFlag: false
                    })
                    this.reloadTable();
                }
            } else {
                message.error('删除失败，角色已分配用户！')
            }
        }

    }
    /**
     * 批量删除选中角色数据
     * @param param 
     */
    async batchDelete() {
        const { selectedRowKeys } = this.state;
        const number = selectedRowKeys.length;
        const requestResponse = await batchDeleteRole(selectedRowKeys);
        if (requestResponse) {
            if (requestResponse == 0) {
                message.success('删除失败,已删除0条数据！');
            } else {
                if (number == requestResponse) {
                    message.success(`批量删除成功，已删除${requestResponse}条数据!`);
                } else {
                    message.warning(`批量删除成功，已删除${requestResponse}条数据，${selectedRowKeys.length - Number(requestResponse)}条数据删除失败！`);
                }

                this.reloadTable();
            }
        }
    }
    /**
     * 保存角色
     * @param param 
     */
    handleSaveRole = async (formdata: any, param: any, item: any) => {
        const { intl: { messages } } = this.props;
        let requestResponse: any;
        const flag = item && item.id;

        const length = Object.getOwnPropertyNames(param.roleDto.permissions).length;
        if (length == 0) {
            message.error('请选择操作选项');
            return;
        }


        if (!!flag) {
            requestResponse = await saveRole(param);
        } else {
            requestResponse = await addRole(param.roleDto);
        }
        if (requestResponse) {
            // 如果详情抽屉存在 则关闭详情抽屉  否则关闭修改/新增的抽屉
            if (this.state.detailFlag) {
                this.closeDetailDrawer();
            } else {
                this.closeDrawer({ editFlag: false, editTitle: '', editItem: null })
            }
            message.success(messages.request_save_success_text_message);
            // if (!!flag) {
            //     const _data = item;
            //     _data.name = formdata.name;
            //     _data.description = formdata.description;
            //     this.updateTableData(_data, _data.id);
            // } else {
            //     this.reloadTable();
            // }
            this.reloadTable();
        }
    }
    /**
     * 表格行点击事件
     * @param param 
     */
    async tableRowClick(item?: any) {
        if (!item.id) return false;
        this.setState({
            detailId: item.id,
            detailFlag: true,
            detailItem: item
        })
    }
    /**
     * 保存角色用户
     * @param param 
     */
    handleSaveRoleUser = async (param: any) => {
        const { intl: { messages } } = this.props;
        const { detailFlag } = this.state;
        const requestResponse = await saveRoleUser(param);
        if (requestResponse) {
            if (detailFlag) {
                this.closeDrawer({ detailFlag: false })
            } else {
                this.closeDrawer({ assignFlag: false })
            }

            message.success(messages.request_assign_success_text_message);
            this.reloadTable();
        }
        // if (detailFlag === true) {
        //   //这是为了强制刷新详情框，详情框内获取？号前面的字符串为真正ID
        //   const detailIdCopy = detailId + '?' + Math.random().toString();
        //   this.setState({
        //     detailId: detailIdCopy
        //   })
        // }
    }
    // 列表数据勾选
    tableRowChange = (selectedRowKeys: any) => {
        this.setState({
            selectedRowKeys,
        });
    }
    /**
     * 重载表格
     * @param flag 
     */
    reloadTable() {
        const { tableRef } = this.state;
        this.setState({
            selectedRowKeys: []
        })
        tableRef.current.reload();
    }
    /**
     * 更新单条数据
     */
    // updateTableData(data: any, key: string | number) {
    //     const { tableRef } = this.state;
    //     this.setState({
    //         selectedRowKeys: []
    //     })
    //     tableRef.current.updateDataOne(data, key);
    // }

    authorityBtn = (title: string, owner: string, name: string) => {
        if (this.hasPermission(title)) {
            if (name == '超级管理员') return false;

            if (this.userId == owner || this.userName === 'admin') {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    render() {
        const { intl: { messages, formatMessage } } = this.props;

        const defColumns = [
            {
                title: messages.operation_text,
                dataIndex: '',
                key: 'id',
                width: 180,
                render: (record: any) => {
                    const owner = record.owner;
                    const name = record.name;
                    const delHtml = (
                        this.authorityBtn('删除', owner, name) ?
                            <Popconfirms
                                title={<FormattedMessage id="delete_popconfirm_notice" />}
                                onConfirm={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                                    e.stopPropagation();
                                    this.handleDataDelete(record.id)
                                }}
                            >
                                <Button
                                    type="link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.closeDetailDrawer();
                                    }}
                                >
                                    {messages.delete_text}
                                </Button>
                            </Popconfirms> :
                            <Button
                                disabled
                                type="link"
                                className='table-link-btn'
                            > 删除</Button>
                    );
                    const editHtml = (
                        this.authorityBtn('修改', owner, name) ?
                            <Button
                                type="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.closeDetailDrawer();
                                    this.openEditDrawer(record);
                                }}
                            >
                                {messages.modify_text}
                            </Button>
                            :
                            <Button
                                disabled
                                type="link"
                                className='table-link-btn'
                            > 修改</Button>
                    );
                    const assignHtml = (
                        <Button
                            type="link"
                            disabled={!this.hasPermission('分配用户') || record.name === '超级管理员'}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.closeDetailDrawer();
                                this.assignDrawerFlag(record)
                            }}
                        >
                            {messages.permission_role_assign_user_title}
                        </Button>
                    );
                    return (<div className={styles['tableBtns']}>{editHtml} | {delHtml} | {assignHtml}</div>);
                }
            },
            {
                title: messages.permission_role_text,
                dataIndex: 'name',
                width: 120,
            },
            {
                title: messages.remark_text,
                dataIndex: 'description',
                width: 250,
            },
            {
                title: messages.create_date_time,
                dataIndex: 'createDataTime',
                width: 120,
                render: (text: string) => {
                    if (text != null) {
                        const texts = text.split(" ");
                        return texts.length ? texts[0] : text;
                    }
                },
                sorterKey: 'create_data_time'
            },
            {
                title: messages.last_update_date_time,
                dataIndex: 'updateDataTime',
                width: 150,
                sorterKey: 'update_data_time',
                render: (text: string) => {
                    const time = text.substring(0, text.length - 3);
                    return time;
                }
            },
            {
                title: messages.last_update_date_user,
                dataIndex: 'updateDataUsername',
                width: 120,
            },
        ];
        const { selectedRowKeys } = this.state, len = selectedRowKeys.length, popflag = !selectedRowKeys || !len;
        const rowSelection = {
            columnWidth: 50,
            selectedRowKeys,
            onChange: this.tableRowChange,
            getCheckboxProps: (record: any) => ({
                disabled: record.enabled == 0 || !this.hasPermission(messages.delete_text)
            }),
        };
        return (
            <div className={styles['role-permission-container']}>
                <div className={styles['data-table']} style={{ height: '100%' }}>
                    <Table
                        ref={this.state.tableRef}
                        columns={defColumns}
                        showRow={true}
                        showTree={false}
                        showSetting
                        rowSelection={rowSelection}
                        // scroll={{ y: 'calc(100vh - 340px)' }}
                        rowClick={(record: Record<string, any>) => {
                            this.tableRowClick(record);
                        }}
                        btnGroup={[
                            (
                                <Button
                                    key="add"
                                    type="primary"
                                    disabled={!this.hasPermission(messages.add_text)}
                                    onClick={() => this.openEditDrawer(null)}
                                >
                                    {messages.add_text}
                                </Button>
                            ),
                            (
                                <Popconfirms
                                    key="delete"
                                    disabled={!this.hasPermission(messages.delete_text)}
                                    title={popflag ? messages.delete_popconfirm_message : formatMessage({ id: 'batch_delete_popconfirm_message' }, { number: len })}
                                    showOk={!popflag}
                                    onConfirm={() => {
                                        this.batchDelete()
                                    }}>
                                    <Button disabled={!this.hasPermission(messages.delete_text)}>
                                        {messages.batch_delete}
                                    </Button>
                                </Popconfirms>

                            )
                        ]}
                        queryAjax={roleList}
                        settingQuery={{
                            placeholder: messages.permission_role_message,
                            key: 'keyword'
                        }}
                        queryCallback={() => {
                            this.setState({
                                selectedRowKeys: []
                            })
                        }}
                    />
                </div>
                {
                    this.state.detailFlag !== undefined && this.state.detailItem !== undefined ? <Detail
                        flag={this.state.detailFlag}
                        roleId={this.state.detailId}
                        item={this.state.detailItem}
                        menuPermissionData={this.menuPermissionData}
                        close={this.closeDrawer}
                        edit={this.openEditDrawer}
                        assign={this.assignDrawerFlag}
                        delete={this.handleDataDelete}
                        handleSaveRoleUser={this.handleSaveRoleUser}
                        handleSaveRole={this.handleSaveRole}
                    /> : null
                }
                {
                    this.state.assignFlag !== undefined ? <Assign
                        flag={this.state.assignFlag}
                        item={this.state.assignItem}
                        save={this.handleSaveRoleUser}
                        close={this.closeAssignDrawer}
                    /> : null
                }
                {
                    this.state.editFlag !== undefined ? <Edit
                        flag={this.state.editFlag}
                        permission={this.menuPermissionData}
                        roleId={this.state.editId}
                        close={this.closeEditDrawer}
                        save={this.handleSaveRole}
                    /> : null
                }
            </div>
        );
    }
}
export default connect(
    null,
    dispatch => ({
        getMenuTreeData: (payload: any) => {
            dispatch({ type: 'permissionManager/getMenuTreeDataEvery', payload });
        },
        getUserTreeData: (payload: any) => {
            dispatch({ type: 'permissionManager/getUserTreeDataEvery', payload });
        },
    }),
)(injectIntl(RolePermission))
