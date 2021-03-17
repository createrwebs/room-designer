

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    select,
}
    from '../api/actions'
// import { getMeubleName } from '../api/Utils';
import MeubleLine from './MeubleLine';
import Button from './bars/Button';

class MeubleInfo extends Component {
    constructor (props) {
        super(props);
        this.state = {
            filter: ""
        };
    }
    render() {
        return (
            <div className="meubleinfo">
                {this.props.selection &&
                    <div>
                        <div style={{ float: 'right' }}>
                            <Button action={() => { this.props.select(null) }} icon="fa fa-fw fa-times" text={""} status={""} />
                        </div>
                        <span>
                            {this.props.selection.name}<br />
                            {this.props.selection.file}<br />
                        largeur: {this.props.selection.width}<br />
                        wall: {this.props.selection.wall}<br />
                        angle: {this.props.selection.angle}<br />
                        position: {this.props.selection.position}<br />
                        H: {this.props.selection.dim.H}<br />
                        P: {this.props.selection.dim.P}<br />
                        L: {this.props.selection.dim.L}<br />
                        </span>
                    </div>
                }
            </div>
        );
    }
}
function mapStateToProps(state, props) {
    // console.log("MeubleInfo  mapStateToProps", state.selection);

    return {
        selection: state.selection,

    };
}
const mapDispatchToProps = {
    select
};
export default connect(mapStateToProps, mapDispatchToProps)(MeubleInfo);