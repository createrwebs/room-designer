import React, { Component } from 'react';
import { connect } from 'react-redux';

import config from '../../assets/config.json';
import defaultdressing from '../../assets/dressings/defaultdressing.json';
import dressing1 from '../../assets/dressings/dressing-1.json';
import dressing2 from '../../assets/dressings/dressing-2.json';
// import catalogue from '../../assets/catalogue.json';
// import catalogueitem from '../../assets/dressings/catalogueitem.json';

import { getJson } from '../api/request';
import { localhost } from '../api/Config';
import {
	BridgeEvent,
	Tools,
	setConfig,
	resizeScene,
	newScene,
	loadScene,
	setScenes,
	loadAllSku,
	setCatalogue,
	clickMeubleLine,
	select,
	dragMeubleOverScene,
	dropMeubleOnScene,
	animeSelectedMeuble,
	changeTool,
	generateAllPix,
	setSceneMaterial,
}
	from '../api/actions'
import { parseSKU } from '../3d/Sku'
import sceneBridge from '../api/Bridge';

import { WEBGL } from 'three/examples/jsm/WEBGL.js';
import Room from './Room';
// import Plan from './Plan';
import Loading from './Loading';
import Dragging from './Logging';
import { getGui } from './DataGui';

// import Toolbar from './bars/Toolbar';
import Toolbar from './bars/ToolbarProduction';// test main.bundle.js size

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

		/* 		getJson("scenes")
					.then(c => setScenes(c))
					.catch(e => {
						console.log("load scenes error", e);
					})
					.then(setScenesAction => {
						const loadFirstScene = false;
						if (setScenesAction.scenes.length > 0 && loadFirstScene) loadScene(setScenesAction.scenes[0].name)
					}) */

		let gui
		if (localhost) {

			fetch('https://kinotools.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
				method: 'GET',
			})
				.then(response => response.json())
				.then(catalogue => {
					setCatalogue(catalogue)

					/* catalogue.forEach(element => {
						console.log(element.sku)
					}); */

					/* print all sku and skuinfo fmor catalogue */
					/* const modules = catalogue.filter(i => parseSKU(i.sku).type === "module")
					console.log("sku of type module :", modules) */

					setConfig(config)// creation scene
					// loadScene(dressing2)
					// generateAllPix()
					// this.props.loadAllSku();

					if (typeof composition !== 'undefined') {
						loadScene(composition)
					} else {
						newScene(defaultdressing);
						// clickMeubleLine("NYC155H219P0")
						// clickMeubleLine("NYC155H219PG")
						// clickMeubleLine("NYH219P40FD")
						// clickMeubleLine("NYH219P62FD")
						// clickMeubleLine("NYH238P62FD")
						// clickMeubleLine("NYH238P62L040")

						// clickMeubleLine("NYH219P62L040")//ID 248 autoput items
						// clickMeubleLine("NYH219P62L040")//ID 248 autoput items
						// clickMeubleLine("NYH219P62L040")//ID 248 autoput items
						// clickMeubleLine("NYH238P62L119")//ID 248 autoput items
						// clickMeubleLine("NYH238P62L096")// autoput items
						// clickMeubleLine("NYH219P40L096")// autoput items
						// clickMeubleLine("NYC231H238PP")// autoput items
						// clickMeubleLine("NYANGH219")// has laquable
						// clickMeubleLine("NYCOIFH238SF")
						/* 	.then(e => {
							console.log("meuble loaded", e);
						}) */

						// this.props.select(MainScene.meubles[0])// undefined => to mapStateToProps ?
					}
					this.setState({ catalogueLoaded: true })
					// setTimeout(changeTool, 1500, Tools.HAMMER)
					gui = getGui()
				})
		}
		else {
			getJson("config")
				.then(c => {
					setConfig(c)

					fetch('https://kinotools.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
						method: 'GET',
					})
						.then(response => response.json())
						.then(catalogue => {
							setCatalogue(catalogue)
							/* 
							gui = getGui()
							gui.hide() */
							if (typeof composition !== 'undefined') {
								loadScene(composition)
							} else {
								newScene(defaultdressing);
							}
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
						{localhost &&
							<Toolbar />
						}
						{/* <div
							style={{
								bottom: '8px',
								right: '8px',
								display: 'block',
								width: '400px',
								height: '400px',
								border: '1px solid white',
								position: 'absolute'
							}}>
							<Plan />
						</div> */}
						<Loading />
						<Dragging />
						<Room />
					</div>
				}
			</div >
		)
	}
}
const mapDispatchToProps = {
	BridgeEvent,
	setScenes,
	loadAllSku,
	clickMeubleLine,
	select,
	dragMeubleOverScene,
	dropMeubleOnScene,
	animeSelectedMeuble,
	generateAllPix,
};
export default connect(null, mapDispatchToProps)(App)