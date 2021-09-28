import React, { Component } from "react";
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';

import Tabs from "antd/es/tabs";
const { TabPane } = Tabs;

import VehicleManager from "./vehicleManager";
import PeopleManager from "./peopleManager";
import FacilityManager from "./facilityManager";

import ThirdMenuContainer from "@/common/thirdMenuContainer";

import styles from './index.module.less';
import { hasPagePermmision } from "@/framework/router";

interface IProps {
  getBindData: Function,
  getGroupTreeData: Function;
  getProtocolTypeData: Function;
}

/**
 * 监控对象
 */
class MonitorManager extends Component<IProps, any, any> {
  constructor(props: IProps) {
    super(props);

    const { getProtocolTypeData } = this.props;
    getProtocolTypeData();// 获取通讯类型数据
  }

  render() {
    return (<ThirdMenuContainer contentFullHeight>
      {hasPagePermmision('3_vehicle_management') && <TabPane className={styles.managerPanel} tab={<FormattedMessage id="monitor_vehicleManager" />} key="vehicleManager">
        <VehicleManager />
      </TabPane>
      }
      {hasPagePermmision('3_people_management') && <TabPane className={styles.managerPanel} tab={<FormattedMessage id="monitor_peopleManager" />} key="peopleManager">
        <PeopleManager />
      </TabPane>
      }
      {hasPagePermmision('3_facility_management') && <TabPane className={styles.managerPanel} tab={<FormattedMessage id="monitor_facilityManager" />} key="facilityManager">
        <FacilityManager />
      </TabPane>
      }
    </ThirdMenuContainer>
    )
  }
}

export default connect(
  null,
  dispatch => ({
    getProtocolTypeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getProtocolTypeDataEvery', payload });
    },
  }),
)(injectIntl(MonitorManager as any));