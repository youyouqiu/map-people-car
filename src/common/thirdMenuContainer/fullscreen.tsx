import React, { Component } from "react";
import { connect } from 'react-redux';
import FullscreenOutlined from "@ant-design/icons/FullscreenOutlined";
import FullscreenExitOutlined from "@ant-design/icons/FullscreenExitOutlined";
import styles from "./index.module.less";

interface IProps {
    toggleFullScreen: Function;
}

interface IState {
    fullscreen: boolean;
}

class Fullscreen extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            fullscreen: false,
        }
    }

    /**
     * 全屏
     */
    launchFullscreen = () => {
        const element: any = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    /**
     * 退出全屏
     */
    exitFullscreen = () => {
        let documentElement: any = document;
        if (documentElement.exitFullscreen) {
            documentElement.exitFullscreen();
        } else if (documentElement.mozCancelFullScreen) {
            documentElement.mozCancelFullScreen();
        } else if (documentElement.webkitExitFullscreen) {
            documentElement.webkitExitFullscreen();
        }
    }

    changeFullScreen = () => {
        const { toggleFullScreen } = this.props;
        const { fullscreen } = this.state;
        if (!fullscreen) {
            this.setState({
                fullscreen: true
            });
            this.launchFullscreen();
            document.addEventListener('fullscreenchange', this.onFullscreenChange);
        } else {
            document.removeEventListener('fullscreenchange', this.onFullscreenChange);
            this.exitFullscreen();
            this.setState({
                fullscreen: false
            })
        }
        toggleFullScreen();
    }

    onFullscreenChange = () => {
        if (document.fullscreenElement) {
            return;
        }

        const { toggleFullScreen } = this.props;
        document.removeEventListener('fullscreenchange', this.onFullscreenChange);
        this.setState({
            fullscreen: false
        });
        toggleFullScreen();
    }

    render() {
        const { fullscreen } = this.state;
        return (
            <div className={styles['fullscreen']} onClick={this.changeFullScreen}>
                {
                    fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
                }
            </div>
        )
    }
}


function mapDispatchToProps(dispatch: any) {
    return {
        toggleFullScreen: () => dispatch({
            type: 'container/toggleFullScreen',
        }),
    };
}

export default connect<Partial<IProps>, any, any, any>(
    null,
    mapDispatchToProps
)(Fullscreen);