import { Model } from "../framework/d.ts/model"
import { getStore } from "../framework/utils/localStorage";
import { rolePermission, roleUserTree } from '@/server/systemManagement';

export type StateType = {
    menuTreeData: object;
    userTreeData: Array<object>;
}

const PermissionManager: Model<StateType> = {
    namespace: 'permissionManager',
    defaultState: {
        menuTreeData: {},// 菜单权限树数据
        userTreeData: [],// 角色下用户树数据
    },
    reducers: {
        start: function (state: StateType) {
            return state;
        },
        default: (state: StateType) => {
            const token = getStore('token');
            if (token) {
                return Object.assign({}, state, { logined: true });
            }
            return state;
        },
        refreshData: function (state: StateType, action: any) {
            const { payload: { key, data } } = action;
            (state as any)[key] = data;
            return state;
        },
    },
    sagas: {
        // 获取菜单权限树数据
        *getMenuTreeDataLatest(saga: any, data: any) {
            const result: any = yield saga.call(rolePermission, data.payload);
            if (result) {
                yield saga.put({
                    type: 'permissionManager/refreshData',
                    payload: {
                        key: 'menuTreeData',
                        data: result
                    }
                })
            }
        },
        // 获取角色下用户树数据
        *getUserTreeDataLatest(saga: any, data: any) {
            const result: any = yield saga.call(roleUserTree, data.payload);
            if (result) {
                yield saga.put({
                    type: 'permissionManager/refreshData',
                    payload: {
                        key: 'userTreeData',
                        data: result
                    }
                })
            }
        },
    }
}




export default PermissionManager;