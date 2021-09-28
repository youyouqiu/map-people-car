/* eslint-disable @typescript-eslint/camelcase */
/**
 * 通过webpack定义的一个全局变量，开发时true，生产时false
 */
declare const PROCESS_DEV_ENV: boolean;

const titleName = () => {
  let personalizedConfig: any = window.sessionStorage.getItem('personalizedConfig');
  personalizedConfig = JSON.parse(personalizedConfig);
  if (personalizedConfig && personalizedConfig.platformTitle) {
    return personalizedConfig.platformTitle
  } else {
    return '环卫云平台'
  }
}

export default {
  remote: {
    socketUrl: PROCESS_DEV_ENV ? 'http://192.168.24.165:8763' : '',
  },
  // 百度地图key
  bmapKey: 'BOUTxUmuP8RMGbHvYuubgGTwWYHmNyFv',
  /**
   * 高德地图Key
   */
  amapKey: '6b953aec395d345fd37e1b5434d587a9',
  /**
  * 谷歌地图Key
  */
  googleKey: 'AIzaSyB7hF55D-GpYxFAPlNgcjdLnZ6cuh6xssY',
  loginParam: {
    path: '/api/auth/oauth/token',
    param: {
      client_id: 'user',
      client_secret: 'userSecret',
      username: 'admin',
      password: '123456',
      grant_type: 'password',
      scope: 'write',
    },
  },
  routes: [
    { path: '/', exact: true, code: 'default', component: 'container/index', name: '环卫云平台' },
    { path: '/login', code: 'login', component: 'login/index', name: '登录' },
    {
      path: '/view/:param2?/:param3?/:param4?',
      code: 'view',
      component: 'container/index',
      name: titleName(),
      children: [
        {
          path: '/view/home',
          code: '2_home',
          component: 'home/index',
          name: '首页',
          children: [
            {
              path: '/view/home/personal',
              code: '3_personal_center',
              component: 'home/personal/index',
              name: '个人中心',
            },
          ],
        },
        {
          path: '/view/monitorManager',
          code: '2_monitoring_object',
          component: 'monitorManager/index',
          name: '监控对象',
          children: [
            {
              name: '车辆管理',
              path: '/view/monitorManager/vehicleManager',
              code: '3_vehicle_management',
              component: 'monitorManager/index',
              children: [
                {
                  name: '车辆列表',
                  code: '4_vehicle_list',
                  path: '/view/monitorManager/vehicleManager/vehicleList',
                  component: 'monitorManager/vehicleManager/',
                },
              ],
            },
            {
              name: '人员管理',
              code: '3_people_management',
              path: '/view/monitorManager/peopleManager',
              component: 'monitorManager/index',
              children: [
                {
                  name: '人员列表',
                  code: '4_people_list',
                  path: '/view/monitorManager/peopleManager/peopleList',
                  component: 'monitorManager/peopleManager/',
                },
              ],
            },
            {
              name: '设施管理',
              code: '3_facility_management',
              path: '/view/monitorManager/facilityManager',
              component: 'monitorManager/index',
              children: [
                {
                  name: '设施列表',
                  code: '4_facility_list',
                  path: '/view/monitorManager/facilityManager/facilityList',
                  component: 'monitorManager/facilityManager/',
                },
              ],
            },
          ],
        },
        {
          path: '/view/orgAndUser',
          code: '2_org_and_user',
          component: 'orgAndUser/index',
          name: '组织用户',
          children: [
            {
              path: '/view/orgAndUser/orgMgm',
              code: '3_organization_management',
              component: 'orgAndUser/orgMgm/index',
              name: '组织管理',
              children: [
                {
                  path: '/view/orgAndUser/orgMgm/orgList',
                  code: '4_organization_list',
                  component: 'orgAndUser/orgMgm/index',
                  name: '组织列表',
                },
              ],
            },
            {
              name: '人员管理',
              code: '3_people_management',
              path: '/view/monitorManager/peopleManager',
              component: 'monitorManager/index',
              children: [
                {
                  name: '人员列表',
                  code: '4_people_list',
                  path: '/view/monitorManager/peopleManager/peopleList',
                  component: 'monitorManager/peopleManager/',
                },
              ],
            },
            // {
            //   name: "设施管理",
            //   code: "3_facility_management",
            //   path: '/view/monitorManager/facilityManager',
            //   component: 'monitorManager/index',
            //   children: [
            //     {
            //       name: "设施列表",
            //       code: "4_facility_list",
            //       path: '/view/monitorManager/facilityManager/facilityList',
            //       component: 'monitorManager/facilityManager/',
            //     }
            //   ]
            // }
          ],
        },
        {
          path: '/view/enterpriseUser',
          code: '2_enterprise_user',
          component: 'enterpriseUser/index',
          name: '企业用户',
          children: [
            {
              path: '/view/enterpriseUser/enterpriseMgm',
              code: '3_enterprise_user_management',
              component: 'enterpriseUser/enterpriseMgm/index',
              name: '用户管理',
              children: [
                {
                  path: '/view/enterpriseUser/enterpriseMgm/enterpriseList',
                  code: '4_enterprise_user_list',
                  component: '/enterpriseUser/enterpriseMgm/index',
                  name: '企业用户列表',
                },
              ],
            },
            {
              path: '/view/enterpriseUser/permission',
              code: '3_enterprise_role_and_permission',
              component: 'enterpriseUser/permission/index',
              name: '角色权限',
              children: [
                {
                  path: '/view/enterpriseUser/permission/rolelist',
                  code: '4_enterprise_role_list',
                  component: 'enterpriseUser/permission/rolelist',
                  name: '角色列表',
                },
              ],
            },
          ],
        },
        {
          path: '/view/orgAndUser',
          code: '2_org_and_user',
          component: 'orgAndUser/index',
          name: '组织用户',
          children: [
            {
              path: '/view/orgAndUser/orgMgm',
              code: '3_organization_management',
              component: 'orgAndUser/orgMgm/index',
              name: '组织管理',
              children: [
                {
                  path: '/view/orgAndUser/orgMgm/orgList',
                  code: '4_organization_list',
                  component: 'orgAndUser/orgMgm/index',
                  name: '组织列表',
                },
              ],
            },
            {
              path: '/view/orgAndUser/userMgm',
              code: '3_user_management',
              component: 'orgAndUser/userMgm/index',
              name: '用户管理',
              children: [
                {
                  path: '/view/orgAndUser/userMgm/userList',
                  code: '4_system_user_list',
                  component: 'orgAndUser/userMgm/index',
                  name: '系统用户列表',
                },
              ],
            },
            {
              path: '/view/orgAndUser/permission',
              code: '3_role_and_permission',
              component: 'orgAndUser/permission/index',
              name: '角色权限',
              children: [
                {
                  path: '/view/orgAndUser/permission/rolelist',
                  code: '4_role_list',
                  component: 'orgAndUser/permission/rolelist',
                  name: '角色列表',
                },
              ],
            },
          ],
        },
        {
          path: '/view/enterpriseAndContract',
          code: '2_enterprise_contract',
          component: 'enterpriseAndContract/index',
          name: '企业合同',
          children: [
            {
              name: '企业管理',
              path: '/view/enterpriseAndContract/enterpriseManage',
              code: '3_enterprise_management',
              component: 'enterpriseAndContract/enterpriseManage/index',
              children: [
                {
                  name: '企业列表',
                  code: '4_enterprise_list',
                  path: '/view/enterpriseAndContract/enterpriseManage/manageList',
                  component: 'enterpriseAndContract/enterpriseManage/index',
                },
              ],
            },
            {
              name: '合同标段',
              path: '/view/enterpriseAndContract/contract',
              code: '3_contract_section',
              component: 'enterpriseAndContract/index',
              children: [
                {
                  name: '合同标段列表',
                  code: '4_contract_section_list',
                  path: '/view/enterpriseAndContract/contract/contractList',
                  component: 'enterpriseAndContract/contract/index',
                },
              ],
            },
          ],
        },
        {
          path: '/view/systemManagement',
          code: '2_system',
          component: 'systemManagement/index',
          name: '系统管理',
          children: [
            {
              path: '/view/systemManagement/dataDictionary',
              code: '3_data_dictionary',
              component: 'systemManagement/dataDictionary/index',
              name: '数据字典',
              children: [

              ]
            },
            {
              path: '/view/systemManagement/sysOperationLog',
              code: '3_system_operation_log',
              component: 'systemManagement/sysOperationLog/index',
              name: '操作日志',
              children: [
                {
                  name: '日志列表',
                  code: '4_system_operation_log_list',
                  path: '/view/systemManagement/sysOperationLog/list',
                  component: 'systemManagement/sysOperationLog/list/index',
                },
              ]
            },
            {
              path: '/view/systemManagement/personalizedConfig',
              code: '4_personalization',
              component: 'systemManagement/personalizedConfig/index',
              name: '个性化设置'
            }
          ]
        },
        {
          path: '/view/workManagement',
          code: '2_work_management',
          component: 'workManagement',
          name: '作业管理',
          children: [
            {
              name: '作业设置',
              path: '/view/workManagement/workSetting',
              code: '3_working_settings',
              component: 'workManagement/workSetting/index',
              children: [
                {
                  name: '作业班次',
                  path: '/view/workManagement/workSetting/workShift',
                  code: '4_work_shift',
                  component: 'workManagement/workSetting/workShift/index',
                }
              ]
            },
            {
              name: '作业排班',
              path: '/view/workManagement/workSchedul',
              code: '3_work_scheduling',
              component: 'workManagement/workSchedul/index',
              children: [
                {
                  name: '排班列表',
                  path: '/view/workManagement/workSchedul/workSchedulList',
                  code: '4_scheduling_list',
                  component: 'workManagement/workSchedul/workSchedulList/index'
                }
              ]
            },
            {
              name: '排班调整',
              path: '/view/workManagement/schdulAdjust',
              code: '3_scheduling_adjustment',
              component: 'workManagement/schdulAdjust/index',
              children: [
                {
                  name: '排班日历',
                  path: '/view/workManagement/schdulAdjust/schedulCalendar',
                  code: '4_scheduling_calendar',
                  component: 'workManagement/schdulAdjust/schedulCalendar/index'
                }
              ]
            },
          ],
        },
        {
          path: '/view/workObject',
          code: '2_work_object',
          component: 'workObject',
          name: '作业对象',
          children: [
            {
              name: '作业线路',
              path: '/view/workObject/workPath',
              code: '3_working_road',
              component: 'workObject/workPath',
              children: [
                {
                  name: '道路列表',
                  path: '/view/workObject/workPath/list',
                  code: '4_road_list',
                  component: 'workObject/workPath/list/index',
                }
              ]
            },
            {
              name: '作业区域',
              path: '/view/workObject/workArea',
              code: '3_working_area',
              component: 'workObject/workArea',
              children: [
                {
                  name: '区域列表',
                  path: '/view/workObject/workArea/list',
                  code: '4_working_area_list',
                  component: '/view/workObject/workArea/list/index',
                }
              ]
            },
            {
              name: '清运区域',
              path: '/view/workObject/cleanArea',
              code: '3_clearance_area',
              component: 'workObject/cleanArea',
              children: [
                {
                  name: '区域列表',
                  path: '/view/workObject/cleanArea/list',
                  code: '4_clearance_area_list',
                  component: '/view/workObject/cleanArea/list/index',
                }
              ]
            },
          ],
        },
        {
          path: '/view/auditsManagement',
          code: '2_audits_management',
          component: 'auditsManagement',
          name: '审核管理',
          children: [
            {
              name: '作业审核',
              path: '/view/auditsManagement/workReview',
              code: '3_work_review',
              component: 'auditsManagement/workReview/index',
              children: [
                {
                  name: '作业对象列表',
                  path: '/view/auditsManagement/workReview/workList',
                  code: '4_work_object_list',
                  component: 'auditsManagement/workReview/workList/index',
                }
              ]
            }
          ]
        },
        {
          name: '监控管理',
          code: '2_monitoring_management',
          path: '/view/monitoringManager',
          component: 'monitoringManager',
          children: [
            {
              name: '作业监控',
              code: '3_work_monitoring',
              path: '/view/monitoringManager/workMonitoring',
              component: 'monitoringManager/workMonitoring',
              children: [
                {
                  name: '作业监控',
                  code: '4_work_monitoring',
                  path: '/view/monitoringManager/workMonitoring',
                  component: 'monitoringManager/workMonitoring',
                }
              ]
            },
            {
              name: "作业回放",
              code: "3_work_playback",
              path: '/view/monitoringManager/workPlayback',
              component: 'monitoringManager/workPlayback',
              children: [
                {
                  name: "作业回放",
                  code: "4_track_playback",
                  path: '/view/monitoringManager/workPlayback',
                  component: 'monitoringManager/workPlayback',
                }
              ]
            },
          ],
        },
        // bigdataBorad
        {
          name: '大数据看板',
          code: '2_big_data_kanban',
          path: '/view/bigdataBorad',
          component: 'bigdataBorad',
          children: [
            {
              name: "领导看板",
              code: "3_leadership_kanban",
              path: '/view/bigdataBorad/leaderBorad',
              component: 'bigdataBorad/leaderBorad',
            },
          ]
        },
        {
          name: '考勤统计',
          code: '2_attendance_stat',
          path: '/view/statisticalAnalysis',
          component: 'statisticalAnalysis',
          children: [
            {
              name: '人员考勤考核报表',
              code: '3_people_attendance_report',
              path: '/view/statisticalAnalysis/staffAttendance',
              component: 'statisticalAnalysis/staffAttendance',
            },
            {
              name: '车辆考勤考核报表',
              code: '3_vehicle_attendance_report',
              path: '/view/statisticalAnalysis/vehicleAttendance',
              component: 'statisticalAnalysis/vehicleAttendance',
            },
          ]
        },
        {
          name: '作业统计',
          code: '2_work_stat',
          path: '/view/workStatistic',
          component: 'workStatistic',
          children: [
            {
              name: '车辆作业统计报表',
              code: '3_machine_work_stat_report',
              path: '/view/workStatistic/machineStatistic',
              component: 'workStatistic/machineStatistic',
            },
            {
              name: '人工作业统计报表',
              code: '3_manual_work_stat_report',
              path: '/view/workStatistic/peopleStatistic',
              component: 'workStatistic/peopleStatistic',
            },
          ]
        }
      ],
    },
    { path: '/401', code: '401', component: 'error/page401', name: '404' },
    { path: '/404', code: '404', component: 'error/page404', name: '404' },
    { path: '/401', code: '401', component: 'error/page401', name: '404' },
    { path: '/404', code: '404', component: 'error/page404', name: '404' },
  ],
};
