import React, { Component } from 'react';
import styles from './index.module.less';

interface IState {
  isSuccess: boolean;
  successMoveDistance: number;
  touchSuccessMoveDistance: number;
  downX: number;
  touchDownX: number;
}

interface IProps {
  getrandomCode: Function;
  updateStatus: Function;
  onRefChild: Function;
}

class LoginSlider extends Component<IProps, IState, any>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      isSuccess: false,
      successMoveDistance: 0,
      downX: 0,
      touchSuccessMoveDistance: 0,
      touchDownX: 0
    }
  }

  containerRef: any = React.createRef();
  sliderRef: any = React.createRef();
  bgColorRef: any = React.createRef();

  componentDidMount() {
    this.props.onRefChild(this);

    setTimeout(() => {
      const successMoveDistance = this.containerRef.current.offsetWidth - this.sliderRef.current.offsetWidth;
      const touchSuccessMoveDistance = this.containerRef.current.offsetWidth - this.sliderRef.current.offsetWidth;

      this.setState({
        successMoveDistance,
        touchSuccessMoveDistance
      }, () => {
        this.sliderRef.current.onmousedown = this.mousedownHandler.bind(this);
        this.sliderRef.current.ontouchstart = this.touchStartHandler.bind(this)
      });
    }, 500);
  }

  /**移动端 */
  touchStartHandler(event: Event) {
    this.bgColorRef.current.style.transition = "";
    this.sliderRef.current.style.transition = "";
    const e: any = event || window.event;
    this.setState({
      touchDownX: e.changedTouches[0].clientX
    }, () => {
      document.ontouchmove = this.touchMoveHandler.bind(this);
      document.ontouchend = this.touchEndHandler.bind(this);
    });
  }

  touchMoveHandler(event: any) {
    const { touchDownX, touchSuccessMoveDistance } = this.state;
    const e = event || window.event || event.which;
    const moveX = e.changedTouches[0].clientX;
    const offsetX = this.getOffsetX(moveX - touchDownX, 0, touchSuccessMoveDistance);

    this.bgColorRef.current.style.width = offsetX + "px";
    this.sliderRef.current.style.left = offsetX + "px";

    console.log('offsetX', offsetX);
    console.log('touchSuccessMoveDistance', touchSuccessMoveDistance);


    if (offsetX == touchSuccessMoveDistance) {
      this.success();
    }
    // e.preventDefault();
  }

  touchEndHandler() {
    const { isSuccess } = this.state;
    if (!isSuccess) {
      this.bgColorRef.current.style.transition = "width 0.5s linear";
      this.sliderRef.current.style.transition = "left 0.5s linear";
      this.bgColorRef.current.style.width = 0 + "px";
      this.sliderRef.current.style.left = 0 + "px";
    }
    document.ontouchmove = null;
    document.ontouchend = null;
  }


  /**PC端 */
  mousedownHandler(event: any) {
    this.bgColorRef.current.style.transition = "";
    this.sliderRef.current.style.transition = "";
    const e: any = event || window.event;
    this.setState({
      downX: e.clientX
    }, () => {
      document.onmousemove = this.mousemoveHandler.bind(this);
      document.onmouseup = this.mouseupHandler.bind(this);
    });
  };

  mousemoveHandler(event: any) {
    const { downX, successMoveDistance } = this.state;
    const e = event || window.event || event.which;
    const moveX = e.clientX;
    const offsetX = this.getOffsetX(moveX - downX, 0, successMoveDistance);
    this.bgColorRef.current.style.width = offsetX + "px";
    this.sliderRef.current.style.left = offsetX + "px";

    if (offsetX == successMoveDistance) {
      this.success();
    }
    e.preventDefault();
  };

  mouseupHandler() {
    const { isSuccess } = this.state;
    if (!isSuccess) {
      this.bgColorRef.current.style.transition = "width 0.5s linear";
      this.sliderRef.current.style.transition = "left 0.5s linear";
      this.bgColorRef.current.style.width = 0 + "px";
      this.sliderRef.current.style.left = 0 + "px";
    }
    document.onmousemove = null;
    document.onmouseup = null;
  };



  getOffsetX(offset: number, min: number, max: number) {
    if (offset < min) {
      offset = min;
    } else if (offset > max) {
      offset = max;
    }
    return offset;
  };

  async success() {
    this.setState({
      isSuccess: true
    });
    this.props.getrandomCode();
    this.props.updateStatus(true);

    this.sliderRef.current.onmousedown = null;
    this.sliderRef.current.ontouchstart = null;
    document.onmousemove = null;
    document.ontouchmove = null;
  };

  resetSlider() {
    const successMoveDistance = this.containerRef.current.offsetWidth - this.sliderRef.current.offsetWidth;
    const touchSuccessMoveDistance = this.containerRef.current.offsetWidth - this.sliderRef.current.offsetWidth;

    this.setState({
      successMoveDistance,
      touchSuccessMoveDistance,
      downX: 0,
      touchDownX: 0,
      isSuccess: false
    });
    this.props.updateStatus(false);
    this.sliderRef.current.style.left = 0 + 'px';
    this.bgColorRef.current.style.width = 0 + "px";
    this.sliderRef.current.onmousedown = this.mousedownHandler.bind(this);
    this.sliderRef.current.ontouchstart = this.touchStartHandler.bind(this);
  }

  render() {
    const { isSuccess } = this.state;
    return (
      <div>
        <div className={styles.loginSlider} ref={this.containerRef}>
          <div className={styles.sliderLabelTip}>{isSuccess ? "您成功啦！请登录！" : "把我滑到右边试试?"}</div>
          <div className={styles.sliderBg} ref={this.bgColorRef}></div>
          <div className={isSuccess ? styles.sliderSuccess : styles.sliderLabel} ref={this.sliderRef}></div>
        </div>
      </div>
    )
  }
}

export default LoginSlider;