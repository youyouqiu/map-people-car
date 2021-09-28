import React, { Component } from "react";
import styles from './index.module.less'
import Tabs from "antd/es/tabs";
const { TabPane } = Tabs;


import ThirdMenuContainer from "@/common/thirdMenuContainer";
import LeaderBorad from './leaderBorad'

import { hasPagePermmision } from "@/framework/router";

class BigdataBorad extends Component<any, any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={styles.fixColor}>
        <ThirdMenuContainer contentFullHeight>
          {hasPagePermmision('3_leadership_kanban') && <TabPane tab='领导看板' key='leaderBorad'>
            <LeaderBorad />
          </TabPane>
          }
        </ThirdMenuContainer>
      </div>
    )
  }
}

export default BigdataBorad;