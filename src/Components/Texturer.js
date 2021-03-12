import React, { Component } from 'react';
import { connect } from 'react-redux';
import { drop } from '../api/actions'
import MeubleLine from './MeubleLine';
import Button from './bars/Button';

class Texturer extends Component {
    constructor (props) {
        super(props);
        this.state = {
            filter: ""
        };
    }
    render() {
        // console.log("Texturer  render");
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


    return {
    };
}
const mapDispatchToProps = {
    drop
};
export default connect(mapStateToProps, mapDispatchToProps)(Texturer);