import React from 'react'

interface IProps {
    ee?: string;
}
interface IState {
    hasError?: boolean;
}

class ErrorBoundary extends React.Component<IProps,IState> {
    constructor(props: IProps) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError() {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return <h4>组件出错了</h4>;
      }
      return this.props.children; 
    }
  }

  export default ErrorBoundary