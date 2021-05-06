import store from '../api/store';
import * as THREE from "three";
import MainScene from './MainScene';

export const getCurrentScene = (stat) => {
    let state = stat ? stat : store.getState()
    let currentScene = state.currentScene
    /*     let currentScene = {
            post_id: store.getState().currentScene.post_id
        } */
    const meublesOnScene = store.getState().meublesOnScene
    let meubles = [];
    store.getState().meublesOnScene.forEach(m => {
        let meuble = {
            sku: m.sku,
            position: {
                wall: m.wall,
                x: m.position
            }
        }
        meubles.push(meuble)
    })
    currentScene.meubles = meubles
    return currentScene
}