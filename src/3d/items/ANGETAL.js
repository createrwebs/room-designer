import Etagere from './Etagere'
import { Measures } from '../Utils'
import { Slots } from '../Constants'

export default class ANGETAL extends Etagere {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        this.slot = this.forceSlot = Slots.L

        this.object.children.forEach(child => {
            child.rotation.y = Math.PI / 2
        })
    }
    getSegmentY() {
        return {
            min: 980,
            max: this.parent.getTop()// - this.height
        }
    }
    setPositionY(y = 0) {
        const segmentY = this.getSegmentY()
        super.setPositionY(Math.min(segmentY.max, Math.max(segmentY.min, y === undefined ? 0 : y)))
    }
    setPositionX(x) {
        this.object.position.x = 98
    }
    setPositionZ(z) {
        this.object.position.z = this.parent.skuInfo.l - Measures.thick
    }
}