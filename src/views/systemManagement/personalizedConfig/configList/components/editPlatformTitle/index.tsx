import React, { useEffect, useRef, memo } from "react";
import { EditDrawer } from '@/common';
import { Form, Input, Row, Col, message } from 'antd';
import { personalizationEdit } from '@/server/configureCalendar';
import { componentIProps } from '@/views/systemManagement/personalizedConfig/configList/interface';
import styles from './index.module.less';
import { getStore, setStore } from '@/framework/utils/localStorage';


const EditPlatformTitle = memo((props: componentIProps) => {
  const form = useRef<any>();

  useEffect(() => {
    if (props.visible) {
      const platformTitle = props.dataSource.platformTitle;
      form.current.setFieldsValue({
        platformTitle: platformTitle ? platformTitle : 'F3环卫云平台'
      });
    }
  }, [props.visible]);

  /**
   * 提交
   */
  const submit = async () => {
    const values = await form.current.validateFields();
    if (values) {
      const result = await personalizationEdit({
        id: props.queryParam.pageId,
        organizationId: props.queryParam.orgId,
        platformTitle: values.platformTitle,
        type: 4,
      });

      if (result) {
        if (props.queryParam.orgId === getStore('orgId')) {
          const headerTitle: any = document.getElementById('header_title');
          let personalizedConfig: any = getStore('personalizedConfig');
          personalizedConfig = JSON.parse(personalizedConfig);
          personalizedConfig.platformTitle = values.platformTitle;

          setStore('personalizedConfig', personalizedConfig);
          headerTitle.innerHTML = values.platformTitle;
          document.title = values.platformTitle;
        }
        message.success('修改成功')
        close();
      } else {
        message.error('修改失败')
      }
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


  return (
    <EditDrawer
      title={'平台标题修改'}
      width={500}
      visible={props.visible}
      onClose={() => close()}
      onConfirm={submit}
      getContainer={props.getContainer}
    >
      <Form ref={form}
        initialValues={{
          platformTitle: '中砼云平台'
        }}
      >
        <Row>
          <Col span={24} className={styles.title}>
            <label><span>*</span>平台标题</label>
            <Form.Item
              style={{ marginTop: 10 }}
              name="platformTitle"
              rules={[{ required: true, message: '平台标题不能为空' }]}
            >
              <Input autoComplete='off' maxLength={8} placeholder="请输入平台标题" allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </EditDrawer >
  )
})

export default EditPlatformTitle;

