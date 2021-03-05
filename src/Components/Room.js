import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ThreeScene from '../3d/ThreeScene';
const localhost = window.location.hostname.indexOf('localhost') !== -1;

class App extends Component {
	constructor (props) {
		super(props);
		this.myRef = React.createRef();

		this.state = {
		};
	}
	componentDidMount() {
		const node = this.myRef.current;
		node.appendChild(ThreeScene.getRendererNodeElement());
		// if (localhost) node.appendChild(ThreeScene.getStatNodeElement());

		ThreeScene.fbxloadAll()
	}
	render() {
		//ThreeScene.updateCamera(this.props)
		//ThreeScene.updateLights(this.props.light)
		ThreeScene.orbitControls.update();// renders
		// ThreeScene.render()

		return (
			<div className="container"
				ref={this.myRef}
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
	// console.log("Room mapStateToProps", state)

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