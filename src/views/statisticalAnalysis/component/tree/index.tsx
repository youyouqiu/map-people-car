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
  let id = '';
  let name = '';
  let defaultValueFlag = true;
  data.forEach(item => {
    map[item.id] = item;
    item.icon = getIcon
    item.disabled = item.type == 'organization'
    if (item.type == 'enterprise' && defaultValueFlag) {
      id = item.id;
      name = item.name;
      defaultValueFlag = false;
    }
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
  return { result, id, name };
}

interface Iprops {
  getOrgInfo: Function;
}

const TreeSelect_ = (props: Iprops) => {
  const [treeData, setTreeDate] = useState<any[]>([]);
  const [value, setValue] = useState<string>('');
  const { getOrgInfo } = props;
  useEffect(() => {
    (async () => {
      const rowTreeData: any = await enterpriseOrgTree<any[]>()
      if (rowTreeData) {
        const data = transformListToTree(rowTreeData);
        setTreeDate(data.result);
        setValue(data.id);
        getOrgInfo({ id: data.id, name: data.name })
      }
    })()
  }, [])

  const onChange = (value: any, label: any) => {
    getOrgInfo({
      id: value,
      name: label[0]
    });
    setValue(value)
  }

  return (
    <TreeSelect
      value={value}
      style={{ width: "260px" }}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto', whiteSpace: 'nowrap' }}
      treeData={treeData}
      placeholder="请选择企业"
      treeNodeFilterProp='title'
      treeDefaultExpandAll
      treeIcon
      showSearch
      allowClear
      virtual={false}
      onChange={onChange}
    />
  )
}
export default TreeSelect_