import Ajax from "../framework/utils/ajax";

/**
 * 离线导出列表查询
 */
export const queryExportList = <T>(data: any) => Ajax.safeGetPage<T>(`/api/tool/exportManager/page`, data);

/**
 * 离线导出列表删除
 */
export const deleteExportListOne = <T>(data: any) => Ajax.safeDelete<T>(`/api/tool/exportManager/${data.id}`, null);

/**
 * 导出状态websocket监听
 */

export const listenerUrl = '/user/queue/user/offline/export/status';

export const sendUrl = '/app/user/offline/export/status';