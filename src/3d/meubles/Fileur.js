import Draggable from './Draggable'
import { Measures } from '../Utils'
import Room from '../Room';
export default class Fileur extends Draggable {
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        this.dpth = 396
        this.minWidth = Room.meubleMagnet
        this.maxWidth = 150
        this.LSMwidth = (state && state.width) ? state.width : this.maxWidth
        this.setWidth(this.LSMwidth)
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
    setWidth(w) {
        // console.log("LSM setWidth", w)
        w = Math.min(this.maxWidth, Math.max(this.minWidth, w))
        this.LSMwidth = w
        const scale = w * 10 / this.maxWidth
        this.object.children[0].scale.x = scale
    }
    enterWallThreshold = 20
    dragging(event) {
        // get mouse drag coord before Draggable.dragging() modifies it :
        Room.axis = Room.getAxisForWall(this.wall);
        const axis = Room.axis
        event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))//grid magnet 1cm
        if (event.object.position[axis] - Room[this.wall].min < 0) {
            this.setWidth(10 + this.maxWidth - (Room[this.wall].min - event.object.position[axis]))
        }
        if (event.object.position[axis] - Room[this.wall].max > 0) {
            this.setWidth(10 + this.maxWidth - (event.object.position[axis] - Room[this.wall].max))
        }
        super.dragging(event)
    }
    getJSON() {
        let meuble = super.getJSON()
        meuble.width = this.LSMwidth
        return meuble
    }
}