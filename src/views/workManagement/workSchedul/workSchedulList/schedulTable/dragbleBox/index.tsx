import React, { useState } from 'react';
import styles from './index.module.less';

const myStyle: React.CSSProperties = {
    position: 'absolute',
    //   top: '4%',
    //   left: '1px',
    //   height: '91%',
    width: '100%',
};

const DragbleBox = (props: any) => {
    const { children, uid, index } = props;

    const [toolShow, setToolShow] = useState(false);
    const leftRef: React.RefObject<HTMLDivElement> = React.createRef();
    const rightRef: React.RefObject<HTMLDivElement> = React.createRef();
    const boxRef: React.RefObject<HTMLDivElement> = React.createRef();

    /**
     *
     * @param element 向后获取最近一个有子元素的box的值
     */
    const getLatestNotNullBoxBehand = (element: any): any => {
        if (!element.nextElementSibling) {
            return;
        } else if (element.nextElementSibling.getAttribute('haschild') != 1) {
            return getLatestNotNullBoxBehand(element.nextElementSibling);
        }
        return element.nextElementSibling;
    };
    /**
     *
     * @param element 想前获取最近一个有子元素的box的值
     */
    const getLatestNotNullBoxBefore = (element: any): any => {
        if (!element.previousElementSibling) {
            return;
        } else if (element.previousElementSibling.getAttribute('haschild') != 1) {
            return getLatestNotNullBoxBefore(element.previousElementSibling);
        }
        return element.previousElementSibling;
    };
    let initCellWidth = 0; //基础单元格的宽度
    let initBoxBoundary = { left: 0, right: 0 }; //盒子的初始边界
    let initCursorPosX = 0; //mouseDown 时 鼠标位置
    let initBoxInfo = [0, 0]; //盒子初始占据的格子数和偏移的left值
    const boxDragBoundary = { left: 0, right: 0 }; //盒子拖动的边界
    /**
     * 获取元素边界信息
     * @param element 元素
     */
    const getBoundary = (element: HTMLDivElement): { left: number; right: number } => {
        if (element) {
            const res = element.getBoundingClientRect();
            return {
                left: res.left,
                right: res.right,
            };
        } else {
            return {
                left: 0,
                right: 0,
            };
        }
    };
    /**
     * 限制数字在某个范围
     * @param number {left: number, right: number}
     */
    const restrict = (target: number, range: { left: number; right: number }): number => {
        if (target < range.left) {
            return range.left;
        } else if (target > range.right) {
            return range.right;
        }
        return target;
    };

    /**
     * 根据元素的宽度和left值判断元素跨了几列
     * @param element
     */
    const calc = (element: HTMLDivElement | null, cellwidth: number) => {
        if (element) {
            const width = element.getBoundingClientRect().width;
            const left = parseInt(window.getComputedStyle(element).left);
            return [Math.round(left / cellwidth), Math.round(width / cellwidth)];
        }
        return [0, 0];
    };

    //拖动事件 右边
    const dragHandler = (e: any) => {
        e = e || event;
        e.preventDefault();
        e.stopPropagation();
        const editor = boxRef.current;
        const width = editor?.getBoundingClientRect().width || 0;
        const colspan = (editor as any).parentNode.getAttribute('colspan'); //单元格占据的格子数
        if (initCellWidth == 0) {
            initCellWidth = width / colspan;
        }
        // console.log('格子宽度:' + initCellWidth);
        initBoxInfo = calc(editor, initCellWidth);
        initBoxBoundary = getBoundary(e.target.parentNode);
        initCursorPosX = e.clientX;
        boxDragBoundary.left = initBoxBoundary.left + initCellWidth;
        // console.log('初始盒子边界')
        // console.log(initBoxBoundary)

        const nextBox = getLatestNotNullBoxBehand(editor?.parentNode); //下一个不为空的盒子  用来确定当前盒子的拖动范围
        boxDragBoundary.right = getBoundary(nextBox).left;
        //右边单元格都为空时
        if (!nextBox) {
            const table: any = document.getElementById('table_tl');
            boxDragBoundary.right = table.getBoundingClientRect().right;
        }
        // console.log('盒子拖动边界',boxDragBoundary);

        // 拖动事件
        document.body.onmousemove = (e: any) => {
            e = e || event;
            e.stopPropagation();
            const moveDistance = e.clientX - initCursorPosX; //鼠标移动的距离
            let newWidth = width + moveDistance;
            //盒子新宽度的限制
            const boxWidthBoundary = {
                left: initCellWidth,
                right: initCellWidth + boxDragBoundary.right - boxDragBoundary.left,
            };
            newWidth = restrict(newWidth, boxWidthBoundary);
            if (editor) {
                editor.style.width = newWidth + 'px';
            }
            //鼠标抬起事件
            document.body.onmouseup = (e) => {
                e.stopPropagation();
                const times = Math.floor(newWidth / initCellWidth); //新宽度是初始宽度的几个整数倍
                const modify = newWidth % initCellWidth > initCellWidth / 2 ? 1 : 0; //修正times
                newWidth = (times + modify) * initCellWidth;
                newWidth = newWidth < initCellWidth ? initCellWidth : newWidth;
                if (editor) {
                    editor.style.width = newWidth + 'px';
                }

                const res = calc(editor, initCellWidth);
                // console.log(initBoxInfo);
                // console.log('ssss');
                // console.log(res);
                props.updateData(uid, index, res, initBoxInfo);
                document.body.onmouseup = null;
                document.body.onmousemove = null;
            };
        };
    };

    //拖动事件 左边
    const dragHandler2 = (e: any) => {
        e = e || event;
        e.preventDefault();
        e.stopPropagation();
        const editor = boxRef.current;
        const width = editor?.getBoundingClientRect().width || 0;
        let initLeft = 0; //初始left值
        const colspan = (editor as any).parentNode.getAttribute('colspan'); //单元格占据的格子数
        if (initCellWidth == 0) {
            initCellWidth = width / colspan;
        }
        // console.log('格子宽度:' + initCellWidth);
        initBoxInfo = calc(editor, initCellWidth);
        initLeft = parseInt(window.getComputedStyle(e.target.parentNode).left);
        // console.log('初始left' + initLeft);

        initBoxBoundary = getBoundary(e.target.parentNode);
        initCursorPosX = e.clientX;
        boxDragBoundary.right = initBoxBoundary.right - initCellWidth;
        // console.log('初始盒子边界')
        // console.log(initBoxBoundary)

        const nextBox = getLatestNotNullBoxBefore(editor?.parentNode); //下一个不为空的盒子  用来确定当前盒子的拖动范围
        boxDragBoundary.left = getBoundary(nextBox).right;
        //左边单元格都为空时
        if (!nextBox) {
            const table: any = document.getElementById('table_tl');
            boxDragBoundary.left = table.getBoundingClientRect().left + initCellWidth;
        }
        // console.log('盒子拖动边界')
        // console.log(boxDragBoundary)

        // 拖动事件
        document.body.onmousemove = (e: any) => {
            e = e || event;
            e.stopPropagation();
            const moveDistance = initCursorPosX - e.clientX; //鼠标移动的距离
            const direction: boolean = moveDistance > 0; //true 向左
            // 向左滑动
            if (direction) {
                let newWidth = width + moveDistance;
                let restictedDistance = restrict(moveDistance, {
                    left: initBoxBoundary.left - initBoxBoundary.right,
                    right: initBoxBoundary.left - boxDragBoundary.left,
                });
                if (editor) {
                    editor.style.left = -restictedDistance + initLeft + 'px';
                }
                //盒子新宽度的限制
                const boxWidthBoundary = {
                    left: initCellWidth,
                    right: initCellWidth + boxDragBoundary.right - boxDragBoundary.left,
                };
                // console.log('黑子宽度')
                // console.log(boxWidthBoundary)

                newWidth = restrict(newWidth, boxWidthBoundary);
                // console.log(newWidth)

                if (editor) {
                    editor.style.width = newWidth + 'px';
                }
                //鼠标抬起事件
                document.body.onmouseup = (e) => {
                    e.stopPropagation();
                    const times = Math.floor(newWidth / initCellWidth); //新宽度是初始宽度的几个整数倍
                    const modify = newWidth % initCellWidth > initCellWidth / 2 ? 1 : 0; //修正times
                    newWidth = (times + modify) * initCellWidth;

                    const times2 = Math.floor(restictedDistance / initCellWidth); //新宽度是初始宽度的几个整数倍
                    restictedDistance = (times2 + modify) * initCellWidth;

                    newWidth = newWidth < initCellWidth ? initCellWidth : newWidth;
                    if (editor) {
                        editor.style.width = newWidth + 'px';
                        editor.style.left = -restictedDistance + initLeft + 'px';
                    }

                    const res = calc(editor, initCellWidth);
                    console.log(res);
                    props.updateData(uid, index, res, initBoxInfo);
                    document.body.onmouseup = null;
                    document.body.onmousemove = null;
                };
            } else {
                const moveDistance = e.clientX - initCursorPosX; //鼠标移动的距离
                //向右滑动
                let newWidth = width - moveDistance;
                let restictedDistance = restrict(moveDistance, {
                    left: 0,
                    right: initBoxBoundary.right - initBoxBoundary.left - initCellWidth,
                });
                if (editor) {
                    editor.style.left = restictedDistance + initLeft + 'px';
                }
                //盒子新宽度的限制
                const boxWidthBoundary = {
                    left: initCellWidth,
                    right: initCellWidth + boxDragBoundary.right - boxDragBoundary.left,
                };
                newWidth = restrict(newWidth, boxWidthBoundary);
                if (editor) {
                    editor.style.width = newWidth + 'px';
                }
                //鼠标抬起事件
                document.body.onmouseup = (e) => {
                    e.stopPropagation();
                    const times = Math.floor(newWidth / initCellWidth); //新宽度是初始宽度的几个整数倍
                    const modify = newWidth % initCellWidth > initCellWidth / 2 ? 1 : 0; //修正times
                    newWidth = (times + modify) * initCellWidth;

                    const times2 = Math.floor(restictedDistance / initCellWidth); //新宽度是初始宽度的几个整数倍
                    const modify2 = restictedDistance % initCellWidth > initCellWidth / 2 ? 1 : 0; //修正times

                    restictedDistance = (times2 + modify2) * initCellWidth;

                    newWidth = newWidth < initCellWidth ? initCellWidth : newWidth;
                    if (editor) {
                        editor.style.width = newWidth + 'px';
                        editor.style.left = restictedDistance + initLeft + 'px';
                    }

                    const res = calc(editor, initCellWidth);
                    // console.log(res);
                    props.updateData(uid, index, res, initBoxInfo);
                    document.body.onmouseup = null;
                    document.body.onmousemove = null;
                };
            }
        };
    };

    return (
        <>
            <div
                className={styles.box}
                onMouseDown={() => {
                    //这里不要用 onClick 或者 onMouseUp 事件，you can have a try
                    setToolShow(!toolShow);
                }}
                style={myStyle}
                ref={boxRef}
            >
                {children}
                <>
                    <p
                        className={styles.left}
                        onMouseDown={dragHandler2}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        ref={leftRef}
                    ></p>
                    <p
                        className={styles.right}
                        onMouseDown={dragHandler}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        ref={rightRef}
                    ></p>
                    <p className={styles.abs}></p>
                </>
            </div>
        </>
    );
};

export default DragbleBox;
