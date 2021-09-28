import React, { useEffect, useState, memo } from "react";
import { Descriptions, List, Button, message } from 'antd';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { IProps, listData } from './interface';
import styles from './index.module.less';
import { LeftOutlined } from '@ant-design/icons';
import OrgTree from './orgTree';
import { pageDataList, personalizationReset, personalizationPreview } from "@/server/configureCalendar";
import config from '@/framework/config';
import favicon from '@/static/image/favicon.ico';
import indexLogo from '@/static/image/logo1.png';

import EditLoginConfig from './components/editLoginConfig';
import EditPlatformIco from './components/editPlatformIco';
import EditPlatformLogo from './components/editPlatformLogo';
import EditPlatformTitle from "./components/editPlatformTitle";
import EditHomeBottomInfo from './components/editHomeBottomInfo';
import EditPlatformPath from './components/editPlatformPath';
import PreviewPlatformIco from './components/previewPlatformIco';
import PreviewLoginConfig from './components/previewLoginConfig';
import PreviewPlatformLogo from './components/previewPlatformLogo';
import { setStore, getStore } from "@/framework/utils/localStorage";


const ConfigList = memo((props: IProps) => {
  const [isTreeShow, setIsTreeShow] = useState<boolean>(true);
  const [orgInfo, setOrgInfo] = useState<any>({ id: '', name: '' });
  const [pageId, setPageId] = useState<string>('');
  const [dataSource, setDataSource] = useState<any>(listData);
  const [previewData, setPreviewData] = useState<any>([]);
  /**设置 */
  const [editLoginConfigVisible, setEditLoginConfigVisible] = useState<boolean>(false);
  const [editPlatformIcoVisible, setEditPlatformIcoVisible] = useState<boolean>(false);
  const [editPlatformLogoVisible, setEditPlatformLogoVisible] = useState<boolean>(false);
  const [editPlatformTitleVisible, setEditPlatformTitleVisible] = useState<boolean>(false);
  const [editHomeBottomInfoVisible, setEditHomeBottomInfoVisible] = useState<boolean>(false);
  const [editEditPlatformPathVisible, setEditPlatformPathVisible] = useState<boolean>(false);
  /**预览 */
  const [previewLoginConfigVisible, setPreviewLoginConfigVisible] = useState<boolean>(false);
  const [previewPlatformIcoVisible, setPreviewPlatformIcoVisible] = useState<boolean>(false);
  const [previewPlatformLogoVisible, setPreviewPlatformLogoVisible] = useState<boolean>(false);

  useEffect(() => {
    const { orgId, orgName } = props;
    setOrgInfo({ id: orgId, name: orgName });
    queryPageData(orgId);
  }, [props.orgId, props.orgName]);


  /**
   * 获取当前选中组织树节点
   */
  const getSelectTNode = (selectedNode: any) => {
    if (!selectedNode) { return; }
    // setLoading(true);
    setPreviewData([]);
    setOrgInfo({ id: selectedNode.id, name: selectedNode.name });
    queryPageData(selectedNode.id)
  }

  /**
   * 分页
   */
  const queryPageData = async (orgId: string) => {
    const result: any = await pageDataList({ orgId });
    if (result) {
      setPageId(result.id);
      const params = {
        id: result.id,
        orgId: orgInfo.id,
        type: 1
      }
      updatePreview(params, result)
    } else {
      setDataSource(listData);
      setPageId('');
      setPreviewData([]);
    }
    // setLoading(false);
  }

  /**
   * 更新预览数据
   * @param params 
   * @param pageData 
   */
  const updatePreview = async (params: any, pageData: any) => {
    const result: any = await personalizationPreview(params);
    if (result) {
      setPreviewData(result);
      const newData = [...listData];
      newData.map((item: any) => {
        switch (item.key) {
          case 1:
            item.time = pageData.loginUpdateDataTimeStr
            item.UpdateDataUsername = pageData.loginUpdateDataUsername;
            break;
          case 2:
            item.time = pageData.icoUpdateDataTimeStr
            item.UpdateDataUsername = pageData.icoUpdateDataUsername
            break;
          case 3:
            item.time = pageData.logoUpdateDataTimeStr
            item.UpdateDataUsername = pageData.logoUpdateDataUsername
            break;
          case 4:
            item.time = pageData.titleUpdateDataTimeStr
            item.UpdateDataUsername = pageData.titleUpdateDataUsername
            item.picture = `目前设置的平台标题为：${result.platformTitle ? result.platformTitle : 'F3环卫云平台'}`
            break;
          case 5:
            item.time = pageData.infoUpdateDataTimeStr
            item.UpdateDataUsername = pageData.infoUpdateDataUsername
            if (result.versionInfo && result.recordNo) {
              item.picture = `目前设置的平台首页置底信息为：${result.versionInfo},${result.recordNo}`
            } else {
              item.picture = '目前设置的平台首页置底信息为：@2015-2017中位(北京)科技有限公司，京ICP备15041746号-1'
            }
            break;
          case 6:
            item.time = pageData.homeUpdateDataTimeStr
            item.UpdateDataUsername = pageData.homeUpdateDataUsername
            item.picture = `目前设置的平台登录后首页为：${result.homePageCode ? getLoginPageName(result.homePageCode) : '个人中心'}`
            break;
        }
      });
      setDataSource(newData);
    }
  }

  /**
   * 获取登录后首页名称
   */
  const getLoginPageName = (code: string) => {
    const routes: any = config.routes[2].children;
    let name: any = undefined;

    routes.map((item: any) => {
      if (item.code == code) {
        name = item.name;
      }
      if (item.children && item.children.length > 0 && !name) {
        name = getChildrenLoginPageName(item.children, code)
      }
    });

    return name;
  }

  const getChildrenLoginPageName = (data: any, code: string) => {
    let name: any = undefined
    data.map((item: any) => {
      if (item.code == code) {
        name = item.name;
      }
      if (item.children && item.children.length > 0 && !name) {
        name = getChildrenLoginPageName(item.children, code);
      }
    });
    return name;
  }


  /**
   * 预览
   */
  const handlePreviewEvent = (key: number) => {
    switch (key) {
      case 1:
        setPreviewLoginConfigVisible(true)
        break;
      case 2:
        setPreviewPlatformIcoVisible(true)
        break;
      case 3:
        setPreviewPlatformLogoVisible(true)
        break;
    }
  }

  /**
   * 修改
   */
  const drawerEdit = (key: number) => {
    switch (key) {
      case 1:
        setEditLoginConfigVisible(true)
        break;
      case 2:
        setEditPlatformIcoVisible(true)
        break;
      case 3:
        setEditPlatformLogoVisible(true)
        break;
      case 4:
        setEditPlatformTitleVisible(true)
        break;
      case 5:
        setEditHomeBottomInfoVisible(true)
        break;
      case 6:
        setEditPlatformPathVisible(true)
        break;
    }
  }

  /**
   * 恢复默认
   */
  const handleDefaultEvent = async (key: number) => {
    const result = await personalizationReset({
      type: key,
      id: pageId,
      orgId: orgInfo.id
    });

    if (result) {
      let personalizedConfig: any = getStore('personalizedConfig');
      personalizedConfig = JSON.parse(personalizedConfig);

      switch (key) {
        case 2:
          const link = document.getElementsByTagName("link")[0];
          link.setAttribute('href', favicon);
          personalizedConfig.platformIco = favicon;
          break
        case 3:
          const headerLogo = document.getElementById('header_logo');
          headerLogo?.setAttribute('src', indexLogo);
          personalizedConfig.platformLogo = indexLogo;
          break
        case 4:
          const headerTitle: any = document.getElementById('header_title');
          headerTitle.innerHTML = 'F3环卫云平台';
          document.title = 'F3环卫云平台';
          personalizedConfig.platformTitle = 'F3环卫云平台';
          break
      }
      setStore('personalizedConfig', personalizedConfig);
      clearLocalStorage(key);
      queryPageData(orgInfo.id);
      message.success('恢复默认成功')
    }
  }

  /**
   * 清除缓存
   */
  const clearLocalStorage = (key: number) => {
    let personalizedConfig: any = getStore('personalizedConfig');
    personalizedConfig = JSON.parse(personalizedConfig);
    switch (key) {
      case 1:
        personalizedConfig.loginBoxPosition = 2;
        personalizedConfig.loginLogoPosition = 3;
        personalizedConfig.loginBackgroundImage = null;
        personalizedConfig.loginLogoImage = null;
        break;
      case 2:
        personalizedConfig.platformIco = null;
        break;
      case 5:
        personalizedConfig.versionInfo = null;
        personalizedConfig.recordNo = null;
        break;
    }
    setStore('personalizedConfig', personalizedConfig);
  };

  return (
    <div className={styles.container}>
      <LeftOutlined
        className={styles.treeBtn}
        style={isTreeShow ? { transform: 'rotate(0deg)' } : { transform: 'rotate(-180deg)' }}
        onClick={() => {
          setIsTreeShow(!isTreeShow)
        }}
      />
      <div className={styles.orgTree} style={isTreeShow ? { marginLeft: 0 } : { marginLeft: -300 }}>
        <OrgTree
          refreshCount={0}
          treeNodeClick={getSelectTNode} />
      </div>
      <div className={styles.rightBox} style={isTreeShow ? { width: 'calc(100% - 300px)' } : { width: '100%' }}>
        <h4 className={styles.name}>{orgInfo.name}</h4>
        <h4 className={styles.title} style={{ marginTop: 0 }}><span style={{ marginLeft: 20 }}>登录页</span></h4>
        <List
          itemLayout="horizontal"
          dataSource={dataSource}
          renderItem={(item: any) => (
            item.key != 0 ?
              <List.Item>
                <Descriptions
                  column={6}
                >
                  <Descriptions.Item>
                    <div style={{ fontWeight: "bold", marginLeft: 20 }}>{item.title}</div>
                    <div className={styles.color}>{item.description}</div>
                  </Descriptions.Item>
                  <Descriptions.Item style={{ marginLeft: 20 }}>
                    <div>
                      {
                        item.key == 1 || item.key == 2 || item.key == 3 ?
                          <Button
                            type='link' style={{ padding: '0 4px' }}
                            onClick={() => { handlePreviewEvent(item.key) }}
                          >
                            预览
                          </Button> : ''
                      }
                      {
                        item.key == 1 || item.key == 2 || item.key == 3 ?
                          '|' : ''
                      }
                      <Button
                        type='link' style={{ padding: '0 4px' }}
                        data-key={item.key}
                        onClick={() => drawerEdit(item.key)}
                      // disabled={!hasPermission('修改')}
                      >
                        修改
                      </Button>|
                      <Button
                        type='link' style={{ padding: '0 4px' }}
                        onClick={() => { handleDefaultEvent(item.key) }}
                      // disabled={!hasPermission('恢复默认')}
                      >
                        恢复默认
                      </Button>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item span={2}>
                    <div className={styles.color}>{item.picture}</div>
                    <div className={styles.color}>{item.logo}</div>
                  </Descriptions.Item>
                  <Descriptions.Item style={{ textAlign: 'center' }}>
                    <div className={styles.color}>最后修改时间：</div>
                    <div className={styles.color}>{item.time}</div>
                  </Descriptions.Item>
                  <Descriptions.Item style={{ textAlign: 'center' }}>
                    <div className={styles.color}>修改人：</div>
                    <div className={styles.color}>{item.UpdateDataUsername}</div>
                  </Descriptions.Item>
                </Descriptions>
              </List.Item>
              :
              <h4 className={styles.title}><span style={{ marginLeft: 20 }}>平台首页</span></h4>
          )}
        />
      </div>

      {/** 登录页面配置 */}
      {
        editLoginConfigVisible && <EditLoginConfig
          visible={editLoginConfigVisible}
          queryParam={{ pageId, orgId: orgInfo.id }}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setEditLoginConfigVisible(false);
            queryPageData(orgInfo.id)
          }}
        />
      }

      {/** 平台Ico修改 */}
      {
        editPlatformIcoVisible && <EditPlatformIco
          visible={editPlatformIcoVisible}
          queryParam={{ pageId, orgId: orgInfo.id }}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setEditPlatformIcoVisible(false);
            queryPageData(orgInfo.id)
          }}
        />
      }

      {/** 平台Logo修改 */}
      {
        editPlatformLogoVisible && <EditPlatformLogo
          visible={editPlatformLogoVisible}
          queryParam={{ pageId, orgId: orgInfo.id }}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setEditPlatformLogoVisible(false);
            queryPageData(orgInfo.id)
          }}
        />
      }


      {/** 平台标题修改 */}
      {
        editPlatformTitleVisible && <EditPlatformTitle
          visible={editPlatformTitleVisible}
          queryParam={{ pageId, orgId: orgInfo.id }}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setEditPlatformTitleVisible(false);
            queryPageData(orgInfo.id)
          }}
        />
      }

      {/** 首页底部信息修改 */}
      {
        editHomeBottomInfoVisible && <EditHomeBottomInfo
          visible={editHomeBottomInfoVisible}
          queryParam={{ pageId, orgId: orgInfo.id }}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setEditHomeBottomInfoVisible(false);
            queryPageData(orgInfo.id)
          }}
        />
      }
      {/** 平台登录后首页 */}
      {
        editEditPlatformPathVisible && <EditPlatformPath
          visible={editEditPlatformPathVisible}
          queryParam={{ pageId, orgId: orgInfo.id }}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setEditPlatformPathVisible(false);
            queryPageData(orgInfo.id)
          }}
        />
      }

      {/** 登录页预览 */}
      {
        previewLoginConfigVisible != undefined && <PreviewLoginConfig
          visible={previewLoginConfigVisible}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setPreviewLoginConfigVisible(false);
            queryPageData(orgInfo.id);
          }}
        />
      }

      {/** Ico预览 */}
      {
        previewPlatformIcoVisible != undefined && <PreviewPlatformIco
          visible={previewPlatformIcoVisible}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setPreviewPlatformIcoVisible(false);
            queryPageData(orgInfo.id);
          }}
        />
      }

      {/** Logo预览 */}
      {
        previewPlatformLogoVisible != undefined && <PreviewPlatformLogo
          visible={previewPlatformLogoVisible}
          dataSource={previewData}
          onClose={() => {
            setPreviewData([]);
            setPreviewPlatformLogoVisible(false);
            queryPageData(orgInfo.id);
          }}
        />
      }
    </div>
  )
})

export default connect(
  (state: AllState) => ({
    orgId: state.root.userMessage.organizationId,
    orgName: state.root.userMessage.organizationName
  })
)(ConfigList);