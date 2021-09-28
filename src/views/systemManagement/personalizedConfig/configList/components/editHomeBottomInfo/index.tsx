import React, { useEffect, useRef, memo } from "react";
import { EditDrawer } from '@/common';
import { Form, Input, Row, Col, message } from 'antd';
import { personalizationEdit } from '@/server/configureCalendar';
import styles from './index.module.less';
import { regularText } from '@/common/rules';
import { componentIProps } from '@/views/systemManagement/personalizedConfig/configList/interface';
import { setStore, getStore } from "@/framework/utils/localStorage";
const { TextArea } = Input;


const EditHomeBottomInfo = memo((props: componentIProps) => {
  const form = useRef<any>();

  useEffect(() => {
    if (props.visible) {
      const data = props.dataSource;
      form.current.setFieldsValue({
        versionInfo: data.versionInfo ? data.versionInfo : '@2015-2017中位(北京)科技有限公司',
        recordNo: data.recordNo ? data.recordNo : '京ICP备15041746号-1'
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
        type: 5,
        versionInfo: values.versionInfo,
        domainName: values.domainName,
        recordNo: values.recordNo
      });

      if (result) {
        if (props.queryParam.orgId === getStore('orgId')) {
          let personalizedConfig: any = getStore('personalizedConfig');
          personalizedConfig = JSON.parse(personalizedConfig);
          personalizedConfig.versionInfo = values.versionInfo;
          personalizedConfig.recordNo = values.recordNo;
          setStore('personalizedConfig', personalizedConfig)
        }
        message.success('修改成功')
        close()
      } else {
        message.error('修改失败')
      }
    }
  }

  /**
   * 关闭抽屉
   * @param type 
   */
  const close = (type?: boolean) => { // 关闭按钮事件
    if (props.onClose) {
      props.onClose(type)
    }
  }

  return (
    <EditDrawer
      title={'平台首页置底信息修改'}
      width={500}
      visible={props.visible}
      onClose={() => close()}
      onConfirm={submit}
      getContainer={props.getContainer}
    >
      <Form ref={form}
        initialValues={{
          versionInfo: '©2015-2017中位（北京）科技有限公司',
          domainName: 'www.zwlbs.com',
          recordNo: '京ICP备15041746号-1'
        }}
      >
        <Row>
          <Col span={24} className={styles.title}>
            <label><span>*</span>版本信息</label>
            <Form.Item
              style={{ marginTop: 10 }}
              name="versionInfo"
              rules={[
                { required: true, message: '版本信息不能为空' },
                regularText
              ]}
            >
              <TextArea placeholder="请输入版本信息" maxLength={25} allowClear />
            </Form.Item>
          </Col>
          <Col span={24} className={styles.title}>
            <label><span>*</span>备案编号</label>
            <Form.Item
              style={{ marginTop: 10 }}
              name="recordNo"
              rules={[
                { required: true, message: '备案编号不能为空' },
                regularText
              ]}
            >
              <Input autoComplete='off' placeholder="请输入备案编号" maxLength={50} allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </EditDrawer>
  )
});


export default EditHomeBottomInfo;

