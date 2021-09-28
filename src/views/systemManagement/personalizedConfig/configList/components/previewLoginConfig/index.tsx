import React, { useEffect, useState, memo } from "react";
import { Modal, Row, Col, Input, Button } from 'antd';
import styles from './index.module.less';
import logo from '@/static/image/logo.png';
import bg from '@/static/image/bg.jpg';
import { UnlockOutlined, UserOutlined } from '@ant-design/icons';
import { PreviewIProps } from '../../interface'

const PreviewLoginConfig = memo((props: PreviewIProps) => {
  const [logoImg, setLogoImg] = useState(logo); //登录框logo图
  const [bgImg, setBgImg] = useState(bg) //登录背景图
  const [loginDialogStyle, setLoginDialogStyle] = useState(); //登录框位置 
  const [logoPositionStyle, setlogoPositionStyle] = useState(); //logo位置
  const loginPosition: any = [
    {
      left: '40px',
      top: '140px'
    },
    {
      left: '430px',
      top: '140px'
    },
    {
      left: '820px',
      top: '140px'
    }
  ];
  const logoPosition: any = [
    {
      left: '0px',
      top: '25px'
    },
    {
      left: '880px',
      top: '25px'
    }
  ]

  useEffect(() => {
    if (props.visible) {
      const data = props.dataSource;
      const loginNum: any = data.loginBoxPosition ? data.loginBoxPosition - 1 : 1;
      setLoginDialogStyle(loginPosition[loginNum]);

      const logoNum: any = data.loginLogoPosition ? data.loginLogoPosition - 1 : 2;
      if (logoNum !== 2) {
        setlogoPositionStyle(logoPosition[logoNum])
      } else {
        setlogoPositionStyle(loginPosition[loginNum])
      }

      setBgImg(data && data.loginBackgroundImage ? data.loginBackgroundImage : bg);
      setLogoImg(data && data.loginLogoImage ? data.loginLogoImage : logo);
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
      title="登录页预览"
      visible={props.visible}
      onCancel={() => close()}
      width='1200px'
      className={styles.preview}
    >
      <Row>
        <Col span={24} style={{ height: '600px' }}>
          <div className={styles.bg} style={{ backgroundImage: `url(${bgImg})` }}>
            <div>
              <div className={styles.logoImg} style={logoPositionStyle}>
                <img style={{ width: 160 }} src={logoImg} />
              </div>
              <div className={styles.loginForm} style={loginDialogStyle}>
                <div className={styles.loginTitle}>
                  <h3>登录平台</h3>
                </div>
                <Input className={styles.loginUserName}
                  disabled={true}
                  style={{ backgroundColor: '#e6f6ff' }} size="large" placeholder="用户名"
                  prefix={<UserOutlined />}
                />
                <Input.Password className={styles.loginPassWord}
                  disabled={true} size="large" placeholder="密码"
                  prefix={<UnlockOutlined style={{ fontSize: '22px', color: '#848484' }} />}
                />
                <div className={styles.loginSlider}>
                  <div className={styles.sliderLabelTip}>把我滑到右边试试?</div>
                  <div className={styles.sliderBg}></div>
                  <div className={styles.sliderLabel}>
                  </div>
                </div>
                <Button className={styles.loginButton} type="primary">登录</Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  )
})


export default PreviewLoginConfig;