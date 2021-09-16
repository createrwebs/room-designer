import Item from './Item'
import { Measures } from '../Utils'

export default class Miroir extends Item {
    setPositionX(x) {
        const middle = (this.parent.skuInfo.l + 2 * Measures.thick) / 2
        const toRight = x > middle
        if (toRight) {
            this.object.children.forEach(child => {
                child.position.z = this.depth + 80
                child.rotation.y = -Math.PI
            })
        }
        else {
            this.object.children.forEach(child => {
                child.position.z = 80
                child.rotation.y = 0
            })
        }

        this.object.position.x
            = this.positionX
            = toRight ? this.parent.skuInfo.l + this.width - 14 : this.width - 14
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