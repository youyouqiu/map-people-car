
import React, { Component } from 'react';
import {
    message,
} from 'antd';
import styles from './index.module.less';
import { GroupTree, EditDrawer } from '@/common';
import { assignGroup } from '@/server/orgMgm';

interface IProps {
    visible: boolean;
    closeDrawer: () => void;
    userId: string;
    checkedKeys: Array<string>;
    getContainer?: string | false;
    closeDetailDrawer?: Function;//关闭详情抽屉
}

interface IState {
    groupIds: Array<string>;
    // loading: boolean
}


class AssignGroupDrawer extends Component<IProps, IState, any> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            groupIds: this.props.checkedKeys,
            // loading: true
        };
    }

    // UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    //     const {
    //         visible
    //     } = nextProps;
    //     if (visible) {
    //         this.setState({
    //             loading: true
    //         })
    //     }
    // }

    /**
     * 确定
     */
    refer = () => {
        const { userId } = this.props;
        const { groupIds } = this.state;
        if (groupIds.length == 0) {
            message.warn('请勾选要分配的分组');
            return;
        }
        this.assignGroup(userId, groupIds);
    }
    /**
     * 分配分组请求
     */
    async assignGroup(userId: string, groupIds: string[]) {
        const params = {
            userId: userId,
            body: groupIds
        };

        const datas = await assignGroup<boolean>(params);
        if (datas) {
            message.success('修改成功');

            const {
                closeDetailDrawer,
                closeDrawer
            } = this.props;
            closeDrawer();
            if (typeof closeDetailDrawer == 'function') {
                closeDetailDrawer()
            }
        }
    }


    /**
     * 勾选
     */
    getCheckTNode = (checkedKeys: any) => {
        this.setState({
            groupIds: checkedKeys,
        })
    }

    /**
     * 关闭加载框
     */
    // closeLoading = () => {
    //     this.setState({
    //         loading: false
    //     });
    // }

    render() {
        const {
            visible,
            closeDrawer,
            userId,
            getContainer,
            checkedKeys
        } = this.props;

        // const {
        //     loading
        // } = this.state;

        return (
            <EditDrawer
                title="分配分组"
                width={420}
                visible={visible}
                onClose={closeDrawer}
                getContainer={getContainer}
                onConfirm={this.refer}
            >
                <div
                    className={styles['content-box']}
                    style={{ height: 'calc(100vh - 264px)' }}
                >
                    <div style={{ marginBottom: 10 }}>请勾选需要分配的分组</div>

                    {
                        visible && <GroupTree
                            isCheckable={true}
                            isShowselect={true}
                            onTreeCheck={this.getCheckTNode}
                            checkedKeys={checkedKeys}
                            userId={userId}
                        />
                    }

                </div>

                {/* 加载框 */}
                {/* {
                    loading && (
                        <Spin
                            spinning
                            className={styles['loading']}
                        />
                    )
                } */}
            </EditDrawer>
        );
    }
}
export default AssignGroupDrawer;
