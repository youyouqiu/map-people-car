import React from "react";
import Tabs from "antd/es/tabs";
import EnterpriseMgm from "./enterpriseMgm";
import Permission from './permission';
import ThirdMenuContainer from "../../common/thirdMenuContainer";
import { hasPagePermmision } from "@/framework/router";

const { TabPane } = Tabs;

/**
 * 组织用户
 */
function EnterpriseUser() {
    return (
        <ThirdMenuContainer contentFullHeight>
            {hasPagePermmision('3_enterprise_user_management') && <TabPane
                tab="用户管理"
                key="enterpriseMgm"
            >
                <EnterpriseMgm />
            </TabPane>
            }
            {hasPagePermmision('3_enterprise_role_and_permission') && <TabPane
                tab="角色权限"
                key="permission"
            >
                <Permission />
            </TabPane>
            }
        </ThirdMenuContainer>
    )
}

export default EnterpriseUser;