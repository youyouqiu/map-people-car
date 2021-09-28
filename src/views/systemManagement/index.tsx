import React from 'react'
import Tabs from 'antd/es/tabs'
const { TabPane } = Tabs
import ThirdMenuContainer from '@/common/thirdMenuContainer'
import { hasPagePermmision } from '@/framework/router'
import SysOperationLog from './sysOperationLog'
import DataDictionary from './dataDictionary';
import PersonalizedConfig from './personalizedConfig';
import {
  useParams, useHistory
} from "react-router-dom";
// useHistory
const SystemManagement = () => {
  const { location, push } = useHistory();
  // console.log('h', h);
  return (
    <>
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_data_dictionary') && (
          <TabPane tab="数据字典" key="dataDictionary">
            <DataDictionary parentRouter={{ location, push }} />
          </TabPane>
        )}
        {/* {hasPagePermmision('3_working_area') && (
          <TabPane tab="消息管理" key="workArea">
            <WorkArea />
          </TabPane>
        )} */}
        {hasPagePermmision('3_system_operation_log') && (
          <TabPane tab="操作日志" key="sysOperationLog">
            <SysOperationLog />
          </TabPane>
        )}

        {hasPagePermmision('4_personalization') && (
          <TabPane tab="个性化设置" key="personalizedConfig">
            <PersonalizedConfig />
          </TabPane>
        )}
      </ThirdMenuContainer>
    </>
  )
}

export default SystemManagement
