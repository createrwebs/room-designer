import Item from './Item'
import { Measures } from '../Utils'

export default class Penrab extends Item {
    /*     constructor (props, object, state, skuInfo, parent) {
            super(props, object, state, skuInfo, parent)
    
            this.object.children.forEach(child => {
                child.position.set(0, -this.height, 300)
            })
        } */
    setPositionX(x) {
        this.object.position.x = Measures.thick
    }
    setPositionY(y = 0) {
        const max = this.parent.getTop() - this.height
        const min = this.parent.getBottom(this.slot)
        this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
    }
    setPositionZ(z) {
        this.object.position.z = (this.parent.depth - this.depth) / 2
    }
}