import React, { useEffect, useState, memo } from "react";
import { EditDrawer } from '@/common';
import { Row, Col, Upload, message, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons'
import { personalizationEdit } from '@/server/configureCalendar';
import indexLogo from '@/static/image/logo1.png';
import styles from './index.module.less';
import { componentIProps } from '@/views/systemManagement/personalizedConfig/configList/interface';
import { getStore, setStore } from '@/framework/utils/localStorage';

const EditPlatformLogo = memo((props: componentIProps) => {
  const [fileList, setFileList] = useState<any>([]);
  const defaultLogo: any = [
    { url: indexLogo, uid: '-1' },
  ];

  useEffect(() => {
    setFileList(defaultLogo);
  }, []);

  useEffect(() => {
    if (props.visible) {
      const platformLogo = props.dataSource.platformLogo;
      setFileList(platformLogo ? [{ url: platformLogo, uid: '-1' }] : defaultLogo);
    }
  }, [props.visible]);


  /**
   * 上传Logo
   * @param list 
   */
  const handleChange = (list: any) => {
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
   * 提交
   */
  const submit = async () => { //提交
    const urlList = [...fileList[0].url.split('/')];
    let platformLogo;
    if (urlList[urlList.length - 1] == "indexLogo.svg") {
      platformLogo = indexLogo;
    } else {
      platformLogo = fileList[0].url;
    }

    const result = await personalizationEdit({
      type: 3,
      platformLogo,
      id: props.queryParam.pageId,
      organizationId: props.queryParam.orgId
    });

    if (result) {
      if (props.queryParam.orgId === getStore('orgId')) {
        const headerLogo = document.getElementById('header_logo');
        let personalizedConfig: any = getStore('personalizedConfig');
        personalizedConfig = JSON.parse(personalizedConfig);
        personalizedConfig.platformLogo = platformLogo;

        setStore('personalizedConfig', personalizedConfig);
        headerLogo?.setAttribute('src', platformLogo);
      }

      message.success('修改成功')
      close();
    } else {
      message.error('修改失败')
    }
  }


  return (
    <EditDrawer
      title={'平台LOGO修改'}
      width={500}
      visible={props.visible}
      onClose={() => close()}
      onConfirm={submit}
      getContainer={props.getContainer}
    >
      <Row>
        <span style={{ fontSize: 15 }}>LOGO图标</span>
        <Col span={24} className={styles.upload}>
          <Upload
            headers={{
              'Authorization': `Bearer ${getStore('token')}`
            }}
            action='/api/tool/file'
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
        </Col>

        <Col span={24} className={styles.message}>
          <Alert
            message="图片大小建议38x38左右"
            type="warning"
            showIcon
          />
        </Col>
      </Row>
    </EditDrawer >
  )
})

export default EditPlatformLogo;

