import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './api/store';
import App from './components/App';

import './fonts/css/font-awesome.css';

const localhost = window.location.hostname.indexOf('localhost') !== -1;

/* 		{
	"file": "NYCOIFH238.fbx-2 Separations.fbx",
	"rotateX": "-90"
},
{
	"file": "H219-L48-GLACE-Dr v2.fbx",
	"rotateX": "-90"
}, */


ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("root")
);