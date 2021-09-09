import Item from './Item'
import { Measures } from '../Utils'
import { Slots } from '../Constants'

export default class ANGTIR extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        this.slot = this.forceSlot = Slots.L
    }
    getSegmentY() {
        return {
            min: this.parent.getBottom(),
            max: 710 - this.height
        }
    }
    setPositionY(y = 0) {
        const segmentY = this.getSegmentY()
        this.object.position.y = Math.min(segmentY.max, Math.max(segmentY.min, y === undefined ? 0 : y))
        super.setPositionY()
    }
    setPositionX(x) {
        this.object.position.x = 58
    }
    setPositionZ(z) {
        this.object.position.z = 640
    }
}