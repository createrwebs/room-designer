import ItemUsingHole from '../items/ItemUsingHole'
import { Measures } from '../Utils'

export default class RangePull extends ItemUsingHole {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        let h = -this.height
        this.object.children.forEach(child => {
            child.position.set(0, h, 0)
        })
    }
    setPositionY(y = 0) {
        const max = this.parent.getTop()
        const min = this.parent.getBottom(this.slot) + this.height
        // console.log(min, max)
        super.setPositionY(Math.min(max, Math.max(min, y === undefined ? 0 : y)))
    }
}