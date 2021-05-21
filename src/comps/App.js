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
import store from '../api/store';// localhost tests
import sceneBridge from '../api/Bridge';

import { WEBGL } from 'three/examples/jsm/WEBGL.js';
import Room from './Room';
import Toolbar from './bars/Toolbar';
import Loading from './Loading';
import Dragging from './Dragging';
import { getGui } from './DataGui';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			webgl: WEBGL.isWebGLAvailable() ? "WEBGL is available" : "WEBGL is UNAVAILABLE"
		};
		window.scene_bridge = sceneBridge.bind(this)

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

		let gui
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
					// this.props.loadAllSku();

					this.props.newScene(defaultdressing);
					// clickMeubleLine("NYC231H238PP")
					// clickMeubleLine("NYC155H219P0")
					// clickMeubleLine("NYC155H219PG")
					// clickMeubleLine("NYH219P40FD")
					// clickMeubleLine("NYH219P62FD")
					// clickMeubleLine("NYH238P62FD")
					// clickMeubleLine("NYH238P62L040")
					// clickMeubleLine("NYH238P62L096")

					// clickMeubleLine("NYH238P62L119")//ID 248
					// clickMeubleLine("NYH238P62L096")
					clickMeubleLine("NYH219P40L096")
					// clickMeubleLine("NYC231H238PP")
					/* 	.then(e => {
					console.log("meuble loaded", e);
					}) */
					this.props.changeTool(Tools.HAMMER)
					// this.props.select(MainScene.meubles[0])// undefined => to mapStateToProps ?
					gui = getGui()
				})
		}
		else {
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
					// this.props.loadScene(dressing1)

					gui = getGui()
					gui.hide()
				})
				.catch(e => {
					console.log("load catalogue error", e);
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
					this.props.configLoaded &&
					<div>
						{localhost &&
							<Toolbar />
						}
						<Loading />
						<Dragging />
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
	}
}
const mapDispatchToProps = {
	BridgeEvent,
	setConfig,
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
	setSceneMaterial
};
export default connect(mapStateToProps, mapDispatchToProps)(App)