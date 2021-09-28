import React, { Component } from "react";
import Tabs from "antd/es/tabs";
import FourthMenuContainer from "../../../common/fourthMenuContainer";
import OrgList from "./orgList";
import { hasPagePermmision } from "@/framework/router";
const { TabPane } = Tabs;

class OrgMgm extends Component<any, any, any>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <FourthMenuContainer
                contentFullHeight
            >
                {hasPagePermmision('4_organization_list') && <TabPane
                    tab="组织列表"
                    key="orgList"
                >
                    <OrgList />
                </TabPane>
                }
            </FourthMenuContainer >
        )
    }
}


export default OrgMgm;