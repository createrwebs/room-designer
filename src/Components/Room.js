import React, { Component } from 'react';
import { connect } from 'react-redux';

import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import MainScene from '../3d/MainScene';
import Loader from '../3d/Loader'
import Draggable from '../3d/Draggable'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const localhost = window.location.hostname.indexOf('localhost') !== -1;

class App extends Component {
	constructor (props) {
		super(props);
		this.canvasWrapperRef = React.createRef();

		this.state = {
		};
	}
	componentDidMount() {
		const node = this.canvasWrapperRef.current;
		node.appendChild(MainScene.getRendererNodeElement());
		if (localhost) node.appendChild(MainScene.getStatNodeElement());

		// MainScene.fbxloadAll()
		this.fbxloadAll()
	}
	fbxloadAll() {

		// here or on reducers ?

		Loader.setup();
		const loader = new FBXLoader(Loader.manager);
		this.props.fbxs.forEach(props => loader.load(`models/${props.file}.fbx`, this.fbxloaded.bind(this, props)))
	}
	fbxloaded(props, object) {
		// this.add(new Draggable(props, object));// meuble to put in the list better than the scene

		if (props.position) {
			MainScene.add(new Draggable(props, object));
		}
	}
	render() {
		// MainScene.updateCamera(this.props)
		// MainScene.updateLights(this.props.light)
		MainScene.orbitControls.update();// renders
		// MainScene.render()

		return (
			<div id="canvas-wrapper" className="con"
				ref={this.canvasWrapperRef}
				style={{
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
			</div>
		)
	}
}
const mapStateToProps = (state) => {

	return {
		fbxs: state.config.fbx,
		fov: state.camera.fov,
		zoom: state.camera.zoom,
		focus: state.camera.focus,
		light: state.light,
	}
}
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(App)