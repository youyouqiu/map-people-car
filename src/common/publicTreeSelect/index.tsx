/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 组织树
 */
import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { getOrgTree, getGroupTree } from '@/server/monitorManager';
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
  multipleFlag?: boolean;
  /**
   * 所属企业禁用
   */
  isEdit?: boolean;
}

interface IState {
  treeData: Array<object>;
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
      treeData: []
    };
  }

  componentDidMount() {
    const { treeData } = this.props;

    // 如果已传入了组织树显示数据,不再执行接口请求
    if (!treeData) {
      this.setState({
        treeData: []
      });
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
    const { treeType } = this.props;
    // console.log('treeType', treeType);
    // console.log('param', param);

    let result: any = [];
    if (treeType === 'organization') {// 企业树
      result = await getOrgTree<Array<object>>(param);
    } else if (treeType === 'group') {// 分组树
      result = await getGroupTree<Array<object>>({ queryParam: param, queryType: 2, userId: '' });
    } else {
      result = await enterpriseOrgTree<Array<object>>(param);
    }
    this.renderTreeData(result || []);
  }

  /**
  * 重构组织树数据(只需重构分组树,组织树不用)
  */
  renderTreeData = (dataArr: Array<INodeItem>) => {
    const { treeType } = this.props;
    const data = JSON.parse(JSON.stringify(dataArr));
    const treeData = getTreeRoot(data, treeType !== 'organization', treeType);

    this.setState({
      treeData: treeData
    })
  }

  render() {
    const { treeType, value, multipleFlag, isEdit, ...otherProps } = this.props;
    const { treeData } = this.state;

    return (
      <TreeSelect
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
        treeNodeFilterProp='title'
        virtual={false}
        dropdownStyle={{ whiteSpace: 'nowrap' }}
        {...otherProps}
        value={treeData.length > 0 ? value : undefined}
        treeData={treeData}
      />
    )
  }
}

export default PublicTreeSelect;