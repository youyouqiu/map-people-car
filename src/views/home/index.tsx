import React, { Component } from 'react';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
// import Workbench from './workbench';
import Personal from './personal';
import styles from './index.module.less';
import ThirdMenuContainer from '../../common/thirdMenuContainer';
import Copyright from './copyright';
import { hasPagePermmision } from '@/framework/router';

class Home extends Component<any, any, any> {

  render() {

    return (
      <div className={styles['home-wrap']}>
        <ThirdMenuContainer
          style={{
            flex: 1,
            background: '#F1F2F5',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
          containerStyle={{
            height: '100%'
          }}
          contentFullHeight
          tabBarStyle={{
            backgroundColor: 'white'
          }}
        >
          {
            hasPagePermmision("3_personal_center") && <TabPane
              tab="个人中心"
              key="personal"
            >
              <Personal />
            </TabPane>
          }
        </ThirdMenuContainer>
        {/* <Copyright /> */}
      </div>
    )
  }
}

export default Home;