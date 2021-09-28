import React from 'react';

interface IState {
    visible: boolean;
}
interface Iprops {
    close?: boolean;
}
class ContextMenu extends React.Component<Iprops, IState> {
    root: React.RefObject<HTMLDivElement> = React.createRef();
    constructor(props: any) {
        super(props);
        this.state = {
            visible: false,
        };
    }
    parentBox: any;
    componentDidMount() {
        this.parentBox = this.root.current?.parentElement;
        document.addEventListener('contextmenu', this._handleContextMenu);
        document.addEventListener('click', this.handleClick);
        document.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this._handleContextMenu);
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('scroll', this.handleScroll);
    }

    _handleContextMenu = (event: any) => {
        this.setState({ visible: false }); //当点击其他地方右键时可以根据需求来判断是否需要先关闭菜单
        event.preventDefault();
        //限定右键菜单功能只在包裹了<ContextMenu /> 的直接父元素里面使用
        if (!(this.parentBox.contains(event.target) || this.parentBox == event.target)) {
            return;
        }
        this.setState({
            visible: true,
        });
        const clickX = event.clientX;
        const clickY = event.clientY; //事件发生时鼠标的Y坐标
        const screenW = window.innerWidth; //文档显示区的宽度
        const screenH = window.innerHeight;
        const rootW = this.root.current?.offsetWidth || 0; //右键菜单本身元素的宽度
        const rootH = this.root.current?.offsetHeight || 0;
        // right为true，说明鼠标点击的位置到浏览器的右边界的宽度可以放contextmenu。
        // 否则，菜单放到左边。 // top和bottom，同理。
        const right = screenW - clickX > rootW;
        const left = !right;
        const top = screenH - clickY > rootH;
        const bottom = !top;
        if (this.root.current) {
            if (right) {
                this.root.current.style.left = `${clickX + 15}px`;
            }
            if (left) {
                this.root.current.style.left = `${clickX - rootW - 15}px`;
            }
            if (top) {
                this.root.current.style.top = `${clickY + 15}px`;
            }
            if (bottom) {
                this.root.current.style.top = `${clickY - rootH - 15}px`;
            }
        }
    };
    handleClick = (event: any) => {
        const clickOutside = !this.root.current?.contains(event.target);
        // console.log(clickOutside);
        if (clickOutside) {
            this.setState({ visible: false });
            this.forceUpdate();
        }
    };

    handleScroll = () => {
        this.setState({ visible: false });
    };

    render() {
        const { visible } = this.state;
        const { close } = this.props;
        if (close) {
            return null;
        }
        return (
            <div
                ref={this.root}
                style={
                    visible
                        ? { position: 'fixed', zIndex: 100 }
                        : {
                              position: 'fixed',
                              zIndex: 100,
                              visibility: 'hidden',
                          }
                }
                className={visible ? 'show' : 'hide'}
            >
                {this.props.children}
            </div>
        );
    }
}

export default ContextMenu;
