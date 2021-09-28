/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { TreeSelect } from 'antd';
import { TreeSelectProps } from 'antd/lib/tree-select/index'
import { enterpriseOrgTree } from '@/server/enterpriseUser'

import orgIcon from '@/static/image/orgIcon.svg';
import orgIconOpen from '@/static/image/openOrgIcon.svg';
import groupIcon from '@/static/image/group.svg';

const imgStyle = { width: '14px', height: '14px', verticalAlign: 'middle' }
export const getIcon = (node: any) => {
  const { expanded, data: { type, children, workType, monitorType } } = node;
  switch (type) {
    case 'organization':
      if (expanded && children) {
        return <img src={orgIconOpen} style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />;
      }
      return <img src={orgIcon} style={imgStyle} />;
    case 'enterprise':
      return <img src={groupIcon} style={imgStyle} />;
    default:
      break;
  }
};

const transformListToTree = (data: any[], sortFn?: (a: string, b: string) => number) => {
  const result: any[] = []
  const map: any = {};
  data.forEach(item => {
    map[item.id] = item;
    item.icon = getIcon
    item.disabled = item.type == 'organization'
  });
  data.forEach(item => {
    const parent = map[item.pId];
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      result.push(item);
    }
  });
  const sortDeep = (arr: any[], sortFn: (a: string, b: string) => number) => {
    arr.sort(sortFn)
    arr.forEach((item) => {
      if (item.children) {
        sortDeep(item.children, sortFn)
      }
    })
  }
  if (sortFn) {
    sortDeep(result, sortFn)
  }
  return result;
}

const TreeSelect_: React.FC<TreeSelectProps<string> & {setSelectedTreeNodeKey: (key: string, name: string) => void}> = (props) => {
  const [defaultValue, setDefaultValue] = useState<string>('')
  const [treeData, setTreeDate] = useState<any[]>([])
  useEffect(() => {
    (async () => {
      const rowTreeData: any = await enterpriseOrgTree<any[]>()
      const transferedTreeData = transformListToTree(rowTreeData)
      setFirstEnterprise(transferedTreeData)
      rowTreeData && setTreeDate(transferedTreeData)
    })()
  }, [])
  // 获取第一个企业
  const setFirstEnterprise = (treeData: any[]) => {
    if (!treeData) return
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i].type == 'enterprise') {
        props.setSelectedTreeNodeKey(treeData[i].id, treeData[i].name)
        setDefaultValue(treeData[i].id)
        return;
      } else {
        setFirstEnterprise(treeData[i].children);
      }
    }
  };
  return (
    <TreeSelect
      key={defaultValue}
      defaultValue={defaultValue}
      style={{ width: '210px', overflow: 'auto' }}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto', whiteSpace: 'nowrap' }}
      treeData={treeData}
      placeholder="请选择企业"
      treeNodeFilterProp='title'
      treeDefaultExpandAll
      treeIcon
      showSearch
      allowClear
      virtual={false}
      {...props}
    />
  )
}
export default TreeSelect_