import Item from './Item'
import { Measures } from '../Utils'

export default class Porte extends Item {

    constructor(props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        // Measures.thick - Measures.arrondi
        // center the door :
        // this.deport = ((this.parent.skuInfo.L + 2 * Measures.thick) - getSize(this.object, "x")) / 2
        this.deport = Measures.thick - Measures.arrondi

        this.isLeftDoor = this.skuInfo.type.substr(2, 1) == "G"
    }
    setPositionX(x) {
        this.object.position.x = !this.parent.skuInfo.has2Doors || this.isLeftDoor ? this.deport : this.parent.skuInfo.L / 2 + Measures.thick
    }
    setPositionY(y) {
        this.object.position.y = this.deport
    }
    setPositionZ(z) {
        this.object.position.z = this.parent.depth
    }
}