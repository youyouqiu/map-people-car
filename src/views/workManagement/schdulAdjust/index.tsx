import React from 'react';
import FourthMenuContainer from '@/common/fourthMenuContainer';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import { hasPagePermmision } from '@/framework/router';
import SchedulCalendar from './schedulCalendar';

const SchedulAdjust = () => {
    return (
        <FourthMenuContainer contentFullHeight>
            {hasPagePermmision('4_scheduling_calendar') && (
                <TabPane tab="排班日历" key="schedulingCalendar">
                    <SchedulCalendar />
                </TabPane>
            )}
        </FourthMenuContainer>
    );
};

export default SchedulAdjust;
