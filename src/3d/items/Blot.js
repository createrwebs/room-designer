import Item from './Item'

export default class Blot extends Item {
    setPositionY(y = 0) {
        this.object.position.y = this.positionY = this.parent.getBottom(this.slot, this)
    }
}