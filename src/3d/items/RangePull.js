import ItemUsingHole from '../items/ItemUsingHole'
import { Measures } from '../Utils'

export default class RangePull extends ItemUsingHole {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        const h = -this.height
        this.object.children.forEach(child => {
            child.position.set(0, h - Measures.thick / 2, 0)
        })
    }
    getSegmentY() {
        return {
            min: this.parent.getBottom(this.slot) + this.height,
            max: this.parent.getTop()
        }
    }
    setPositionY(y = 0) {
        const segmentY = this.getSegmentY()
        super.setPositionY(Math.min(segmentY.max, Math.max(segmentY.min, y === undefined ? 0 : y)))
    }
}