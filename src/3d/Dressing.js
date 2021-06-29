import store from '../api/store';
import MainScene from './MainScene';

export const getCurrentScene = (stat) => {
    let state = stat ? stat : store.getState()
    let currentScene = state.currentScene
    /*     let currentScene = {
            post_id: store.getState().currentScene.post_id
        } */
    let meubles = [];
    MainScene.meubles.forEach(m => {
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