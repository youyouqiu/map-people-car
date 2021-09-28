/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * 适用于
 * 组织树完全受控勾选
 * 模糊搜索保留搜索前勾选的key
 * 不保存父节点，勾选子节点联动父节点实现父节点勾选
 * 
 * exitCheck：初始需要勾选的节点
 * type: 需要存储的节点类型(例如：存储勾选的type='user'的id)
 */

export function loopTreeChecked(exitCheck: string[] | undefined, type: string) {
    const filterType: string = type;//类型
    let treeChecked: string[] = exitCheck ? [...exitCheck] : [];//组织树勾选key集合
    let checkTypeIds: string[] = exitCheck ? [...exitCheck] : [];//勾选的特定类型的id集合
    let checked = false;

    /**
     * 循环递归勾选节点
     * @param nodes :勾选的节点
     */
    function loopCheckedKeys(nodes: any) {
        // 循环递归勾选节点
        setCheckKeys(nodes);
        if (nodes.children) {
            loopChildren(nodes.children);
        }
    }
    function loopChildren(children: any[]) {
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            if (item.children) {
                loopChildren(item.children);
            } else {
                setCheckKeys(item);
            }
        }
    }
    function setCheckKeys(node: any) {
        if (checked) {//取消勾选
            treeChecked = treeChecked.filter((id: string) => (id != node.id && id != node.pId));

            if (node.type == filterType) {
                checkTypeIds = checkTypeIds.filter((id: string) => (id != node.id && id != node.pId));
            }
        } else {//勾选
            if (
                treeChecked.indexOf(node.id) == -1
                && node.type == filterType//不保存父节点组织id,防止模糊搜索的时候勾选了组织，取消模糊搜索的时候导致组织下的所有子节点都被勾选了
            ) {
                treeChecked.push(node.id);
            }

            if (node.type == filterType && checkTypeIds.indexOf(node.id) == -1) {
                checkTypeIds.push(node.id);
            }
        }
    }

    return function (nodes: any) {
        if (nodes) {
            checked = nodes.checked;
            loopCheckedKeys(nodes);
        }

        return {
            treeChecked: treeChecked,//组织树勾选key集合
            checkTypeIds: checkTypeIds//勾选的特定类型的id集合
        }
    }
}