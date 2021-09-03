import Meuble from './Meuble'
import { getSize, Measures } from '../Utils'
import { create as createRuler } from '../helpers/Ruler';
import { Corners, Sides } from '../Constants';
import Room from '../Room';

export default class FileurAng90 extends Meuble {// les meubles d'angles ne sont pas Draggables, mais se positionnent face caméra
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        this[`depth-${Sides.L}`] = 622
        this[`depth-${Sides.R}`] = 622
    }
    setDepth(side, d) {//40 | 62
        // console.warn("setDepth", side, d);
        this[`depth-${side}`] = d == 62 ? 622 : 396
        if (this.state && this.state.position) this.setPosition(this.state.position)
    }
    getDepth(side) {
        return !this[`depth-${side}`] ? 622 - 210 : this[`depth-${side}`] - 210
    }
    positionAllChildren() {
    }
    setPosition(position) {
        this.object.position.y = Measures.thick
        switch (position.wall) {
            case Corners.FR:
                this.object.position.x = this.getDepth(Sides.L)
                this.object.position.z = this.getDepth(Sides.R)
                break;
            case Corners.RB:
                this.object.rotation.y = -Math.PI / 2;

                this.object.position.x = Room.xmax - this.getDepth(Sides.R);
                this.object.position.z = this.getDepth(Sides.L)
                break;
            case Corners.BL:
                this.object.rotation.y = Math.PI;

                this.object.position.x = Room.xmax - this.getDepth(Sides.L);
                this.object.position.z = Room.zmax - this.getDepth(Sides.R);
                break;
            case Corners.LF:
                this.object.rotation.y = Math.PI / 2;

                this.object.position.x = this.getDepth(Sides.R)
                this.object.position.z = Room.zmax - this.getDepth(Sides.L);
                break;
            default:
                console.warn("Meuble FileurAng90 with no corner position");
        }
    }
}
