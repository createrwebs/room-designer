import React, { Component } from 'react';
import MainScene from '../3d/MainScene';

class Room extends Component {
	constructor(props) {
		super(props);
		this.threejsSceneRef = React.createRef();
	}
	componentDidMount() {
		const node = this.threejsSceneRef.current;
		node.appendChild(MainScene.getRendererNodeElement());
		// if (localhost) node.appendChild(MainScene.getStatNodeElement());
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
export default Room