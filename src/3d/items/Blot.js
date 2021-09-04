import Item from './Item'
import { Measures } from '../Utils'
import { Box3 } from "three";

export default class Blot extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        this.lastY = this.object.position.y
    }
    setPositionY(y = 0) {

        /* var boundingBox = new Box3().setFromObject(this.object);

        var collide = this.parent.items.filter(i => i != this)
            .find(i => {
                var bBox = new Box3().setFromObject(i.object);

                return boundingBox.intersectsBox(bBox)

            })

        if (collide) {
            this.object.position.y = this.positionY = this.lastY
            return
        } */

        const max = this.parent.skuInfo.H * 10 - this.height - 120
        this.object.position.y = this.positionY = Math.min(max, Math.max(this.parent.getBottom(), y === undefined ? 0 : y))

        this.lastY = this.object.position.y
    }
}