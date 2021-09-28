/* eslint-disable @typescript-eslint/camelcase */
import home_CN from './home_CN';
import monitor_CN from "./monitor_CN";// 监控对象模块

import common_CN from "./common_CN";// 公共部分
import permission_CN from "./permission_CN";// 公共部分
import attribute_CN from "./attribute_CN";// 计划管理-属性管理模块

const zh_CN = Object.assign(
    {},
    common_CN,
    home_CN,
    monitor_CN,
    permission_CN,
    attribute_CN
);


export default zh_CN;