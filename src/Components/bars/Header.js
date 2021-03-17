import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import {
    loadScene,
    setCurrentSceneProp,
}
    from '../../api/actions'

import './bars.css';

class Header extends Component {
    constructor (props) {
        super(props);
        this.state = { value: '' };
        this.setProp = this.setProp.bind(this);
    }
    /*
    https://react-bootstrap.github.io/components/navbar/ 
    */

    setProp(prop) {
        this.props.setCurrentSceneProp(prop)
    }
    render() {
        return (
            <Navbar sticky="top" variant="pills" onSelect={this.props.loadScene} className="minetnavbar">
                <Navbar.Brand href="#home">
                    <img
                        src="./images/logo_small.gif"
                        className="d-inline-block align-top"
                        alt="Meubles Minet logo"
                    />
                </Navbar.Brand>
                <NavDropdown title="Les dressings" id="nav-dropdown">
                    {this.props.scenes && this.props.scenes
                        .sort((a, b) => a.name - b.name)
                        .map((s, idx) =>
                            <NavDropdown.Item key={idx} eventKey={s.name}>{s.name}</NavDropdown.Item>
                        )}
                </NavDropdown>
                {this.props.hasCurrentScene &&
                    <Form inline>
                        <Form.Row>
                            <Form.Control
                                style={{ width: '180px' }}
                                size="sm"
                                type="text"
                                placeholder="Nouveau dressing"
                                value={this.props.name}
                                onChange={(e) => this.setProp({ name: e.target.value })} />
                        </Form.Row>
                    </Form>
                }
            </Navbar>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        scenes: state.scenes,
        hasCurrentScene: state.currentScene != null,
        name: state.currentScene ? state.currentScene.name : "",
    }
}
const mapDispatchToProps = {
    loadScene,
    setCurrentSceneProp,
};
export default connect(mapStateToProps, mapDispatchToProps)(Header)