// 传感器基本参数
export const sensorBasicParam = [{
  name: '传感器长度',
  key: 'sensorLength',
  colWidth: 330,
  inputProps: {
    maxLength: 5,
    placeholder: '最多5位整数',
  },
  validate: {
    rules: [{
      required: true,
      message: '请输入传感器长度',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 0 && newNum <= 99999) {
            return Promise.resolve();
          }
          return Promise.reject('最多5位整数');
        }
      }
    }]
  }
},
  // {
  //   name: '滤波系数',
  //   key: 'filteringFactor',
  //   component: <Select bordered={false} getPopupContainer={() => getSelectContainer('waterParam')}>
  //     <Option value="01">实时</Option>
  //     <Option value="02">平滑</Option>
  //     <Option value="03">平稳</Option>
  //   </Select>
  // }, {
  //   name: '波特率',
  //   key: 'baudRate',
  //   component: <Select bordered={false} getPopupContainer={() => getSelectContainer('waterParam')}>
  //     <Option value="01">2400</Option>
  //     <Option value="02">4800</Option>
  //     <Option value="03">9600</Option>
  //     <Option value="04">19200</Option>
  //     <Option value="05">38400</Option>
  //     <Option value="06">57600</Option>
  //     <Option value="07">115200</Option>
  //   </Select>
  // }, {
  //   name: '奇偶校验',
  //   key: 'oddEvenCheck',
  //   component: <Select bordered={false} getPopupContainer={() => getSelectContainer('waterParam')}>
  //     <Option value="1">奇校验</Option>
  //     <Option value="2">偶校验</Option>
  //     <Option value="3">无校验</Option>
  //   </Select>
  // }, {
  //   name: '补偿使能',
  //   key: 'compensationCanMake',
  //   component: <Select bordered={false} getPopupContainer={() => getSelectContainer('waterParam')}>
  //     <Option value="1">使能</Option>
  //     <Option value="2">禁用</Option>
  //   </Select>
  // }
]

// 个性参数
export const personalityParam = [{
  name: '标定组数',
  key: 'calibrationSets',
  inputProps: {
    maxLength: 2,
    placeholder: '组数范围0-50',
  },
  validate: {
    rules: [{
      required: true,
      message: '请输入标定组数',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 0 && newNum <= 50) {
            return Promise.resolve();
          }
          return Promise.reject('请输入0-50之间的整数');
        }
      }
    }]
  }
}, {
  name: '加水量阈值(L)',
  key: 'addOilAmountThreshold',
  colWidth: 100,
  inputProps: {
    maxLength: 2,
    placeholder: '8-60之间的整数',
  },
  validate: {
    rules: [{
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 8 && newNum <= 60) {
            return Promise.resolve();
          }
          return Promise.reject('请输入8-60之间的整数');
        }
      }
    }]
  }
}, {
  name: '加水时间阈值(s)',
  key: 'addOilTimeThreshold',
  nameWidth: 140,
  inputProps: {
    maxLength: 3,
    placeholder: '1-400之间的整数',
  },
  validate: {
    rules: [{
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 400) {
            return Promise.resolve();
          }
          return Promise.reject('请输入1-400之间的整数');
        }
      }
    }]
  }
},
{
  name: '漏水时间阈值(s)',
  key: 'seepOilTimeThreshold',
  nameWidth: 140,
  inputProps: {
    maxLength: 3,
    placeholder: '1-400之间的整数',
  },
  validate: {
    rules: [{
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 400) {
            return Promise.resolve();
          }
          return Promise.reject('请输入1-400之间的整数');
        }
      }
    }]
  }
},
{
  name: '漏水量阈值(L)',
  key: 'seepOilAmountThreshold',
  colWidth: 100,
  inputProps: {
    maxLength: 2,
    placeholder: '1-60之间的整数',
  },
  validate: {
    rules: [{
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 60) {
            return Promise.resolve();
          }
          return Promise.reject('请输入1-60之间的整数');
        }
      }
    }]
  }
},
  // {
  //   name: '自动上传时间(s)',
  //   key: 'automaticUploadTime',
  //   component: <Select bordered={false} getPopupContainer={() => getSelectContainer('waterParam')}>
  //     <Option value="01">被动</Option>
  //     <Option value="02">10</Option>
  //     <Option value="03">20</Option>
  //     <Option value="04">30</Option>
  //   </Select>
  // },
  // {
  //   name: '输出修正系数K',
  //   key: 'outputCorrectionCoefficientK',
  //   colWidth: 100,
  //   inputProps: {
  //     maxLength: 3,
  //     placeholder: '0-200之间的整数',
  //   },
  //   validate: {
  //     rules: [{
  //       validator: async (rule: any, value: string) => {
  //         const newNum = Number(value);
  //         if (value) {
  //           if (!isNaN(newNum) && newNum >= 0 && newNum <= 200) {
  //             return Promise.resolve();
  //           }
  //           return Promise.reject('请输入0-200之间的整数');
  //         }
  //       }
  //     }]
  //   }
  // },
  // {
  //   name: '输出修正系数B',
  //   key: 'outputCorrectionCoefficientB',
  //   colWidth: 100,
  //   inputProps: {
  //     maxLength: 3,
  //     placeholder: '0-200之间的整数',
  //   },
  //   validate: {
  //     rules: [{
  //       validator: async (rule: any, value: string) => {
  //         const newNum = Number(value);
  //         if (value) {
  //           if (!isNaN(newNum) && newNum >= 0 && newNum <= 200) {
  //             return Promise.resolve();
  //           }
  //           return Promise.reject('请输入0-200之间的整数');
  //         }
  //       }
  //     }]
  //   }
  // }
]

// 标定数据(加水数据)
export const addWaterData = [{
  name: '加水前',
  key: 'beforeHeight',
  inputProps: {
    disabled: true,
    placeholder: '加水前液体高度(mm)',
  },
  validate: {
    rules: [{
      required: true,
      message: '请在图表中选择加水前的数据',
    }]
  }
},
{
  name: '',
  key: 'beforeValue',
  inputProps: {
    disabled: true,
    placeholder: '加水前水量值(L)',
  },
  validate: {
    rules: [{
      required: true,
      message: '请在图表中选择加水前的数据',
    }]
  }
},
{
  name: '加水后',
  key: 'afterHeight',
  inputProps: {
    disabled: true,
    placeholder: '加水后液体高度(mm)',
  },
  validate: {
    rules: [{
      required: true,
      message: '请在图表中选择加水后的数据',
    }]
  }
},
{
  name: '',
  key: 'afterValue',
  inputProps: {
    disabled: true,
    placeholder: '加水后水量值(L)',
  },
  validate: {
    rules: [{
      required: true,
      message: '请在图表中选择加水后的数据',
    }]
  }
},
{
  name: '实际加水量',
  key: 'thickness',
  validate: {
    rules: [
      {
        required: true,
        message: '请输入实际加水量',
      },
      {
        pattern: new RegExp(/^\d{0,5}([\b]*|\.|\.\d{0,1}|$)$/),
        message: '请输入数字,保留1位小数'
      }]
  }
}]

// 下发结果
export const sendResultColumn = [{
  name: '最后一次下发时间',
  key: 'lastSendTime',
}, {
  name: '下发状态',
  key: 'sendStatus',
}]

