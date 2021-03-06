import React, { memo, useState, useEffect, useRef } from 'react';
import { Badge, Modal, List, Descriptions, Progress, Radio, Input, Pagination, Popconfirm, message, Tooltip } from 'antd';
import { CloudDownloadOutlined, CloseCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { queryExportList, deleteExportListOne, listenerUrl, sendUrl } from '@/server/common';
import { getStore } from "../../framework/utils/localStorage";
import moment from 'moment';
import styles from './index.module.less';
import pdfIcon from '@/static/image/pdfIcon.svg';
import docxIcon from '@/static/image/docx.svg';
import xlsxIcon from '@/static/image/xlsx.svg';
import txtIcon from '@/static/image/txt.svg';
import unkownIcon from '@/static/image/unkown.svg';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { download } from '@/framework/utils/function';

interface ISelector {
  root: any;
};

const Index = memo(() => {
  const [dotStatus, setDotStatus] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<{
    size: number;
    page: number;
    status?: string;
    keyword?: string;
    orderType?: string;
    orderField?: string;
  }>({
    size: 10,
    page: 1,
    orderType: 'DESC',
    orderField: 'createDataTime'
  });
  const [data, setData] = useState<Array<any> | undefined>();
  const [total, setTotal] = useState<number>(0);
  const [radioValue, setRadioValue] = useState<string>('');
  const managementRef = useRef<{
    listData: Array<any> | undefined;
    progreeTimeout: any;
    globalVisible: boolean;
  }>({
    listData: undefined,
    progreeTimeout: null,
    globalVisible: false,
  });

  const dispatch = useDispatch();

  const { globalSocket, exportManagementVisible } = useSelector((
    {
      root: { globalSocket, exportManagementVisible }
    }: ISelector
  ) => {
    return {
      globalSocket,
      exportManagementVisible,
    }
  }, shallowEqual);

  useEffect(() => {
    setVisible(exportManagementVisible);
    if (exportManagementVisible) {
      managementRef.current.globalVisible = true;
      setDotStatus(false);
    }
  }, [exportManagementVisible]);

  useEffect(() => {
    if (globalSocket) {
      onSocketSucces();
    } else {
      onSocketClose();
    }
  }, [globalSocket]);

  /**
   * socket????????????
   */
  const onSocketSucces = () => {
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = { data: {}, desc: { type: 0 } } //??????
    if (globalSocket) {
      globalSocket.subscribeAndSend(listenerUrl, exportListener, sendUrl, header, requestStr);
    }
  };

  /**
   * socket??????
   */
  const onSocketClose = () => {
    if (managementRef.current.progreeTimeout) {
      clearTimeout(managementRef.current.progreeTimeout);
      managementRef.current.progreeTimeout = null;
    }
  };

  /**
   * ??????????????????
   * socket??????????????????????????????
   */
  const exportListener = (res: any) => {
    const t: any = JSON.parse(res.body);
    if (managementRef.current.globalVisible) {
      if (Array.isArray(managementRef.current.listData)) {
        if (managementRef.current.progreeTimeout) {
          clearTimeout(managementRef.current.progreeTimeout);
          managementRef.current.progreeTimeout = null;
        }
        const d = managementRef.current.listData.map((item) => {
          if (item.id === t.id) {
            let I: Record<string, any>;
            if (t.status === 2) { // ??????????????????
              I = Object.assign({}, item, { status: t.status, size: t.size, webUrl: t.webUrl });
            } else {
              I = Object.assign({}, item, { status: t.status });
            }
            return I;
          }
          return item;
        });
        const nd = returnData(d);
        managementRef.current.listData = nd;
        setData(nd);
      }
    } else {
      setDotStatus(true);
    }
  };

  /**
   * ????????????????????????
   */
  const onClick = () => {
    setVisible(true);
    managementRef.current.globalVisible = true;
    setDotStatus(false);
  };

  const handleCancel = () => {
    managementRef.current.listData = undefined;
    if (managementRef.current.progreeTimeout) {
      clearTimeout(managementRef.current.progreeTimeout);
      managementRef.current.progreeTimeout = null;
    }
    setData(undefined);
    setVisible(false);
    managementRef.current.globalVisible = false;
    setRadioValue('');
    setQueryParams({
      size: 10,
      page: 1,
      orderType: 'DESC',
      orderField: 'createDataTime'
    });
    dispatch({ type: 'root/setExportManagementVisible', payload: false });
  };

  useEffect(() => {
    if (visible) {
      queryLoad();
    }
  }, [visible, queryParams]);

  /**
   * ????????????????????????
   */
  const queryLoad = () => {
    if (managementRef.current.progreeTimeout) {
      clearTimeout(managementRef.current.progreeTimeout);
      managementRef.current.progreeTimeout = null;
    }
    managementRef.current.listData = undefined;
    setData(undefined);
    queryExportList(queryParams).then((res: any) => {
      if (res.code === 200) {
        const d = returnData(res.data);
        managementRef.current.listData = d;
        setData(d);
        setTotal(res.total);
      }
    });
  };

  /**
   * ????????????????????????
   */
  const returnData = (d: Array<any>) => {
    let flag = false; // ???????????????????????????????????????????????????????????????
    const D = d.map((item: any) => {
      const downloadTime = moment(item.downloadTime).unix();
      const nowTime = moment().unix();
      const progress = nowTime - downloadTime <= 85 ? nowTime - downloadTime : 85;
      if (item.status === 1 && progress < 85) {
        flag = true;
      }
      switch (item.status) {
        case 0:
          item.progress = 0;
          return item;
        case 1:
          item.progress = progress;
          return item;
        case 2:
          item.progress = 100;
          return item;
        case 3:
          item.progress = item.progress ? item.progress : progress;
          return item;
      }
    });
    /**
     * ??????????????????????????????
     */
    if (managementRef.current.progreeTimeout) {
      clearTimeout(managementRef.current.progreeTimeout);
      managementRef.current.progreeTimeout = null;
    }
    if (flag) {
      managementRef.current.progreeTimeout = setTimeout(() => {
        const data = returnData(D);
        managementRef.current.listData = data;
        setData(data);
      }, 1000)
    };
    return D;
  };

  /**
   * ??????????????????
   */
  const returnStatus = (item: any) => {
    switch (item.status) {
      case 0:
        return '?????????';
      case 1:
        return '?????????';
      case 2:
        return (
          // <a href={item.webUrl} download={item.fileName}>??????</a>
          <span style={{ color: 'rgb(69,144, 247)', cursor: 'pointer' }} onClick={() => download(item.webUrl, item.fileName)}>??????</span>
        );
      case 3:
        return '??????';
    }
  };

  /**
   * ?????????????????????
   */
  const onPageChange = (page: number, pageSize: number) => {
    setQueryParams(Object.assign({}, queryParams, { page, size: pageSize }));
  }

  /**
   * ???????????????????????????
   */
  const onShowSizeChange = (current: number, size: number) => {
    setQueryParams(Object.assign({}, queryParams, { page: current, size }));
  }

  /**
   * ??????????????????
   */
  const onRadioGroupChange = (e: any) => {
    const value = e.target.value;
    setRadioValue(value);
    setQueryParams(Object.assign({}, queryParams, { status: value }));
  }

  /**
   * ????????????????????????
   */
  const onSearch = (value: string) => {
    setQueryParams(Object.assign({}, queryParams, { keyword: value }));
  }

  /**
   * ???????????????
   */
  const renderProgress = (item: any) => {
    let status: "normal" | "exception" | "active" | "success" | undefined = undefined;
    switch (item.status) {
      case 0:
        status = 'normal';
        break;
      case 1:
        status = 'active';
        break;
      case 2:
        status = 'success';
        break;
      case 3:
        status = 'exception';
        break;
    };
    return (
      <Progress size={'small'} percent={item.progress} status={status} />
    );
  };

  /**
   * ??????????????????????????????
   */
  const onDeleteExportData = (id: string) => {
    deleteExportListOne({ id }).then((res: any) => {
      if (res) {
        queryLoad();
      }
    });
  };

  /**
   * ??????????????????
   */
  const returnFileIcon = (name: string) => {
    if (name) {
      const str = name.split('.');
      const type = str.pop();
      let icon;
      switch (type) {
        case 'xls':
          icon = xlsxIcon;
          break;
        case 'xlsx':
          icon = xlsxIcon;
          break;
        case 'txt':
          icon = txtIcon;
          break;
        case 'doc':
          icon = docxIcon;
          break;
        case 'pdf':
          icon = pdfIcon;
          break;
        default:
          icon = unkownIcon;
      };
      return (
        <img src={icon} width={45} height={45} />
      );
    }
  };

  return (
    <>
      <div className={styles['badge-container']} onClick={onClick} id={'badgeContainer'}>
        <Tooltip title={'????????????'}>
          <Badge dot={dotStatus}>
            <CloudDownloadOutlined style={{ fontSize: 20, verticalAlign: '-6px', color: '#ffffff' }} />
          </Badge>
        </Tooltip>
      </div>
      <Modal
        title="????????????"
        visible={visible}
        onCancel={handleCancel}
        footer={null}
        centered={true}
        destroyOnClose={true}
        width={1200}
      >
        <div className={styles['search-selected-list']}>
          <div className={styles['button-list']}>
            <Radio.Group value={radioValue} onChange={onRadioGroupChange}>
              <Radio.Button value="">??????</Radio.Button>
              <Radio.Button value="0">?????????</Radio.Button>
              <Radio.Button value="1">?????????</Radio.Button>
              <Radio.Button value="2">??????</Radio.Button>
              <Radio.Button value="3">??????</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles['input-view']}>
            <Input.Search placeholder="??????????????????" allowClear={true} onSearch={onSearch} />
          </div>
        </div>
        <List
          loading={!data}
          itemLayout="horizontal"
          dataSource={data}
          split={true}
          size={'small'}
          style={{ height: '500px', overflow: 'auto' }}
          renderItem={item => (
            <List.Item>
              <Descriptions column={15}>
                <Descriptions.Item span={6}>
                  <List.Item.Meta
                    avatar={
                      returnFileIcon(item.fileName)
                    }
                    title={item.fileName}
                    description={item.source}
                  />
                </Descriptions.Item>
                <Descriptions.Item span={1}>{item.size}</Descriptions.Item>
                <Descriptions.Item span={3}>????????????<br />{item.createDataTime}</Descriptions.Item>
                <Descriptions.Item span={3}><div style={{ width: '200px' }}>{renderProgress(item)}</div></Descriptions.Item>
                <Descriptions.Item span={1}>{returnStatus(item)}</Descriptions.Item>
                <Descriptions.Item span={1} style={{ textAlign: 'center' }}>
                  <Popconfirm
                    title="?????????????????????"
                    okText="??????"
                    cancelText="??????"
                    onConfirm={() => onDeleteExportData(item.id)}
                  >
                    <CloseCircleOutlined style={{ fontSize: 20, color: '#c4c4c4' }} />
                  </Popconfirm>
                </Descriptions.Item>
              </Descriptions>
            </List.Item>
          )}
        />
        {
          // (data && data.length > 0) && (
          <div className={styles['footer']}>
            <div className={styles['des']}>
              <span>????????????????????????????????????????????????</span>
            </div>
            <div className={styles['pagination-list']}>
              <Pagination
                total={total}
                showSizeChanger
                showQuickJumper
                onChange={onPageChange}
                onShowSizeChange={onShowSizeChange}
              />
            </div>
          </div>
          // )
        }
      </Modal>
    </>
  )
});

export default Index;

interface IFileProps {
  children?: any;
  onClick?: Function;
  status?: boolean;
  tips?: number;
}

export const FileAnimation = (props: IFileProps) => {
  const exportRef: React.RefObject<any> = React.createRef(); // ??????
  const [style, setStyle] = useState<any>({
    left: 0,
    top: 0,
  });
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(false);

  useEffect(() => {
    if (exportRef && !status) {
      const top = exportRef.current.getBoundingClientRect().top;
      const left = exportRef.current.getBoundingClientRect().left;
      setStyle({ top, left });
      setStatus(true);
    }
  }, [exportRef]);

  const onClick = () => {
    if (props.status) {
      setVisible(true);
    } else {
      if (props.tips == 0) {
        message.warning('???????????????????????????????????????');
      } else if (props.tips == 1) {
        message.warning('?????????????????????????????????100??????')
      }
    }
  };

  useEffect(() => {
    if (visible) {
      const badgeContainer: any = document.getElementById('badgeContainer');
      const offsetLeft = badgeContainer.offsetLeft;
      const offsetTop = badgeContainer.offsetTop;
      setStyle({
        left: offsetLeft,
        top: offsetTop,
        zIndex: 999,
      });
      setTimeout(() => {
        setVisible(false);
        if (typeof props.onClick === 'function') {
          props.onClick();
        }
      }, 400);
    } else {
      const top = exportRef.current.getBoundingClientRect().top;
      const left = exportRef.current.getBoundingClientRect().left;
      setStyle({ top, left });
    }
  }, [visible]);

  return (
    <>
      {
        visible && (
          <div
            className={styles['file-animation-container']}
            style={style}
          >
            <FolderOpenOutlined className={styles['file-ico']} />
          </div>
        )
      }
      <div ref={exportRef} onClick={onClick} style={{ display: 'inline-block' }}>
        {
          props.children
        }
      </div>
    </>
  )
};
