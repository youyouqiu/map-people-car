import React, { useEffect, useState, memo } from "react";
import { EditDrawer } from '@/common';
import { Row, Col, message, TreeSelect } from 'antd';
import { personalizationEdit } from '@/server/configureCalendar';
import { orgGetPermission, userGetPermission } from "@/server/login";
import styles from './index.module.less';
import config from '@/framework/config';
import { componentIProps } from '../../interface';
import { getStore } from '@/framework/utils/localStorage';

const user_type: any = getStore('user_type');

const EditPlatformPath = memo((props: componentIProps) => {
  const [treeData, setTreeData] = useState([]);
  const [treeValue, setTreeValue] = useState('');
  const [path, setPath] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    renderTreeData();
    setTreeValue('3_personal_center');
    setPath('/view/home/personal');
  }, []);

  useEffect(() => {
    if (props.visible) {
      const data = props.dataSource;
      setPath(data.homePage ? data.homePage : '/view/home/personal');
      setTreeValue(data.homePageCode ? data.homePageCode : '3_personal_center');
      setName(data.homePageName ? data.homePageName : '首页');
    }
  }, [props.visible]);

  /**
   * 组织树数据组装
   */
  const renderTreeData = async () => {
    const values: any = user_type == 0 ? await orgGetPermission<any>(null) : await userGetPermission<any>(null);
    if (values) {
      const menu = values.menu;
      const treeData: any = [];
      for (let i = 0; i < menu.length; i++) {
        const item = menu[i];
        if (item.children.length > 0) {
          treeChildern(item.children);
        }
        item.disabled = true;
        item.title = item.name;
        item.key = item.code;
        item.value = item.code;
        treeData.push(item)
      }
      setTreeData(treeData);
    }
  }

  const treeChildern = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.children && item.children.length > 0) {
        treeChildern(item.children)
        item.disabled = true;
      }
      item.title = item.name;
      item.key = item.code;
      item.value = item.code;
    }
  }


  /**
   * 
   *  组织树展开回调
   * @param open 
   */
  const onDropdownVisibleChange = (open: boolean) => {
    if (open) renderTreeData();
  }

  /**
   * 切换
   * @param value 
   */
  const onchange = (value: any) => {
    console.log('value', value);
    setTreeValue(value);
    const routes: any = config.routes[2].children;

    for (let i = 0; i < routes.length; i++) {
      const item: any = routes[i];
      if (item.code == value) {
        setPath(item.path);
        setName(item.name);
        break
      }
      if (item.children && item.children.length > 0) {
        getLogoPath(item.children, value);
      }
    }
  }

  /**
   * 获取路径
   * @param data 
   * @param value 
   */
  const getLogoPath = (data: any, value: string) => {
    for (let i = 0; i < data.length; i++) {
      const item: any = data[i];
      if (item.code == value) {
        setPath(item.path);
        setName(item.name);
        break;
      }
      if (item.children && item.children.length > 0) {
        getLogoPath(item.children, value);
      }
    }
  }

  /**
   * 提交
   */
  const submit = async () => {
    const result = await personalizationEdit({
      id: props.queryParam.pageId,
      organizationId: props.queryParam.orgId,
      type: 6,
      homePage: path,
      homePageCode: treeValue,
      homePageName: name

    });

    if (result) {
      message.success('修改成功')
      close();
    } else {
      message.error('修改失败')
    }
  }

  /**
   * 关闭按钮
   * @param type 
   */
  const close = (type?: boolean) => {
    if (props.onClose) {
      props.onClose(type)
    }
  }


  return (
    <EditDrawer
      title={'平台登录后首页修改'}
      width={500}
      visible={props.visible}
      onClose={() => close()}
      onConfirm={submit}
      getContainer={props.getContainer}
    >
      <Row id="treeSelect">
        <Col span={24} className={styles.title}>
          <label><span>*</span>指定首页</label>
          <TreeSelect
            style={{ width: '100%', marginTop: 10 }}
            listHeight={400}
            value={treeValue}
            treeData={treeData}
            placeholder="请输入平台登录后首页"
            treeDefaultExpandAll
            onChange={onchange}
            onDropdownVisibleChange={onDropdownVisibleChange}
          />
        </Col>
      </Row>
    </EditDrawer >
  )
})

export default EditPlatformPath;