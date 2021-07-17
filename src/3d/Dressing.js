import store from '../api/store';
import MainScene from './MainScene';

export const getCurrentScene = (stat) => {
    let state = stat ? stat : store.getState()
    let currentScene = state.currentScene// || defaultdressing
    /*     let currentScene = {
        post_id: store.getState().currentScene.post_id
    } */
    const meubles = [];
    MainScene.meubles.forEach(m => {
        meubles.push(m.getJSON())
    })
    currentScene.meubles = meubles
    currentScene.materialId = MainScene.materialId
    return currentScene
}