import React from 'react';
import Tabs from 'antd/es/tabs';
const { TabPane } = Tabs;
import ThirdMenuContainer from '@/common/thirdMenuContainer';
import { hasPagePermmision } from '@/framework/router';
import WorkSetting from './workSet';
import WorkSchedul from './workSchedul';
import SchdulAdjust from './schdulAdjust';

const WorkObject = () => {
  return (
    <>
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_working_settings') && (
          <TabPane tab="作业设置" key="workSetting">
            <WorkSetting />
          </TabPane>
        )}
        {hasPagePermmision('3_work_scheduling') && (
          <TabPane tab="作业排班" key="workSchedul">
            <WorkSchedul />
          </TabPane>
        )}
        {hasPagePermmision('3_scheduling_adjustment') && (
          <TabPane tab="排班调整" key="schdulAdjust">
            <SchdulAdjust />
          </TabPane>
        )}
      </ThirdMenuContainer>
    </>
  );
};

export default WorkObject;
