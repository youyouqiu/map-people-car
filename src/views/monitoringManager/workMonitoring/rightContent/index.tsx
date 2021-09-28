import React, { memo, useEffect, useRef } from "react";

import TopStatistics from './topStatistics';
import Map from './map';
import WorkStatistics from './workStatistics';

import styles from '../index.module.less';
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import VideoRealtime from './videoRealtime';

const RightContent = memo(() => {
  const history = useHistory();
  const dispatch = useDispatch();
  const rightContainerRef: any = useRef();

  useEffect(() => {
    dispatch({ type: 'workMonitoring/refreshData', payload: { key: 'videoParam', data: null } });
  }, [])

  // 连接redux数据
  const { videoParam } = useSelector(({
    workMonitoring: {
      videoParam
    }
  }: any) => {
    return {
      videoParam
    }
  }, shallowEqual);

  return <div className={styles.rightContainer} ref={rightContainerRef}>
    {/* 顶部统计模块 */}
    <TopStatistics history={history} />
    {/* 地图模块 */}
    <Map />
    {/* 右上角作业内容 */}
    {/* {currentSelectTreeNode && currentSelectTreeNode.type === 'monitor' ? <WorkContent /> : null} */}
    {/* 右下角作业统计 */}
    <WorkStatistics history={history} />

    {videoParam && <VideoRealtime getContainer={rightContainerRef.current} videoParam={videoParam} />}
  </div>
})

export default RightContent;