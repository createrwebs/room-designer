import React, { Component } from 'react';
import { connect } from 'react-redux';
import { } from '../../api/actions'
// import Button from './Button';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import './bars.css';

class Header extends Component {
    disconnect() {
        // ConnectionHelper.disconnect();
    }
    shareScreen(share) {
        // if (!this.props.hasScreenShared) return;
        // if (share) Room.startShareScreen();
        // else Room.stopShareScreen();
    }
    raiseHand() {
        /*         Room.getRoom().sendCommandOnce("raiseHand", {
                    value: "all",
                    attributes: {}, // map with keys the name of the attribute and values - the values of the attributes.
                    children: [] // array with JS object with the same structure.
                }) */
    }
    toggleChat() {
    }
    mute(type) {
        /*         Room.muteUnmuteLocal(type).forEach(p => p.then(result => {
                    console.log("muteUnmuteLocal", type, result);
                }).catch(e => {
                    console.log("muteUnmuteLocal ERROR", type, e);
                })) */
    }

    render() {
        // const audioStatus = this.props.hasAudio ? this.props.audioMuted ? "inactive" : "active" : "deactivated"
        // const videoStatus = this.props.hasVideo ? this.props.videoMuted ? "inactive" : "active" : "deactivated"
        // const screenStatus = this.props.hasScreenShared ? !this.props.screenShared ? "inactive" : "active" : "deactivated"

        // const audioText = this.props.hasAudio ? this.props.audioMuted ? "Audio désactivé" : "Audio actif" : "Pas d'audio"
        // const videoText = this.props.hasVideo ? this.props.videoMuted ? "Video désactivée" : "Video active" : "Pas de video"
        // // const screenText = this.props.hasScreenShared ? !this.props.screenShared ? "Partager votre écran" : "Arrêter le partage" : "Partage d'écran désactivé"
        // const screenText = this.props.hasScreenShared ? !this.props.screenShared ? "Partager votre écran" : "Partage en cours" : "Partage d'écran désactivé"
        // const chatText = this.props.chatShowed ? "Masquer les messages" : "Voir les messages"

        return (
            <Navbar fixed="top" bg="light" expand="lg">
                <Navbar.Brand href="#home">Minet3d</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#link">Link</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
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