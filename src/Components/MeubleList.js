

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { kick } from '../api/actions'
import { getMeubleName } from '../api/Utils';
import MeubleLine from './MeubleLine';
import Button from './bars/Button';

class MeubleList extends Component {
    constructor (props) {
        super(props);
        this.state = {
            filter: ""
        };
    }
    render() {
        // console.log("MeubleList  render");
        return (
            <div className="userlist">
                <div className="search-userlist">
                    <i className="fa fa-fw fa-search" />
                    <input
                        placeholder="filtrer"
                        autoFocus
                        type="text"
                        autoComplete=""
                        value={this.state.filter}
                        onChange={(e) => this.setState({ filter: e.target.value.toLowerCase() })} />
                    <div>
                        <Button action={() => this.raiseHand("all")} icon="fa fa-fw fa-hand-paper-o" text="Lever la main pour tous les participants" />
                        <Button action={() => this.mute("Audio", "all")} icon="fa fa-fw fa-microphone" text="Audio pour tous les participants" />
                        <Button action={() => this.mute("Video", "all")} icon="fa fa-fw fa-video-camera" text="Video pour tous les participants" />
                    </div>
                </div>
                <div className="scrollable">
                    {this.props.userList
                        .filter(u => this.state.filter.length < 2 || u.name.toLowerCase().includes(this.state.filter))
                        .sort((u1, u2) => u1.name - u2.name)
                        .map((u, idx) =>
                            <MeubleLine key={idx}
                                isConnected={u.isConnected}
                                signinId={u.signinId}
                                participantId={u.participantId}
                                name={u.name}
                                hasAudio={u.hasAudio}
                                hasVideo={u.hasVideo}
                                audioMuted={u.audioMuted}
                                videoMuted={u.videoMuted}
                                hasScreenShared={u.hasScreenShared}
                                screenShared={u.screenShared}
                                raiseHand={this.raiseHand}
                                mute={this.mute}
                                kick={this.props.kick}
                                authorizeShareScreen={this.authorizeShareScreen}
                            />)}
                </div>
            </div>
        );
    }
}
function mapStateToProps(state, props) {
    // console.log("MeubleList  mapStateToProps", state.signinMeubleList);

    // joining signin & classroom users

    let userList = []
    state.main.signinMeubleList.forEach(su => {
        const ju = state.main.jitsiMeubleList.find(u => parseInt(u.getProperty("USER_ID")) === su.USER_ID)//string | int
        const connected = ju !== undefined
        const hasAudio = connected && ju.getTracks().find(track => track.type === "audio") !== undefined
        const hasVideo = connected && ju.getTracks().find(track => track.type === "video") !== undefined
        const screenShared = connected && ju.getTracks().find(track => track.videoType === "desktop") !== undefined
        userList.push({
            name: getMeubleName(su),
            isConnected: connected,
            signinId: su.USER_ID,
            participantId: connected ? ju.getId() : null,
            hasAudio,
            hasVideo,
            audioMuted: hasAudio && ju.getTracks().find(track => track.type === "audio").isMuted(),
            videoMuted: hasVideo && ju.getTracks().find(track => track.type === "video").isMuted(),
            hasScreenShared: connected && ju.getProperty('hasScreenShared'),
            screenShared,
        });
    })

    return {
        userList
    };
}
const mapDispatchToProps = {
    kick
};
export default connect(mapStateToProps, mapDispatchToProps)(MeubleList);