import React, { Component } from "react";
import Tabs from "antd/es/tabs";
import { FourthMenuContainer } from '../../../common';
const { TabPane } = Tabs;

import Rolelist from "./rolelist";
import { hasPagePermmision } from "@/framework/router";

class Permission extends Component<any, any, any>{
    render() {
        return (
            <FourthMenuContainer contentFullHeight>
                {hasPagePermmision('4_role_list') && <TabPane tab="角色列表" key="rolelist">
                    <Rolelist />
                </TabPane>
                }
            </FourthMenuContainer>
        )
    }
}


export default Permission;