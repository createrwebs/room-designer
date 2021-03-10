import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import './bars.css';

class Header extends Component {

    /*
    https://react-bootstrap.github.io/components/navbar/ 
    */

    render() {
        const handleSelect = (eventKey) => alert(`selected ${eventKey}`);
        return (
            <Navbar fixed="top" variant="pills" onSelect={handleSelect} className="minetnavbar">
                <Navbar.Brand href="#home">
                    <img
                        src="./images/logo_small.gif"
                        className="d-inline-block align-top"
                        alt="Meubles Minet logo"
                    />
                </Navbar.Brand>
                <Nav.Item>
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
                </Nav.Item>
                <NavDropdown title="Dropdown" id="nav-dropdown">
                    <NavDropdown.Item eventKey="4.1">Action</NavDropdown.Item>
                    <NavDropdown.Item eventKey="4.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item eventKey="4.3">Something else here</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item eventKey="4.4">Separated link</NavDropdown.Item>
                </NavDropdown>
            </Navbar>
        )
    }
}
const mapStateToProps = (state) => {
    return {
    }
}
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(Header)