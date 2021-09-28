import React from "react";
import Tabs from "antd/es/tabs";

import ThirdMenuContainer from "@/common/thirdMenuContainer";
import FourthMenuContainer from "@/common/fourthMenuContainer";
import List from "./list";
import { hasPagePermmision } from "@/framework/router";
import styles from './index.module.less';
const { TabPane } = Tabs;

/**
 * 日志管理
 */
export default () => {
  return (
    <>
      <FourthMenuContainer contentFullHeight>
        {hasPagePermmision('4_system_operation_log_list') && (
          <TabPane tab="日志列表" key="systemOperationLogList">
            <div className={styles['log']} >
              <List />
            </div>
          </TabPane>
        )}
      </FourthMenuContainer>
    </>
  )
};
