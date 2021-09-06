import Item from './Item'
import { Measures } from '../Utils'
import { Box3 } from "three";

export default class Blot extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
    }
    setPositionY(y = 0) {
        const max = this.parent.skuInfo.H * 10 - this.height - 120
        this.object.position.y = this.positionY = Math.min(max, Math.max(this.parent.getBottom(), y === undefined ? 0 : y))
    }
}