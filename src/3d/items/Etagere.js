import ItemUsingHole from '../items/ItemUsingHole'
import { Measures } from '../Utils'

export default class Etagere extends ItemUsingHole {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        this.object.children.forEach(child => {
            child.position.set(0, - Measures.thick / 2, 0)//-this.height different behavior with coulissante!
        })
    }
    setPositionZ(z) {
        if (this.props.sku.includes("PCO")) {// etagere pour armoire coulissante, plus courte
            this.object.position.z = 20
        }
        else {
            this.object.position.z = this.parent.depth - this.depth - 11
        }
    }
}