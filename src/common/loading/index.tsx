import React from 'react';
import { Spin } from 'antd';


export interface ILoadingProps {
  size?: 'small' | 'large' | 'default' | undefined;
  type?: 'inline' | 'block' | 'modal';
}

export default function Loading(props: ILoadingProps) {
  let { type } = props;
  if (!type) {
    type = 'inline'
  }
  if (type === 'inline') {
    return (
      <Spin
        spinning
        size={props.size}
      />
    );
  } else if (type === 'block') {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spin
          spinning
          size={props.size}
        />
      </div>
    )
  } else {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 9999 }}>
        <Spin
          spinning
          size={props.size}
        />
      </div>
    )
  }

}
