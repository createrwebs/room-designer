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
            <div className="headerbar">
                
                <div style={{ float: 'left' }}>
                    <Button action={() => { this.raiseHand() }} icon="fa fa-fw fa-hand-paper-o" text="Lever la main" />
                </div>
                <div style={{ float: 'left' }}>
                    <Button action={() => { this.mute("audio") }} icon="fa fa-fw fa-microphone" text={""} status={""} />
                    <Button action={() => { this.mute("video") }} icon="fa fa-fw fa-video-camera" text={""} status={""} />
                </div>
                <div style={{ float: 'left' }}>
                    <Button action={() => { this.toggleChat() }} icon="fa fa-fw fa-comments-o" text={""} />
                </div>
                <div style={{ float: 'right' }}>
                    ds
                </div>
                <div style={{ float: 'right' }}>
                    <Button action={() => { this.disconnect() }} icon="fa fa-fw fa-power-off" text="Sortir" />
                </div>
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