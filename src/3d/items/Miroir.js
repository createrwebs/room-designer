import Item from './Item'
import { Measures } from '../Utils'

export default class Miroir extends Item {
    setPositionX(x) {
        const middle = (this.parent.skuInfo.l + 2 * Measures.thick) / 2
        const toRight = x > middle
        this.object.position.x = this.positionX = toRight ? this.parent.skuInfo.l : this.width// - this.width
    }
    getSegmentY() {
        return {
            min: this.parent.getBottom(this.slot),
            max: this.parent.getTop() - this.height
        }
    }
    setPositionY(y = 0) {
        const segmentY = this.getSegmentY()
        super.setPositionY(this.object.position.y = Math.min(segmentY.max, Math.max(segmentY.min, y === undefined ? 0 : y)))
    }
}