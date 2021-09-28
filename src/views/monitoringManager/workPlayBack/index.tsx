import React, { memo, useState } from 'react';
import { connect } from 'react-redux';
import { LeftOutlined } from "@ant-design/icons";
import LeftContainer from './leftContainer'
import RightContainer from './rightTrackContainer'
import styles from './index.module.less';
const Index = memo(() => {
    const [treeVisible, setTreeVisible] = useState<boolean>(true);
    function toggleTreeVisible() {
        setTreeVisible(!treeVisible)
    }
    return <div className={styles.monitoringContainer}>
        <div className={[styles.leftSide, !treeVisible && styles.leftHide].join(' ')}>
            <LeftContainer />
        </div>
        <div className={styles.rightSide}>
            <div className={styles.toggleIcon} onClick={toggleTreeVisible}>
                <LeftOutlined className={[styles.arrowIcon, !treeVisible && styles.arrowRotate].join(' ')} />
            </div>
            <RightContainer />
        </div>
    </div>
})
export default connect(
    null,
    null
)(Index);