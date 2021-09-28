import React from 'react';
import Tabs from 'antd/es/tabs';
const { TabPane } = Tabs;
import List from './list';
import FourthMenuContainer from '@/common/fourthMenuContainer';
import { hasPagePermmision } from '@/framework/router';

const Manage = () => {
  return (
    <>
      <FourthMenuContainer contentFullHeight>
        {hasPagePermmision('4_clearance_area_list') && (
          <TabPane tab="区域列表" key="clearanceAreaList">
            <List />
          </TabPane>
        )}
      </FourthMenuContainer>
    </>
  );
};

export default Manage;
