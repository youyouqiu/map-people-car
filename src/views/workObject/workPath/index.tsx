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
        {hasPagePermmision('4_road_list') && (
          <TabPane tab="道路列表" key="roadList">
            <List />
          </TabPane>
        )}
      </FourthMenuContainer>
    </>
  );
};

export default Manage;
