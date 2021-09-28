import Ajax from '@/framework/utils/ajax';

/**
 * 详情数据列表
 */
export const detailList = <T>(data: any) => Ajax.safePostPage<T>(`/api/sa/attendance/report/detail/page`, data);

/**
 * 人员月度考勤汇总报表查询
 */
export const peoplePage = <T>(data: any) => Ajax.safePostPage<T>(`/api/sa/attendance/report/people/stat/page`, data);

/**
 * 车辆月度考勤汇总报表查询
 */
export const vehiclePage = <T>(data: any) => Ajax.safePostPage<T>(`/api/sa/attendance/report/vehicle/stat/page`, data);






