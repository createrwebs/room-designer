import MainScene from './MainScene';
import Meuble from './meubles/Meuble';
import { Sides } from "./Constants";
import Room from "./Room";
import { getId as getMaterialId } from './Material'

/*
    generate JSON dressing for saving  
*/
export const getCurrentDressing = () => {
    let dressing = {
        xmax: Room.xmax,
        zmax: Room.zmax,
        name: Room.name,
    }
    const meubles = [];
    MainScene.meubles.forEach(m => {
        meubles.push(m.getJSON())
    })
    dressing.meubles = meubles
    dressing.materialId = getMaterialId()
    return dressing
}

/*
    generate JSON dressing for devis (sku, material, laques)  
*/
export const getCurrentDressingForDevis = () => {
    let dressing = {}
    const meubles = [];
    const items = [];
    // const laqueOnMeshes = []

    MainScene.meubles.forEach(m => {
        const joins = Meuble.isJoined(m)
        if (m.skuInfo.type === "COIF") {// COIF has its own panels, FF FS SS SF appends to sku
            meubles.push(`${m.props.sku}${joins.includes(Sides.L) ? 'S' : 'F'}${joins.includes(Sides.R) ? 'S' : 'F'}`)
        }
        else {
            meubles.push(m.props.sku)
            if (!m.skuInfo.hasSides) {//gestion panneaux amovibles
                if (!joins.includes(Sides.L)) meubles.push(m.getPanneauName(Sides.L))
                if (!joins.includes(Sides.R)) meubles.push(m.getPanneauName(Sides.R))
            }
        }
        m.items.forEach(i => {
            let sku
            if (i.skuInfo.type == "ANGAB") {
                if (i.props.sku.substr(-1) === "R") {// le L est zappé
                    sku = i.props.sku.substr(0, i.props.sku.length - 1)

                    // add panels
                    items.push({
                        sku: m.getPanneauName(Sides.L),
                        laqueOnMeshes: []
                    })
                    items.push({
                        sku: m.getPanneauName(Sides.R),
                        laqueOnMeshes: []
                    })

                }
            }
            else {
                sku = i.props.sku
            }
            /*             for (const [key, value] of Object.entries(i.laqueOnMeshes)) {// laques in item
                            laqueOnMeshes[key] = value
                        } */
            if (sku) {
                items.push({
                    sku,
                    laqueOnMeshes: i.laqueOnMeshes
                })
            }
        })
        /*         for (const [key, value] of Object.entries(m.laqueOnMeshes)) {// laques in meuble
                    laqueOnMeshes[key] = value
                } */
    })
    // console.log("Meuble.Joins", Meuble.Joins)
    Meuble.Joins.forEach(join => {
        const leftMeubleUid = join.substr(0, join.indexOf('-'));
        const leftMeuble = MainScene.meubles.find(m => m.getUid() === leftMeubleUid)
        const rightMeubleUid = join.substr(join.indexOf('-') + 1);
        const rightMeuble = MainScene.meubles.find(m => m.getUid() === rightMeubleUid)
        if (leftMeuble
            && leftMeuble.skuInfo.type !== "COIF"
            && rightMeuble
            && rightMeuble.skuInfo.type !== "COIF")
            meubles.push(`NYH${leftMeuble.skuInfo.H}P${leftMeuble.skuInfo.PR}SE`)// right panel depth of left pane !
    })

    dressing.meubles = meubles
    dressing.items = items
    // dressing.laqueOnMeshes = laqueOnMeshes
    dressing.materialId = getMaterialId()
    return dressing
}