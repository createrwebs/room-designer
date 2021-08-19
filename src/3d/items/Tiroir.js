import Item from './Item'
import { getSegment, Measures } from '../Utils'

export default class Tiroir extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        const segmentY = getSegment(object, "y")
        let places = this.parent.places[this.place]
        if (places.length == 0) {
            console.warn(`no slot available for ${this.props.sku}`)
            // this.parent.removeItem(this)
            // this.object.position.y = this.positionY - Measures.thick / 2
            return
        }

        places = places.filter(function (p) {
            return !(p >= segmentY.min && p <= segmentY.max + 60)//aeration!
        })
        this.parent.places[this.place] = places

        // console.log(places, segmentY)

    }
    setPositionY(y) {
        this.object.position.y = 50//this.parent.trousTIR[0]
    }
    setPositionZ(z) {
        this.object.position.z = Measures.thick
    }
}