import React, { memo, useState, useEffect, useRef } from 'react';
import { Drawer, DatePicker, Button, Tooltip, message, Spin } from 'antd';
import styles from './index.module.less';
import fastForward from '@/static/image/fastForward.png';
import play from '@/static/image/play.png';
import stop from '@/static/image/stop.png';
import suspended from '@/static/image/suspended.png';
import { VideoPlayer } from 'react-plugin-library';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { getMonitorVideoSetting } from '@/server/monitorManager';
import { getStore } from "@/framework/utils/localStorage";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
interface IProps {
  getContainer: any
  monitorInfo: any //监控对象信息
  closeVideoPlayDrawer: Function;
}

const VideoPlayback = memo((props: IProps) => {
  const { getContainer, monitorInfo, closeVideoPlayDrawer } = props;
  const [videoBasic, setVideoBasic] = useState<any>([]); //视频窗口参数
  const [videoQueryDate, setVideoQueryDate] = useState<any>([]); //查询时间
  const [videoPlayFlag, setVideoPlayFlag] = useState<boolean>(true); //视频播放暂停按钮切换
  const [videoChannelMap, setVideoChannelMap] = useState<any>(new Map()); //视频播放成功数据
  const [forwardSpeed, setForwardSpeed] = useState<any>({ page: 1, videoParam: '1' }); //视频播放速度
  const [videoStatus, setVideoStatus] = useState<number>(1) //1:进度条加载中 2:进度条加载完成 3:播放 4:暂停 5:停止      ？？？ -1：初始化中 0：未播放/停止 1：播放中?
  const currentClickVideo = useRef<any>({ id: '', dom: '' }); //当前点击video
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  // 连接redux数据
  const { videoControlPlugin, videoTimeSlice } = useSelector(({
    videoPlayback: {
      videoControlPlugin,
      videoTimeSlice
    }
  }: any) => {
    return {
      videoControlPlugin,
      videoTimeSlice
    }
  }, shallowEqual);

  const { currentSelectDate } = useSelector(({
    workPlayTrack: {
      currentSelectDate
    }
  }: any) => {
    return {
      currentSelectDate
    }
  }, shallowEqual);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const userID = getStore('user_id');
  let clickCount = 0;

  useEffect(() => {
    setLoading(true)
    setVideoQueryDate([moment(`${year}-${month}-${day} 00:00:00`, dateFormat), moment(`${year}-${month}-${day} 23:59:59`, dateFormat)]);
    videoPlaybackInit();

    window.onbeforeunload = function () {
      return componentWillUnmount();
    };

    return componentWillUnmount();
  }, []);

  useEffect(() => {
    if (videoTimeSlice && videoTimeSlice.length > 0) {
      videoTimeSlice.map((item: any) => {
        const video = videoChannelMap.get('video-' + item.channelNum);
        if (video) {
          video.rtpMediaPlayer.closeSocket();
          video.rtpMediaPlayer.cmdCloseVideo();
          videoChannelMap.delete('video-' + item.channelNum);
        }
      });
      setVideoChannelMap(videoChannelMap);

      setTimeout(() => {
        videoPlayBack(videoTimeSlice)
      }, 600);
    }
  }, [videoTimeSlice]);

  useEffect(() => {
    if (videoControlPlugin) {
      videoStop();
      setVideoStatus(2);
    }
  }, [videoControlPlugin]);

  useEffect(() => {
    if (!currentSelectDate) closeDrawer();
  }, [currentSelectDate]);

  /**
   * 组件销毁 关闭socket
   */
  const componentWillUnmount = () => {
    videoChannelMap.forEach((value: any) => {
      value.rtpMediaPlayer.cmdCloseVideo();
      value.rtpMediaPlayer.closeSocket();
    });
  }

  /**
   * 视频窗口初始化
   */
  const videoPlaybackInit = async () => {
    const videoBasic: any = await getMonitorVideoSetting(monitorInfo.monitorId);
    if (videoBasic) {
      setVideoBasic(videoBasic);
      colsRender(videoBasic);
    }
  }

  /**
   * 视频窗口渲染
   */
  const colsRender = (videoBasic: any) => {
    let colCount: number = 4;
    const channelsLenth = videoBasic.channels.length;
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
      const divDom = document.createElement('div');
      divDom.setAttribute('class', styles['videoWindow-' + colCount]);
      divDom.setAttribute('id', 'video-' + i);
      ReactDOM.render(React.createElement(VideoPlayer, {}), divDom);
      videoContainer.appendChild(divDom);
    }
    setLoading(false);
  }

  /**
   * 视频播放
   */
  const videoPlayBack = (videoBasicTime: any) => {
    videoBasicTime.map((item: any) => {
      const channelNum = item.channelNum;
      const startTime = item.startTime;
      const endTime = item.endTime;
      const divDom: any = document.getElementById("video-" + channelNum);
      const simCardNumber = videoBasic.monitor.simCardNumber;
      const deviceType = videoBasic.monitor.deviceType;
      const deviceID = videoBasic.monitor.deviceId;
      const channelsItem = videoBasic.channels.filter((i: any) => i.physicsChannelNumber == channelNum);
      // const streamType = channelsItem[0].streamType;
      const streamType = '0';
      const param = {
        url: `${videoBasic.historyPlayUrl}/${simCardNumber}/${channelNum}`,
        basic: {
          vehicleId: videoBasic.monitorId,                 //车辆id
          simcardNumber: simCardNumber,                    //终端手机卡号
          channelNumber: channelNum + '',        //终端通道号?
          sampleRate: '8000',                        //音频采样率?
          channelCount: '0',                         //音频通道号?
          audioFormat: 'G726-32K',                         //音频编码?
          playType: 'TRACK_BACK',                          //播放类型(实时 REAL_TIME，回放 TRACK_BACK，对讲 BOTH_WAY，监听 UP_WAY，广播 DOWN_WAY)
          dataType: '0',                      // 播放数据类型(0：音视频，1：视频，2：双向对讲，3：监听，4：中心广播，5：透传)
          userID: userID,                                  //用户id
          deviceID: deviceID,                              //终端id
          streamType: streamType + '',                     //码流类型(0：主码流，1：子码流)  参数暂时写死
          deviceType: deviceType + '',                     //设备类型
          monitorId: videoBasic.monitorId,                 //监控对象id
          clientId: videoBasic.clintId,                    //微服务架构使用，不同细分区分的ID
          startTime: startTime,          //开始时间(例:201030164044)
          endTime: endTime,              //结束时间
          remoteMode: '0',                                 //回放方式(0：正常回放 1：快进回放 2：关键帧快退回放 3：关键帧播放 4：单帧上传)
          forwardOrRewind: forwardSpeed.videoParam,        //快进快退倍数(回放方式为1和2时，此字段有效，否则为0. 0：无效 1：1倍 2：2倍 3：4倍 4：8倍 5：16倍)
          storageType: '0',                                //存储器类型(0主存储器或灾备存储器 1主存储器 2灾备存储器)
          domId: 'channel-' + channelNum
        },
        open,
        onPlay,
        onClose,
        onErrorMessage,
      }
      ReactDOM.render(React.createElement(VideoPlayer, param), divDom);
    });
  }

  /**
   * 视频播放成功
   */
  const onPlay = (data: any, rtpMediaPlayer: any) => {
    const videoDom = document.getElementById('video-' + data.channelNumber);
    videoChannelMap.set(`video-${data.channelNumber}`, { data, rtpMediaPlayer });
    setVideoChannelMap(videoChannelMap);

    if (videoPlayFlag) setVideoPlayFlag(false);
    if (videoDom) videoDom.addEventListener('click', videoWindowEvent);
    progressSpeed(Number(data.forwardOrRewind))
    console.log('播放成功', data);
  }

  /**
   * 视频关闭
   */
  const onClose = () => {
    console.log('关闭');
  }

  /**
   * 视频播放异常消息
   */
  const onErrorMessage = (code: number, data: any) => {
    if (videoChannelMap.size == 0) {
      videoControlPlugin.pause();
      setVideoPlayFlag(true)
    } else {
      videoChannelMap.delete(`video-${data.channelNumber}`)
      setVideoChannelMap(videoChannelMap);
    }
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
   * video窗口单击事件
   */
  const videoWindowClick = (dom: any) => {
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
   * 打开视频声音
   */
  const openVideoChannelVoice = (videoId: string) => {
    const data = videoChannelMap.get(videoId);
    data.rtpMediaPlayer.openVideoVoice();
  }

  /**
   * 关闭视频声音
   */
  const closeVideoChannelVoice = (videoId: string) => {
    const data = videoChannelMap.get(videoId);
    data.rtpMediaPlayer.closeVideoVoice();
  }

  /**
   * 视频播放/暂停
   */
  const videoPlay = () => {
    if (videoStatus == 1) return;
    if (videoPlayFlag) { //播放
      if (videoStatus == 2 || videoStatus == 5) {
        videoControlPlugin.play();
      } else {
        videoControlPlugin.continue()
      }
      setVideoStatus(3);
    } else { //暂停
      videoChannelMap.forEach((value: any) => {
        value.rtpMediaPlayer.cmdPause();
        value.rtpMediaPlayer.pause();
      });
      videoControlPlugin.pause();
      setVideoStatus(4);
    }
    setVideoPlayFlag(!videoPlayFlag);
  }

  /**
   * 视频播放停止
   */
  const videoStop = () => {
    if (videoStatus == 1 || videoStatus == 2) return;
    videoChannelMap.forEach((value: any) => {
      value.rtpMediaPlayer.cmdCloseVideo();
      value.rtpMediaPlayer.closeSocket();
    });

    videoControlPlugin.setSpeed(1);
    videoControlPlugin.stop();

    setVideoChannelMap(new Map());
    setVideoPlayFlag(true);
    setForwardSpeed({ page: 1, videoParam: '1' });
    setVideoStatus(5);
    currentClickVideo.current = { id: '', dom: '' };
    colsRender(videoBasic);
  }

  /**
   * 视频播放速度
  */
  const videoSpeed = () => {
    if (videoStatus == 1 || videoStatus == 2 || videoStatus == 5) return;
    let playbackSpeed = 1;

    switch (forwardSpeed.page) {
      case 1:
        setForwardSpeed({ page: 2, videoParam: '2' });
        playbackSpeed = 2;
        break;
      case 2:
        setForwardSpeed({ page: 4, videoParam: '3' });
        playbackSpeed = 3
        break;
      case 4:
        setForwardSpeed({ page: 8, videoParam: '4' });
        playbackSpeed = 4
        break;
      case 8:
        setForwardSpeed({ page: 16, videoParam: '5' });
        playbackSpeed = 5
        break;
      case 16:
        setForwardSpeed({ page: 1, videoParam: '1' });
        playbackSpeed = 1
        break;
    }
    videoChannelMap.forEach((value: any) => {
      value.rtpMediaPlayer.cmdForwardPlay(playbackSpeed)
    });
    if (videoStatus == 3) progressSpeed(playbackSpeed);
  }

  /**
   * 进度条速度
   */
  const progressSpeed = (num: number) => {
    let speed: number = 1;
    switch (num) {
      case 1:
        speed = 1;
        break;
      case 2:
        speed = 2;
        break;
      case 3:
        speed = 4;
        break;
      case 4:
        speed = 8;
        break;
      case 5:
        speed = 16;
        break;
    }
    videoControlPlugin.setSpeed(speed);
  }


  /**
   * 日期面板日期选择 
   */
  const changeRangePickerTime = (time: any) => {
    setVideoQueryDate(time);
  }

  /**
   * 日期查询
   */
  const queryDate = () => {
    const startTime = moment(videoQueryDate[0]).format(dateFormat);
    const endTime = moment(videoQueryDate[1]).format(dateFormat);
    const endTimeStamp: any = new Date(endTime);
    const startTimeStamp: any = new Date(startTime);
    if (endTimeStamp - startTimeStamp > 86400000) {
      message.error("查询时间范围不能大于一天");
      return false;
    }
    videoStop();
    dispatch({
      type: 'videoPlayback/refreshData', payload: {
        key: 'queryTime', data: {
          startTime: videoQueryDate[0].format('YYYYMMDDHHmmss'),
          endTime: videoQueryDate[1].format('YYYYMMDDHHmmss'),
          monitorId: monitorInfo.monitorId
        }
      }
    })
  }

  /**
   * 关闭抽屉
   */
  const closeDrawer = () => {
    videoChannelMap.forEach((value: any) => {
      value.rtpMediaPlayer.cmdCloseVideo();
      value.rtpMediaPlayer.closeSocket();
    });
    videoControlPlugin.stop();
    dispatch({ type: 'videoPlayback/resetData', payload: { key: '', data: null } });
    closeVideoPlayDrawer();
  }

  return (
    <Drawer
      title={`视频回放(${monitorInfo.monitorName ? monitorInfo.monitorName : '-'})`}
      width={850}
      placement='right'
      closable={true}
      forceRender={true}
      visible={true}
      mask={false}
      getContainer={getContainer}
      style={{ position: 'absolute' }}
      className={styles.drawerCls}
      onClose={closeDrawer}
    >
      <Spin spinning={loading} >
        <div className={styles.videoContainer} id="videoContainer"></div>
        <div className={styles.videoFooter}>
          <div className={styles.peer}>
            <RangePicker
              value={videoQueryDate}
              showTime={{ format: dateFormat }}
              format={dateFormat}
              onChange={changeRangePickerTime}
            />
            <Button style={{ marginLeft: 15 }} type='primary' onClick={queryDate}>查询</Button>
          </div>
          <div className={styles.peer}>
            <Tooltip placement="top" title={videoPlayFlag ? '播放' : '暂停'}>
              <img className={styles.icon} src={videoPlayFlag ? play : suspended} onClick={videoPlay}
                style={videoStatus == 1 ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip placement="top" title={'停止'}>
              <img className={styles.icon} src={stop} onClick={videoStop}
                style={videoStatus == 1 || videoStatus == 2 ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip placement="top" title={'播放速度'}>
              <img className={styles.icon} src={fastForward} onClick={videoSpeed}
                style={videoStatus == 1 || videoStatus == 2 || videoStatus == 5 ? { width: 85, cursor: 'not-allowed' } : { width: 85, cursor: 'pointer' }}
              />
            </Tooltip>
            <span className={styles.videoSpeed} onClick={videoSpeed}>x{forwardSpeed.page}</span>
          </div>
        </div>
      </Spin>

    </Drawer >
  )
})

export default VideoPlayback;