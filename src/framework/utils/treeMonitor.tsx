/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * 树形结构封装
 * 注意:这里设置了 item.type == 'monitor' 的 item.isLeaf = true,
 * 如果不需要设置这个属性，请引入tree.tsx,否则会出现没有子节点的组织或者分组前面出现箭头图标
 */
import React from 'react';
import orgIcon from '@/static/image/orgIcon.svg';
import openOrgIcon from '@/static/image/openOrgIcon.svg';
import monitorIcon from '@/static/image/monitorIcon.svg';
import groupIcon from '@/static/image/group.svg';
import customer from '@/static/image/customer.svg';
import styles from '@/framework/skin/tree.module.less'

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
 */
export const getTreeRoot = (treeData: Array<INodeItem>) => {
    // 获取根节点
    let parentId = '-1';
    const ids = treeData.map((item: INodeItem) => item.id);
    for (let i = 0; i < treeData.length; i++) {
        const item = treeData[i];
        if (item.pId == '-1' || ids.indexOf(item.pId) == -1) {
            parentId = item.pId;
            break;
        }
    }
    // 循环递归子节点
    return getTree(treeData, parentId);
}
/**
 * 循环递归子节点
 * @param newData
 * @param parentId 
 */
function getTree(treeData: Array<INodeItem>, parentId: string) {
    const resultObj: any = {};
    const newData = JSON.parse(JSON.stringify(treeData));
    for (let i = 0; i < newData.length; i++) {
        const item = newData[i];
        if (resultObj[item.pId]) {
            if (item.type === 'organization') {// 企业节点放到后面
                resultObj[item.pId].push(item);
            } else {
                resultObj[item.pId].unshift(item);
            }
        } else {
            resultObj[item.pId] = [item];
        }
    }

    for (let i = 0; i < newData.length; i += 1) {
        const item: any = newData[i];
        if (item.type == 'monitor') {//防止不同分组下相同的监控对象出现相同的组织树key
            item.key = `${item.pId}-${item.id}`;
        }
        item.icon = getIcon;
        item.isLeaf = item.type == 'monitor';
        item.disableCheckbox = item.type == 'organization';

        if (item && resultObj[item.id]) {
            item.children = resultObj[item.id];
        }
    }

    const treeArr = resultObj[parentId] ? resultObj[parentId] : [];
    return treeArr;
}

/**
 * 组织树图标
 * nodeProps：node节点数据
 */
export const getIcon = (nodeProps: any) => {
    const { expanded, data: { type, children } } = nodeProps;
    switch (type) {
        case "organization"://组织
            if (expanded && children) {
                return <img src={openOrgIcon} className={styles['org-icon']} />;
            }
            return <img src={orgIcon} className={styles['tree-icon']} />;
        case 'group'://分组
            return <img src={groupIcon} className={styles['tree-icon']} />;
        case 'monitor'://监控对象
            return <img src={monitorIcon} className={styles['tree-icon']} />;
        case 'user'://用户
            return <img src={customer} className={styles['user-icon']} />;
        case 'customer'://客户
            return <img src={customer} className={styles['user-icon']} />;
        default:
            break;
    }
}