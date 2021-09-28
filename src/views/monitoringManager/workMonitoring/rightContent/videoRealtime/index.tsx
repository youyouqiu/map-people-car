/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useState, useEffect, useRef } from 'react';
import { Drawer, message, Switch, Row, Col } from 'antd';
import styles from './index.module.less';
import { VideoPlayer } from 'react-plugin-library';
import ReactDOM from 'react-dom';
import { getMonitorVideoSetting } from '@/server/monitorManager';
import { getStore } from "@/framework/utils/localStorage";
import { CarOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { getOnWorkStatus, getWorkStatus, noImg } from '../../publicFun';
import { getMonitorWindowInfo } from '@/server/workMonitoring';
import _ from 'lodash';
interface IProps {
  getContainer: any
  videoParam: any
}

const VideoRealtime = memo((props: IProps) => {
  const [visible, setVisible] = useState<boolean>(false); //抽屉显示隐藏
  const [isVideoPlay, setisVideoPlay] = useState<boolean>(true); //video播放暂停按钮切换
  const [videoPlaySuccessMap, setVideoPlaySuccessMap] = useState<any>(new Map()); //video播放成功数据
  const [videoBasicInfo, setVideoBasicInfo] = useState<any>(); //视频数据
  const [fullScreenFlag, setFullScreenFlag] = useState<boolean>(false); //全屏
  const [monitorInfo, setMonitorInfo] = useState<any>({}); // 监控对象详细信息
  const currentClickVideo = useRef<any>({ id: '', dom: '' }); //当前点击video
  const videoSucces = useRef<number>(0); //0：播放成功 1：播放失败 
  const userID = getStore('user_id');
  let clickCount = 0;


  useEffect(() => {
    window.onbeforeunload = function () {
      return componentWillUnmount();
    };

    return componentWillUnmount();
  }, []);

  useEffect(() => {
    if (props.videoParam) {
      getMonitorInfo();
      videoInit();
      setisVideoPlay(true);
      setVideoPlaySuccessMap(new Map());
      setVideoBasicInfo(null);
      currentClickVideo.current = { id: '', dom: '' };
      setVisible(true);
    }
  }, [props.videoParam]);

  /**
   * 组件销毁 关闭socket
   */
  const componentWillUnmount = () => {
    videoPlaySuccessMap.forEach((value: any) => {
      value.rtpMediaPlayer.cmdCloseVideo();
      value.rtpMediaPlayer.closeSocket();
    });
  }

  /**
   * 获取监控对象信息
   */
  const getMonitorInfo = async () => {
    const result = await getMonitorWindowInfo<any>({ monitorId: props.videoParam.id });
    if (result) {
      setMonitorInfo({ ...result.lastLocation, ...result.workMonitorDto })
    } else {
      setMonitorInfo({ monitorName: props.videoParam.name })
    }
  }

  /**
  * video初始化
  */
  const videoInit = async () => {
    const videoBasic: any = await getMonitorVideoSetting(props.videoParam.id);
    if (videoBasic) {
      setVideoBasicInfo(videoBasic)
      colsRender(videoBasic, true);
    }
  }


  /**
   * video窗口单击事件
   */
  const videoWindowClick = (dom: any) => {
    if (videoSucces.current == 0) return;
    const id = dom.getAttribute('id');
    if (currentClickVideo.current.id == id) {
      currentClickVideo.current.dom.classList.remove(styles.videoBorder);
      closeVideoChannelVoice(currentClickVideo.current.id);
      currentClickVideo.current = { id: '', dom: '' };
    } else {
      if (currentClickVideo.current.dom != '') currentClickVideo.current.dom.classList.remove(styles.videoBorder);
      dom.classList.add(styles.videoBorder);
      if (currentClickVideo.current.id) closeVideoChannelVoice(currentClickVideo.current.id);
      openVideoChannelVoice(id);
      currentClickVideo.current = { id, dom };
    }
  }

  /**
  * video窗口双击事件
  */
  const videoWindowDblclick = (dom: any) => {
    if (videoSucces.current == 0) return;
    const childrenList = dom.parentNode.children;
    const id = dom.getAttribute('id');
    if (dom.style.width != '100%') {
      for (let i = 0; i < childrenList.length; i++) {
        childrenList[i].style.display = 'none';
      }
      dom.setAttribute('style', 'width: 100%; height: 100%;');

      if (currentClickVideo.current.id != id) {
        if (currentClickVideo.current.id != '') {
          currentClickVideo.current.dom.classList.remove(styles.videoBorder);
          dom.classList.add(styles.videoBorder)
          closeVideoChannelVoice(currentClickVideo.current.id);
          openVideoChannelVoice(id);
        } else {
          dom.classList.add(styles.videoBorder);
          openVideoChannelVoice(id);
        }
      }

    } else {
      for (let i = 0; i < childrenList.length; i++) {
        childrenList[i].setAttribute('style', '');
      }
    }

    currentClickVideo.current = { id, dom };
  }

  /**
   * video通道判断单击与双击事件
   */
  const videoWindowEvent = (e: any) => {
    const dom = e.currentTarget;
    if (!clickCount) {
      setTimeout(() => {
        if (clickCount == 1) { //单击
          videoWindowClick(dom);
        } else { //双击
          videoWindowDblclick(dom);
        }
        clickCount = 0;
      }, 210);
    }
    clickCount++;
  }

  /**
  * 创建video标签
  */
  const createChildHTML = (colCount: number, i: number, open: boolean, videoBasic: any) => {
    const divDom = document.createElement('div');
    divDom.setAttribute('class', styles['videoWindow-' + colCount]);
    divDom.setAttribute('id', 'video-' + i);

    const simCardNumber = videoBasic.monitor.simCardNumber;
    const deviceType = videoBasic.monitor.deviceType;
    const deviceID = videoBasic.monitor.deviceId;
    let physicsChannelNumber, channelType, streamType;

    if (videoBasic.channels[i - 1]) {
      physicsChannelNumber = videoBasic.channels[i - 1].physicsChannelNumber;
      channelType = videoBasic.channels[i - 1].channelType;
      streamType = videoBasic.channels[i - 1].streamType;
    } else {
      open = false
    }

    const param = {
      url: `${videoBasic.realtimePlayUrl}/${simCardNumber}/${physicsChannelNumber}/0`,
      basic: {
        vehicleId: videoBasic.monitorId,                 //车辆id
        simcardNumber: simCardNumber,                    //终端手机卡号
        channelNumber: physicsChannelNumber + '',        //终端通道号?
        sampleRate: '' || '8000',                        //音频采样率?
        channelCount: '' || '0',                         //音频通道号?
        audioFormat: 'G726-32K',                         //音频编码?
        playType: 'REAL_TIME',                          //播放类型(实时 REAL_TIME，回放 TRACK_BACK，对讲 BOTH_WAY，监听 UP_WAY，广播 DOWN_WAY)
        dataType: '0',                      // 播放数据类型(0：音视频，1：视频，2：双向对讲，3：监听，4：中心广播，5：透传)
        userID: userID,                                  //用户id
        deviceID: deviceID,                              //终端id
        streamType: streamType + '',                     //码流类型(0：主码流，1：子码流)
        deviceType: deviceType + '',                   //设备类型
        monitorId: videoBasic.monitorId,               //监控对象id
        clientId: videoBasic.clintId,                  //微服务架构使用，不同细分区分的ID
      },
      open,
      onPlay,
      onErrorMessage
    }
    setisVideoPlay(false);
    ReactDOM.render(React.createElement(VideoPlayer, param), divDom);
    return divDom;
  }

  /**
  * video窗口渲染
  */
  const colsRender = (videoBasic: any, open: boolean) => {
    let colCount = 4;
    const channelsLenth = videoBasic?.channels.length || videoBasic;
    const videoContainer: any = document.getElementById('videoContainer');
    if (channelsLenth <= 4 && channelsLenth >= 0) {
      colCount = 4;
    } else if (channelsLenth > 4 && channelsLenth <= 6) {
      colCount = 6
    } else if (channelsLenth > 6 && channelsLenth <= 9) {
      colCount = 9
    } else if (channelsLenth > 9 && channelsLenth <= 10) {
      colCount = 10
    } else if (channelsLenth > 10) {
      colCount = 16
    }

    while (videoContainer.hasChildNodes()) {
      videoContainer.removeChild(videoContainer.firstChild);
    }

    for (let i = 1; i <= colCount; i++) {
      const dom = createChildHTML(colCount, i, open, videoBasic);
      videoContainer.appendChild(dom);
    }
  }

  /**
   * 关闭抽屉
   */
  const closeDrawer = () => {
    videoPlaySuccessMap.forEach((value: any) => {
      value.rtpMediaPlayer.cmdCloseVideo();
      value.rtpMediaPlayer.closeSocket();
    });

    setVideoPlaySuccessMap(new Map());
    setisVideoPlay(true);
    currentClickVideo.current = { id: '', dom: '' };
    videoSucces.current = 0;
    setVisible(false)
  }

  /**
  * video播放成功
  */
  const onPlay = (data: any, rtpMediaPlayer: any) => {
    console.log('播放成功', data);
    videoPlaySuccessMap.set(`video-${data.channelNumber}`, { data, rtpMediaPlayer });
    if (isVideoPlay) setisVideoPlay(!isVideoPlay);
    setVideoPlaySuccessMap(videoPlaySuccessMap);
    // setVideoStatus(1);
    videoSucces.current = 1;
    const videoDom = document.getElementById('video-' + data.channelNumber);
    if (videoDom) videoDom.addEventListener('click', videoWindowEvent);
  }

  /**
   * video播放异常消息
   */
  const onErrorMessage = (code: number) => {
    if (code == -1006 || code == -1005) {
      message.error('终端未响应', 2);
    }
  }

  /**
   * 打开video声音
   */
  const openVideoChannelVoice = (videoId: string) => {
    const data = videoPlaySuccessMap.get(videoId);
    data.rtpMediaPlayer.openVideoVoice();
    console.log('打开声音', videoId, data)
  }

  /**
   * 关闭video声音
   */
  const closeVideoChannelVoice = (videoId: string) => {
    const data = videoPlaySuccessMap.get(videoId);
    data.rtpMediaPlayer.closeVideoVoice();
    console.log('关闭声音', videoId, data)
  }

  /**
   * video播放/暂停
   */
  const videoPlay = () => {
    if (isVideoPlay) { //播放
      if (videoBasicInfo) {
        colsRender(videoBasicInfo, true);
      }
    } else { //暂停
      videoPlaySuccessMap.forEach((value: any) => {
        value.rtpMediaPlayer.cmdCloseVideo();
        value.rtpMediaPlayer.closeSocket();
      });
      setVideoPlaySuccessMap(new Map());
      colsRender(videoBasicInfo, false);
    }
    setisVideoPlay(!isVideoPlay);
  }

  /**
   * 全屏
   */
  const fullScreen = () => {
    const videoContainerDom = document.getElementById('videoContainer');
    if (!fullScreenFlag) {
      videoContainerDom?.setAttribute('style', 'height:92%');
    } else {
      videoContainerDom?.setAttribute('style', 'height:60%');
    }
    setFullScreenFlag(!fullScreenFlag)
  }


  return (
    <Drawer
      title={`实时视频(${props.videoParam.name})`}
      width={!fullScreenFlag ? 850 : '100%'}
      placement='left'
      closable={!fullScreenFlag ? true : false}
      forceRender={true}
      visible={visible}
      mask={false}
      // getContainer={props.getContainer}
      getContainer={
        !fullScreenFlag ? props.getContainer :
          props.getContainer.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode}
      style={{ position: 'absolute' }}
      className={styles.drawerCls}
      onClose={closeDrawer}
    >
      < div className={styles.videoContainer} id="videoContainer"></div>
      <div className={styles.videoHandle}>
        <Switch checked={!isVideoPlay} onChange={videoPlay} title={isVideoPlay ? '播放' : '关闭'} />
        {fullScreenFlag ? <FullscreenExitOutlined title='退出全屏' className={styles.fullImg} onClick={fullScreen} /> : <FullscreenOutlined title='全屏' className={styles.fullImg} onClick={fullScreen} />}
      </div>
      <div className={`${styles.videoInfo} ${fullScreenFlag ? styles.hide : ''}`}>
        <div className={styles.infoHeader}>基本信息</div>
        <div className={styles.infoContent}>
          <div className={styles.recordHeader}>
            <h4><CarOutlined /> {monitorInfo.monitorName}({monitorInfo.type})</h4>
          </div>
          <Row>
            <Col span={18}>
              <Row>
                <Col span={12}>
                  <div>所属企业: {monitorInfo.enterpriseName}</div>
                  <div>在岗状态: <span className={styles.blue}>{getOnWorkStatus(monitorInfo.onWorkStatus)}</span></div>
                  <div>作业状态: <span className={styles.blue}>{getWorkStatus(monitorInfo.workStatus)}</span></div>
                  <div>行驶速度: {monitorInfo.gpsSpeed ? `${monitorInfo.gpsSpeed}km/h` : '--'}</div>
                  <div>终端手机号: {monitorInfo.terminalPhoneNum || '--'}</div>
                </Col>
                <Col span={12} style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <div>驾驶员: {monitorInfo.professionalsList && monitorInfo.professionalsList.length > 0 ? monitorInfo.professionalsList.map((value: any) => `${value.name}(${value.number})`).join(',') : '--'}</div>
                  <div>里程(km): {monitorInfo.dayMile || '--'}</div>
                  {monitorInfo.oilCapacityInfo && monitorInfo.oilCapacityInfo[0] !== -1 ? <div className={styles.infoItem}>
                    <span className={styles.itemName}>剩余油量(L)：</span>
                    <span>{monitorInfo.oilCapacityInfo === undefined || monitorInfo.oilCapacityInfo.length === 0 ? '--' : monitorInfo.oilCapacityInfo.join(',')}</span>
                  </div>
                    : ''}
                  {monitorInfo.waterCapacityInfo && monitorInfo.waterCapacityInfo[0] !== -1 ? <div className={styles.infoItem}>
                    <span className={styles.itemName}>剩余水量(L)：</span>
                    <span>{monitorInfo.waterCapacityInfo === undefined || monitorInfo.waterCapacityInfo.length === 0 ? '--' : monitorInfo.waterCapacityInfo.join(',')}</span>
                  </div>
                    : ''}
                  {monitorInfo.loadWeightInfo && monitorInfo.loadWeightInfo[0] !== -1 ? <div className={styles.infoItem}>
                    <span className={styles.itemName}>载重量(kg)：</span>
                    <span>{monitorInfo.loadWeightInfo === undefined || monitorInfo.loadWeightInfo.length === 0 ? '--' : monitorInfo.loadWeightInfo.join(',')}</span>
                  </div>
                    : ''}
                </Col>
              </Row>
              <div>位置信息: {monitorInfo.address || '--'}</div>
            </Col>
            <Col span={6} className={styles.rightInfo}>
              <div className={styles.itemImg}>
                <img src={monitorInfo.photoUrl ? monitorInfo.photoUrl : noImg} />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Drawer >
  )
});

export default VideoRealtime;