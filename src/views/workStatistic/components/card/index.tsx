/* eslint-disable react/prop-types */
import React from 'react'
import st from './index.module.less'
interface IProps {
  title: string;
  data1: number;
  name1: string;
  data2: number;
  name2: string;
  color1: string;
  color2: string;
  icon: string
}
const Card: React.FC<IProps> = (props) => {
  const {title, data1, name1, data2, name2, color1, color2, icon} = props
  return(
    <div className={st.box}>
      <div className={st.title} style={{background: color1}}>
        <span  className={st.span1}>{title}</span>
        <span  className={st.span2}>{name1}: {data1 || 0}</span>
      </div>
      <div className={st.content}>
        <div className={st.left}>
          <span className={st.span1}>{name2}</span>
          <span className={st.span2}>{data2 || 0}</span>
        </div>
        <div className={st.right}  style={{background: color2}}>
          <img src={icon}/>
        </div>
      </div>
    </div>
  )
}
export default Card