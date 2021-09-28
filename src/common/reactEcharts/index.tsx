/**
 * 数据中心 - Echarts模块
 */
import React, { CSSProperties, PureComponent } from 'react';
import Echarts from 'echarts-for-react';
import styles from './index.module.less';

interface IProps {
  echartsOption: any;
  isMarquee?: boolean;
  marqueeOption?: any;
  clickFun?: Function;
  style?: CSSProperties;
}
interface IState {
}

class ReactEcharts extends PureComponent<IProps, IState, any> {
  imgLeftRef: any = React.createRef();
  imgRigthRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
    }
  }

  onChartReadyCallback = (optional: any) => {
    console.log(optional, 'onChartReadyCallback');
  }

  render() {
    let eventsObj: any = {};
    if (this.props.clickFun) {
      eventsObj.click = this.props.clickFun;
    }
    const {
      echartsOption,
      style
    } = this.props;
    return (
      <div className={styles['reactEcharts-wrap']}>
        <Echarts
          option={echartsOption}
          notMerge={true}
          lazyUpdate={true}
          theme={"theme_name"}
          onEvents={eventsObj}
          onChartReady={this.onChartReadyCallback}
          style={style}
        />
      </div>
    )
  }
}

export default ReactEcharts;
