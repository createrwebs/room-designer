import React, { Component } from 'react';
import { connect } from 'react-redux';
import { } from '../../api/actions'
import Button from './Button';
import './bars.css';
import MainScene from '../../3d/MainScene';

class Toolbar extends Component {
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
            <div>
                <div className="tools-wrapper">
                    <Button action={() => { this.disconnect() }} icon="fa fa-file" text="Nouvelle composition" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-save" text="Enregistrer la composition" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-image" text="Prendre une photo" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-print" text="Imprimer la composition" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-download" text="Télecharger la composition" />
                </div>

                <div className="tools-wrapper">
                    <Button action={() => { this.disconnect() }} icon="fa fa-vector-square" text="Modifier la pièce" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-mouse-pointer" text="Sélectionner" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-hammer" text="Editer" />

                    <Button action={() => { this.disconnect() }} icon="fa fa-palette" text="Choisir une texture" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-paint-brush" text="Peindre" />

                    <Button action={() => { this.disconnect() }} icon="fa fa-ruler-combined" text="Règles" />

                    <Button action={() => { this.disconnect() }} icon="fa fa-trash" text="Corbeille" />
                </div>

                <div className="tools-wrapper">
                    <Button action={() => { this.disconnect() }} icon="fa fa-play-circle" text="Toggle animations" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-lightbulb" text="Toggle lights" />
                    <Button action={() => { this.disconnect() }} icon="fa fa-adjust" text="Toggle shadows" />


                </div>

                <div className="tools-wrapper dropdown">
                    <Button status="npr" action={() => { }} icon="fa fa-sliders-h" text="Mes réglages" />
                    <Button status="npl" action={() => { }} icon="fa fa-ellipsis-v" />
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
export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)