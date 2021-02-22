import React, { Component } from 'react';
// import shave from 'shave';
import Button from './bars/Button';

class UserLine extends Component {
    render() {
        // shave('.userline-span', 18);
        const audioStatus = this.props.hasAudio ? this.props.audioMuted ? "inactive" : "active" : "deactivated"
        const videoStatus = this.props.hasVideo ? this.props.videoMuted ? "inactive" : "active" : "deactivated"
        const screenStatus = this.props.hasScreenShared ? !this.props.screenShared ? "inactive" : "active" : "deactivated"

        const audioText = this.props.hasAudio ? this.props.audioMuted ? "Audio désactivé" : "Audio actif" : "Pas d'audio"
        const videoText = this.props.hasVideo ? this.props.videoMuted ? "Video désactivée" : "Video active" : "Pas de video"
        const screenText = this.props.hasScreenShared ? !this.props.screenShared ? "Partage autorisé" : "Partage en cours" : "Partage d'écran désactivé"

        return (
            <div className={`userline`}>
                <span className={`userline-span`}>
                    {this.props.name}
                </span>
                {this.props.isConnected &&
                    <div>
                        <Button action={() => { this.props.raiseHand(this.props.participantId) }} icon="fa fa-fw fa-hand-paper-o" text="Lever la main" />
                        <Button action={() => { this.props.mute("Audio", this.props.participantId) }} icon="fa fa-fw fa-microphone" text={audioText} status={audioStatus} />
                        <Button action={() => { this.props.mute("Video", this.props.participantId) }} icon="fa fa-fw fa-video-camera" text={videoText} status={videoStatus} />
                        <Button action={() => { this.props.authorizeShareScreen(!this.props.hasScreenShared, this.props.participantId) }} icon="fa fa-fw fa-desktop" text={screenText} status={screenStatus} />
                        <Button action={() => { this.props.kick(this.props.participantId) }} icon="fa fa-fw fa-user-times" text="Expulser" />
                    </div>
                }
            </div>
        );
    }
}
export default UserLine