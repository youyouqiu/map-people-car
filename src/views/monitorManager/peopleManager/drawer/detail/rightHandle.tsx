/**
 * 人员详情右侧操作安保部区域
 */
import React, { Component } from 'react';
import moment from 'moment';
import { Popconfirm, Button, message, } from 'antd';

import { OperatorContainer } from '@/common/';
import { getCurrentUserPermission } from '@/framework/utils/function';
import { deletePeople, cancelVehicleBind } from '@/server/monitorManager';

import styles from '../../../index.module.less';
import { connect } from 'react-redux';

interface IProps {
    monitorInfo: any;
    changeDrawer: Function;
    currentTable: any;
    getBindData: Function;
}

interface IState { }

// 当前页面权限
const permission = getCurrentUserPermission('4_people_list');
class Index extends Component<IProps, IState, any> {
    constructor(props: IProps) {
        super(props);
    }

    /**
     * 判断按钮权限
     * @param title 按钮名称
     */
    hasPermission = (title: string) => {
        return permission.indexOf(title) !== -1;
    }

    /**
     * 时间戳转日期格式
     */
    getDateStr = (date: number, format?: string) => {
        return moment(date).format(format ? format : 'YYYY-MM-DD');
    }

    /**
     * 改变抽屉显示状态
     */
    changeDrawerVisible = (param: object) => {
        const { changeDrawer } = this.props;
        changeDrawer(param);
    };

    /**
     * 删除人员
     */
    deleteMonitorFun = async () => {
        const { monitorInfo: { id }, getBindData, changeDrawer, currentTable } = this.props;
        const result = await deletePeople<boolean>(id);
        if (result) {
            changeDrawer({ detailVisible: false });
            getBindData();
            message.success('删除成功');
            currentTable.current.reload();
        }
    }

    /**
     * 人员解绑
     */
    cancelMonitorBind = async () => {
        const { currentTable, getBindData, changeDrawer, monitorInfo: { id }, } = this.props;
        const result = await cancelVehicleBind<boolean>(id);
        if (result) {
            changeDrawer({ detailVisible: false });
            getBindData();
            message.success('解绑成功');
            currentTable.current.reload();
        }
    }

    render() {
        const { monitorInfo = {} } = this.props;
        console.log('monitorInfo', monitorInfo);

        return (
            <OperatorContainer>
                <div className={styles.monitorName}>{monitorInfo.name}</div>
                <div className={styles.monitorInfo}>
                    <div>
                        <p>所属企业:</p>
                        <p>{monitorInfo.orgName}</p>
                    </div>
                    <div>
                        <p>绑定状态:</p>
                        <p>{monitorInfo.bindingType === 1 ? '已绑定' : '未绑定'}</p>
                    </div>
                    <div>
                        <p>最后修改时间:</p>
                        <p>{moment(monitorInfo.updatDataTimeStr).format('YYYY-MM-DD HH:mm')}</p>
                    </div>
                </div>
                <Button block disabled={!this.hasPermission('修改')} onClick={() => { this.changeDrawerVisible({ addAndedit: 'edit' }) }}>
                    修改人员
                    </Button>
                <Button
                    block
                    disabled={monitorInfo.bindingType === 1 && this.hasPermission('绑定') ? false : true}
                    onClick={() => { this.changeDrawerVisible({ editBindInfo: true }) }}
                >
                    修改绑定
                        </Button>
                {monitorInfo.bindingType === 1 && this.hasPermission('解绑') ?
                    <Popconfirm
                        placement="top"
                        title={(
                            <div>
                                <div>解绑后所有关联数据无</div>
                                        法恢复，确认是否继续？
                            </div>
                        )}
                        onConfirm={this.cancelMonitorBind}
                        okText="确定"
                        cancelText="取消">
                        <Button block>解绑</Button>
                    </Popconfirm>
                    :
                    <Button key='disabledbindMonitor' disabled block>解绑</Button>
                }
                {this.hasPermission('删除')
                    ? <Popconfirm
                        key='deleteMonitorBtn'
                        placement="top"
                        title='确认是否删除？'
                        onConfirm={this.deleteMonitorFun}
                        okText="确定"
                        cancelText="取消">
                        <Button block>删除</Button>
                    </Popconfirm>
                    :
                    <Button key='disabledDeleteMonitorBtn' disabled block>删除</Button>
                }
            </OperatorContainer>
        );
    }
}
export default connect(
    null,
    dispatch => ({
        getBindData: (payload: any) => {
            dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
        }
    }),
)(Index);
