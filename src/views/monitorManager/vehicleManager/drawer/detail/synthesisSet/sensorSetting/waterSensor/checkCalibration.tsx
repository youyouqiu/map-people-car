
/**
 * 查看标定
 */
import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "antd";
import { getCalibration } from '@/server/monitorManager';
import styles from '../../index.module.less'

interface IProps {
  changeVisible: Function,
  monitorId: string,
  sensorOutId: number,
}

const columns = [
  {
    title: '序号',
    render: (text: any, record: any, index: number) => `${index + 1}`,
  },
  {
    title: '液位高度(mm)',
    dataIndex: 'key',
  },
  {
    title: '水量值(L)',
    dataIndex: 'value',
  },
];

const CheckCalibration = (props: IProps) => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);// 表格数据

  useEffect(() => {
    getCalibrationFun();
  }, [])

  // 获取标定数据
  const getCalibrationFun = async () => {
    setLoading(true);
    const param = {
      monitorId: props.monitorId,
      sensorOutId: props.sensorOutId,
    }
    const result = await getCalibration<any>(param);
    if (result && result.length > 0) {
      setDataSource(JSON.parse(result[0].calibrationJson));
    }
    setLoading(false);
  }

  return (
    <Modal
      title="查看标定"
      visible
      mask={false}
      onCancel={() => props.changeVisible('')}
      footer={[<Button onClick={() => props.changeVisible('')}>取消</Button>]}
    >
      <Table
        bordered
        loading={loading}
        className={styles.customTable}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: `calc(100vh - 350px)` }}
      />
    </Modal>
  );
}

export default CheckCalibration;