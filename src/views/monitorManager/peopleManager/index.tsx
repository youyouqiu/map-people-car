import React, { Component } from "react";
import { injectIntl, FormattedMessage } from 'react-intl';
import Tabs from "antd/es/tabs";
const { TabPane } = Tabs;
import FourthMenuContainer from "@/common/fourthMenuContainer";

import Content from "./content";

import styles from '../index.module.less';
import { hasPagePermmision } from "@/framework/router";

class VehicleManager extends Component<any, any, any>{
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <FourthMenuContainer contentFullHeight>
                {hasPagePermmision('4_people_list') && <TabPane className={styles.vehiclePanel} tab={<FormattedMessage id="monitor_peopleList" />} key="peopleList">
                    <Content />
                </TabPane>
                }
            </FourthMenuContainer >
        )
    }
}


export default injectIntl(VehicleManager as any);