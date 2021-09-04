import Item from './Item'
import { Measures, getSize } from '../Utils'

export default class RangeChaussure extends Item {

    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        this.isLeft = this.props.sku.substr(-1, 1) == "G"
    }
    setPositionX(x) {
        super.setPositionX(x)

        if (!this.isLeft) {
            const slots = this.parent.skuInfo.slots
            if (slots) {
                const slotWidth = slots[1] - slots[0]
                this.object.position.x = this.object.position.x + slotWidth - this.width - Measures.thick
            }
            else {
                this.object.position.x = this.parent.skuInfo.l - this.width + Measures.thick
            }
        }
    }
    setPositionY(y = 0) {
        const max = this.parent.skuInfo.H * 10 - this.height - 120
        const min = 100
        // console.log(min, max)
        this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
    }
}