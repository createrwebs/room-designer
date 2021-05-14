import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	add,
	allLoaded
}
	from '../api/actions'

import MainScene from '../3d/MainScene';
import Loader from '../3d/Loader'
import Draggable from '../3d/Draggable'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// const localhost = window.location.hostname.indexOf('localhost') !== -1;

class Room extends Component {
	constructor (props) {
		super(props);
		this.threejsSceneRef = React.createRef();

		this.state = {
		};
	}
	componentDidMount() {
		const node = this.threejsSceneRef.current;
		node.appendChild(MainScene.getRendererNodeElement());
		// if (localhost) node.appendChild(MainScene.getStatNodeElement());

		// shortcut to display scene:
		// this.props.allLoaded()
	}
	render() {
		MainScene.orbitControls.update();

		return (
			<div ref={this.threejsSceneRef}
				style={{
					top: '0',
					left: '0',
					display: 'block',
					width: '100%',
					height: '100%',
					// border: '1px solid blue'
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
	add,
	allLoaded
};
export default connect(mapStateToProps, mapDispatchToProps)(Room)