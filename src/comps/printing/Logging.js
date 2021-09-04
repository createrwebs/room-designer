import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localhost } from '../../api/Utils';

export class Dragging extends Component {
	constructor (props) {
		super(props);
	}
	render() {
		return (
			<div style={this.props.style}>
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
		info: state.loggingBottomRight,
		raycast: state.raycast
	}
}
export default connect(mapStateToProps)(Dragging)