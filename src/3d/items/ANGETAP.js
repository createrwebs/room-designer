import Etagere from './Etagere'
import { Measures } from '../Utils'
import { Slots } from '../Constants'

export default class ANGETAP extends Etagere {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        this.slot = this.forceSlot = Slots.C
    }
    setPositionX(x) {
        this.object.position.x = 46
    }
    getSegmentY() {
        return {
            min: this.parent.getBottom(this.slot),
            max: this.parent.getTop()// - this.height
        }
    }
    setPositionY(y = 0) {
        const segmentY = this.getSegmentY()
        super.setPositionY(Math.min(segmentY.max, Math.max(segmentY.min, y === undefined ? 0 : y)))
    }
    setPositionZ(z) {
        this.object.position.z = 90
    }
}