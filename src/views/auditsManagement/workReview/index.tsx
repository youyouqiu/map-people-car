import React, { Component } from "react";
import { FourthMenuContainer } from "@/common";
import { Tabs } from "antd";
const { TabPane } = Tabs;
import WorkList from './workList';
import { hasPagePermmision } from "@/framework/router";


class WorkReview extends Component<any, any, any>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <FourthMenuContainer
                contentFullHeight
            >
                {hasPagePermmision('4_system_user_list') && <TabPane
                    tab="作业对象列表"
                    key="userList"
                >
                    <WorkList />
                </TabPane>
                }
            </FourthMenuContainer >
        )
    }
}


export default WorkReview;