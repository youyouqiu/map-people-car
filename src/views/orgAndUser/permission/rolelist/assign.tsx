import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import UserTree from '@/common/userTree'
import { EditDrawer } from '@/common';
import styles from './index.module.less';

interface IProps {
    flag: boolean;
    item: any;
    close: Function;
    save: Function;
    intl: any;
    userTreeData: Array<object>;
    getUserTreeData: Function;
    getContainer?: 'body';
}

class RoleAssign extends React.Component<IProps, any, any> {
    checkedUser: string[];

    constructor(props: IProps) {
        super(props);
        this.checkedUser = [];
        this.state = {
            checkUsers: [],
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { item, getUserTreeData } = this.props;
        if (item !== nextProps.item) {
            getUserTreeData({ queryParam: '', queryType: 0 });
        }
    }

    userTreeCheck(checkedKeys: string[]) {
        this.checkedUser = checkedKeys;
    }

    saveAssignUser = () => {
        const { item } = this.props;
        const param = {
            roleId: item.id,  // clickItem.id
            userIds: this.checkedUser
        }

        this.props.save(param);
    }

    bindDrawerFlag = () => {

        this.props.close({ assignFlag: false });
    }

    render() {
        const { intl: { messages }, item, flag, getContainer } = this.props;

        return (
            <EditDrawer
                title={messages.permission_role_assign_user_title}
                width={560}
                onClose={this.props.close}
                visible={flag}
                getContainer={getContainer}
                onConfirm={this.saveAssignUser}
            >
                {
                    flag ?
                        <div>
                            <div className={styles['title']}>{messages.permission_role_assign_checked_message}</div>
                            <div style={{ height: 'calc(100vh - 258px)' }}>
                                <UserTree
                                    roleId={item.id}
                                    item={item}
                                    treeQueryStatus={true}
                                    treeEditStatus={true}
                                    treeCheck={(checkedKeys: string[]) => {
                                        this.userTreeCheck(checkedKeys);
                                    }} />
                            </div>
                        </div>
                        : null
                }

            </EditDrawer>
        )
    }
}
export default connect(
    (state: AllState) => ({
        userTreeData: state.permissionManager.userTreeData,
    }),
    dispatch => ({
        getUserTreeData: (payload: any) => {
            dispatch({ type: 'permissionManager/getUserTreeDataEvery', payload });
        },
    }),
)(injectIntl(RoleAssign))

