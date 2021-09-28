import React from 'react';
import { Radio, Select } from "antd";
import { getSelectContainer } from '@/framework/utils/function';
const { Option } = Select;

// 实时流设置
export const realTimeStream = [{
  name: '实时流编码模式',
  key: 'realtimeStreamMode',
  validate: {
    rules: [{
      required: true,
      message: '请选择实时流编码模式',
    }]
  },
  component: <Select bordered={false} getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
    <Option value={0}>CBR(固定码率)</Option>
    <Option value={1}>VBR(可变码率)</Option>
    <Option value={2}>ABR(平均码率)</Option>
  </Select >
}, {
  name: '实时流分辨率',
  key: 'realtimeStreamResolution',
  colWidth: 100,
  validate: {
    rules: [{
      required: true,
      message: '请选择实时流分辨率',
    }]
  },
  component: <Select bordered={false} getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
    <Option value={0}>QCIF</Option>
    <Option value={1}>CIF</Option>
    <Option value={2}>WCIF</Option>
    <Option value={3}>D1</Option>
    <Option value={4}>WD1</Option>
    <Option value={5}>720P</Option>
    <Option value={6}>1080P</Option>
  </Select >
}, {
  name: '实时流关键帧间隔(帧)',
  key: 'realtimeStreamKeyframeInterval',
  nameWidth: 140,
  validate: {
    rules: [{
      required: true,
      message: '请输入实时流关键帧间隔',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 1000) {
            return Promise.resolve();
          }
          return Promise.reject('输入范围1-1000的整数');
        }
      }
    }]
  }
},
{
  name: '实时流目标帧率(帧/s)',
  key: 'realtimeStreamTargetFrame',
  nameWidth: 150,
  validate: {
    rules: [{
      required: true,
      message: '请输入实时流目标帧率',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 120) {
            return Promise.resolve();
          }
          return Promise.reject('输入范围1-120的整数');
        }
      }
    }]
  }
}, {
  name: '实时流目标码率(kbps)',
  key: 'realtimeStreamTargetBitRate',
  nameWidth: 160,
  validate: {
    rules: [{
      required: true,
      message: '请输入实时流目标码率',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 4294967295) {
            return Promise.resolve();
          }
          return Promise.reject('输入范围1-4294967295的整数');
        }
      }
    }]
  }
}]

// 存储流设置
export const storageFlowStream = [{
  name: '存储流编码模式',
  key: 'storeStreamMode',
  validate: {
    rules: [{
      required: true,
      message: '请选择存储流编码模式',
    }]
  },
  component: <Select bordered={false} getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
    <Option value={0}>CBR(固定码率)</Option>
    <Option value={1}>VBR(可变码率)</Option>
    <Option value={2}>ABR(平均码率)</Option>
  </Select >
}, {
  name: '存储流分辨率',
  key: 'storeStreamResolution',
  colWidth: 100,
  validate: {
    rules: [{
      required: true,
      message: '请选择存储流分辨率',
    }]
  },
  component: <Select bordered={false} getPopupContainer={() => getSelectContainer('audioVideoContainer')}>
    <Option value={0}>QCIF</Option>
    <Option value={1}>CIF</Option>
    <Option value={2}>WCIF</Option>
    <Option value={3}>D1</Option>
    <Option value={4}>WD1</Option>
    <Option value={5}>720P</Option>
    <Option value={6}>1080P</Option>
  </Select >
}, {
  name: '存储流关键帧间隔(帧)',
  key: 'storeStreamKeyframeInterval',
  nameWidth: 140,
  validate: {
    rules: [{
      required: true,
      message: '请输入存储流关键帧间隔',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 1000) {
            return Promise.resolve();
          }
          return Promise.reject('输入范围1-1000的整数');
        }
      }
    }]
  }
},
{
  name: '存储流目标帧率(帧/s)',
  key: 'storeStreamTargetFrame',
  nameWidth: 150,
  validate: {
    rules: [{
      required: true,
      message: '请输入存储流目标帧率',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 120) {
            return Promise.resolve();
          }
          return Promise.reject('输入范围1-120的整数');
        }
      }
    }]
  }
}, {
  name: '存储流目标码率(kbps)',
  key: 'storeStreamTargetBitRate',
  nameWidth: 160,
  validate: {
    rules: [{
      required: true,
      message: '请输入存储流目标码率',
    }, {
      validator: async (rule: any, value: string) => {
        const newNum = Number(value);
        if (value) {
          if (!isNaN(newNum) && newNum >= 1 && newNum <= 4294967295) {
            return Promise.resolve();
          }
          return Promise.reject('输入范围1-4294967295的整数');
        }
      }
    }]
  }
}]

// OSD字幕叠加设置
export const subtitleOverlay = [{
  name: '日期和时间',
  key: 'dateAndTime',
  component: <Radio.Group>
    <Radio value='1'>是</Radio>
    <Radio value='0'>否</Radio>
  </Radio.Group>
}, {
  name: '车牌号',
  key: 'monitorName',
  component: <Radio.Group>
    <Radio value='1'>是</Radio>
    <Radio value='0'>否</Radio>
  </Radio.Group>
}, {
  name: '逻辑通道号',
  key: 'logicChannelNumber',
  component: <Radio.Group>
    <Radio value='1'>是</Radio>
    <Radio value='0'>否</Radio>
  </Radio.Group>
}, {
  name: '经纬度',
  key: 'latitudeAndLongitude',
  colWidth: 150,
  component: <Radio.Group>
    <Radio value='1'>是</Radio>
    <Radio value='0'>否</Radio>
  </Radio.Group>
}, {
  name: '行驶记录速度',
  key: 'recordedSpeed',
  component: <Radio.Group>
    <Radio value='1'>是</Radio>
    <Radio value='0'>否</Radio>
  </Radio.Group>
}, {
  name: '卫星定位速度',
  key: 'gpsSpeed',
  component: <Radio.Group>
    <Radio value='1'>是</Radio>
    <Radio value='0'>否</Radio>
  </Radio.Group>
}]

// 下发结果
export const sendResultColumn = [{
  name: '最后一次下发时间',
  key: 'lastSendTime',
}, {
  name: '下发状态',
  key: 'sendStatus',
}]

