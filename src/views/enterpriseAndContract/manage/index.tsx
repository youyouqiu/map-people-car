import React from 'react';
import Tabs from 'antd/es/tabs';
const { TabPane } = Tabs;
import EnterpriseList from './enterpriseList';
import FourthMenuContainer from '@/common/fourthMenuContainer';
import { hasPagePermmision } from '@/framework/router';

const Manage = () => {
    return (
        <>
            <FourthMenuContainer contentFullHeight>
                {hasPagePermmision('4_enterprise_list') && (
                    <TabPane tab="企业列表" key="monitoringGroupList">
                        <EnterpriseList />
                    </TabPane>
                )}
            </FourthMenuContainer>
        </>
    );
};

export default Manage;
