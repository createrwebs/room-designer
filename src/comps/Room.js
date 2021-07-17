import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	allLoaded
}
	from '../api/actions'

import MainScene from '../3d/MainScene';
import Draggable from '../3d/Draggable'

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
		zoom: state.camera.zoom,
		focus: state.camera.focus,
		light: state.light,
	}
}
const mapDispatchToProps = {
	allLoaded
};
export default connect(mapStateToProps, mapDispatchToProps)(Room)