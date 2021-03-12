import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import {
    loadScene
}
    from '../../api/actions'

import './bars.css';

class Header extends Component {

    /*
    https://react-bootstrap.github.io/components/navbar/ 
    */

    render() {
        return (
            <Navbar fixed="top" variant="pills" onSelect={this.props.loadScene} className="minetnavbar">
                <Navbar.Brand href="#home">
                    <img
                        src="./images/logo_small.gif"
                        className="d-inline-block align-top"
                        alt="Meubles Minet logo"
                    />
                </Navbar.Brand>
                {/*                 <Nav.Item>
                    <Nav.Link eventKey="1" href="#/home">
                        NavLink 1 content
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="2" title="Item">
                        NavLink 2 content
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="3" disabled>
                        NavLink 3 content
                    </Nav.Link>
                </Nav.Item> */}
                <NavDropdown title="Les dressings" id="nav-dropdown">
                    {this.props.scenes && this.props.scenes
                        .sort((a, b) => a.name - b.name)
                        .map((s, idx) =>
                            <NavDropdown.Item key={idx} eventKey={s.name}>{s.name}</NavDropdown.Item>
                        )}
                </NavDropdown>
            </Navbar>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        scenes: state.scenes
    }
}
const mapDispatchToProps = {
    loadScene
};
export default connect(mapStateToProps, mapDispatchToProps)(Header)