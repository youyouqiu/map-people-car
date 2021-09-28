import React, { useEffect, useState, memo } from "react";
import { Modal } from 'antd';
import favicon from '@/static/image/favicon.ico';
import styles from '../../index.module.less'
import { PreviewIProps } from '../../interface'

const PreviewPlatformIco = memo((props: PreviewIProps) => {
  const [url, setUrl] = useState();

  useEffect(() => {
    if (props.visible) {
      setUrl(props.dataSource.platformIco ? props.dataSource.platformIco : favicon)
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
      title="平台网页标题ico"
      visible={props.visible}
      onCancel={() => close()}
      className={styles.preview}
    >
      <div style={{ width: '100%', height: '100%', textAlign: "center" }}>
        <img src={url} />
      </div>
    </Modal>
  )
})

export default PreviewPlatformIco;