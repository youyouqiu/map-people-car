import React, { Component } from "react";

import Tabs from "antd/es/tabs";
const { TabPane } = Tabs;


import ThirdMenuContainer from "@/common/thirdMenuContainer";
import WorkMonitoring from "./workMonitoring";// 作业监控
import WorkPlayBack from "./workPlayBack";// 作业回放

import { hasPagePermmision } from "@/framework/router";

/**
 * 监控管理
 */
class MonitoringManager extends Component<any, any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_work_monitoring') && <TabPane tab='作业监控' key='workMonitoring'>
          <WorkMonitoring />
        </TabPane>
        }
        {hasPagePermmision('3_work_playback') && <TabPane tab='作业回放' key='workPlayback'>
          <WorkPlayBack />
        </TabPane>
        }
      </ThirdMenuContainer>
    )
  }
}

export default MonitoringManager;