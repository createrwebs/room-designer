import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
// import 'react-notifications/lib/notifications.css';

// import config from '../config.json';// config is dynamic loaded
import { getConfig } from '../api/request';
import {
	setConfig
}
	from '../api/actions'
import { WEBGL } from 'three/examples/jsm/WEBGL.js';

import Header from './bars/Header';
import Toolbar from './bars/Toolbar';
import Footer from './bars/Footer';
import Room from './Room';
import MeubleInfo from './MeubleInfo';
// import MeubleList from './MeubleList';

import './App.css';

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};

		getConfig()
			.then(c => this.props.setConfig(c))
			.catch(e => {
				console.log("load config error", e);
			});
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
				{!this.props.allAssetsLoaded &&
					<div id="loading_splash" className="pouet">Loading ...</div>
				}
				<NotificationContainer />
				<Header />
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
								<Footer webgl={this.state.webgl} />
							</div>
						</footer>
					</div>
				}
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		configLoaded: state.config != null,
		allAssetsLoaded: state.allAssetsLoaded,
		meubleListShowed: false,//state.main.meubleListShowed,
		meubleInfoShowed: state.selection != null,
	}
}
const mapDispatchToProps = {
	setConfig
};
export default connect(mapStateToProps, mapDispatchToProps)(App)