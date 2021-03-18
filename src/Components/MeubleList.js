import React, { Component } from 'react';
import { connect } from 'react-redux';
import { drop, clickMeubleLine } from '../api/actions'
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
            <div className="meubleList">
                <div className="search-meubleList">
                    <i className="fa fa-fw fa-search" />
                    <input
                        placeholder="filtrer"
                        autoFocus
                        type="text"
                        autoComplete=""
                        value={this.state.filter}
                        onChange={(e) => this.setState({ filter: e.target.value.toLowerCase() })} />
                    {/*                     <div>
                        <Button action={() => this.raiseHand("all")} icon="fa fa-fw fa-hand-paper-o" text="Lever la main pour tous les participants" />
                        <Button action={() => this.mute("Audio", "all")} icon="fa fa-fw fa-microphone" text="Audio pour tous les participants" />
                        <Button action={() => this.mute("Video", "all")} icon="fa fa-fw fa-video-camera" text="Video pour tous les participants" />
                    </div> */}
                </div>
                <div className="scrollable">
                    {this.props.meubleList
                        .filter(u => this.state.filter.length < 2 || u.name.toLowerCase().includes(this.state.filter))
                        .sort((u1, u2) => u1.name - u2.name)
                        .map((u, idx) =>
                            <MeubleLine key={idx}
                                file={u.file}
                                name={u.name}
                                click={this.props.clickMeubleLine}
                            />)}
                </div>
            </div>
        );
    }
}
function mapStateToProps(state, props) {
    let meubleList = []

    return {
        meubleList: state.config.fbx
    };
}
const mapDispatchToProps = {
    drop, clickMeubleLine
};
export default connect(mapStateToProps, mapDispatchToProps)(MeubleList);