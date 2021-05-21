import React, { Component } from 'react';
import { connect } from 'react-redux';

const mainDiv = {
	color: '#887788',
	font: '.8em Arial, sans-serif',
	position: 'absolute',
	padding: '8px',
	bottom: '0px',
};

export class Loading extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div style={mainDiv}>
				{this.props.items.length > 0 &&
					<span>loading...</span>
				}
				{this.props.items.map((element, key) => {
					return (
						<div key={key} style={{
						}}>
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