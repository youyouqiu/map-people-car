/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * 树形结构封装
 */
import React from 'react';
import orgIcon from '@/static/image/orgIcon.svg';
import openOrgIcon from '@/static/image/openOrgIcon.svg';
import monitorIcon from '@/static/image/monitorIcon.svg';
import groupIcon from '@/static/image/group.svg';
import customer from '@/static/image/customer.svg';
import clearanceArea from '@/static/image/clearanceArea.svg'; // 清运区域
import maneuveringGroup from '@/static/image/maneuveringGroup.svg'; // 机动组
import unscheduled from '@/static/image/unscheduled.svg'; // 未排班
import workArea from '@/static/image/workArea.svg'; // 作业区域
import workRoute from '@/static/image/workRoute.svg'; // 作业线路
import styles from '@/framework/skin/tree.module.less';
import { RiseOutlined, IdcardOutlined, ShareAltOutlined, UsergroupDeleteOutlined, CarOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';

import { getStore } from '@/framework/utils/localStorage';
export interface INodeItem {
  id: string;
  key: string;
  name?: string;
  pId: string;
  title: string;
  type: string;
  value?: number;
  [key: string]: any;
}

/**
 * 组装树形结构
 * treeData:接口数据
 * refactoring:(分组下拉选树)需要特殊处理
 */
export const getTreeRoot = (newData: Array<INodeItem>, refactoring?: boolean, treeType?: string, data?: any) => {
  // 获取根节点
  const parentIds = [];
  const pIdArr: any = [];
  const ids: any = [];
  const userName = getStore('userName');

  newData.map((item: INodeItem) => {
    ids.push(item.id);
    if (refactoring) {
      pIdArr.push(item.pId);
    }
    return item;
  });
  const treeData = copyObject(newData);
  for (let i = treeData.length - 1; i >= 0; i -= 1) {
    const item = treeData[i];
    if (ids.indexOf(item.pId) === -1 && parentIds.indexOf(item.pId) === -1) {
      parentIds.push(item.pId);
    }

    // 分组下拉选树禁止勾选组织,并删除为子节点的组织
    if (refactoring && item.type === 'organization' && treeType != 'enterprise') {
      item.disableCheckbox = true;
      item.checkable = false;
      if (pIdArr.indexOf(item.id) === -1) {
        treeData.splice(i, 1);
      }
    }

    if (treeType === 'enterprise' && item.type === 'organization') {
      item.disabled = true;
    }

    if (userName != 'admin' && data) {
      if (item.name == 'admin' || item.id == data.owner || item.name === userName) {
        item.disabled = true;
      }

      if (data.enterpriseAdminId) {
        const enterpriseAdminId = data.enterpriseAdminId;
        const isHave = enterpriseAdminId.indexOf(item.id);
        if (isHave != '-1') {
          item.disabled = true;
        }
      }
    } else {
      if (item.name == 'admin') {
        item.disabled = true;
      }
    }
  }

  // 循环递归子节点
  return getTree(treeData, parentIds);
};

/**
 * 循环递归子节点
 * @param treeData
 * @param parentIds
 */
function getTree(treeData: Array<INodeItem>, parentIds: string[]) {
  const resultObj: any = {};
  for (let i = 0; i < treeData.length; i++) {
    const item = treeData[i];
    if (!item.icon) {
      item.icon = getIcon;
    }
    if (resultObj[item.pId]) {
      if (item.type === 'organization') {
        // 企业节点放到后面
        resultObj[item.pId].push(item);
      } else {
        resultObj[item.pId].unshift(item);
      }
    } else {
      resultObj[item.pId] = [item];
    }

    if (item.type === 'user') {
      item.title = item.title + `( ${item.monitorAliases != null ? item.monitorAliases : '-'} )`;
    }
    if (item.type === 'monitor') {
      item.isLeaf = true;
      item.key = `${item.id}_${item.pId}`;
    }
  }

  for (let i = 0; i < treeData.length; i += 1) {
    const item: any = treeData[i];
    const childrenArr = resultObj[item.id];
    if (item && childrenArr) {
      if (childrenArr[0].type === 'work') {
        item.children = sortWork(childrenArr);
      } else {
        item.children = childrenArr;
      }
    }
  }

  let treeArr: any[] = [];
  for (let i = 0; i < parentIds.length; i++) {
    const id = parentIds[i];
    treeArr = treeArr.concat(resultObj[id]);
  }

  // const treeArr = resultObj[parentId] ? resultObj[parentId] : [];
  return treeArr;
}

/**
 * 作业对象排序
 */
function sortWork(workData: Array<{ workType: number }>) {
  const sortObj: any = {};
  const newArr: any = [];
  workData.map((item) => {
    switch (item.workType) {
      case 0: // 机动组
        sortObj[0] = sortObj[0] ? sortObj[0] + 1 : 1;
        newArr.unshift(item);
        break;
      case 1: // 作业道路
        sortObj[1] = sortObj[1] ? sortObj[1] + 1 : 1;
        if (sortObj[0]) {
          newArr.splice(sortObj[0], 0, item);
        } else {
          newArr.unshift(item);
        }
        break;
      case 2: // 作业区域
        if (sortObj[0] && sortObj[1]) {
          newArr.splice(sortObj[0] + sortObj[1], 0, item);
        } else if (sortObj[0] || sortObj[1]) {
          newArr.splice(sortObj[0] || sortObj[1], 0, item);
        } else {
          newArr.unshift(item);
        }
        break;
      case 3: // 清运区域
        if (newArr.length > 0 && newArr[newArr.length - 1].workType === 4) {
          newArr.splice(-1, 0, item);
        } else {
          newArr.push(item);
        }
        break;
      case 4: // 未排班
        newArr.push(item);
        break;
    }
  });
  return newArr;
}

/**
 * 组织树图标
 * nodeProps：node节点数据
 */
export const getIcon = (nodeProps: any) => {
  const {
    expanded,
    data: { type, children, workType, monitorType },
  } = nodeProps;
  switch (type) {
    case 'organization': // 组织
      if (expanded && children) {
        return <img src={openOrgIcon} className={styles['org-icon']} />;
      }
      return <img src={orgIcon} className={styles['tree-icon']} />;
    case 'section': // 企业(标段)
    case 'enterprise':
      return <img src={groupIcon} className={styles['tree-icon']} />;
    case 'work': // 作业对象
      return getWorkIcon(workType);
    case 'monitor': // 监控对象
      if (monitorType === 0) {
        // 车
        return <CarOutlined className={styles['treeIcon']} />;
      } else if (monitorType === 1) {
        // 人
        return <UserOutlined className={styles['treeIcon']} />;
      } else {
        // 物
        return <DeleteOutlined className={styles['treeIcon']} />;
      }
    case 'user': // 用户
      return <img src={customer} className={styles['user-icon']} />;
    default:
      break;
  }
};

function getWorkIcon(type: number) {
  switch (type) {
    case 0: // 机动组
      return <img src={maneuveringGroup} className={styles.maxIcon} />;
    case 1: // 作业道路
      return <img src={workRoute} className={styles.treeIcon} />;
    case 2: // 作业区域
      return <img src={workArea} className={styles.treeIcon} />;
    case 3: // 清运区域
      return <img src={clearanceArea} className={styles.treeIcon} />;
    case 4: // 未排班
      return <img src={unscheduled} className={styles.treeIcon} />;
    default:
      return <img src={unscheduled} className={styles.treeIcon} />;
  }
}

/*
 * 深拷贝
 */

function copyObject(object: any): any {
  const copy = Object.create(Object.getPrototypeOf(object));
  copyOwnPropertiesFrom(copy, object);
  return copy;
}

function copyOwnPropertiesFrom(target: any, source: any): any {
  Object.getOwnPropertyNames(source).forEach(function (propKey) {
    const desc: any = Object.getOwnPropertyDescriptor(source, propKey);
    Object.defineProperty(target, propKey, desc);
  });
  return target;
}
