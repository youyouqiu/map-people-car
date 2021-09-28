import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './page404.module.less';

class Page404 extends Component {
  render() {
    return (
      <div className={styles.module}>
        <p>404</p>
        <p>你所查看的页面不存在</p>
      </div>
    );
  }
}

export default connect(null, null)(Page404);
