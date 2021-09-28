import Ajax from "../framework/utils/ajax";

export const query = <T>(data: any) => Ajax.safeGet<T>('/api/tool/china/area/dropDown', data)
export const queryArea = <T>(data: any) => Ajax.safeGet<T>('/api/tool/china/area', data)