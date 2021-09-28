const menuList = [
  {
    name: 'Dashboard',
    icon: 'user',
    code: 'Dashboard',
    childPermissions: [
      { name: '首页', code: 'home', childPermissions: null },
    ],
  },
];

/**
 * 根据用户权限获取菜单
 */
export const getMenuList = () => menuList;

export const menuIconConfig = {
  Dashboard: 'dashboard', // 工作台
  Group: 'form', // 组织管理
  UserList: 'user', // 组织与用户管理
  RoleList: 'user', // 角色管理
  Device: 'table', // 设备管理
  MonitorList: 'user', // 终端监测
  DeviceManagementList: 'user', // 终端管理
  System: 'profile', // 系统管理
  LogList: 'user', // 日志查询
  ReportForm: 'check-circle-o', // 报表管理
  RechargeQueryList: 'user', // 充值查询
};
