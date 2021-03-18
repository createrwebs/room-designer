import React, { Component } from 'react';
// import shave from 'shave';
// import Button from './bars/Button';

class MeubleLine extends Component {
    render() {
        // shave('.Meubleline-span', 18);
        return (
            <div className={`meubleline`} onClick={e => this.props.click(this.props.file)}>
                <span>
                    {this.props.name}<br />
                    {this.props.file}<br />
                </span>
            </div>
        );
    }
}
export default MeubleLine