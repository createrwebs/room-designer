import ItemUsingHole from '../items/ItemUsingHole'
import { Measures } from '../Utils'

export default class Chassis extends ItemUsingHole {
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
    getSegmentY() {
        return {
            min: this.parent.getBottom(this.slot),
            max: this.parent.getTop()// - this.height
        }
    }
    setPositionY(y = 0) {
        const segmentY = this.getSegmentY()
        super.setPositionY(Math.min(segmentY.max, Math.max(segmentY.min, y === undefined ? 0 : y)))
    }
    setPositionZ(z) {
        this.object.position.z = this.parent.depth - this.depth - 11
    }
}