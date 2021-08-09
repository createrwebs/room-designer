import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localhost } from '../../api/Utils';

const rightBottomDiv = {
	color: '#222222',
	font: '.8em Arial, sans-serif',
	position: 'absolute',
	padding: '8px',
	bottom: '0px',
	right: '0px',
	textAlign: "right"
};

export class Dragging extends Component {
	constructor (props) {
		super(props);
	}
	render() {
		return (
			<div style={rightBottomDiv}>
				{this.props.info &&
					<span>{this.props.info}</span>
				}
				<br />
				{localhost && this.props.raycast &&
					<span>{this.props.raycast}</span>
				}
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		info: state.dragged ? state.dragged.info() : "",
		raycast: state.raycast
	}
}
export default connect(mapStateToProps)(Dragging)