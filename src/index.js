import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './api/store';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './fonts/css/font-awesome.css';

const localhost = window.location.hostname.indexOf('localhost') !== -1;

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);