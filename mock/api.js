// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

function fromJSONFile (filename) {
    return (req, res) => {
        const data = fs.readFileSync(`./mock/data/${filename}.json`).toString()
        const json = JSON.parse(data)
        return res.json(json)
    }
}

const proxy = {
    // 'POST /api/auth/oauth/token': fromJSONFile('login'),
    // "GET /api/user/permission/menu": fromJSONFile("menu"),// 顶部页面菜单接口
    // "GET /api/sa/enterprise/user/enterpriseOrgTree": fromJSONFile("groupTree"),// 分组树接口
    // 'GET /api/user/organization/tree': fromJSONFile('orgTree'),//组织树
    /**
     * 监控对象模块
     */
    // 'POST /api/mo/monitoring-vehicle/page': fromJSONFile('vehicleList'), // 车辆列表
    /**
     * 企业合同
     */
    // 'GET /api/user/organization/tree': fromJSONFile('groupTree'), // 组织树数据
    // 'POST /api/ec/contractlist': fromJSONFile('contractList'), // 合同列表
    // 'POST /api/ec/enterpriseList': fromJSONFile('enterpriseList'), // 企业列表
    // 'POST /api/workManagement/workObject/workPathList': fromJSONFile('workPathList'), // 作业路线列表
    // 'POST /api/workManagement/workObject/workPathList': fromJSONFile('workPathList'), // 作业路线列表

    /**
     * 作业监控
     */
    // 'GET /api/sa/work/monitoring/workObject/basicStatistic': fromJSONFile('basicStatistic'), // 作业对象概况统计
    // 'GET /api/sa/work/monitoring/monitorPoint': fromJSONFile('monitorWindowInfo'), // 监控对象弹窗数据
    // 'POST /api/sa/work/playback/getMileageStatisticInfos': fromJSONFile('mileage'), // 
    // 'POST /api/sa/work/playback/getHistoryData': fromJSONFile('history'), // 
    // 'POST /api/sa/work/playback/getWorkPlayBackResp': fromJSONFile('work'), // 
}

module.exports = proxy