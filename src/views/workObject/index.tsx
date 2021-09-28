import React from 'react'
import Tabs from 'antd/es/tabs'
const { TabPane } = Tabs
import ThirdMenuContainer from '@/common/thirdMenuContainer'
import { hasPagePermmision } from '@/framework/router'
import WorkPath from './workPath'
import WorkArea from './workArea'
import CleanArea from './cleanArea'

const WorkObject = () => {
  return (
    <>
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_working_road') && (
          <TabPane tab="作业线路" key="workPath">
            <WorkPath />
          </TabPane>
        )}
        {hasPagePermmision('3_working_area') && (
          <TabPane tab="作业区域" key="workArea">
            <WorkArea />
          </TabPane>
        )}
        {hasPagePermmision('3_clearance_area') && (
          <TabPane tab="清运区域" key="cleanArea">
            <CleanArea />
          </TabPane>
        )}
      </ThirdMenuContainer>
    </>
  )
}

export default WorkObject
