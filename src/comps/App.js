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
}
	from '../api/actions'
import { set as setCatalogue } from '../api/Catalogue'

import { parseSKU } from '../3d/Sku'
import sceneBridge from '../api/Bridge';
import { setId as setMaterialId } from '../3d/Material'

import { WEBGL } from 'three/examples/jsm/WEBGL.js';
import ThreeScene from './ThreeScene';
import Loading from './printing/Loading';
import Logging from './printing/Logging';
import { getGui } from './printing/DataGui';

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			configLoaded: false,
			catalogueLoaded: false
		};
		this.state = {
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};
		window.scene_bridge = sceneBridge.bind(this)

		setMaterialId(window.materials[0].id)

		let gui
		if (localhost) {

			fetch('https://kinotools.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
				method: 'GET',
			})
				.then(response => response.json())
				.then(catalogue => {
					setConfig(config)// creation scene
					setCatalogue(catalogue)

					if (loadedDressingAtStart) {
						loadScene(loadedDressingAtStart)// from index
					}
					else {
						newScene()
					}
					this.setState({ catalogueLoaded: true })
					setTimeout(changeTool, 1500, Tools.HAMMER)
					// gui = getGui()
				})
		}
		else {
			getJson("config")
				.then(c => {
					setConfig(c ? c : config)

					fetch('https://kinotools.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
						method: 'GET',
					})
						.then(response => response.json())
						.then(catalogue => {
							setCatalogue(catalogue)
							/* 
							gui = getGui()
							gui.hide() */
							newScene();
							this.setState({ catalogueLoaded: true })

						})
						.catch(e => {
							console.log("load catalogue error", e);
						})
				})
				.catch(e => {
					console.log("load config error", e);
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
						<Loading />
						<Logging />
						<ThreeScene />
					</div>
				}
			</div >
		)
	}
}
export default App