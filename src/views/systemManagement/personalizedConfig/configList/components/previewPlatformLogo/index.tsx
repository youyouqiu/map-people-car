import React, { useEffect, useState, memo } from "react";
import { Modal } from 'antd';
import Logo from '@/static/image/logo1.png';
import styles from '../../index.module.less';
import { PreviewIProps } from '../../interface';

const PreviewPlatformLogo = memo((props: PreviewIProps) => {
  const [url, setUrl] = useState();

  useEffect(() => {
    if (props.visible) {
      setUrl(props.dataSource.platformLogo ? props.dataSource.platformLogo : Logo)
    }
  }, [props.visible])

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
    <Modal
      title="平台首页Logo"
      visible={props.visible}
      onCancel={() => close()}
      className={styles.preview}
    >
      <div style={{ width: 100, margin: '0 auto' }}>
        <img style={{ maxWidth: '100%', display: 'inline-block', height: 'auto' }} src={url} />
      </div>
    </Modal>
  )
})

export default PreviewPlatformLogo;