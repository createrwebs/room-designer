import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from './Button';
import './bars.css';
import {
    setCamera,
    setLight,
    logCamera
} from '../../api/actions'
class Footer extends Component {
    constructor (props) {
        super(props);
        this.state = {
        };
    }
    modifyProps(prop) {
        this.props.setCamera(prop)
    }

    /*
    https://react-bootstrap.netlify.app/components/navbar/
    */

    render() {
        return (
            <Navbar fixed="bottom" className="minetnavbar">
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        {this.props.webgl}
                    </Navbar.Text>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
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
                </Navbar.Collapse>
                <div>
                    <Button action={() => { this.props.setLight() }} icon="fa fa-fw fa-lightbulb" text={"Eclairer"} />
                </div>
                <div>
                    <Button action={() => { this.props.logCamera() }} icon="fa fa-fw fa-video" text={"Camera position"} status={this.props.cameraLog ? "active" : "deactivated"} />
                </div>
                {this.props.selection &&
                    <div>
                        <i className="fa fa-fw fa-hand-point-up" />
                        <span>
                            {this.props.selection.name}
                        </span>
                    </div>
                }
                {this.props.dragged &&
                    <div>
                        <i className="fa fa-fw fa-arrows-alt" />
                        <span>
                            {this.props.dragged.name}
                        </span>
                    </div>
                }
            </Navbar>
        )

    }
}
const mapStateToProps = (state) => {
    return {
        selection: state.selection,
        cameraLog: state.cameraLog,
        dragged: state.dragged,
        fov: state.camera.fov,
        zoom: state.camera.zoom,
        focus: state.camera.focus
    }
}
const mapDispatchToProps = {
    setCamera,
    setLight,
    logCamera
};
export default connect(mapStateToProps, mapDispatchToProps)(Footer)