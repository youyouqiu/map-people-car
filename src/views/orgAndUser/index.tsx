import React from "react";
import Tabs from "antd/es/tabs";
import OrgMgm from "./orgMgm";
import UserMgm from "./userMgm";
import Permission from "./permission";

import ThirdMenuContainer from "../../common/thirdMenuContainer";
import { hasPagePermmision } from "@/framework/router";

const { TabPane } = Tabs;

/**
 * 组织用户
 */
function OrgAndUser() {
    return (
        <ThirdMenuContainer contentFullHeight>
            {hasPagePermmision('3_organization_management') && <TabPane
                tab="组织管理"
                key="orgMgm"
            >
                <OrgMgm />
            </TabPane>
            }
            {hasPagePermmision('3_user_management') && <TabPane tab="用户管理" key="userMgm">
                <UserMgm />
            </TabPane>
            }
            {hasPagePermmision('3_role_and_permission') && <TabPane tab="角色权限" key="permission">
                <Permission />
            </TabPane>
            }
        </ThirdMenuContainer>
    )
}

export default OrgAndUser;