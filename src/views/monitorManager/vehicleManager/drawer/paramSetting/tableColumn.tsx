import React from 'react';
import { regularText } from "@/common/rules";
import { Select } from "antd";
const { Option } = Select;

/**
 * 参数设置抽屉,参数列显示信息
 */
export const columnInfo: any = {
  // 通讯参数设置
  message: {
    '2013': [{// 2013协议版本
      name: '主服务器APN',
      key: 'mainServerAPN',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '主服务器地址',
      key: 'mainServerAddress',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 30,
        placeholder: ''
      }
    }, {
      name: '备份服务器APN',
      key: 'backupServerAPN',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '备份服务器地址',
      key: 'backupServerAddress',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 30,
        placeholder: ''
      }
    }, {
      name: '服务器TCP端口',
      key: 'serverTCPPort',
      validate: {
        rules: [{
          pattern: new RegExp(/^[a-zA-Z0-9]{0,5}$/),
          message: '请输入数字/字母',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '服务器UDP端口',
      key: 'serverUDPPort',
      validate: {
        rules: [{
          pattern: new RegExp(/^[a-zA-Z0-9]{0,5}$/),
          message: '请输入数字/字母',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '主服务器无线通信拨号用户名',
      key: 'mainServerCallUserName',
      nameWidth: 150,
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '主服务器无线通信拨号密码',
      key: 'mainServerCallUserPwd',
      nameWidth: 150,
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '备份服务器无线通信拨号用户名',
      key: 'backupServerCallUserName',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '备份服务器无线通信拨号密码',
      key: 'backupServerCallUserPwd',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }],
    '2019': [{// 2019协议版本
      name: '主服务器APN',
      key: 'mainServerAPN',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '主服务器地址',
      key: 'mainServerAddress',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 30,
        placeholder: ''
      }
    }, {
      name: '从服务器APN',
      key: 'slaveServerAPN',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '从服务器地址',
      key: 'slaveServerAddress',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 30,
        placeholder: ''
      }
    }, {
      name: '备份服务器APN',
      key: 'backupServerAPN',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '备份服务器地址',
      key: 'backupServerAddress',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 30,
        placeholder: ''
      }
    }, {
      name: '主服务器无线通信拨号用户名',
      key: 'mainServerCallUserName',
      nameWidth: 150,
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '主服务器无线通信拨号密码',
      key: 'mainServerCallUserPwd',
      nameWidth: 150,
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '从服务器无线通信拨号用户名',
      key: 'slaveServerCallUserName',
      nameWidth: 150,
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '从主服务器无线通信拨号密码',
      key: 'slaveServerCallUserPwd',
      nameWidth: 150,
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '备份服务器无线通信拨号用户名',
      key: 'backupServerCallUserName',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }, {
      name: '备份服务器无线通信拨号密码',
      key: 'backupServerCallUserPwd',
      validate: { rules: [regularText] },
      inputProps: {
        maxLength: 20,
        placeholder: ''
      }
    }]
  },
  // 终端参数设置
  terminal: [{
    name: '终端心跳发送间隔',
    key: 'heartSpace',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,5}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 5,
      placeholder: ''
    }
  }, {
    name: 'TCP消息应答超时时间',
    key: 'tcpAckTimeOut',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,5}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 5,
      placeholder: ''
    }
  }, {
    name: 'TCP消息重传次数',
    key: 'tcpReUpTimes',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,3}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 3,
      placeholder: ''
    }
  }, {
    name: 'UDP消息应答超时时间',
    key: 'udpAckTimeOut',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,5}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 5,
      placeholder: ''
    }
  }, {
    name: 'UDP消息重传次数',
    key: 'udpReUpTimes',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,3}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 3,
      placeholder: ''
    }
  }, {
    name: 'SMS消息应答超时时间',
    key: 'smsAckTimeOut',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,5}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 5,
      placeholder: ''
    }
  }, {
    name: 'SMS消息重传次数',
    key: 'smsReUpTimes',
    validate: {
      rules: [{
        pattern: new RegExp(/^[0-9]{0,5}$/),
        message: '请输入数字',
      }]
    },
    inputProps: {
      maxLength: 3,
      placeholder: ''
    }
  }, {
    name: '拐点补传角度',
    key: 'inflectionPointAdditional',
    validate: {
      rules: [
        {
          validator: async (rule: any, value: string) => {
            const newNum = Number(value);
            if (value) {
              if (!isNaN(newNum) && newNum >= 0 && newNum <= 179) {
                return Promise.resolve();
              }
              return Promise.reject('输入范围0-179的整数');
            }
          }
        }
      ]
    },
    inputProps: {
      maxLength: 3,
      placeholder: ''
    }
  }, {
    name: '电子围栏半径(m)',
    key: 'electronicFenceRadius',
    validate: {
      rules: [
        {
          pattern: new RegExp(/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/),
          message: '输入范围0-65535',
        }
      ]
    },
    inputProps: {
      maxLength: 5,
      placeholder: ''
    }
  }],
  // 位置汇报参数设置
  address: [
    // 定时汇报
    [{
      name: '位置汇报策略',
      key: 'positionUpTactics',
      component: <Select bordered={false}>
        <Option value={0}>定时汇报</Option>
        <Option value={1}>定距汇报</Option>
        <Option value={2}>定时和定距汇报</Option>
      </Select >
    }, {
      name: '位置汇报方案',
      key: 'positionUpScheme',
      component: <Select bordered={false} >
        <Option value={0}>根据ACC状态</Option>
        <Option value={1}>根据登录状态和ACC状态</Option>
      </Select >
    }, {
      name: '缺省时间汇报间隔(s)',
      key: 'defaultTimeUpSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '休眠时汇报时间间隔(s)',
      key: 'dormancyUpTimeSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '紧急报警时汇报时间间隔(s)',
      key: 'emergencyAlarmUpTimeSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '驾驶员未登录汇报时间间隔(s)',
      key: 'driverLoggingOutUpTimeSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }],
    //  定距汇报
    [{
      name: '位置汇报策略',
      key: 'positionUpTactics',
      component: <Select bordered={false}>
        <Option value={0}>定时汇报</Option>
        <Option value={1}>定距汇报</Option>
        <Option value={2}>定时和定距汇报</Option>
      </Select >
    }, {
      name: '位置汇报方案',
      key: 'positionUpScheme',
      component: <Select bordered={false} >
        <Option value={0}>根据ACC状态</Option>
        <Option value={1}>根据登录状态和ACC状态</Option>
      </Select >
    }, {
      name: '缺省距离汇报间隔(m)',
      key: 'defaultDistanceUpSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '休眠时汇报距离间隔(m)',
      key: 'dormancyUpDistanceSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '紧急报警时汇报距离间隔(m)',
      key: 'emergencyAlarmUpDistanceSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '驾驶员未登录汇报距离间隔(m)',
      key: 'driverLoggingOutUpDistanceSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }],
    // 定时和定距汇报
    [{
      name: '位置汇报策略',
      key: 'positionUpTactics',
      component: <Select bordered={false}>
        <Option value={0}>定时汇报</Option>
        <Option value={1}>定距汇报</Option>
        <Option value={2}>定时和定距汇报</Option>
      </Select >
    }, {
      name: '位置汇报方案',
      key: 'positionUpScheme',
      component: <Select bordered={false} >
        <Option value={0}>根据ACC状态</Option>
        <Option value={1}>根据登录状态和ACC状态</Option>
      </Select >
    }, {
      name: '缺省时间汇报间隔(s)',
      key: 'defaultTimeUpSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '休眠时汇报时间间隔(s)',
      key: 'dormancyUpTimeSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '紧急报警时汇报时间间隔(s)',
      key: 'emergencyAlarmUpTimeSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '驾驶员未登录汇报时间间隔(s)',
      key: 'driverLoggingOutUpTimeSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '缺省距离汇报间隔(m)',
      key: 'defaultDistanceUpSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '休眠时汇报距离间隔(m)',
      key: 'dormancyUpDistanceSpace',
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '紧急报警时汇报距离间隔(m)',
      key: 'emergencyAlarmUpDistanceSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }, {
      name: '驾驶员未登录汇报距离间隔(m)',
      key: 'driverLoggingOutUpDistanceSpace',
      nameWidth: 150,
      validate: {
        rules: [{
          pattern: new RegExp(/^[0-9]{0,5}$/),
          message: '请输入数字',
        }]
      },
      inputProps: {
        maxLength: 5,
        placeholder: ''
      }
    }]
  ]
}