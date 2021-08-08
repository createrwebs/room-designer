import Item from './Item'
import { Measures, getSize } from '../Utils'

export default class Chassis extends Item {

    setPositionX(x) {
        this.object.position.x = Measures.thick
        //this.parent.skuInfo.L*10 - this.width + Measures.thick
    }
    setPositionY(y) {

        if (y) {
            y = Math.min(this.parent.skuInfo.H * 10 - this.height, Math.max(this.height, y))
        }

        super.setPositionY(y)
    }
    setPositionZ(z) {
        this.object.position.z = this.parent.depth - this.depth - 11
    }
}