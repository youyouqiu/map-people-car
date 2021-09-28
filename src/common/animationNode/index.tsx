/* eslint-disable react/prop-types */
/**
 * 功能：创建动画，类似于加入购物车的那种
 * 使用：
 *    1、必须传入一个dom节点（参数 to），用来获取动画的结束点位置信息
 *    2、父组件拿到refs后，调用run方法执行动画
 */
import React,{ useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import ReactDOM from 'react-dom'
interface IProps {
  to: Element | null; // 动画结束参考节点
  animationEnd?: () => void; // 动画结束回调
  content?: React.ReactNode; // 执行动画的ReactNode节点
  children?: React.ReactNode; // 解决ts报错
}

export interface RefProps {
  run?: () => void
}

const AnimateNode =forwardRef<RefProps, IProps>((props, ref) => {
  const {children, to, content, animationEnd} = props
  const from = useRef<HTMLDivElement>(null) // 动画开始参考节点
  const divRef = useRef<HTMLDivElement>(null) // 执行动画的节点
  const [position, setPosition] = useState<[number, number]>([ 0, 0 ]) //执行动画的节点的left和top值
  const [opacity, setOpacity] = useState(0) // 执行动画节点的透明度
  const [isRunning, setIsRunning] = useState(false) // 是否在动画执行中的标志
  const [transition, setTransition] = useState('none') // transition 参数
  const endPos = to?.getBoundingClientRect() // 结束点位置信息
  const startPos = from.current?.getBoundingClientRect()  // 开始点位置信息
  
  // 动画结束回调
  const animationEndFn = () => {
    setTransition('none')
    setIsRunning(false)
    if(startPos){
      setPosition([startPos.left + (startPos.width / 2), startPos.top + (startPos.height / 2)])
    }
    animationEnd && animationEnd()
    divRef.current?.removeEventListener('transitionend',animationEndFn)
  }

  useEffect(() => {
    if(!startPos) return
    setPosition([startPos.left + (startPos.width / 2), startPos.top + (startPos.height / 2)])
  },[startPos?.left])

  useImperativeHandle(ref, () => ({
    run
  }));
  // 执行动画
  const run = () => {
    if(!endPos || isRunning) return
    setIsRunning(true)
    divRef.current?.addEventListener('transitionend',animationEndFn)
    setTransition('none')
    setOpacity(1)
    setTimeout(() => {
      setTransition('all ease 0.8s')
      setOpacity(0)
      setPosition([endPos.left + (endPos.width / 2), endPos.top + (endPos.height / 2)])
    })
  }

  return(
    <div
      ref={from} 
    >
      {
        ReactDOM.createPortal(
          <div 
            ref={divRef}
            style={{
            width: '20px', 
            height: '20px', 
            zIndex: 10000,
            position: 'fixed', 
            transition: transition,
            opacity: opacity,
            left: position[0],
            top: position[1]
          }}>
            {content}
          </div>,
          document.querySelector('body') as HTMLBodyElement
        )
      }
      {children}
    </div>
  )
})
export default AnimateNode