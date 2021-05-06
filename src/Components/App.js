import React, { Component } from 'react';
import { connect } from 'react-redux';

import config from '../../assets/config.json';
import defaultdressing from '../../assets/dressings/defaultdressing.json';
import dressing1 from '../../assets/dressings/dressing-1.json';
import dressing2 from '../../assets/dressings/dressing-2.json';
import catalogue from '../../assets/catalogue.json';
// import catalogueitem from '../../assets/dressings/catalogueitem.json';

import { getJson } from '../api/request';
import { localhost } from '../api/Config';
import {
	BridgeEvent,
	Tools,
	setConfig,
	resizeScene,
	newScene,
	saveScene,
	loadScene,
	takePicture,
	downloadScene,
	setScenes,
	loadAllSku,
	setCatalogue,
	clickMeubleLine,
	dragMeubleOverScene,
	dropMeubleOnScene,
	animeSelectedMeuble,
	changeTool,
	generateAllPix,
	setSceneMaterial,
}
	from '../api/actions'
import { WEBGL } from 'three/examples/jsm/WEBGL.js';

import { getCurrentScene } from '../3d/Dressing';

import Toolbar from './bars/Toolbar';
import Room from './Room';
import { getGui } from './DataGui';

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};
		window.scene_bridge = this.bridge.bind(this)

		/* log on meublesminet.com
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						log: 'barret',
						pwd: 'barret',
						rememberme: 'forever',
					})
				};
				fetch('https://meublesminet.com/3d/wp-login.php', requestOptions)
					.then(response => response.json()) */

		/* load_catalogue*/


		/* load_objects_of_type
				fetch('https://preprod.kinoki.fr/minet3d/wp-admin/admin-ajax.php', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
					body: new URLSearchParams({
						'action': 'load_objects_of_type',
						'type': 'modules',
					})
				}).then(response => response.json())*/

		/* 		getJson("scenes")
					.then(c => this.props.setScenes(c))
					.catch(e => {
						console.log("load scenes error", e);
					})
					.then(setScenesAction => {
						const loadFirstScene = false;
						if (setScenesAction.scenes.length > 0 && loadFirstScene) this.props.loadScene(setScenesAction.scenes[0].name)
					}) */

		const gui = getGui()
		if (localhost) {
			fetch('https://preprod.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
				method: 'GET',
			})
				.then(response => response.json())
				.then(catalogue => {
					this.props.setCatalogue(catalogue)

					// this.props.setCatalogue(catalogue)
					this.props.setConfig(config)// creation scene
					// this.props.loadScene(dressing2)
					// this.props.generateAllPix()
					this.props.newScene(defaultdressing);
					this.props.clickMeubleLine("NYH238P62L119")
				})
		}
		else {
			gui.hide()
			getJson("config")
				.then(c => this.props.setConfig(c))// creation scene
				.catch(e => {
					console.log("load config error", e);
				})

			fetch('https://preprod.kinoki.fr/minet3d/wp-json/minet-api/v2/catalogue', {
				method: 'GET',
			})
				.then(response => response.json())
				.then(catalogue => {
					this.props.setCatalogue(catalogue)

					this.props.newScene(defaultdressing);
					if (localhost) {
						// this.props.loadAllSku();
						if (false) {
							this.props.clickMeubleLine("NYH238P62L119")
							// this.props.clickMeubleLine("NYC191H238PP")
							// this.props.clickMeubleLine("NYC155H219P0")
							// this.props.clickMeubleLine("NYC155H219PG")
							// this.props.clickMeubleLine("NYH219P40FD")
							// this.props.clickMeubleLine("NYH219P62FD")
							// this.props.clickMeubleLine("NYH238P62FD")
							// this.props.clickMeubleLine("NYH238P62L040")
							// this.props.clickMeubleLine("NYH238P62L096")
							// this.props.clickMeubleLine("NYH238P62P40")
						}
						this.props.loadScene(dressing1)
					}
				})
				.catch(e => {
					console.log("load catalogue error", e);
				})
		}

	}
	bridge(event, param1, param2) {
		console.log("scene_bridge", event, param1, param2)
		switch (event) {
			case BridgeEvent.NEW_DRESSING:
				this.props.newScene(param1, param2)
				break;
			case BridgeEvent.SAVE_DRESSING:
				return getCurrentScene()
				break;
			case BridgeEvent.LOAD_DRESSING:
				this.props.loadScene(param1, param2)
				break;
			case BridgeEvent.DOWNLOAD_DRESSING:
				// this.props.downloadScene(param1, param2)
				break;
			case BridgeEvent.TAKE_PICTURE:
				this.props.takePicture()
				break;
			case BridgeEvent.GENERATE_ALL_PIX:
				this.props.generateAllPix()
				break;

			case BridgeEvent.ADD_MEUBLE_TO_SCENE:
				this.props.clickMeubleLine(param1, param2)
				break;
			case BridgeEvent.DRAG_MEUBLE_OVER_SCENE:
				this.props.dragMeubleOverScene(param1, param2)
				break;
			case BridgeEvent.DROP_MEUBLE_TO_SCENE:
				this.props.dropMeubleOnScene(param1, param2)
				break;
			case BridgeEvent.SET_SCENE_MATERIAL:
				this.props.setSceneMaterial(param1)
				break;
			case BridgeEvent.LOAD_ALL_SKU:
				this.props.loadAllSku()
				break;

			case BridgeEvent.SELECT_MEUBLE:
				this.props.changeTool(Tools.ARROW)
				break;
			case BridgeEvent.EDIT_MEUBLE:
				this.props.changeTool(Tools.HAMMER)
				break;
			case BridgeEvent.REMOVE_MEUBLE:
				this.props.changeTool(param1 ? Tools.TRASH : null)
				break;
			case BridgeEvent.ANIM_SELECTED_MEUBLE:
				this.props.animeSelectedMeuble()
				break;
			default:
				console.log("no case found for event ", event)
				break;
		}
	}
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize.bind(this));
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.onWindowResize.bind(this));
	}
	onWindowResize() {
		this.props.resizeScene()
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
					this.props.configLoaded &&
					<div>
						{localhost &&
							<Toolbar />
						}
						<Room />
					</div>
				}
			</div >
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
	BridgeEvent,
	setConfig,
	resizeScene,
	newScene,
	saveScene,
	loadScene,
	takePicture,
	downloadScene,
	setScenes,
	loadAllSku,
	setCatalogue,
	clickMeubleLine,
	dragMeubleOverScene,
	dropMeubleOnScene,
	animeSelectedMeuble,
	changeTool,
	generateAllPix,
	setSceneMaterial
};
export default connect(mapStateToProps, mapDispatchToProps)(App)