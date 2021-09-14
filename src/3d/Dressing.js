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
    dressing.joins = Meuble.Joins
    return dressing
}

/*
    generate JSON dressing for devis (sku, material, laques)  
*/
export const getCurrentDressingForDevis = () => {
    let dressing = {}
    const meubles = [];

    // meuble en objets

    MainScene.meubles.forEach(m => {
        const meuble = {}
        if (m === MainScene.selection) {
            meuble.selected = true
        }
        const joins = Meuble.isJoined(m)
        if (["COIF", "BUR"].includes(m.skuInfo.type)) {// COIF & BUR has its own panels, FF FS SS SF appends to sku
            meuble.sku = `${m.props.sku}${joins.includes(Sides.L) ? 'S' : 'F'}${joins.includes(Sides.R) ? 'S' : 'F'}`
            // meubles.push(`${m.props.sku}${joins.includes(Sides.L) ? 'S' : 'F'}${joins.includes(Sides.R) ? 'S' : 'F'}`)
        }
        else {
            meuble.sku = m.props.sku
            // meubles.push(m.props.sku)
            if (!m.skuInfo.hasSides) {//gestion panneaux amovibles
                if (!joins.includes(Sides.L)) meubles.push({ sku: m.getPanneauName(Sides.L) })
                if (!joins.includes(Sides.R)) meubles.push({ sku: m.getPanneauName(Sides.R) })
            }
        }

        const laqueMeuble = m.getFirstLaqueId()
        if (laqueMeuble) meuble.laque = laqueMeuble

        const items = [];
        m.items.forEach(i => {
            let sku
            if (i.skuInfo.type == "ANGAB") {
                if (i.props.sku.substr(-1) === "R") {// le L est zappé
                    sku = i.props.sku.substr(0, i.props.sku.length - 1)
                }
            }
            else {
                sku = i.props.sku
            }
            if (sku) {
                const item = {
                    sku
                }
                const laque = i.getFirstLaqueId()
                if (laque) item.laque = laque
                items.push(item)
            }
        })
        if (items.length > 0) {
            meuble.items = items
        }
        meubles.push(meuble)
    })
    /*
    ajout des separateurs
    */
    // console.log("Meuble.Joins", Meuble.Joins)
    Meuble.Joins.forEach(join => {
        const leftMeubleUid = join.substr(0, join.indexOf('-'));
        const leftMeuble = MainScene.meubles.find(m => m.getUid() === leftMeubleUid)
        const rightMeubleUid = join.substr(join.indexOf('-') + 1);
        const rightMeuble = MainScene.meubles.find(m => m.getUid() === rightMeubleUid)
        if (leftMeuble
            && !["COIF", "BUR"].includes(leftMeuble.skuInfo.type)
            && rightMeuble
            && !["COIF", "BUR"].includes(rightMeuble.skuInfo.type))
            meubles.push({ sku: `NYH${leftMeuble.skuInfo.H}P${leftMeuble.skuInfo.PR}SE` })// right panel depth of left pane !
    })

    dressing.meubles = meubles
    dressing.materialId = getMaterialId()
    return dressing
}
window.getCurrentDressingForDevis = getCurrentDressingForDevis