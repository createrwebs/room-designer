import ItemUsingHole from '../items/ItemUsingHole'

export default class Etagere extends ItemUsingHole {
    setPositionZ(z) {
        if (this.props.sku.includes("PCO")) {// etagere pour armoire coulissante, plus courte
            this.object.position.z = 20
        }
        else {
            this.object.position.z = this.parent.depth - this.depth - 11
        }
    }
}