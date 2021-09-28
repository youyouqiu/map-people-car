import Ajax from "@/framework/utils/ajax";
import { getStore } from "@/framework/utils/localStorage";

/**
 * 个人中心
 */
export const getUserMsg = <T>(data: any) => Ajax.safeGet<T>(`/api/user/user/${data ? data.userId : getStore('user_id')}`, null);//根据用户id查询用户信息

/**
 * 获取用户信息(无需权限)
 */
export const getUserInfo = <T>() => Ajax.safeGet<T>('/api/user/user/current/info', null);


/**
 * 用户权限下的角色
 * @param data :用户id，参数userId 
 */
export const getUserRole = <T>(data: any) => Ajax.safeGet<T>(`/api/user/user/${getStore('user_id')}/role`, data);

/**
 * 修改用户信息
 * @param data{
 *  user: 表单数据
 *  userId: 用户id
 * }
 */
export const updateUserMsg = (data: any) => Ajax.safePut<boolean>(`/api/user/user/personal/${getStore('user_id')}`, data);

/**
 * 用户权限下的角色
 * @param data{
 *  user: 表单数据
 *  userId: 用户id
 * }
 */
export const updatePsw = (data: any) => Ajax.post(`/api/user/user/password/${getStore('user_id')}`, data);

/**
 * 获取用户头像
 * @param data 
 */
export const getPhoto = (data: any) => Ajax.get(`/api/user/user/photo`, data);

/**
 * 上传用户头像
 * @param data 
 * file:图片文件
 */
export const postPhoto = (data: any) => Ajax.post(`/api/user/user/photo`, data);
