/**
 * 位置信息表单
 */
import React, { Component } from 'react';
import { regularText } from '@/common/rules';
import TableForm from '@/common/tableForm';
import FacilityMap from './map';

import styles from '../../../index.module.less';

interface IProps {
  monitorInfo: Record<string, any>,
  formRef: any,
  markerPosition: Array<number> | null
}

interface IAddress {
  province: string,
  city: string,
  district: string,
  address: string,
  longitude: number,
  latitude: number
}

class Index extends Component<IProps, any, any> {
  constructor(props: IProps) {
    super(props);
  }

  /**
  * 获取表单显示列信息
  */
  getTableColumn = () => {
    const infoColumn = [{
      name: '经度',
      key: 'longitude',
      // validate: {
      //     rules: [
      //         { required: true, message: '经度不能为空' },
      //         {
      //             pattern: new RegExp(/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/),
      //             message: '经度整数部分为0-180,小数部分为0到6位',
      //         }]
      // },
      inputProps: {
        placeholder: '请在地图中标注位置'
      },
    }, {
      name: '纬度',
      key: 'latitude',
      // validate: {
      //     rules: [
      //         { required: true, message: '纬度不能为空' },
      //         {
      //             pattern: new RegExp(/^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/),
      //             message: '纬度整数部分为0-90,小数部分为0到6位',
      //         }]
      // },
      inputProps: {
        placeholder: '请在地图中标注位置'
      },
    }, {
      name: '省份',
      key: 'province',
      inputProps: {
        placeholder: '请在地图中标注位置',
        readOnly: true
      },
    }, {
      name: '地市',
      key: 'city',
      inputProps: {
        placeholder: '请在地图中标注位置',
        readOnly: true
      },
    }, {
      name: '区县',
      key: 'district',
      inputProps: {
        placeholder: '请在地图中标注位置',
        readOnly: true
      },
    }, {
      name: '详细地址',
      key: 'address',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        placeholder: '请在地图中标注位置',
        maxLength: 50,
      },
    }, {
      name: '描述',
      key: 'describe',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 150,
      },
    }]
    return infoColumn;
  }

  /**
   * 地图标注位置改变,联动更新相关位置信息
   * @param result 
   */
  mapAddressChange = (result: IAddress) => {
    const { formRef } = this.props;
    formRef.current?.setFieldsValue(result);
  }

  render() {
    const { markerPosition } = this.props;
    const infoColumn = this.getTableColumn();

    return <table className={styles.itemTable}>
      <tbody>
        <tr><th colSpan={2} className={styles.tableHeader}>位置信息</th></tr>
        <tr>
          <td width={530}>
            <FacilityMap position={markerPosition} addressChange={this.mapAddressChange} />
          </td>
          <td>
            <TableForm className={styles.detailTable} dataSource={infoColumn} column={2} />
          </td>
        </tr>
      </tbody>
    </table>
  }
}
export default Index;
