import React, { Component } from "react";
import Tabs from "antd/es/tabs";
import FourthMenuContainer from "../../../common/fourthMenuContainer";
import EnterpriseList from "./enterpriseList"
import { hasPagePermmision } from "@/framework/router";
const { TabPane } = Tabs;

class EnterpriseMgm extends Component<any, any, any>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <FourthMenuContainer
                contentFullHeight
            >
                {hasPagePermmision('4_enterprise_user_list') && <TabPane
                    tab="企业用户列表"
                    key="enterpriseUserList"
                >
                    <EnterpriseList />
                </TabPane>
                }
            </FourthMenuContainer >
        )
    }
}


export default EnterpriseMgm;