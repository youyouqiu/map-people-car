import Ajax from '@/framework/utils/ajax';


// 日志-/logger/page/logs
export const postDictLogPage = <T>(data: any) => Ajax.safePostPage<T>('/api/tool/logger/page/logs', data);
