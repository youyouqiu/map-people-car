import React from 'react'
import FourthMenuContainer from '@/common/fourthMenuContainer'
import { Tabs } from 'antd'
const { TabPane } = Tabs
import { hasPagePermmision } from '@/framework/router'
import WorkShift from './workShift'

const WorkSet = () => {
  return (
    <FourthMenuContainer contentFullHeight>
      {hasPagePermmision('4_work_shift') && (
        <TabPane tab="作业班次" key="workShift">
          <WorkShift />
        </TabPane>
      )}
    </FourthMenuContainer>
  )
}

export default WorkSet
