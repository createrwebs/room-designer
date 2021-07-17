import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BridgeEvent,
    newScene,
    saveSceneToLocalStorage,
    saveSceneToFile,
} from '../../api/actions'
import Button from './Button';
import MainScene from '../../3d/MainScene';
// import SceneConfig from '../panels/SceneConfig'
import defaultdressing from '../../../assets/dressings/defaultdressing.json';
import dressing1 from '../../../assets/dressings/defaultdressing.json';
import material1 from '../../../assets/material-chene-blanc.json';

import './bars.css';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

const Panels = {
    SCENECONFIG: 'sceneconfig',
}

class Toolbar extends Component {
    constructor (props) {
        super(props);
        this.state = { currentPanel: null };
    }
    disconnect() {

        var cond = MainScene.renderer.shadowMap.enabled;

        if (!cond) {
            MainScene.renderer.shadowMap.enabled = true;
        } else {
            MainScene.renderer.shadowMap.enabled = false;
        }
        MainScene.renderer.shadowMap.needsUpdate = true;
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

        return (
            <div className="fab-toolbar fab-floatingbar">
                <div style={{ paddingRight: '4px' }}>
                    <Button action={() => {
                        window.scene_bridge(BridgeEvent.NEW_DRESSING, defaultdressing)
                    }} icon="fa fa-file" text="Nouvelle composition" />
                    <Button action={() => {
                        console.log(window.scene_bridge(BridgeEvent.SAVE_DRESSING))
                    }} icon="fa fa-save" text="Enregistrer la composition" />
                    <Button action={() => {
                        window.scene_bridge(BridgeEvent.LOAD_DRESSING, dressing1)
                    }} icon="fa fa-upload" text="Charger la composition" />
                    <Button action={() => {
                        window.scene_bridge(BridgeEvent.TAKE_PICTURE)
                    }} icon="fa fa-image" text="Prendre une photo" />
                    <Button action={() => {
                        window.scene_bridge(BridgeEvent.GENERATE_ALL_PIX)
                    }} icon="fa fa-image" text="Vignettes batch" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-print" text="Imprimer la composition" />
                    <Button action={() => { saveSceneToLocalStorage() }} icon="fa fa-download" text="Enregistrer la composition dans ce navigateur" />
                    <Button action={() => { saveSceneToFile() }} icon="fa fa-download" text="Télecharger la composition" />
                </div>

                {this.props.hasCurrentScene &&
                    <div style={{ paddingRight: '4px' }}>
                        <Button
                            status={this.state.currentPanel === Panels.SCENECONFIG ? "active" : ""}
                            action={() => {
                                this.setState({ currentPanel: this.state.currentPanel === Panels.SCENECONFIG ? null : Panels.SCENECONFIG })
                            }}
                            icon="fa fa-vector-square" text="Modifier la pièce" />
                        <Button status="inactive" action={() => window.scene_bridge(BridgeEvent.SELECT_MEUBLE)} icon="fa fa-mouse-pointer" text="Sélectionner" />
                        <Button action={() => window.scene_bridge(BridgeEvent.EDIT_MEUBLE)} icon="fa fa-hammer" text="Editer" />
                        <Button
                            action={() => window.scene_bridge(BridgeEvent.SET_SCENE_MATERIAL, material1)}
                            icon="fa fa-palette" text="Choisir une texture" />
                        <Button action={() => window.scene_bridge(BridgeEvent.BRUSH_MODE, 1)} icon="fa fa-paint-brush" text="Peindre" />
                        <Button action={() => { this.disconnect() }} icon="fa fa-ruler-combined" text="Règles" />
                        <Button action={() => window.scene_bridge(BridgeEvent.REMOVE_MEUBLE, true)} icon="fa fa-trash" text="Corbeille" />
                    </div>
                }

                <div style={{ paddingRight: '4px' }}>
                    <Button action={() => { window.scene_bridge(BridgeEvent.ANIM_SELECTED_MEUBLE) }} icon="fa fa-play-circle" text="Animer le meuble sélectionné" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-lightbulb" text="Toggle lights" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-adjust" text="Toggle shadows" />
                </div>

                <div className="dropdown">
                    <Button status="npr" action={() => { }} icon="fa fa-sliders-h" text="Mes réglages" />
                    <Button status="npl" action={() => { }} icon="fa fa-ellipsis-v" />
                </div>
                {/* {this.props.hasCurrentScene
                    && this.state.currentPanel === Panels.SCENECONFIG
                    &&
                    <div className="fab-toolpanels fab-floatingbar">
                        <SceneConfig />
                    </div>
                } */}
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        hasCurrentScene: state.currentScene != null,
    }
}
const mapDispatchToProps = {
    newScene,
};
export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)