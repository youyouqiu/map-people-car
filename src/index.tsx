
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React, { Component } from 'react';
import ReactDOM from "react-dom";
import './index.less';
import { Provider } from 'react-redux';
import getStore from './store';
import Intl from './intl';

class App extends Component {
    render() {
        return (
            <Provider store={getStore() as any}>
                <Intl />
            </Provider>
        );
    }
}

async function start() {
    ReactDOM.render(<App />, document.getElementById('topest-container'));
}

start();
