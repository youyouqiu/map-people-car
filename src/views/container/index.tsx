import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import History from "history";
import Header from "./header";
import Content from './content'

interface IProps {
  history: History.History;
  isFullScreen: boolean;
}

class Container extends Component<IProps, any> {
  render() {
    const { history, isFullScreen } = this.props;

    const headerStyle = isFullScreen ? { display: 'none' } : {};
    const contentStyle = isFullScreen ? { height: '100%' } : { height: 'calc(100% - 60px)' };
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Header history={history} style={headerStyle} />
        <div style={contentStyle}>
          <Content />
        </div>
      </div>
    )
  }
}


function mapStateToProps(state: AllState) {
  return {
    isFullScreen: state.container.isFullScreen,
  };
}

export default connect<Partial<IProps>, any, any, any>(
  mapStateToProps,
  null
)(Container);