
import Ajax from '@/framework/utils/ajax';





// 车辆类别-通用下拉列表
export const getDictCarCategoryDropdown = <T>(data: any) => Ajax.safeGet<T>('/api/mb/dict/VEHICLE_CATEGORY/dropdown', data);
// 行业类别-通用下拉列表 
export const getDictIndustryDropdown = <T>(data: any) => Ajax.safeGet<T>('/api/mb/dict/INDUSTRY_CATEGORY/dropdown', data);


// 车辆类型-分页
export const postDictCarTypePage = <T>(data: any) => Ajax.safePostPage<T>('/api/mb/dict/VEHICLE_TYPE/page', data);
// 车辆类型-新增
export const postDictCarTypeAdd = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/dict/VEHICLE_TYPE', data);
// 车辆类型-更新 
export const postDictCarTypeUpdate = <T>(data: any) => Ajax.safePut<T>(`/api/mb/dict/VEHICLE_TYPE/${data.id}`, data);
// 车辆类型-详情 
export const getDictCarTypeInfo = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/VEHICLE_TYPE/${data.id}`, null);
// 车辆类型-冻结 
export const postDictCarTypeDisableId = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/VEHICLE_TYPE/${data.id}/${data.name}/disable`, null);
// 车辆类型-取消冻结 
export const postDictCarTypeEnableId = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/VEHICLE_TYPE/${data.id}/${data.name}/enable`, null);
// 车辆类型-批量冻结
export const postDictCarTypeDisable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/VEHICLE_TYPE/batchDisable`, data);
// 车辆类型-批量取消冻结
export const postDictCarTypeEnable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/VEHICLE_TYPE/enable`, data);
// 车辆类型-删除
export const postDictCarTypeDelete = <T>(data: any) => Ajax.safeDelete<T>(`/api/mb/dict/VEHICLE_TYPE/delete/${data.id}/${data.name}`, null);
// 车辆类型-通用下拉列表
export const postDictCarTypeDropdown = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/VEHICLE_TYPE/dropdown`, null);



// 岗位类型-新增
export const postDictJobsTypeAdd = <T>(data: any) => Ajax.safeRepeatPost<T>(`/api/mb/dict/POSITION_TYPE`, data);
// 岗位类型-更新
export const postDictJobsTypeUpdate = <T>(data: any) => Ajax.safePut<T>(`/api/mb/dict/POSITION_TYPE/${data.id}`, data);
// 岗位类型-冻结
export const postDictJobsTypeDisableId = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/POSITION_TYPE/${data.id}/${data.name}/disable`, null);
// 岗位类型-取消冻结
export const postDictJobsTypeEnableId = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/POSITION_TYPE/${data.id}/${data.name}/enable`, null);
// 岗位类型-批量冻结
export const postDictJobsTypeDisable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/POSITION_TYPE/batchDisable`, data);
// 岗位类型-批量取消冻结
export const postDictJobsTypeEnable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/POSITION_TYPE/enable`, data);
// 岗位类型-通用下拉
export const getDictJobsTypeDropdown = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/POSITION_TYPE/dropdown`, null);
// 岗位类型-分页列表 
export const postDictJobsTypePage = <T>(data: any) => Ajax.safePostPage<T>(`/api/mb/dict/POSITION_TYPE/page`, data);
// 岗位类型-删除
export const postDictJobsTypeDelete = <T>(data: any) => Ajax.safeDelete<T>(`/api/mb/dict/POSITION_TYPE/delete/${data.id}/${data.name}`, null);



// 设施类型-新增
export const postDictFacilityTypeAdd = <T>(data: any) => Ajax.safeRepeatPost<T>(`/api/mb/dict/FACILITY_TYPE`, data);
// 设施类型-更新
export const postDictFacilityTypeUpdate = <T>(data: any) => Ajax.safePut<T>(`/api/mb/dict/FACILITY_TYPE/${data.id}`, data);
// 设施类型-冻结
export const postDictFacilityTypeDisableId = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/FACILITY_TYPE/${data.id}/${data.name}/disable`, null);
// 设施类型-取消冻结
export const postDictFacilityTypeEnableId = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/FACILITY_TYPE/${data.id}/${data.name}/enable`, null);
// 设施类型-批量冻结
export const postDictFacilityTypeDisable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/FACILITY_TYPE/batchDisable`, data);
// 设施类型-批量取消冻结
export const postDictFacilityTypeEnable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/FACILITY_TYPE/enable`, data);
// 设施类型-通用下拉
export const getDictFacilityTypeDropdown = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/FACILITY_TYPE/dropdown`, null);
// 设施类型-分页列表 
export const postDictFacilityTypePage = <T>(data: any) => Ajax.safePostPage<T>(`/api/mb/dict/FACILITY_TYPE/page`, data);
// 设施类型-删除
export const postDictFacilityTypeDelete = <T>(data: any) => Ajax.safeDelete<T>(`/api/mb/dict/FACILITY_TYPE/delete/${data.id}/${data.name}`, null);


// 外设类型-新增
export const postDictPeripheralsAdd = <T>(data: any) => Ajax.safeRepeatPost<T>(`/api/mb/dict/peripheral`, data);
// 外设类型-更新
export const putDictPeripheralsUpdate = <T>(data: any) => Ajax.safePut<T>(`/api/mb/dict/peripheral/${data.id}`, data);
// 外设类型-冻结
export const postDictPeripheralsDisableId = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/peripheral/${data.id}/disable`, null);
// 外设类型-取消冻结
export const postDictPeripheralsEnableId = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/peripheral/${data.id}/enable`, null);
// 外设类型-批量冻结
export const postDictPeripheralsDisable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/peripheral/batch/disable`, data);
// 外设类型-批量取消冻结
export const postDictPeripheralsEnable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/peripheral/batch/enable`, data);
// 外设类型-通用下拉
export const getDictPeripheralsDropdown = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/peripheral/dropdown`, null);
// 外设类型-分页列表 
export const postDictPeripheralsPage = <T>(data: any) => Ajax.safePostPage<T>(`/api/mb/dict/peripheral/page`, data);
// 外设类型-删除
export const deleteDictPeripherals = <T>(data: any) => Ajax.safeDelete<T>(`/api/mb/dict/peripheral/${data.id}/delete`, null);


// 功能类型-新增
export const postDictFunctionTypeAdd = <T>(data: any) => Ajax.safeRepeatPost<T>(`/api/mb/dict/switchType`, data);
// 功能类型-更新
export const putDictFunctionTypeUpdate = <T>(data: any) => Ajax.safePut<T>(`/api/mb/dict/switchType/${data.id}`, data);
// 功能类型-冻结
export const postDictFunctionTypeDisableId = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/switchType/${data.id}/disable`, null);
// 功能类型-取消冻结
export const postDictFunctionTypeEnableId = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/switchType/${data.id}/enable`, null);
// 功能类型-批量冻结
export const postDictFunctionTypeDisable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/switchType/batch/disable`, data);
// 功能类型-批量取消冻结
export const postDictFunctionTypeEnable = <T>(data: any) => Ajax.safePost<T>(`/api/mb/dict/switchType/batch/enable`, data);
// 功能类型-通用下拉
export const getDictFunctionTypeDropdown = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/dict/switchType/dropdown`, null);
// 功能类型-分页列表 
export const postDictFunctionTypePage = <T>(data: any) => Ajax.safePostPage<T>(`/api/mb/dict/switchType/page`, data);
// 功能类型-删除
export const deleteDictFunctionType = <T>(data: any) => Ajax.safeDelete<T>(`/api/mb/dict/switchType/${data.id}/delete`, null);

export const getModeList = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/dict/workMode/page', data); // 获取模式列表
export const frezzeMode = <T>(id: string) => Ajax.safePost<T>(`/api/sa/dict/workMode/${id}/disable`, null); // 冻结模式
export const frezzeModeBatch = <T>(ids: string[]) => Ajax.safePost<T>(`/api/sa/dict/workMode/disable`, ids); // 批量冻结模式
export const unfrezzeMode = <T>(id: string) => Ajax.safePost<T>(`/api/sa/dict/workMode/${id}/enable`, null); // 取消冻结模式

export const deleteMode = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/dict/workMode/${id}/delete`, null); // 删除模式
