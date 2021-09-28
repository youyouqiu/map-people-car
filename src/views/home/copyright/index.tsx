import React, { Component } from 'react';
import styles from './index.module.less';


class Copyright extends Component<any, any, any> {

    render() {
        return (
            <div className={styles['copyright']}>Copyright@2019北京中位科技有限公司</div>
        )
    }


}

export default Copyright;