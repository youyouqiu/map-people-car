
import React, { Component } from 'react';
import { Modal } from 'antd';
import {
    EyeOutlined, DeleteOutlined
} from '@ant-design/icons';
import styles from './index.module.less';
interface IProps {
    src?: string,//
    width?: number,
    height?: number,
    wraperW?: number,
    wraperH?: number,
    previewSrc?: any,
    deleteHandle?: Function,
    alt?: string
}

interface IState {
    previewVisible: boolean,
    defaultSrc: string,
    defaultAlt: any
    imgIsError: boolean
    childrenNode: any
}



class ImageWraper extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            previewVisible: false,
            defaultSrc: '',
            defaultAlt: '>_<加载失败啦',
            // defaultAlt: <div>{'>_<'}<br/>加载失败啦</div>,
            imgIsError: false,
            childrenNode: null
        };
    }

    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        // const { src, previewSrc, deleteHandle } = nextPros;
        this.handleChildNode(nextPros)
    }

    componentDidMount() {

        this.handleChildNode(this.props)

    }

    handleChildNode(props: any) {
        const { children } = props;
        let childrenObj: any = Array.isArray(children) ? children[0] : children;// 只取第一个子元素
        // 有且是图片
        if (childrenObj && childrenObj.type === 'img') {
            const { src, alt } = childrenObj.props;
            // console.log(src)
            if (!src) {        // 子元素没有src ，展示错误样式
                this.setState({
                    imgIsError: true
                })

            } else {
                this.setState({
                    imgIsError: false,
                    defaultSrc: src,
                    defaultAlt: alt
                })
                this.setState({
                    childrenNode: this.addEvent(childrenObj)
                })
            }

        }
    }









    /*
    挂载加载错误事件
    */
    addEvent(node: any) {

        return React.cloneElement(node, {
            onError: () => {
                console.log('error:image src is failed to load  ');
                this.setState({
                    imgIsError: true
                })
            },
            onLoad: () => {
                console.log('success:image src is success to load ');
                this.setState({
                    imgIsError: false
                })
            }
        })
    }

    render() {
        const { src, alt, deleteHandle, children, width, height, previewSrc, wraperH, wraperW } = this.props;
        const { defaultAlt, defaultSrc, previewVisible, imgIsError, childrenNode } = this.state;
        return (
            <div className={styles['image-box']}   >
                <div className={styles['pr']} style={{ width: wraperW ? wraperW + 'px' : '100%', height: wraperH ? wraperH + 'px' : '100%' }} >
                    {//如果有SRC-就展示SRC图片
                        src ?
                            <img src={src} alt={alt || defaultAlt} className={styles['img']} style={{ width: width ? width + 'px' : '100%', height: width ? height + 'px' : '100%' }} />
                            :
                            //没有src才渲染 组件的子节点
                            childrenNode
                    }
                    {imgIsError &&
                        <div className={styles['image-error']} >
                            {alt || <span>{'>_<'}<br />图片不见啦</span>}
                        </div>

                    }
                    {/* {children} */}
                    <div className={`${styles['image-mask']} ${styles[(deleteHandle ? 'mask-bgc2' : 'mask-bgc1')]}`} >
                        {/* mask-bgc1 */}
                        <EyeOutlined onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.setState({ previewVisible: true })
                        }} />

                        {deleteHandle && <DeleteOutlined onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteHandle();
                        }} />}
                    </div>
                    <Modal
                        visible={previewVisible}
                        title='车辆类型图标预览'
                        footer={null}
                        onCancel={() => this.setState({ previewVisible: false })}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewSrc || src || defaultSrc} />
                    </Modal>
                </div>

            </div>
        )
    }
}

export default ImageWraper;
