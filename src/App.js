import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
// import { NotificationManager } from 'react-notifications';
// import 'react-notifications/lib/notifications.css';
import InfoBar from './Components/bars/InfoBar';
import Room from './Components/Room';
import { WEBGL } from 'three/examples/jsm/WEBGL.js';

import './App.css';

import config from './Config.json';
console.log(config);

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
				<Room />
				<InfoBar webgl={this.state.webgl} />
				{this.state.showJoinForm &&
					<div className="websdktest">
						<form onSubmit={this.handleSubmit}>
							<div>
								<input
									placeholder="meeting number"
									type="text"
									autoComplete="meeting_number"
									maxLength="32"
									value={this.state.meeting_number}
									onChange={(e) => this.setState({ meeting_number: e.target.value })}
								/>
							</div>
							<div>
								<input
									placeholder="room password"
									type="text"
									autoComplete="meeting_pwd"
									maxLength="32"
									value={this.state.meeting_pwd}
									onChange={(e) => this.setState({ meeting_pwd: e.target.value })}
								/>
							</div>
							<div>
								<input
									placeholder="nom"
									type="text"
									autoComplete="name"
									maxLength="32"
									value={this.state.name}
									onChange={(e) => this.setState({ name: e.target.value })}
								/>
							</div>
							<div>
								<input
									placeholder="email"
									type="text"
									autoComplete="email"
									maxLength="32"
									value={this.state.email}
									onChange={(e) => this.setState({ email: e.target.value })}
								/>
							</div>
							<input type="submit" value="join" />
						</form>
					</div>
				}
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
	}
}
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(App)