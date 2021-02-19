import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { moderator } from '../../API/Config'
import Button from './Button';
import './bars.css';
import { setCamera, setLight } from '../../api/actions'
class InfoBar extends Component {
    constructor (props) {
        super(props);
        this.state = {
        };
    }
    modifyProps(prop) {
        this.props.setCamera(prop)
    }
    render() {
        return (
            <div className="infobar" >
                <div>
                    <i className="fa fa-fw fa-server" />
                    <span>
                        {this.props.webgl}
                    </span>
                </div>
                {this.props.jitsiLogged &&
                    <div>
                        <i className="fa fa-fw fa-handshake-o" />
                        <span>
                            {`Minet3d`}
                        </span>
                    </div>
                }
                <div>
                    {/*  <i className="fa fa-fw fa-unlock-alt" />
                    <span>
                        {` ${this.props.roomName} ouverte `}
                    </span> */}
                    fov
                    <input
                        placeholder="fov"
                        type="number"
                        autoComplete="fov"
                        value={this.props.fov}
                        onChange={(e) => this.modifyProps({ fov: e.target.value })} />
                     zoom
                    <input
                        placeholder="zoom"
                        type="number"
                        autoComplete="zoom"
                        value={this.props.zoom}
                        onChange={(e) => this.modifyProps({ zoom: e.target.value })} />
                     focus
                    <input
                        placeholder="focus"
                        type="number"
                        autoComplete="focus"
                        value={this.props.focus}
                        onChange={(e) => this.modifyProps({ focus: e.target.value })} />
                    {/* <Button action={() => { this.lockRoom() }} icon="fa fa-fw fa-lock" text={"Verrouiller la salle"} /> */}
                </div>
                <div>
                    <Button action={() => { this.props.setLight() }} icon="fa fa-fw fa-lightbulb-o" text={"Eclairer"} />
                </div>
                {this.props.selection &&
                    <div>
                        <i className="fa fa-fw fa-arrows-h" />
                        <span>
                            {this.props.selection.name}
                        </span>
                    </div>
                }
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        selection: state.selection,
        fov: state.camera.fov,
        zoom: state.camera.zoom,
        focus: state.camera.focus
    }
}
const mapDispatchToProps = {
    setCamera,
    setLight
};
export default connect(mapStateToProps, mapDispatchToProps)(InfoBar)