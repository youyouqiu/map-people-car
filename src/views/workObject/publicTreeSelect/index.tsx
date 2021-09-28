/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 组织树
 */
import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { getGroupTree } from '@/server/monitorManager';
import { getOrgTree22 } from '@/server/enterpriseAndContract';
import { enterpriseOrgTree } from '@/server/enterpriseUser';
import { getTreeRoot } from '@/framework/utils/tree';
import { TreeSelectProps } from 'antd/lib/tree-select';
interface IProp extends TreeSelectProps<string> {
  /**
   * organization:企业树,group为组织树,enterprise:组织企业
   */
  treeType?: 'organization' | 'group' | 'enterprise';
  /**
   * TreeSelect是否多选
   */
  multipleFlag?: true | false;
  /**
   * 所属企业禁用
   */
  isEdit?: true | false;
  treeInit?: Function;
  orgId?: string;
  onSelect: (value: any) => void
}

interface IState {
  treeData: Array<object>;
  value: string;
}

interface INodeItem {
  id: string;
  key: string;
  name: string;
  pId: number;
  title: string;
  type: string;
  value: number;
}

class PublicTreeSelect extends Component<IProp, IState, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      treeData: [],
      value: ''
    };
  }

  componentDidMount() {
    const { treeData } = this.props;

    // 如果已传入了组织树显示数据,不再执行接口请求
    if (!treeData) {
      this.getTreeData();
    } else {
      this.renderTreeData(treeData as any);
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps: any) {
    const { treeData: newData } = nextProps;
    const { treeData } = this.state;
    if (treeData.length === 0 && newData) {
      this.renderTreeData(newData);
    }
  }

  /**
   * 获取分组组织树数据
   * @param param
   */
  getTreeData = async (param?: string) => {
    const { treeType, treeInit } = this.props;
    let result: any = [];
    if (treeType === 'organization') {
      // 企业树
      result = await getOrgTree22<Array<object>>(param);
      if (treeInit && result) {
        treeInit(result);
      }
    } else if (treeType === 'group') {
      // 分组树
      result = await getGroupTree<Array<object>>({ queryParam: param, queryType: 2, userId: '' });
    } else {
      result = await enterpriseOrgTree<Array<object>>(param);
    }
    this.renderTreeData(result || []);
  };

  /**
   * 重构组织树数据(只需重构分组树,组织树不用)
   */
  renderTreeData = (dataArr: Array<INodeItem>) => {
    const { treeType, orgId, onSelect } = this.props;
    const data = JSON.parse(JSON.stringify(dataArr));
    const treeData = getTreeRoot(data, treeType !== 'organization', treeType);
    this.setState({
      treeData: treeData,
    });
    if(orgId){
      this.setState({
        value: orgId
      })
      onSelect(orgId)
    }else{  // 选中第一个
      this.setState({
        value: treeData[0].id
      })
      onSelect(treeData[0].id)
    }
  };

  render() {
    const { treeType, value, multipleFlag, isEdit, onSelect, ...otherProps } = this.props;
    const { treeData } = this.state;

    return (
      <TreeSelect
        value={this.state.value}
        onSelect={(value) => {onSelect(value),this.setState({value})}}
        disabled={isEdit}
        bordered={false}
        multiple={multipleFlag}
        labelInValue
        treeDefaultExpandAll
        allowClear
        showArrow
        treeIcon
        showSearch
        treeDataSimpleMode={treeType === 'organization'}
        treeNodeFilterProp="title"
        virtual={false}
        dropdownStyle={{ whiteSpace: 'nowrap' }}
        {...otherProps}
        // value={treeData.length > 0 ? value : undefined}
        treeData={treeData}
      />
    );
  }
}

export default PublicTreeSelect;
