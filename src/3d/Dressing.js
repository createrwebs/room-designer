import MainScene from './MainScene';
import Meuble from './Meuble';

/*
    generate JSON dressing for saving  
*/
export const getCurrentDressing = (state) => {
    let currentDressing = state ? state : MainScene.currentDressing
    const meubles = [];
    MainScene.meubles.forEach(m => {
        meubles.push(m.getJSON())
    })
    currentDressing.meubles = meubles
    currentDressing.materialId = MainScene.materialId
    return currentDressing
}

/*
    generate JSON dressing for devis (sku, material, laques)  
*/
export const getCurrentDressingForDevis = () => {
    let currentDressing = {}
    const meubles = [];
    const items = [];
    const laqueOnMeshes = []

    MainScene.meubles.forEach(m => {
        const joins = Meuble.isJoined(m)
        if (m.skuInfo.type === "COIF") {// COIF has its own panels, FF FS SS SF appends to sku
            meubles.push(`${m.props.sku}${joins.includes("left") ? 'S' : 'F'}${joins.includes("right") ? 'S' : 'F'}`)
        }
        else {
            meubles.push(m.props.sku)
            if (!m.skuInfo.hasSides) {//gestion panneaux amovibles
                if (!joins.includes("left")) meubles.push(m.getPanneauName("left"))
                if (!joins.includes("right")) meubles.push(m.getPanneauName("right"))
            }
        }
        m.items.forEach(i => {
            items.push(i.props.sku)
        })

        // laques only on Meuble subobjects ? (not items?)
        for (const [key, value] of Object.entries(m.laqueOnMeshes)) {
            laqueOnMeshes[key] = value
        }
    })
    // console.log("Meuble.Joins", Meuble.Joins)
    Meuble.Joins.forEach(join => {
        const leftMeubleUid = join.substr(0, join.indexOf('-'));
        const leftMeuble = MainScene.meubles.find(m => m.uid === leftMeubleUid)
        const rightMeubleUid = join.substr(join.indexOf('-') + 1);
        const rightMeuble = MainScene.meubles.find(m => m.uid === rightMeubleUid)
        if (leftMeuble
            && leftMeuble.skuInfo.type !== "COIF"
            && rightMeuble.skuInfo.type !== "COIF")
            meubles.push(`NYH${leftMeuble.skuInfo.H}P${leftMeuble.skuInfo.PR}SE`)// right panel depth of left pane !
    })

    // TODO laques 




    currentDressing.meubles = meubles
    currentDressing.items = items
    currentDressing.laqueOnMeshes = laqueOnMeshes
    currentDressing.materialId = MainScene.materialId
    return currentDressing
}