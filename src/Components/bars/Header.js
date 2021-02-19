import React, { Component } from 'react';
import { connect } from 'react-redux';
import Room from '../../API/Room'
import ConnectionHelper from '../../API/ConnectionHelper'
import { moderator } from '../../API/Config'
import { toggleChat, toggleUserList } from '../../API/actions'
import Button from './Button';
import './bars.css';

class Header extends Component {
    disconnect() {
        ConnectionHelper.disconnect();
    }
    shareScreen(share) {
        if (!this.props.hasScreenShared) return;
        if (share) Room.startShareScreen();
        // else Room.stopShareScreen();
    }
    raiseHand() {
        Room.getRoom().sendCommandOnce("raiseHand", {
            value: "all",
            attributes: {}, // map with keys the name of the attribute and values - the values of the attributes.
            children: [] // array with JS object with the same structure.
        })
    }
    mute(type) {
        Room.muteUnmuteLocal(type).forEach(p => p.then(result => {
            console.log("muteUnmuteLocal", type, result);
        }).catch(e => {
            console.log("muteUnmuteLocal ERROR", type, e);
        }))
    }

    render() {
        const audioStatus = this.props.hasAudio ? this.props.audioMuted ? "inactive" : "active" : "deactivated"
        const videoStatus = this.props.hasVideo ? this.props.videoMuted ? "inactive" : "active" : "deactivated"
        const screenStatus = this.props.hasScreenShared ? !this.props.screenShared ? "inactive" : "active" : "deactivated"

        const audioText = this.props.hasAudio ? this.props.audioMuted ? "Audio désactivé" : "Audio actif" : "Pas d'audio"
        const videoText = this.props.hasVideo ? this.props.videoMuted ? "Video désactivée" : "Video active" : "Pas de video"
        // const screenText = this.props.hasScreenShared ? !this.props.screenShared ? "Partager votre écran" : "Arrêter le partage" : "Partage d'écran désactivé"
        const screenText = this.props.hasScreenShared ? !this.props.screenShared ? "Partager votre écran" : "Partage en cours" : "Partage d'écran désactivé"
        const chatText = this.props.chatShowed ? "Masquer les messages" : "Voir les messages"

        return (
            <div className="headerbar">
                <div style={{ float: 'left' }}>
                    <Button action={() => { this.raiseHand() }} icon="fa fa-fw fa-hand-paper-o" text="Lever la main" />
                </div>
                <div style={{ float: 'left' }}>
                    <Button action={() => { this.mute("audio") }} icon="fa fa-fw fa-microphone" text={audioText} status={audioStatus} />
                    <Button action={() => { this.mute("video") }} icon="fa fa-fw fa-video-camera" text={videoText} status={videoStatus} />
                    <Button action={() => { this.shareScreen(!this.props.screenShared) }} icon="fa fa-fw fa-desktop" text={screenText} status={screenStatus} cursor={this.props.hasScreenShared ? 'default' : 'default'} />
                </div>
                <div style={{ float: 'left' }}>
                    <Button action={() => { this.props.toggleChat() }} icon="fa fa-fw fa-comments-o" text={chatText} />
                    {moderator &&
                        <Button action={() => { this.props.toggleUserList() }} icon="fa fa-fw fa-users" text="Liste des participants" />
                    }
                </div>
                <div style={{ float: 'right' }}>
                    <Button action={() => { this.disconnect() }} icon="fa fa-fw fa-power-off" text="Sortir" />
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {

    const tracks = Room.getRoom().getLocalTracks();
    const hasAudio = tracks.find(track => track.type === "audio") !== undefined
    const audioMuted = hasAudio && tracks.find(track => track.type === "audio").isMuted()
    const hasVideo = tracks.find(track => track.type === "video") !== undefined
    const videoMuted = hasVideo && tracks.find(track => track.type === "video").isMuted()

    return {
        hasScreenShared: Room.getRoom().getLocalParticipantProperty('hasScreenShared'),
        screenShared: state.main.screenShared,
        chatShowed: state.main.chatShowed,
        hasAudio,
        audioMuted,
        hasVideo,
        videoMuted,
    }
}
const mapDispatchToProps = {
    toggleChat, toggleUserList
};
export default connect(mapStateToProps, mapDispatchToProps)(Header)