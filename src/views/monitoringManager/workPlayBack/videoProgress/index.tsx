import React, { useEffect, useState, memo, useRef } from 'react';
import { Empty, Spin } from 'antd';
import { VideoProgress } from 'react-plugin-library';
import { getStore } from '@/framework/utils/localStorage';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
interface Iprops {
  webSocket: any;
  monitorInfo: any;
  isEmpty: boolean;
}

let resourcesList: any, resourcesListOriginal: any;

export default memo((props: Iprops) => {
  const [data, setData] = useState<any>({ channelData: {}, cNumberData: [] });
  const [defaultDate, setDefaultDate] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const videoControlPluginRef = useRef<any>(null);
  const { monitorInfo, webSocket, isEmpty } = props;
  const dispatch = useDispatch();

  // 连接redux数据
  const { queryTime } = useSelector(({
    videoPlayback: {
      queryTime,
    }
  }: any) => {
    return {
      queryTime,
    }
  }, shallowEqual);

  useEffect(() => {
    if (Object.keys(monitorInfo).length > 0) {
      setData({ channelData: {}, cNumberData: [] });
      setLoading(true)
      // const token = getStore('token');
      // const header = { access_token: `Bearer ${token}` }
      const header = {};
      const startTime = monitorInfo.startTime;
      const endTime = monitorInfo.endTime;
      const requestStr = {
        data: {
          monitorId: monitorInfo.monitorId, startTime, endTime
        }, desc: { type: 1 }
      }
      webSocket.subscribeAndSend('/user/queue/video_replay', subscription, '/app/monitor/videoReplay', header, requestStr);
    }
  }, [monitorInfo]);

  useEffect(() => {
    if (queryTime) {
      setData({ channelData: {}, cNumberData: [] });
      setLoading(true)
      // const token = getStore('token');
      // const header = { access_token: `Bearer ${token}` }
      const header = {};
      const requestStr = {
        data: {
          monitorId: queryTime.monitorId, startTime: queryTime.startTime, endTime: queryTime.endTime
        }, desc: { type: 1 }
      }
      webSocket.subscribeAndSend('/user/queue/video_replay', subscription, '/app/monitor/videoReplay', header, requestStr);
    }
  }, [queryTime]);

  /**
   * 订阅成功回调
   */
  const subscription = (response: any) => {
    if (response) {
      const body = JSON.parse(response.body);
      if (body.data) {
        resourcesList = body.data.resourcesList.concat();
        resourcesListOriginal = body.data.resourcesList.concat();
        const channelData: any = {};
        const cNumberData = [];
        for (let i = 0; i < resourcesList.length; i++) {
          const item = resourcesList[i];
          if (!channelData[item.channelNum]) {
            cNumberData.push(item.channelNum);
            channelData[item.channelNum] = [
              {
                ID: 1,
                DisplayText: "",
                StationId: item.channelNum,
                StartTime: formatDate(item.startTime),
                EndTime: formatDate(item.endTime)
              }
            ]
          } else {
            const index = channelData[item.channelNum].length - 1;
            const id = channelData[item.channelNum][index].ID;
            channelData[item.channelNum].push({
              ID: id + 1,
              DisplayText: "",
              StationId: item.channelNum,
              StartTime: formatDate(item.startTime),
              EndTime: formatDate(item.endTime)
            })
          }
        }
        setData({ channelData, cNumberData });
        setDefaultDate(formatDate(monitorInfo.startTime, 1));
        setLoading(false);
      }
    }
  }

  /**
   * 进度条渲染完成
   */
  const onRender = (videoControlPlugin: any) => {
    if (videoControlPluginRef.current) {
      videoControlPluginRef.current.setSpeed(1);
      videoControlPluginRef.current.stop();
    }
    videoControlPluginRef.current = videoControlPlugin
    dispatch({ type: 'videoPlayback/refreshData', payload: { key: 'videoControlPlugin', data: videoControlPlugin } })
  }

  /**
  * 进度条持续播放事件
  */
  const onPlaying = (data: any) => {
    videoPlay(data);
  }

  /**
   * 进度条拖拽结束事件 
   */
  const onDragEnd = (data: any) => {
    resourcesList = resourcesListOriginal.concat()
  }

  /**
  * 进度条点击选中时间点后触发事件
  */
  const onStatusClick = (data: any) => {
    resourcesList = resourcesListOriginal.concat()
  }

  /**
   * 点击暂停触发事件
   */
  const onPause = (data: any) => {
    resourcesList = resourcesListOriginal.concat()
  }

  /**
  * 点击停止触发事件
  */
  const opStop = (data: any) => {
    resourcesList = resourcesListOriginal.concat()
  }

  /**
   * 播放视频
   */
  const videoPlay = (nowTime: any) => {
    const data = [];
    if (resourcesList.length > 0) {
      for (let i = resourcesList.length - 1; i >= 0; i--) {
        if (timeRange(resourcesList[i].startTime, resourcesList[i].endTime, nowTime)) {
          let endTime = resourcesList[i].endTime
          let obj = {
            channelNum: resourcesList[i].channelNum,
            endTime: endTime,
            startTime: endTime.substring(0, 6) + getTime(nowTime.currentHour) + getTime(nowTime.currentMinute) + getTime(nowTime.currentSecond)
          }
          data.push(obj);
          resourcesList.splice(i, 1);
        }
        if (i == 0 && data.length > 0) {
          dispatch({ type: 'videoPlayback/refreshData', payload: { key: 'videoTimeSlice', data } });
        }
      }
    }
  }

  /**
   * 判断当前进度条时间是否进入可以播放时间片段范围
   */
  const timeRange = (startTime: any, endTime: any, nowTime: any) => {
    const startH = startTime.substring(6, 8);
    const startM = startTime.substring(8, 10);
    const startS = startTime.substring(10, 12);
    const endH = endTime.substring(6, 8);
    const endM = endTime.substring(8, 10);
    const endS = endTime.substring(10, 12);
    const nowTimeH = nowTime.currentHour;
    const nowTimeM = nowTime.currentMinute;
    const nowTimeS = nowTime.currentSecond;

    const s = new Date();
    const e = new Date();
    const n = new Date();

    s.setHours(startH);
    s.setMinutes(startM);
    s.setSeconds(startS)
    e.setHours(endH);
    e.setMinutes(endM);
    e.setSeconds(endS);
    n.setHours(nowTimeH);
    n.setMinutes(nowTimeM);
    n.setSeconds(nowTimeS);

    if (n.getTime() - s.getTime() > 0 && n.getTime() - e.getTime() < 0) {
      return true;
    } else {
      return false;
    }
  }

  const getTime = (time: any) => {
    if (time < 10 && time >= 0) {
      return '0' + time;
    } else {
      return time
    }
  }

  /**
   * 日期格式
   */
  const formatDate = (time: string, type?: number | undefined) => {
    let y, M, d, h, m, s;
    if (type == 1) {
      y = time.substring(0, 4);
      M = time.substring(4, 6);
      d = time.substring(6, 8);
      h = time.substring(8, 10);
      m = time.substring(10, 12);
      s = time.substring(12, 14);
    } else {
      const date = new Date();
      const year = date.getFullYear() + '';
      const str = year.substring(0, 2);
      y = str + time.substring(0, 2);
      M = time.substring(2, 4);
      d = time.substring(4, 6);
      h = time.substring(6, 8);
      m = time.substring(8, 10);
      s = time.substring(10, 12);
    }
    return `${y}-${M}-${d} ${h}:${m}:${s}`;
  }

  return (
    <>
      {
        isEmpty ? <Empty description={'暂无视频回放数据！'} style={{ margin: '65px auto' }} image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
          <Spin spinning={loading}>
            <VideoProgress
              cNumberData={data.cNumberData}
              channelData={data.channelData}
              defaultDate={defaultDate}
              onRender={onRender}
              onDragEnd={onDragEnd}
              onPlaying={onPlaying}
              onStatusClick={onStatusClick}
              opStop={opStop}
              onPause={onPause}
            />
          </Spin>
      }
    </>
  )
});