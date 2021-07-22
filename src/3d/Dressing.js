import MainScene from './MainScene';

/*
    generate JSON dressing for saving  
*/
export const getCurrentDressing = (state) => {
    let currentDressing = state ? state : MainScene.currentDressing// || defaultdressing
    const meubles = [];
    MainScene.meubles.forEach(m => {
        meubles.push(m.getJSON())
    })
    currentDressing.meubles = meubles
    currentDressing.materialId = MainScene.materialId
    return currentDressing
}