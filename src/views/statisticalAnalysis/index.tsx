import React, { Component } from "react";

import Tabs from "antd/es/tabs";
const { TabPane } = Tabs;


import ThirdMenuContainer from "@/common/thirdMenuContainer";
import { hasPagePermmision } from "@/framework/router";
import StaffAttendance from './staffAttendance';
import VehicleAttendance from './vehicleAttendance'


/**
 * 统计分析
 */
class StatisticalAnalysis extends Component<any, any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_people_attendance_report') && <TabPane tab='人员考勤考核报表' key='staffAttendance'>
          <StaffAttendance />
        </TabPane>
        }

        {hasPagePermmision('3_vehicle_attendance_report') && <TabPane tab='车辆考勤考核报表' key='vehicleAttendance'>
          <VehicleAttendance />
        </TabPane>
        }

      </ThirdMenuContainer >
    )
  }
}

export default StatisticalAnalysis;