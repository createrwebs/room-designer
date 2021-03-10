import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import MainScene from '../3d/MainScene';
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

		MainScene.fbxloadAll()
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
		fov: state.camera.fov,
		zoom: state.camera.zoom,
		focus: state.camera.focus,
		light: state.light,
	}
}
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(App)