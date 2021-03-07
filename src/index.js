import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './api/store';
import App from './components/App';

import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'bootstrap/dist/css/bootstrap.min.css';
// import './fonts/css/font-awesome.css';// /src/fonts/ can be deleted safely, replaced by @fortawesome/fontawesome-free module

const localhost = window.location.hostname.indexOf('localhost') !== -1;

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);