import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './api/store';
import App from './comps/App';

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById("canvas-wrapper")
);
