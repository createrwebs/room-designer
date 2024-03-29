import Item from './Item'
import { Measures } from '../Utils'

export default class SeparateurV extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        /*         const h = this.height
                this.object.children.forEach(child => {
                    child.position.set(0, -h, 0)
                }) */

        this.xSegment = {
            min: Measures.thick,
            max: this.parent.skuInfo.l
        }
        this.setPositionX((this.parent.skuInfo.l + 2 * Measures.thick) / 2)

    }
    setPositionX(x) {

        // dragging rejected if collision between Etageres
        if (x)
            this.object.position.x = Math.max(this.xSegment.min, Math.min(this.xSegment.max, x))
    }
    setPositionY(y = 0) {
        const max = this.parent.getTop()
        const min = this.parent.getBottom(this.slot)
        this.object.position.y = this.positionY = Math.round(Math.min(max, Math.max(min, y === undefined ? 0 : y)))
    }
}