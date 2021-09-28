import React from 'react'
import Tabs from 'antd/es/tabs'
import Manage from './manage'
import Contract from './contract'

import ThirdMenuContainer from '@/common/thirdMenuContainer'
import { hasPagePermmision } from '@/framework/router'

const { TabPane } = Tabs

function EnterpriseAndContract() {
  return (
    <ThirdMenuContainer contentFullHeight>
      {hasPagePermmision('3_enterprise_management') && (
        <TabPane tab="企业管理" key="enterpriseManage">
          <Manage />
        </TabPane>
      )}
      {hasPagePermmision('3_contract_section') && (
        <TabPane tab="合同标段" key="contract">
          <Contract />
        </TabPane>
      )}
    </ThirdMenuContainer>
  )
}

export default EnterpriseAndContract
