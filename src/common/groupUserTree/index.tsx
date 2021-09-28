/**
 * 分组权限下的监控人员树
 */
import React, {  ReactElement, useState, useEffect } from 'react';
import styles from './index.module.less';
import { Input, Tree, Select, Spin } from 'antd';
import { getGroupUsers, getCurGroupUsers } from '@/server/orgMgm';
import { getTreeRoot } from '@/framework/utils/tree';
import { loopTreeChecked } from '@/framework/utils/treeOnChecked';
const { Option } = Select;

interface IProps {
    isShowQuery?: boolean;//是否显示搜索框
    groupId: string;//分组id
    onCheck?: Function;//勾选回调
    checked?: Array<string>;//初始勾选节点(不传默认勾选当前分组下的监控人员)
}

export default function GroupUserTree(props: IProps): ReactElement {
    const { isShowQuery = true, groupId, onCheck, checked } = props;

    const [loading, setLoading] = useState<boolean>(true);//加载框
    const [checkedKeys, setCheckedKeys] = useState<Array<string>>([]);//树勾选节点
    const [treeData, setTreeData] = useState<Array<any>>([]);//树节点模糊搜索数据
    const [searchTimer, setSearchTimer] = useState<null | NodeJS.Timeout>(null);//搜索timer
    const [keyword, setKeyword] = useState<string | undefined>(undefined);//搜素框
    const [queryType, setQueryType] = useState<string>('0');//搜索类型
    const [loopObj, setLoopObj] = useState<Function | undefined>(undefined);

    // 获取分组权限下的用户树
    async function getGroupUserDatas() {
        const params = {
            groupId: groupId,
            body: {
                queryType: queryType,
                keyword: keyword
            }
        }
        const datas = await getGroupUsers<Array<any>>(params);
        if (datas) {
            const treeData = getTreeRoot(datas);
            setTreeData(treeData);
            setLoading(false);
        }
    }

    // 初始勾选的分组监控人员
    async function getCurGroupUsersDatas() {
        const params = {
            groupId: groupId,
        }
        const datas = await getCurGroupUsers<Array<any>>(params);
        if (datas) {
            setCheckedKeys(datas);
            // 获取初始勾选的值
            const loopObj = loopTreeChecked(datas, 'user');
            setLoopObj(() => loopObj);
        }
    }

    // 监听groupId
    useEffect(() => {
        getGroupUserDatas().then(() => {
            // 如果父组件有checked属性就直接设置勾选，否则请求后台接口
            if (checked && checked.length > 0) {
                setCheckedKeys(checked);
                // 获取初始勾选的值，和需要传给后台的id的类型
                const loopObj = loopTreeChecked(checked, 'user');
                setLoopObj(() => loopObj);
            } else if (checked == undefined) {
                getCurGroupUsersDatas();
            }
        });
    }, [groupId]);

    // 模糊搜索
    useEffect(() => {
        getGroupUserDatas();
    }, [keyword, queryType])

    

    // 组织树勾选
    function onTreeCheck(checkedKey: Array<string>, e: any) {
        const {
            node,
        } = e;

        // 循环递归勾选节点
        if (typeof loopObj == 'function') {
            const result = loopObj(node);
            setCheckedKeys([...result.treeChecked]);

            if (typeof onCheck == 'function') {
                const checkUserId = [...result.checkTypeIds];
                onCheck(checkUserId);
            }
        }
    }

    // 搜索框切换
    function handleChange(value: string) {
        setLoading(true);
        setQueryType(value);
    }

    // 搜索框输入
    function keywordsChange(e: any) {
        const value = e.target.value;
        if (searchTimer) {
            clearTimeout(searchTimer);
            setSearchTimer(null);
        }

        const timer = setTimeout(() => {
            setLoading(true);
            setKeyword(value);
        }, 500);

        setSearchTimer(timer);
    }

    return (
        <div
            className={styles['search-monitor-tree']}
        >
            {/* 搜索框 */}
            {
                isShowQuery && (
                    <div className={styles['search-input']}>
                        <Select
                            defaultValue="0"
                            style={{ width: 120 }}
                            className={styles['select']}
                            onChange={handleChange}
                        >
                            <Option value='0'>用户名</Option>
                            <Option value='1'>组织</Option>
                        </Select>
                        <Input
                            type="text"
                            placeholder="请输入关键字"
                            onChange={keywordsChange}
                        />
                    </div>
                )
            }

            {/* 组织树 */}
            <div
                className={styles['tree-box']}
            >
                <Tree
                    checkable
                    autoExpandParent={true}
                    onCheck={onTreeCheck}
                    checkedKeys={checkedKeys}
                    treeData={treeData}
                    key={treeData.length === 0 ? Math.random() : '1'}
                    defaultExpandAll
                    showIcon
                />

                {/* 加载框 */}
                {
                    loading && (
                        <Spin
                            spinning
                            className={styles['loading']}
                        />
                    )
                }
            </div>
        </div>
    );
};