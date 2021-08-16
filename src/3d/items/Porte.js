import Item from './Item'
import { Measures, getSize } from '../Utils'

export default class Porte extends Item {

    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        // Measures.thick - Measures.arrondi
        // center the door :
        // this.deport = ((this.parent.skuInfo.L*10 + 2 * Measures.thick) - getSize(this.object, "x")) / 2

        this.isLeftDoor = this.skuInfo.type.substr(2, 1) == "G"
        this.heightType = this.skuInfo.type.substr(3, 1)

        this.deport = Measures.thick - Measures.arrondi

        // doors of heightType of 2 or 4 (not "-") go with TIR2 & TIR4 drawers
        this.posY =
            this.heightType != "-" ?
                this.parent.skuInfo.H * 10 - getSize(this.object, "y") - 19
                : Measures.thick - Measures.arrondi

        if (this.parent.skuInfo.type === "ANG") {
            this.object.rotation.y = Math.PI / 4;
        }
    }
    setPositionX(x) {

        if (this.parent.skuInfo.type === "ANG") {
            this.object.position.x = 620
        }
        else {
            this.object.position.x = !this.parent.skuInfo.has2Doors || this.isLeftDoor ? this.deport : this.parent.skuInfo.L * 10 / 2 + Measures.thick
        }
    }
    setPositionY(y) {
        this.object.position.y = this.posY
    }
    setPositionZ(z) {
        if (this.parent.skuInfo.type === "ANG") {
            this.object.position.z = this.parent.depth - Measures.thick
        }
        else {
            this.object.position.z = this.parent.depth
        }
    }
}