import Item from './Item'
import { Measures, getSize } from '../Utils'

export default class RangeChaussure extends Item {

    constructor(props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        this.isLeft = this.props.sku.substr(-1, 1) == "G"
    }
    setPositionX(x) {
        this.object.position.x =
            this.isLeft ? Measures.thick : this.parent.skuInfo.L - this.width + Measures.thick
    }
    setPositionY(y) {

        if (y) {
            y = Math.min(this.parent.skuInfo.H * 10 - this.height, Math.max(this.height, y))
        }

        super.setPositionY(y)
    }
    setPositionZ(z) {
        this.object.position.z = this.parent.depth - this.depth// - 11
    }
}