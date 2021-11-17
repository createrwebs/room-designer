import Item from './Item'
import { Measures } from '../Utils'
export default class Casier extends Item {
    setPositionX(x) {
        this.object.position.x = 2 * Measures.thick
    }
    setPositionY(y) {//CAS only in second drawer from bottom
        this.object.position.y = this.positionY = this.parent.skuInfo.ymin + 50 + 1 * 190
    }
    setPositionZ(z) {
        this.object.position.z = Measures.thick
    }
}