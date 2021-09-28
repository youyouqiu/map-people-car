import React from 'react'
import Tabs from 'antd/es/tabs'
const { TabPane } = Tabs
import FourthMenuContainer from '@/common/fourthMenuContainer'
import { hasPagePermmision } from '@/framework/router'
import ContractList from './contractList'

const Contract = () => {
  return (
    <>
      <FourthMenuContainer contentFullHeight>
        {hasPagePermmision('4_contract_section_list') && (
          <TabPane tab="合同标段列表" key="monitoringGroupList">
            <ContractList />
          </TabPane>
        )}
      </FourthMenuContainer>
    </>
  )
}

export default Contract
