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

/*
    generate JSON dressing for devis (sku, materail, laques)  
*/
export const getCurrentDressingForDevis = () => {
    let currentDressing = {}
    const meubles = [];
    MainScene.meubles.forEach(m => {
        meubles.push(m.props.sku)
        m.items.forEach(i => {
            meubles.push(i.props.sku)
        })
    })


    // TODO laques 




    currentDressing.meubles = meubles
    currentDressing.materialId = MainScene.materialId
    return currentDressing
}