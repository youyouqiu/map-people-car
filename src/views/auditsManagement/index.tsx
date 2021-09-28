import React from 'react'
import Tabs from 'antd/es/tabs'
const { TabPane } = Tabs
import ThirdMenuContainer from '@/common/thirdMenuContainer'
import { hasPagePermmision } from '@/framework/router'
import WorkReview from './workReview/index'

const WorkObject = () => {
  return (
    <>
      <ThirdMenuContainer contentFullHeight>
        {hasPagePermmision('3_work_review') && (
          <TabPane tab="作业审核" key="workReview">
            <WorkReview />
          </TabPane>
        )}
      </ThirdMenuContainer>
    </>
  )
}

export default WorkObject
