/**
 * 解析终端上传的数据
 * @param params 
 */

export const paramParsing = (params: any) => {
    let result: any = {};
    params.map((param: any) => {
        const { paramId, paramValue } = param;
        switch (paramId) {
            case 0x0001:// 终端心跳发送间隔，单位为秒（s）
                result.heartSpace = paramValue;
                break;
            case 0x0002:// TCP 消息应答超时时间，单位为秒（s）
                result.tcpAckTimeOut = paramValue;
                break;
            case 0x0003:// TCP 消息重传次数
                result.tcpReUpTimes = paramValue;
                break;
            case 0x0004:// UDP 消息应答超时时间，单位为秒（s）
                result.udpAckTimeOut = paramValue;
                break;
            case 0x0005:// UDP 消息重传次数
                result.udpReUpTimes = paramValue;
                break;
            case 0x0006:// SMS 消息应答超时时间，单位为秒（s）
                result.smsAckTimeOut = paramValue;
                break;
            case 0x0007:// SMS 消息重传次数
                result.smsReUpTimes = paramValue;
                break;
            case 0x0010:// 主服务器APN，无线通信拨号访问点。若网络制式为CDMA，则该处为PPP 拨号号码
                result.mainServerAPN = paramValue;
                break;
            case 0x0011:// 主服务器无线通信拨号用户名
                result.mainServerCallUserName = paramValue;
                break;
            case 0x0012:// 主服务器无线通信拨号密码
                result.mainServerCallUserPwd = paramValue;
                break;
            case 0x0013:// 主服务器地址,IP 或域名
                result.mainServerAddress = paramValue;
                break;
            case 0x0014:// 备份服务器APN，无线通信拨号访问点
                result.backupServerAPN = paramValue;
                break;
            case 0x0015:// 备份服务器无线通信拨号用户名
                result.backupServerCallUserName = paramValue;
                break;
            case 0x0016:// 备份服务器无线通信拨号密码
                result.backupServerCallUserPwd = paramValue;
                break;
            case 0x0017:// 备份服务器地址,IP 或域名
                result.backupServerAddress = paramValue;
                break;
            case 0x0018:// 服务器TCP 端口
                result.serverTCPPort = paramValue;
                break;
            case 0x0019:// 服务器UDP 端口
                result.serverUDPPort = paramValue;
                break;
            case 0x0020:// 位置汇报策略，0：定时汇报；1：定距汇报；2：定时和定距汇报
                result.positionUpTactics = paramValue;
                break;
            case 0x0021:// 位置汇报方案，0：根据ACC 状态； 1：根据登录状态和ACC
                // 状态，先判断登录状态，若登录再根据ACC 状态
                result.positionUpScheme = paramValue;
                break;
            case 0x0022:// 驾驶员未登录汇报时间间隔，单位为秒（s），>0
                result.driverLoggingOutUpTimeSpace = paramValue;
                break;
            case 0x0027:// 休眠时汇报时间间隔，单位为秒（s），>0
                result.dormancyUpTimeSpace = paramValue;
                break;
            case 0x0028:// 紧急报警时汇报时间间隔，单位为秒（s），>0
                result.emergencyAlarmUpTimeSpace = paramValue;
                break;
            case 0x0029:// 缺省时间汇报间隔，单位为秒（s），>0
                result.defaultTimeUpSpace = paramValue;
                break;
            case 0x002C:// 缺省距离汇报间隔，单位为米（m），>0
                result.defaultDistanceUpSpace = paramValue;
                break;
            case 0x002D:// 驾驶员未登录汇报距离间隔，单位为米（m），>0
                result.driverLoggingOutUpDistanceSpace = paramValue;
                break;
            case 0x002E:// 休眠时汇报距离间隔，单位为米（m），>0
                result.dormancyUpDistanceSpace = paramValue;
                break;
            case 0x002F:// 紧急报警时汇报距离间隔，单位为米（m），>0
                result.emergencyAlarmUpDistanceSpace = paramValue;
                break;
            case 0x0030:// 拐点补传角度，<180
                result.inflectionPointAdditional = paramValue;
                break;
            case 0x0031:// 电子围栏半径（非法位移阈值），单位为米
                result.electronicFenceRadius = paramValue;
                break;
        }
    })
    return result;
}