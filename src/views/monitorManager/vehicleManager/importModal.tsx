import React, { useEffect, useState } from "react";
import { Modal, Upload, Button, Alert, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
import { downloadFile } from '@/framework/utils/function';

import styles from '../index.module.less';
import { clearInterval } from "stompjs";

interface IProps {
  currentTable: any;
  modalVisible: boolean;
  changeVisible: Function;
}

let secondTimer: any = null;

/**
 * 导入车辆
 * @param props 
 */
function ImportModal(props: IProps) {
  const { currentTable, modalVisible, changeVisible } = props;
  const [fileList, setFileList] = useState([]); // 导入文件列表
  const [loading, setLoading] = useState(false);// 导入loading状态
  const [secondCount, setSecondCount] = useState(30);// 下载失败列表倒计时剩余分钟数
  const [downLoading, setDownLoading] = useState<string>();// 下载通用模板加载状态
  const [errorLoading, setErrorLoading] = useState(false);// 下载失败列表加载状态

  useEffect(() => {
    return () => {
      if (secondTimer) {// 组件销毁时清除定时器
        clearInterval(secondTimer);
      }
    };
  }, []);

  // 上传文件格式及大小控制
  function beforeUpload(file: any) {
    const fileType = file.name.split('.')[1];
    const isJpgOrPng = fileType === 'xls' || fileType === 'xlsx';
    if (!isJpgOrPng) {
      message.error('文件格式不正确，请重新选择！');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('文件大小超过2M，请重新选择！');
    }
    return isJpgOrPng && isLt2M;
  }

  // 设置错误列表下载链接有效时间定时器
  function setSecondTimer(fileData: any) {
    if (fileData.length > 0 && (fileData[0] as any).status !== "uploading") {
      const currentFile: any = fileData[0];
      const { response, response: { code } } = currentFile;
      if (secondTimer) {
        clearInterval(secondTimer);
        secondTimer = null;
      }
      if (code === 200) {
        const { data: { successNum, errorNum } } = response;
        if (errorNum > 0) {// 有未成功数据时,设置错误列表下载链接有效时间定时器
          setSecondCount(30);
          secondTimer = setInterval(function () {
            setSecondCount(secondCount => {
              if (secondCount === 1) {
                clearInterval(secondTimer);
                secondTimer = null;
              }
              return secondCount - 1;
            });
          }, 60000);
        }
        if (successNum > 0) {// 有导入成功数据时,刷新列表
          currentTable.current.reload();
        }
      }
    }
  }

  // 导入文件
  function handleChange(list: any) {
    const { fileList } = list;
    // 过滤掉不符合要求的文件
    if (fileList.length > 0 && !fileList[0].status) {
      setFileList([]);
      return;
    }
    const loading = fileList[0] ? fileList[0].status === "uploading" : false;
    setLoading(loading);
    if (fileList.length > 1) {// 只会保留最新的上传文件,之前的会被清除
      const file = fileList[fileList.length - 1];
      setFileList([file] as any);
      setSecondTimer([file]);
    } else {
      setFileList(fileList);
      setSecondTimer(fileList);
    }
  };

  // 下载新增模板文件
  function downloadAddModelFun() {
    setDownLoading('add');
    downloadFile('/api/mb/monitoring-vehicle/export/vehicleTemplate', 'get', '车辆新增模板.xls', undefined, () => { setDownLoading('') });
  }

  // 下载绑定模板文件
  function downloadBindModelFun() {
    setDownLoading('bind');
    downloadFile('/api/mo/monitoring-object/downloadTemplate', 'get', '车辆绑定模板.xls', undefined, () => { setDownLoading('') });
  }

  // 下载失败列表
  function downloadErrorList(type: string) {
    setErrorLoading(true);
    downloadFile(`/api/mb/monitoring-vehicle/importInfoVehicleError/${type}`, 'get', '失败列表.xls', undefined, () => { setErrorLoading(false) });
  }

  // 获取导入提示语
  function getMessage() {
    if (fileList.length > 0) {
      const len = fileList.length - 1;
      const currentFile: any = fileList[len];
      if (loading) {
        return <Alert message="文件导入中,无法关闭!" type="error" showIcon />;
      } else if (currentFile.status !== 'uploading') {
        const { response, response: { code, msg } } = currentFile;
        if (code === 200) {
          const { data: { successNum, errorNum, importType } } = response;
          if (errorNum === 0) {
            return <Alert message={`导入成功,已成功导入${successNum}条数据!`} type="success" showIcon />
          } else {
            return <Alert
              message={
                <div>
                  成功导入{successNum}条数据,{errorNum}条导入失败,
                                        <Button loading={errorLoading} disabled={secondCount === 0} type='link' className={styles.downLink} onClick={() => { downloadErrorList(importType) }}>下载失败列表</Button>
                                        ({secondCount > 0 ? `请尽快下载,${secondCount}分钟后失效` : '下载链接已失效'})
                                        </div>
              }
              type="warning"
              showIcon
            />
          }
        } else if (msg) {
          return <Alert message={msg} type="error" showIcon />;
        }
      }
    }
    return null;
  }

  return (
    <Modal
      title="导入数据"
      visible={modalVisible}
      width={800}
      footer={null}
      getContainer={false}
      onCancel={() => { !loading ? changeVisible({ importVisible: false }) : null }}
    >
      <Row className={styles.importRow} gutter={12}>
        <Col span={3}>
          <label title="上传附件">上传附件:</label>
        </Col>
        <Col span={20}>
          <Upload
            disabled={loading}
            accept=".xls,.xlsx"
            headers={{
              'Authorization': `Bearer ${getStore('token')}`
            }}
            action='/api/mooverload/monitoring-vehicle/import/vehicle'
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            <Button>
              <UploadOutlined /> 上传文件
                        </Button>
          </Upload>
          <div className={styles.importMsg}>支持扩展名：.xls和xlsx，文件最大2M，最大支持一次导入5000行</div>
        </Col>
      </Row>
      <Row className={styles.importRow} gutter={12}>
        <Col span={3}>
          <label title="下载模板">下载模板:</label>
        </Col>
        <Col span={20}>
          <Button type='link' className={styles.downLink} loading={downLoading === 'add'} onClick={downloadAddModelFun}>车辆新增模板</Button>
          <Button type='link' className={styles.downLink} loading={downLoading === 'bind'} onClick={downloadBindModelFun}>车辆绑定模板</Button>
        </Col>
      </Row>
      <Row className={styles.importRow} gutter={12}>
        <Col span={20} push={3}>
          {getMessage()}
        </Col>
      </Row>
    </Modal>
  )
}

export default ImportModal;