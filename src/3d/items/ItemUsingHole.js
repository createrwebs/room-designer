import { getClosestInArray } from '../Drag'
import Item from './Item';
import { Box3 } from "three";
import { Errors } from '../../api/Errors'

export default class ItemUsingHole extends Item {

    computeAvailableHoles() {
        let places = this.parent.skuInfo.trous
        this.parent.items.filter(i => i.skuInfo.useHole).forEach(i => {
            places = places.filter(p => p !== i.positionY)
        });
        places = places.sort((a, b) => a - b)
    }
    startDrag() {
        this.computeAvailableHoles()
    }
    /*
        only for new item
    */
    findFreePlaceInSlot(slot) {
        let places = this.parent.places[slot]
        if (!places || places.length == 0) {
            // goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_PLACE_FOR_ITEM,
            // `no free place available for ${this.props.sku} in ${slot} slot of ${this.parent.props.sku}`)
            return Errors.NO_PLACE_FOR_ITEM
        }
        const segmentY = this.getSegmentY()
        const hole = places.filter(t => segmentY.min <= t && t <= segmentY.max)
            .find(t => {
                this.object.position.y = t
                const collide = this.checkCollision(new Box3().setFromObject(this.object), slot)
                // console.warn(t, this, collide)
                return collide == undefined
            })
        if (!hole) {
            // goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_PLACE_FOR_ITEM,
            // `no free place available for ${this.props.sku} in ${slot} slot of ${this.parent.props.sku}`)
            return Errors.NO_PLACE_FOR_ITEM
        }
        else return hole
    }
    setPositionY(y) {// dragging Item | from saved dressing | by user click
        let places = this.parent.places[this.slot]
        // console.log("/placesY", this.parent.skuInfo.trous)
        // console.log("|placesY", places)

        if (!places) {
            console.warn(`no slot available for ${this.props.sku} in ${this.slot} slot of ${this.parent.props.sku}`)
            // this.parent.removeItem(this)
            this.object.position.y = this.positionY// - Measures.thick / 2
            return
        }
        if (places.length == 0) {
            console.warn(`no place available for ${this.props.sku} in ${this.slot} slot of ${this.parent.props.sku}`)
            // this.parent.removeItem(this)
            this.object.position.y = this.positionY// - Measures.thick / 2
            return
        }

        // add new available hole in places list
        this.parent.addNewHoleInPlace(this.slot, this)

        const position = y ? y : 0
        const closest = getClosestInArray(position, places)
        this.positionY = closest
        this.object.position.y = this.positionY// - Measures.thick / 2

        // remove new occupied hole in places list
        this.parent.places[this.slot] = places.filter(p => p !== this.positionY).sort((a, b) => a - b)

    }
}