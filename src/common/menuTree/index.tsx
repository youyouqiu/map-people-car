/* eslint-disable @typescript-eslint/no-use-before-define */
// 菜单权限树
import React, { useEffect, useState } from 'react';
import { Tree } from 'antd';
import Loading from '@/common/loading'
import { rolePermission } from '@/server/systemManagement';

import styles from './index.module.less';
import { IAuthMenu } from '@/framework/router';

interface IProps {
  id?: string;
  treeNodeClick?: Function;
  treeEditStatus?: boolean;
  treeCheck?: Function;
  menuTreeData?: { menu: object[]; home: object; permission: object };
  owner?: string
}

interface INodeItem {
  id: string;
  key: string;
  name?: string;
  pId: string;
  title: string;
  type?: string;
  value?: number;
  children: INodeItem[];
}

export default function MenuTree(props: IProps) {
  // console.log(props);

  let icheckedKeys: any = [];
  const [treeData, setTreeData] = useState<Array<INodeItem> | undefined>([]);
  const [flatData, setFlatData] = useState<Array<INodeItem>>([]);
  // const [expandedKeys, setExpandedKeys] = useState<Array<string>>([]);
  const [checkedKeys, setCheckedKeys] = useState<Array<string>>([]);
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);

  useEffect(() => {
    icheckedKeys = [];
    setTreeData(undefined)
    setCheckedKeys([])
    // setExpandedKeys([])
    setSelectedKeys([])
    if (props.id) {
      getMenuTree()
    } else if (props.menuTreeData && props.menuTreeData.menu) {
      const { menu, permission } = props.menuTreeData;
      // console.log('props:', props.menuTreeData);

      renderTreeData(menu as any, permission);
    } else {
      setTreeData([])
    }
  }, [props.id, props.menuTreeData])
  function getMenuTree() {
    if (props.id) {
      const params = {
        roleId: props.id,
        owner: props.owner,
      }
      console.log(params);

      rolePermission(params).then((res: any) => {
        if (res) {
          console.log('res', res);

          const { menu: roleMenu, permission: rolePermmison } = res;
          const keys = getRoleCheckedKeys(roleMenu, rolePermmison);
          if (props.menuTreeData) {
            const { menu, permission } = props.menuTreeData;
            renderTreeData(menu as any, permission, keys);
          }

        }
      })
    }
  }

  /**
   * 获取这个角色勾选的key
   */
  function getRoleCheckedKeys(menuList: Array<IAuthMenu>, permissionList: any) {
    const keys: Array<any> = [];

    function getPermissionList(code: string, permissionList: any) {
      for (const key in permissionList) {
        if (key == code) {
          const action = permissionList[key];
          action.forEach((item: string[]) => {
            const key = code + '?' + item;
            keys.push(key)
          })
        }
      }
    }

    function getMenuList(menu: Array<any>) {
      if (!menu || !menu.length) return null;
      for (const item of menu) {
        const flag = item.children && item.children.length;
        if (item.code) {
          keys.push(item.code)
        };
        flag ? getMenuList(item.children) : getPermissionList(item.code, permissionList)
      }
    }
    menuList.forEach((item: any) => {
      if (item.code) {
        keys.push(item.code)
      };
      getMenuList(item.children)
    })
    return keys;
  }

  /**
   * 渲染树
   * @param menuList 菜单列表
   * @param permissionList 菜单下的按钮列表
   * @param keys 勾选的key，如果有则表示是修改，只勾选keys，没有则代表新增，全部勾选
   */
  function renderTreeData(menuList: Array<IAuthMenu>, permissionList: any, keys?: any) {
    const treeList: Array<INodeItem> = [];
    const flatList: Array<INodeItem> = [];
    function getMenuList(menu: Array<any>, id: string) {
      const tree: Array<INodeItem> = [];
      if (!menu || !menu.length) return tree;
      for (const item of menu) {
        const flag = item.children && item.children.length;
        if (item.code) {
          icheckedKeys.push(item.code)
        };
        tree.push({
          title: item.name,
          key: item.code,
          children: flag ? getMenuList(item.children, item.code) : dealPermissionData(item.code, permissionList),
          pId: id,
          id: item.code
        });
        flatList.push({
          title: item.name,
          key: item.code,
          children: [],
          pId: id,
          id: item.code
        })
      }
      return tree;
    }
    function dealPermissionData(code: string, permissionList: any) {
      const arr: Array<any> = [];
      for (const key in permissionList) {
        if (key == code) {
          const action = permissionList[key];
          action.forEach((item: string) => {
            const key = code + '?' + item;
            icheckedKeys.push(key)
            arr.push({
              title: item,
              key,
              id: key,
              pId: code,
              parentCode: code,
              children: []
            })
            flatList.push({
              title: item,
              key: key,
              children: [],
              pId: code,
              id: key
            })
          })
        }
      }
      return arr;
    }
    menuList.forEach((item: any) => {
      if (item.code) {
        icheckedKeys.push(item.code)
      };
      treeList.push({
        title: item.name,
        key: item.code,
        children: getMenuList(item.children, item.code),
        pId: '-1',
        id: item.code
      });
      flatList.push({
        title: item.name,
        key: item.code,
        children: [],
        pId: '-1',
        id: item.code
      })
    })

    if (treeList.length == menuList.length) {
      setTreeData(treeList);
      setFlatData(flatList);
      setCheckedKeys(keys ? keys : icheckedKeys)
      props.treeCheck && props.treeCheck(icheckedKeys)
    }
  }

  function onTreeCheck(param: any) {
    const keys: string[] = param.checked;
    const isAdd = keys.length - checkedKeys.length > 0;

    if (isAdd) {
      let newKey = undefined;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        let isNew = true;
        for (let j = 0; j < checkedKeys.length; j++) {
          const ck = checkedKeys[j];
          if (ck === k) {
            isNew = false;
            break;
          }
        }
        if (isNew) {
          newKey = k;
          break;
        }
      }

      if (newKey !== undefined) {
        let pId = newKey;
        while (pId !== '-1') {
          for (let i = 0; i < flatData.length; i++) {
            const item = flatData[i];
            if (item.id === pId) {
              pId = item.pId;
              if (keys.indexOf(item.pId) === -1 && item.pId !== '-1') {
                keys.push(item.pId);
              }
              break;
            }
          }
        }

      }
    } else {
      let removeKey = undefined;
      for (let i = 0; i < checkedKeys.length; i++) {
        const k = checkedKeys[i];
        let isRemove = true;
        for (let j = 0; j < keys.length; j++) {
          const ck = keys[j];
          if (ck === k) {
            isRemove = false;
            break;
          }
        }
        if (isRemove) {
          removeKey = k;
          break;
        }
      }

      const childKeys: string[] = [];
      if (removeKey !== undefined && treeData !== undefined) {
        getChildKeys(removeKey, treeData, childKeys);
        console.log(removeKey, childKeys)
        for (let i = 0; i < childKeys.length; i++) {
          const k = childKeys[i];
          const index = keys.indexOf(k);
          if (index > -1) {
            keys.splice(index, 1)
          }
        }
      }

    }
    setCheckedKeys(keys);
    props.treeCheck && props.treeCheck(keys)
  }
  // 点击树节点
  function onTreeSelect(selectedKeys: Array<string>, e: any) {
    const { treeNodeClick } = this.props;
    if (typeof treeNodeClick === 'function') {
      treeNodeClick(e.node, e);
    }
    setSelectedKeys(selectedKeys)
  }

  /**
   * 获取子节点code
   * @param id 树节点的key
   * @param source 树数据
   * @param resultArray 用来存储子节点code的数组
   */
  const getChildKeys = (id: string, source: INodeItem[], resultArray: string[]) => {
    if (!source) {
      return;
    }
    for (let i = 0; i < source.length; i++) {
      const node = source[i];
      if (node.id === id) {
        resultArray.push(node.id);
        node.children && pushChildKeys(node.children, resultArray)
      } else if (node.children) {
        getChildKeys(id, node.children, resultArray)
      }

    }
  }

  /**
   * 将子节点的code填充到结果数组中
   * @param source 树数据
   * @param resultArray 用来存储子节点code的数组
   */
  const pushChildKeys = (source: INodeItem[], resultArray: string[]) => {
    for (let i = 0; i < source.length; i++) {
      const node = source[i];
      resultArray.push(node.id);
      if (node.children) {
        pushChildKeys(node.children, resultArray)
      }
    }
  }

  return (
    <div className={styles['tree-container']}>
      {
        treeData ?
          <Tree
            checkable
            autoExpandParent
            defaultExpandParent
            defaultExpandAll
            showIcon={false}
            disabled={!props.treeEditStatus}
            treeData={treeData}
            checkStrictly
            key={treeData.length === 0 ? Math.random() : '1'}
            onCheck={onTreeCheck}
            onSelect={onTreeSelect}
            selectedKeys={selectedKeys}
            checkedKeys={checkedKeys}
          />
          : <Loading type="block" />
      }

    </div>
  )
}