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

	import Header from './bars/Header';
	import Toolbar from './bars/Toolbar';
import InfoBar from './bars/InfoBar';
import Room from './Room';
import MeubleInfo from './MeubleInfo';
// import MeubleList from './MeubleList';

import { WEBGL } from 'three/examples/jsm/WEBGL.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'


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
			<div className="main">
				<header>
					<Header />
				
				</header>


				<div id="loading_splash" className="pouet">Loading ...</div>
				<NotificationContainer />
				{this.props.configLoaded &&
					<div className="">
						
<main className="">
	
  <div className="scene_wrapper">
	  <div className="row h-100">
		<div className="col-9 h-100 px-0 canvas-wrapper">
		  	<div className="toolbar">
				<Toolbar />
			</div>			
			<div className="column-main">
				<Room />
			</div>

		</div>
		  
		<div className="col-3 column-left">
		  	<MeubleInfo />
		</div>
		  
	  </div>
	  
	  
	  
  </div>	
	
	

</main>


						{/* {this.props.meubleListShowed &&
						<div className="column-left">
						<MeubleList />
						</div>
					} */}
						{
							this.props.meubleInfoShowed &&
							<div className="column-left">
								
							</div>
						}
						<footer className="footer mt-auto py-2">
						<div className="container">
							<span className="">
							<InfoBar webgl={this.state.webgl} />


							</span>
						</div>
						</footer>
						
					</div>
				}
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
		configLoaded: state.config != null,
		meubleListShowed: false,//state.main.meubleListShowed,
		meubleInfoShowed: state.selection != null,
	}
}
const mapDispatchToProps = {
	setConfig
};
export default connect(mapStateToProps, mapDispatchToProps)(App)