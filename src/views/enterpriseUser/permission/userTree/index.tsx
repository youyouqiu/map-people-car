// 权限用户树
import React, { useEffect, useState, useRef } from 'react';
import { Tree, Form, Input, Select } from 'antd';
const { Option } = Select;
import { userEnterpriseTree, roleUserTree } from '@/server/enterpriseUser';
import Loading from '@/common/loading'
import { injectIntl } from 'react-intl';
import styles from './index.module.less';
// import { getIcon } from '@/framework/utils/tree';
// import { getStore } from '@/framework/utils/localStorage';
import { getTreeRoot } from '@/framework/utils/tree';
import { loopTreeChecked } from '@/framework/utils/treeOnChecked';

let searchTimer: any = null;

interface IProps {
  treeNodeClick?: Function;
  treeQueryStatus?: boolean;
  treeEditStatus?: boolean;
  treeCheck?: Function;
  intl: any;
  /**
   * 角色ID
   */
  roleId: string;
  onGetUserCount?: Function;
  /**
   * 企业树
   */
  treeType?: string;
  /**
   * 复选框禁用
   */
  treeBanCheck?: true | undefined
  /**
   * 当前角色信息
   */
  item?: object
}


interface INodeItem {
  id: string;
  key: string;
  name: string;
  pId: string;
  title: string;
  type: string;
  value: number;
  icon?: Function;
  disabled?: boolean;
  children?: INodeItem[];
}

function UserTree(props: IProps) {

  // const userName = getStore("userName");
  const searchForm: any = useRef()
  const icheckedRoleKeys: any = []; // 默认勾选的id
  const [queryType, setQueryType] = useState<number>(0);
  const [serarchTreeInput, setSerarchTreeInput] = useState<number | string>('');
  const [treeData, setTreeData] = useState<Array<INodeItem>>([]);
  const [checkedKeys, setCheckedKeys] = useState<Array<string>>([]);
  // 存放只有用户的key，用来过滤回传给服务器的数据
  // const [userKeys, setUserKeys] = useState<Array<string>>([]);
  const [loopObj, setLoopObj] = useState<Function | undefined>(undefined);

  async function getRoleUserTree(param?: string) {
    const { roleId, onGetUserCount, treeEditStatus, treeType } = props;

    let count = 0;
    const roleData = await roleUserTree<Array<INodeItem>>({ roleId, keyword: param, queryType: 0 });
    if (roleData !== undefined) {
      const checkedKeys: string[] = [];
      for (let i = 0; i < roleData.length; i += 1) {
        const item = roleData[i];
        // if(item.id) icheckedRoleKeys.push(item.id);
        if (item.id && item.type === 'user') {
          icheckedRoleKeys.push(item.id);
          checkedKeys.push(item.id);
          count++;
        };
      }
      if (param === undefined && queryType === 0 && typeof onGetUserCount === 'function') {
        onGetUserCount(count);
      }
      setCheckedKeys(checkedKeys);
      // 获取初始勾选的值
      const loopObj = loopTreeChecked(checkedKeys, 'user');
      setLoopObj(() => loopObj);
      if (!treeEditStatus) {
        const treeData = getTreeRoot(roleData);
        setTreeData(treeData)
      }
    }
  }
  async function getUserTree(param?: string) {
    const { treeEditStatus, roleId } = props;


    let userData = undefined;
    if (treeEditStatus) {
      userData = await userEnterpriseTree<Array<INodeItem>>({ keyword: param, queryType, roleId });
      if (userData !== undefined) {
        const treeData = getTreeRoot(userData, undefined, '', props.item);
        setTreeData(treeData)
      }
    }
  }
  function bindTypeChange(value: number) {
    setQueryType(value);
    setSerarchTreeInput("");
    getUserTree();
  }
  /**
   * 组织树模糊搜索
   */
  function serarchTree(e: { target: { value: string } }) {
    if (searchTimer) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }
    const { value } = e.target;
    setSerarchTreeInput(value);
    searchTimer = setTimeout(() => {
      getUserTree(value);
    }, 500);
  }

  function onTreeCheck(checkedKeys: string[], e: any) {

    const {
      node,
    } = e;
    // 循环递归勾选节点
    if (typeof loopObj == 'function') {
      const result = loopObj(node);
      setCheckedKeys([...result.treeChecked]);

      if (typeof props.treeCheck == 'function') {
        const checkUserId = [...result.checkTypeIds];
        props.treeCheck(checkUserId);
      }
    }
  }

  useEffect(() => {
    setQueryType(() => 0)
    setTreeData(() => [])
    setCheckedKeys(() => [])
    if (props.treeEditStatus) getUserTree();
    getRoleUserTree();
  }, [props.roleId, props.treeEditStatus]);

  return (
    <div className={styles['tree-wrapper']} id="selectContainer" style={{ position: 'relative' }}>
      {
        props.treeQueryStatus ?
          <div className={styles['tree-search']} style={{ marginBottom: 6 }}>
            <Form ref={searchForm}>
              <Input.Group compact>
                <Select value={queryType} style={{ width: '30%' }} onChange={bindTypeChange}>
                  <Option value={0}>用户名</Option>
                  <Option value={1}>真实姓名</Option>
                </Select>
                <Input value={serarchTreeInput} style={{ width: '70%' }} allowClear placeholder={'请输入关键字'} onChange={serarchTree} />
              </Input.Group>
            </Form>
          </div>
          : null
      }
      <div className={styles['tree-container']}>
        {
          !treeData ? <Loading />
            : <Tree
              checkable
              autoExpandParent
              defaultExpandParent
              defaultExpandAll
              showIcon
              disabled={props.treeBanCheck}
              treeData={treeData as any}
              key={treeData.length === 0 ? Math.random() : '1'}
              onCheck={onTreeCheck}
              checkedKeys={checkedKeys}
            />
        }

      </div>
    </div>
  )
}
export default injectIntl(UserTree)