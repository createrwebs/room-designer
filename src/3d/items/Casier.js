import Item from './Item'
import { getSegment, Measures } from '../Utils'
import { getClosestInArray } from '../Drag'

export default class Casier extends Item {
    constructor(props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)


        /*  const nbTiroirs = this.items.filter(i => i.skuInfo.isTiroir).reduce((p, c) => p + c.skuInfo.type == "TIR4" ? 4 : 2, 0)// only 2 types of tiroirs
         const casiers = this.items.filter(i => i.skuInfo.type == "CAS")
 
 
         const segmentY = getSegment(object, "y")
         let places = this.parent.places[this.slot]
         if (places.length == 0) {
             console.warn(`no slot available for ${this.props.sku}`)
             // this.parent.removeItem(this)
             // this.object.position.y = this.positionY - Measures.thick / 2
             return
         }
 
         places = places.filter(function (p) {
             return !(p >= segmentY.min && p <= segmentY.max + 60)//aeration!
         })
         this.parent.places[this.slot] = places */
    }
    setPositionY(y) {
        // only 1 drawer per meuble !
        const tiroir = this.parent.items.find(i => i.skuInfo.isTiroir)
        if (tiroir.length === 0) {
            this.object.position.y = this.positionY.skuInfo.ymin
            return
        }
        const nbTiroirPlaces = tiroir.skuInfo.type == "TIR4" ? 4 : 2
        const places = Array.from(Array(nbTiroirPlaces), (u, x) => this.parent.skuInfo.ymin + 50 + x * 190);
        const position = y ? y : 0
        const closest = getClosestInArray(position, places)
        this.positionY = closest
        // console.warn(`this.positionY`, position, places, this.positionY)
        this.object.position.y = this.positionY

        super.setPositionY()

    }
    setPositionZ(z) {
        this.object.position.z = Measures.thick
    }
}