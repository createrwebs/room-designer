import Item from './Item'
import { Measures } from '../Utils'

export default class Tiroir extends Item {

    setPositionY(y) {
        this.object.position.y = 50//this.parent.trousTIR[0]
    }
    setPositionZ(z) {
        this.object.position.z = Measures.thick
    }
}