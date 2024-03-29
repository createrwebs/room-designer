import React, { Component } from 'react';

import config from '../../assets/config.json';

import { getJson } from '../api/request';
import { localhost } from '../api/Utils';
import {
	Tools,
	setConfig,
	resizeScene,
	newScene,
	loadScene,
	clickMeubleLine,
	changeTool,
	showhideMetrage,
}
	from '../api/actions'
import { set as setCatalogue } from '../api/Catalogue'

import { parseSKU } from '../3d/Sku'
import { comingFromKino as sceneBridge, KinoEvent, goingToKino } from '../api/Bridge';
import { setId as setMaterialId } from '../3d/Material'

import { WEBGL } from 'three/examples/jsm/WEBGL.js';
import ThreeScene from './ThreeScene';
import Loading from './printing/Loading';
import Logging from './printing/Logging';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			catalogueLoaded: false
		};
		this.state = {
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};
		window.scene_bridge = sceneBridge.bind(this)

		setMaterialId(window.materials[0].id)

		if (localhost) {
			fetch('https://minet3d.kinoki.fr/wp-json/minet-api/v2/catalogue', {
				// fetch('https://kinotools.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
				method: 'GET',
			})
				.then(response => response.json())
				.then(catalogue => {
					setConfig(config)// creation scene
					setCatalogue(catalogue)
					this.setState({ catalogueLoaded: true })
					goingToKino(KinoEvent.APP_READY)

					if (loadedDressingAtStart) {
						loadScene(loadedDressingAtStart)// from index
					}
					else {
						newScene()
					}

					setTimeout(function () {
						// changeTool(Tools.HAMMER)
						// window.ts.meubles[0].click()
						showhideMetrage(true)
					}, 3000)
				})
		}
		else {
			getJson("config")
				.then(c => {
					setConfig(c ? c : config)

					const site_root = window.minet3d_reqs_object && window.minet3d_reqs_object.site_root ?
						window.minet3d_reqs_object.site_root : "/"
					fetch(`${site_root}/wp-json/minet-api/v2/catalogue`, {
						method: 'GET',
					})
						.then(response => response.json())
						.then(catalogue => {
							setCatalogue(catalogue)
							newScene();
							this.setState({ catalogueLoaded: true })
							goingToKino(KinoEvent.APP_READY)
						})
						.catch(e => {
						})
				})
				.catch(e => {
				})
		}
	}
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize.bind(this));
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.onWindowResize.bind(this));
	}
	onWindowResize() {
		resizeScene()
	}
	render() {
		const leftBottomDiv = {
			color: '#887788',
			font: '.8em Arial, sans-serif',
			position: 'absolute',
			padding: '8px',
			bottom: '0px',
		};
		const rightBottomDiv = {
			color: '#222222',
			font: '.8em Arial, sans-serif',
			position: 'absolute',
			padding: '8px',
			bottom: '0px',
			right: '0px',
			textAlign: "right"
		};
		const centralBottomDiv = {
			color: '#222222',
			font: '.8em Arial, sans-serif',
			position: 'absolute',
			padding: '8px',
			bottom: '0px',
			right: '0px',
			width: '100%',
			textAlign: "center"
		};
		return (
			<div
				style={{
					top: '0',
					left: '0',
					display: 'block',
					width: '100%',
					height: '100%',
					// border: '1px solid green'
				}}>
				{!this.props.allAssetsLoaded &&
					<div className="loading"></div>
				}
				{
					this.state.catalogueLoaded &&
					<div>
						{localhost &&
							<Loading style={leftBottomDiv} reducedVarToLog="loggingBottomLeft" />
						}
						{localhost &&
							<Loading style={centralBottomDiv} reducedVarToLog="kinoBridge" />
						}
						{localhost &&
							<Logging style={rightBottomDiv} />
						}
						<ThreeScene />
					</div>
				}
			</div >
		)
	}
}
export default App