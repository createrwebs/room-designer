import Item from './Item'
import { Measures } from '../Utils'

export default class Blot extends Item {

    /*     setPositionY(y) {
            this.object.position.y = this.parent.trousTIR[0]
        } */
    setPositionZ(z) {
        this.object.position.z = Measures.thick
    }
}