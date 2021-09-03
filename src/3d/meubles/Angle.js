import Meuble from './Meuble'
import { getSize, Measures } from '../Utils'
import { create as createRuler } from '../helpers/Ruler';
import { Corners } from '../Constants';
import Room from '../Room';

import {
    Group
} from "three";
export default class Angle extends Meuble {// les meubles d'angles ne sont pas Draggables, mais se positionnent face caméra
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)


    }
    positionAllChildren() {
    }
    setupRuler() {
        this.width = getSize(this.object, "x")
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")

        this.ruler1 = createRuler(this.props.sku, this.width + Measures.thick, this.height)
        this.ruler1.position.z = this.depth + 20
        this.ruler2 = createRuler(this.props.sku, this.width + Measures.thick, this.height)
        this.ruler2.rotation.y = Math.PI / 2
        this.ruler2.position.x = this.depth + 20
        this.ruler2.position.z = this.depth + 20


        this.ruler = new Group();
        this.ruler.add(this.ruler1);
        this.ruler.add(this.ruler2);

    }
    setPosition(position) {
        switch (position.wall) {
            case Corners.FR:
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case Corners.RB:
                this.object.rotation.y = -Math.PI / 2;
                this.object.position.x = Room.xmax;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case Corners.BL:
                this.object.rotation.y = Math.PI;
                this.object.position.x = Room.xmax;
                this.object.position.y = 0;
                this.object.position.z = Room.zmax;
                break;
            case Corners.LF:
                this.object.rotation.y = Math.PI / 2;
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = Room.zmax;
                break;
            default:
                console.warn("Meuble Angle with NO corner!?");
        }
    }
}
