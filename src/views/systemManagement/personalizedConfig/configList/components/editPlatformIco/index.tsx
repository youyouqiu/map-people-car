import React, { useEffect, useState, memo } from "react";
import { EditDrawer } from '@/common';
import { Row, Col, Upload, message, Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons'
import { getStore, setStore } from '@/framework/utils/localStorage';
import { personalizationEdit } from '@/server/configureCalendar';
import favicon from '@/static/image/favicon.ico';
import styles from './index.module.less';
import { componentIProps } from '@/views/systemManagement/personalizedConfig/configList/interface';


const EditPlatformIco = memo((props: componentIProps) => {
  const [fileList, setFileList] = useState<any>([]);
  const defaultIco: any = [
    { url: favicon, uid: '-1' },
  ];

  useEffect(() => {
    setFileList(defaultIco)
  }, [])

  useEffect(() => {
    if (props.visible) {
      const platformIco = props.dataSource.platformIco;
      setFileList(platformIco ? [{ url: platformIco, uid: '-1' }] : defaultIco)
    }
  }, [props.visible])

  /**
   * 上传icon校验
   * @param file 
   */
  const beforeUpload = (file: any) => {
    if (file.type !== 'image/x-icon') {
      message.error('文件格式不正确，请重新选择！');
      return false
    } else {
      return true;
    }
  }

  /**
   * 上传icon
   * @param list 
   */
  const onChange = (list: any) => {
    const { fileList } = list;
    const fileStateus = list.file.status;

    if (fileStateus == 'uploading') {
      setFileList([fileList[fileList.length - 1]]);
    }

    if (fileStateus == 'done') {
      const data = JSON.parse(list.file.response.data);
      setFileList([
        {
          url: data.webUrl,
          uid: list.file.uid
        }
      ]);
    }
  }

  /**
   * 关闭抽屉
   * @param type 
   */
  const close = (type?: boolean) => {
    if (props.onClose) {
      props.onClose(type)
    }
  }

  /**
   * 表单提交
   */
  const submit = async () => {
    const urlList = [...fileList[0].url.split('/')];
    let platformIco: any;
    if (urlList[urlList.length - 1] == "favicon.ico") {
      platformIco = ''
    } else {
      platformIco = fileList[0].url
    }

    const result = await personalizationEdit({
      type: 2,
      platformIco,
      id: props.queryParam.pageId,
      organizationId: props.queryParam.orgId
    });

    if (result) {
      if (props.queryParam.orgId === getStore('orgId')) {
        const link = document.getElementsByTagName("link")[0];
        link.setAttribute('href', platformIco);

        let personalizedConfig: any = getStore('personalizedConfig');
        personalizedConfig = JSON.parse(personalizedConfig);
        personalizedConfig.platformIco = platformIco;
        setStore('personalizedConfig', personalizedConfig);
      }
      message.success('修改成功');
      close();
    } else {
      message.error('修改失败')
    }
  }

  return (
    <EditDrawer
      title={'平台ICO修改'}
      width={500}
      visible={props.visible}
      onClose={() => close()}
      onConfirm={submit}
      getContainer={props.getContainer}
    >
      <Row>
        <Col span={24} className={styles.upload}>
          <span style={{ fontSize: 15 }}>ICO图标</span>
          <Upload
            headers={{
              'Authorization': `Bearer ${getStore('token')}`
            }}
            action='/api/tool/file'
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={onChange}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
        </Col>

        <Col span={24} className={styles.message}>
          <Alert
            message="1、图片格式要求ico格式；"
            description="2、图片大小建议正方形如(32x32、64x64、128x128)左右；"
            type="warning"
            showIcon
          />
        </Col>
      </Row>
    </EditDrawer >
  )
});

export default EditPlatformIco