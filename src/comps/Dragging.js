import React, { Component } from 'react';
import { connect } from 'react-redux';

const mainDiv = {
	color: '#BB7788',
	font: '.8em Arial, sans-serif',
	position: 'absolute',
	padding: '8px',
	bottom: '0px',
};

export class Dragging extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div style={mainDiv}>
				{this.props.sku &&
					<span>{this.props.sku}</span>
				}
				{this.props.raycast &&
					<span>{this.props.raycast}</span>
				}
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		sku: state.dragged ? state.dragged.info() : "",
		raycast: state.raycast
	}
}
export default connect(mapStateToProps)(Dragging)