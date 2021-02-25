import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
// import { NotificationManager } from 'react-notifications';
// import 'react-notifications/lib/notifications.css';

// import config from '../config.json';// dynamic load
import { getConfig } from '../api/request';
import {
	setConfig
}
	from '../api/actions'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from './bars/Header';

import Room from './Room';
import MeubleInfo from './MeubleInfo';
// import MeubleList from './MeubleList';

import { WEBGL } from 'three/examples/jsm/WEBGL.js';


import './App.css';

const params = window.location.search.substr(1).split(',');
const localhost = window.location.hostname.indexOf('localhost') !== -1;

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			showJoinForm: false,
			name: localhost ? "fab" : undefined,
			email: localhost ? "fab@email.com" : undefined,
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};
		this.handleSubmit = this.handleSubmit.bind(this);

		getConfig()
			.then(c => this.props.setConfig(c))
			.catch(e => {
				console.log("load config error", e);
			});
	}
	handleSubmit(event) {
		event.preventDefault();
		console.log('handleSubmit', this.state)
	}
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize);
	}
	onWindowResize() {
		/* 		camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
		
				renderer.setSize(window.innerWidth, window.innerHeight);
		
				webgl_render(); */
	}
	render() {
		return (
			<div className="container" style={{
				// backgroundColor: 'white',
				// position: 'absolute',
				top: '0',
				left: '0',
				// padding: '6px',
				display: 'block',
				// zIndex: 99999,
				width: "100%",
				height: "100%"
			}}>
				<NotificationContainer />
				<Header />
				{this.props.configLoaded &&
					<div className="app">
						<Container>
							<Row>
								<Col sm={8}>
									<Room />
								</Col>
								{
									this.props.meubleInfoShowed &&
									<Col sm={4}><MeubleInfo /></Col>
								}
								{
									this.props.meubleListShowed &&
									<Col sm={4}><MeubleList /></Col>
								}
							</Row>
						</Container>
					</div>
				}
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		configLoaded: state.config != null,
		meubleListShowed: false,//state.main.meubleListShowed,
		meubleInfoShowed: state.selection != null,
	}
}
const mapDispatchToProps = {
	setConfig
};
export default connect(mapStateToProps, mapDispatchToProps)(App)