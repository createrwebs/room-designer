import Item from './Item'
import { Measures } from '../Utils'

export default class Chassis extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        let h = -this.height
        switch (skuInfo.type) {
            case "CHACHAUSS":
                h += 8
                break;
            case "CHALINGE":
            case "CHAPANF":
            case "CHAPANT":
                h += 24
                break;
            case "CHACAS":
            case "PENRAB":

                break;
        }
        this.object.children.forEach(child => {
            child.position.set(0, h, 0)
        })
    }
    setPositionX(x) {
        this.object.position.x = Measures.thick
    }
    setPositionY(y = 0) {
        const max = this.parent.skuInfo.H * 10 - this.height
        const min = this.parent.getBottom(this.slot)
        // console.log(min, max)
        super.setPositionY(Math.min(max, Math.max(min, y === undefined ? 0 : y)))

    }
    setPositionZ(z) {
        this.object.position.z = this.parent.depth - this.depth - 11
    }
}