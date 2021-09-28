import React from 'react';



export default class LoadFailed extends React.Component {
    render() {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                color: 'lightgray'
            }}>
                加载页面失败，请检查网络或退出登录
            </div>
        )
    }
}
