import Draggable from './Draggable'
import { Measures } from '../Utils'
export default class Fileur extends Draggable {
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        this.dpth = 396
    }
    getDepth() {
        return this.dpth || 396
    }
    setupRuler() {
        super.setupRuler()
        this.ruler.position.z = this.getDepth() + 20
    }
    positionAllChildren() {
        this.object.children.forEach(child => {
            child.position.set(0, 0, this.getDepth() - Measures.thick)
        })
    }
    setDepth(d) {//40 | 62
        this.skuInfo.P = this.skuInfo.PR = this.skuInfo.PL = d
        this.skuInfo.p = this.skuInfo.P === 62 ? 622 : 396
        this.dpth = this.skuInfo.p
        this.positionAllChildren()
        this.ruler.position.z = this.getDepth() + 20
    }
}