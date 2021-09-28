import React, { useEffect, useState, memo } from "react";
import { EditDrawer } from '@/common';
import { Row, Col, Radio, Input, Button, Upload, message } from 'antd';
import styles from './index.module.less'
import logo from '@/static/image/logo.png';
import bg from '@/static/image/bg.jpg';
import { UnlockOutlined, UserOutlined } from '@ant-design/icons';
import { personalizationEdit } from '@/server/configureCalendar';
import { setStore, getStore } from "@/framework/utils/localStorage";
import { componentIProps } from '@/views/systemManagement/personalizedConfig/configList/interface';


const EditLoginConfig = memo((props: componentIProps) => {
  const [logoImg, setLogoImg] = useState(logo); //登录框logo图
  const [bgImg, setBgImg] = useState(bg) //登录背景图
  const [loginDialog, setLoginDialog] = useState<any>(2);
  const [logoPosition, setLogoPosition] = useState(3);
  const [loginDialogStyle, setLoginDialogStyle] = useState({ //登录框位置
    left: '336px',
    top: '56px'
  });
  const [logoPositionStyle, setlogoPositionStyle] = useState({ //登录框logo位置
    left: '336px',
    top: '56px'
  });



  useEffect(() => {
    if (props.visible) {
      const data = props.dataSource;
      setLoginDialog(data.loginBoxPosition ? data.loginBoxPosition : 2);
      loginBoxPosition(data.loginBoxPosition ? data.loginBoxPosition : 2);
      setLogoPosition(data.loginLogoPosition ? data.loginLogoPosition : 3);

      if (data.loginLogoPosition) {
        loginLogoPosition(data.loginLogoPosition, false);
      } else {
        setlogoPositionStyle({
          left: '336px',
          top: '56px'
        })
      }
      setBgImg(data.loginBackgroundImage ? data.loginBackgroundImage : bg);
      setLogoImg(data.loginLogoImage ? data.loginLogoImage : logo);
    }
  }, [props.visible])


  /**
   * 登录框位置
   * @param e 
   */
  const handleLoginDialog = (e: any) => {
    const value = e.target.value;
    setLoginDialog(value);
    loginBoxPosition(value);
  }

  /**
   * 登录框定位
   * @param value 
   */
  const loginBoxPosition = (value: number) => {
    let num;
    if (value == 1) {
      num = '20px'
      setLoginDialogStyle({
        left: '20px',
        top: '56px'
      })
    } else if (value == 2) {
      num = '336px'
      setLoginDialogStyle({
        left: '336px',
        top: '56px'
      })
    } else {
      num = '635px'
      setLoginDialogStyle({
        left: '635px',
        top: '56px'
      })
    }

    if (logoPosition == 3) {
      setlogoPositionStyle({
        left: num,
        top: '56px'
      })
    }
  }

  /**
   * logo位置
   * @param e 
   */
  const handleLogoPosition = (e: any) => {
    const value = e.target.value;
    setLogoPosition(value);
    loginLogoPosition(value, true);
  }

  /**
   * logo位置定位
   * @param value 
   * @param flag 
   */
  const loginLogoPosition = (value: number, flag: boolean) => {
    if (value == 1) {
      setlogoPositionStyle({
        left: '-30px',
        top: '25px'
      })
    } else if (value == 2) {
      setlogoPositionStyle({
        left: '679px',
        top: '25px'
      })
    } else if (flag) {
      setlogoPositionStyle(loginDialogStyle)
    }
  }

  /**
   * 上传图片校验
   * @param file 
   * @returns 
   */
  const beforeUpload = (file: any) => {
    const fileTypes = ['jpg', 'png', 'jpeg', 'svg', 'gif'];
    const filename = file.name.toLowerCase(), _fileTypes = filename.split('.'), fileType = _fileTypes[_fileTypes.length - 1];
    const legalFileType = fileTypes.findIndex(item => item === fileType);
    if (legalFileType == -1) {
      message.error('文件格式不正确，请重新选择！');
    }
    return legalFileType != -1
  }

  /**
   * 上传背景图
   * @param list 
   */
  const handleFileChangeBg = (list: any) => {
    if (list.file.status == 'done') {
      const data = JSON.parse(list.file.response.data);
      const url = data.webUrl;
      setBgImg(url)
    }
  }

  /**
   * 上传LOGO图
   * @param list 
   */
  const handleFileChangeLogo = (list: any) => {
    if (list.file.status == 'done') {
      const data = JSON.parse(list.file.response.data);
      const url = data.webUrl;
      setLogoImg(url)
    }
  }

  /**
   * 提交
   */
  const submit = async () => {
    const newBgImg = [...bgImg.split('/')];
    let loginBackgroundImage: any;
    if (newBgImg[newBgImg.length - 1] == 'bg.jpg') {
      loginBackgroundImage = '';
    } else {
      loginBackgroundImage = bgImg;
    }


    const newLogoImg = [...logoImg.split('/')];
    let loginLogoImage: any;
    if (newLogoImg[newLogoImg.length - 1] == 'logo.png') {
      loginLogoImage = ''
    } else {
      loginLogoImage = logoImg;
    }

    const result = await personalizationEdit({
      organizationId: props.queryParam.orgId,
      id: props.queryParam.pageId,
      loginBackgroundImage,
      loginLogoImage,
      loginBoxPosition: loginDialog,
      loginLogoPosition: logoPosition,
      type: 1
    });

    if (result) {
      if (props.queryParam.orgId === getStore('orgId')) {
        let personalizedConfig: any = getStore('personalizedConfig');
        personalizedConfig = JSON.parse(personalizedConfig);
        personalizedConfig.loginBoxPosition = loginDialog;
        personalizedConfig.loginLogoPosition = logoPosition;
        personalizedConfig.loginBackgroundImage = loginBackgroundImage == '' ? null : loginBackgroundImage;
        personalizedConfig.loginLogoImage = loginLogoImage == '' ? null : loginLogoImage;
        setStore('personalizedConfig', personalizedConfig);
      }
      message.success('修改成功');
      close(true);
    } else {
      message.error('修改失败');
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
      title={'登录页个性化设置修改'}
      width={1000}
      visible={props.visible}
      onClose={() => close()}
      onConfirm={submit}
      getContainer={props.getContainer}
    >
      <Row>
        <Col span={24} style={{ height: 500 }}>
          <div className={styles.bg} style={{ backgroundImage: `url(${bgImg})` }}>
            <div>
              <div className={styles.logoImg} style={logoPositionStyle}>
                <img style={{ width: 160, height: '93%' }} src={logoImg} />
              </div>
              <div className={styles.loginForm} style={loginDialogStyle}>
                <div className={styles.loginTitle}>
                  <h3>登录平台</h3>
                </div>
                <Input className={styles.loginUserName}
                  disabled={true}
                  style={{ backgroundColor: '#e6f6ff' }} size="large" placeholder="用户名"
                  prefix={<UserOutlined style={{ fontSize: '22px', color: '#848484' }} />}
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
      <Row>
        <Col span={12}>
          <div className={styles.position} >
            <span style={{ marginRight: 8 }}>登录框位置:</span>
            <Radio.Group onChange={handleLoginDialog} value={loginDialog} >
              <Radio value={1}>居左</Radio>
              <Radio value={2}>居中</Radio>
              <Radio value={3}>居右</Radio>
            </Radio.Group>
          </div>
          <div className={styles.upload}>
            <span>注：图片大小建议1920x1080左右，格式为PNG、JPG、JPEG、SVG、GIF。</span>

            <div className={styles.uploadBut}>
              <Upload
                // disabled={loading}
                accept=".rar,.zip,.doc,.docx,.pdf,.jpg"
                headers={{
                  'Authorization': `Bearer ${getStore('token')}`
                }}
                action='/api/tool/file'
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleFileChangeBg}
              >
                <Button type='primary' >上传背景图</Button>
              </Upload>
            </div>
          </div>

        </Col>
        <Col span={12}>
          <div className={styles.position}>
            <span style={{ marginRight: 8 }}>LOGO位置:</span>
            <Radio.Group onChange={handleLogoPosition} value={logoPosition}>
              <Radio value={1}>左上</Radio>
              <Radio value={2}>右上</Radio>
              <Radio value={3}>跟随登录框</Radio>
            </Radio.Group>
          </div>
          <div className={styles.upload}>
            <span>注：图片大小建议689x123左右，格式为PNG、JPG、JPEG、SVG、GIF。</span>

            <div className={styles.uploadBut}>
              <Upload
                // disabled={loading}
                accept=".rar,.zip,.doc,.docx,.pdf,.jpg"
                headers={{
                  'Authorization': `Bearer ${getStore('token')}`
                }}
                action='/api/tool/file'
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleFileChangeLogo}
              >
                <Button type='primary' >上传LOGO</Button>
              </Upload>
            </div>
          </div>
        </Col>
      </Row>

    </EditDrawer >
  )

});

export default EditLoginConfig