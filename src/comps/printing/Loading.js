import React, { Component } from 'react';
import { connect } from 'react-redux';

const leftBottomDiv = {
	color: '#887788',
	font: '.8em Arial, sans-serif',
	position: 'absolute',
	padding: '8px',
	bottom: '0px',
};

export class Loading extends Component {
	render() {
		return (
			<div style={leftBottomDiv}>
				{this.props.items.length > 0 &&
					<span>loading...</span>
				}
				{this.props.items.map((element, key) => {
					return (
						<div key={key}>
							<span>{element}</span>
						</div>
					);
				})}
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		items: state.loadingItems,
	}
}
export default connect(mapStateToProps)(Loading)