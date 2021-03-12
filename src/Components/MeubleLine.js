import React, { Component } from 'react';
// import shave from 'shave';
// import Button from './bars/Button';

class UserLine extends Component {
    render() {
        // shave('.userline-span', 18);
        return (
            <div className={`userline`}>
                <span>
                    {this.props.name}<br />
                    {this.props.file}<br />
                </span>
            </div>
        );
    }
}
export default UserLine