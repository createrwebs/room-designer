import React, { Component } from 'react';
import { connect } from 'react-redux';
import { } from '../../api/actions'
import Button from './Button';
import './bars.css';
import ThreeScene from '../../3d/ThreeScene';

class Header extends Component {
    disconnect() {
        
        var cond = ThreeScene.renderer.shadowMap.enabled;

        if( !cond ){
            ThreeScene.renderer.shadowMap.enabled = true;
        } else {
            ThreeScene.renderer.shadowMap.enabled = false;
        }
        ThreeScene.renderer.shadowMap.needsUpdate = true;
        /**/
        
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
            <div className="headerbarz">
                <nav className="navbar navbar-expand-md navbar-dark fixed-top minetnavbar">
					<div className="container-fluid">
					<a className="navbar-brand" href="#">Meubles Minet</a>
					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarCollapse">
						<ul className="navbar-nav me-auto mb-2 mb-md-0">
						
                        <li className="nav-item">
							<a className="nav-link active" aria-current="page" href="#">Home</a>
						</li>

						<li className="nav-item">
							
                            <a className="nav-link" href="#">Link</a>
						</li>
                        <li className="nav-item">
							<a className="nav-link" href="#">Link</a>
						</li>
                        <li className="nav-item">
							<a className="nav-link" href="#">Link</a>
						</li>
                        <li className="nav-item">
							<a className="nav-link" href="#">Link</a>
						</li>

						<li className="nav-item">
							<a className="nav-link disabled" href="#" tabIndex="-1" aria-disabled="true">Disabled</a>
						</li>

						</ul>
					</div>
					</div>
				</nav>
                
            </div>
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