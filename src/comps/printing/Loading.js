import React, { Component } from 'react';
import { connect } from 'react-redux';

export class Loading extends Component {
	constructor (props) {
		super(props);
	}
	render() {
		return (
			<div style={this.props.style}>
				{Array.isArray(this.props.logging) &&
					<div>
						{
							this.props.logging.length > 0 &&
							<span>loading...</span>
						}
						{this.props.logging.map((element, key) => {
							return (
								<div key={key}>
									<span>{element}</span>
								</div>
							);
						})}
					</div>
				}
				{typeof this.props.logging === "string" &&
					<span style={{ whiteSpace: 'pre-line' }}>{this.props.logging}</span>
				}
			</div>
		)
	}
}
const mapStateToProps = (state, ownProps) => {
	const log = state[ownProps.reducedVarToLog]
	return {
		logging: log,
	}
}
export default connect(mapStateToProps)(Loading)