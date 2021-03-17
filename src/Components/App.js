import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
// import 'react-notifications/lib/notifications.css';

// import config from '../config.json';// config is dynamic loaded
import { getJson } from '../api/request';
import {
	setConfig, setScenes
}
	from '../api/actions'
import { WEBGL } from 'three/examples/jsm/WEBGL.js';

import Header from './bars/Header';
import Toolbar from './bars/Toolbar';
import Footer from './bars/Footer';
import Room from './Room';
import MeubleInfo from './MeubleInfo';
import Composer from './Composer';
import Texturer from './Texturer';
import MeubleList from './MeubleList';

import './App.css';

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};

		getJson("config")
			.then(c => this.props.setConfig(c))
			.catch(e => {
				console.log("load config error", e);
			})

		getJson("scenes")
			.then(c => this.props.setScenes(c))
			.catch(e => {
				console.log("load scenes error", e);
			})
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
				{!this.props.allAssetsLoaded &&
					<div className="loading">Loading ...</div>
				}
				<NotificationContainer />
				<Header />
				{this.props.configLoaded &&
					<div className="scene-wrapper">
						<div className="row h-100">
							<div className="col-9 h-100 px-0 canvas-wrapper">
								<div className="column-main">
									<Toolbar />
									<Room />
								</div>
							</div>
							{this.props.meubleInfoShowed &&
								<div className="col-3 column-left">
									<MeubleInfo />
								</div>
							}
							{this.props.meubleListShowed &&
								<div className="column-left">
									<MeubleList />
								</div>
							}
							{this.props.composerShowed &&
								<div className="column-left">
									<Composer />
								</div>
							}
							{this.props.texturerShowed &&
								<div className="column-left">
									<Texturer />
								</div>
							}
						</div>
					</div>
				}
				<Footer webgl={this.state.webgl} />
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		configLoaded: state.config != null,
		allAssetsLoaded: state.allAssetsLoaded,
		meubleListShowed: state.layout.meubleListShowed,
		composerShowed: state.layout.composerShowed,
		texturerShowed: state.layout.texturerShowed,
		meubleInfoShowed: state.selection != null,
	}
}
const mapDispatchToProps = {
	setConfig, setScenes
};
export default connect(mapStateToProps, mapDispatchToProps)(App)