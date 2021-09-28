import React, { Component } from "react";
import { FourthMenuContainer } from "@/common";
import { Tabs } from "antd";
const { TabPane } = Tabs;
import UserList from './userList';
import { hasPagePermmision } from "@/framework/router";


class UserMgm extends Component<any, any, any>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <FourthMenuContainer
                contentFullHeight
            >
                {hasPagePermmision('4_system_user_list') && <TabPane
                    tab="系统用户列表"
                    key="userList"
                >
                    <UserList />
                </TabPane>
                }
            </FourthMenuContainer >
        )
    }
}


export default UserMgm;