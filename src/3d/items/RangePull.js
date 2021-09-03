import Item from './Item'
import { Measures, getSize } from '../Utils'

export default class RangePull extends Item {

    setPositionY(y) {

        if (y) {
            y = Math.min(this.parent.skuInfo.h - this.height, Math.max(0, y))
        }
        super.setPositionY(y)
        // this.object.position.y = Math.max(50, this.positionY - 372)
    }
}