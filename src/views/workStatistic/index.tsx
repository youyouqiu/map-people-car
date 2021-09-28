import React, { Component } from "react";
import Tabs from "antd/es/tabs";
import ThirdMenuContainer from "@/common/thirdMenuContainer";
import { hasPagePermmision } from "@/framework/router";
import MachineStatistic from './machineStatistic';
import PeopleStatistic from './peopleStatistic'
const { TabPane } = Tabs;

class WorkStatistic extends Component<any, any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_machine_work_stat_report') && <TabPane tab='机器作业统计报表' key='machineStatistic'>
          <MachineStatistic />
        </TabPane>
        }
        {hasPagePermmision('3_manual_work_stat_report') && <TabPane tab='人工作业统计报表' key='peopleStatistic'>
          <PeopleStatistic />
        </TabPane>
        }
      </ThirdMenuContainer >
    )
  }
}

export default WorkStatistic;