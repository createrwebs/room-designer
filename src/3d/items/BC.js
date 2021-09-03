import Item from './Item'
import { Measures } from '../Utils'

export default class BC extends Item {

    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)
        switch (this.props.sku) {
            case "BC77000":
            case "BC78000":
                this.parent.hasLight = true
                break;
        }
    }
    remove() {
        switch (this.props.sku) {
            case "BC77000":
            case "BC78000":
                this.parent.hasLight = false
                break;
        }
        super.remove()
    }
    setPosition(x, y, z) {
        switch (this.props.sku) {
            case "BC50000":// porte pantalon sous etagere
                this.object.position.x = 80
                super.setPositionY(y)
                this.object.position.y += 10
                this.object.position.z = this.parent.skuInfo.P * 10 - this.depth
                break;
            case "BC77000":// leds au-dessus du meuble, nicht draggable!
            case "BC78000":
                if (this.parent.skuInfo.type === "ANG") {
                    this.object.position.x = 620
                    this.object.position.z = 910
                    this.object.position.y = this.parent.skuInfo.H * 10
                    this.object.rotation.y = Math.PI / 4
                }
                else {
                    this.object.position.x = Measures.thick + (this.parent.skuInfo.L * 10 - this.width) / 2
                    this.object.position.y = this.parent.skuInfo.H * 10
                    this.object.position.z = this.parent.skuInfo.P * 10 - this.depth + 100
                }
                break;
            case "BC80000":// spot led detecteur
                if (this.parent.skuInfo.type === "ANG") {
                    this.object.position.x = 780
                    this.object.position.z = 800
                    this.object.position.y = this.parent.skuInfo.H * 10 - Measures.thick// - this.height
                    this.object.rotation.y = Math.PI / 4
                }
                else {
                    this.object.position.x = Measures.thick + (this.parent.skuInfo.L * 10 - this.width) / 2
                    this.object.position.y = this.parent.skuInfo.H * 10
                    this.object.position.z = this.parent.skuInfo.P * 10 - this.depth + 100
                }
                break;
            case "BC81000":// porte cintre pivotant sous etagere
                this.object.position.x = 80
                super.setPositionY(y)
                this.object.position.y += 10
                this.object.position.z = this.parent.skuInfo.P * 10 - this.depth
                break;
            case "BC82000":// porte cintre extractible
                this.object.position.x = 100
                super.setPositionY(y)
                this.object.position.y -= 4
                this.object.position.z = this.parent.skuInfo.P * 10 - this.depth
                break;
            case "BC83000":// prise elec
                this.object.position.x = 80
                super.setPositionY(y)
                this.object.position.y += 44
                this.object.position.z = this.parent.depth - this.depth - 11//recul
                break;
            case "BC84000":// porte cravate
            case "BC84000G":
            case "BC84000D":
                const toLeft = !(this.props.sku.substr(-1, 1) == "D")
                this.object.position.x = (!toLeft ? this.parent.skuInfo.l - this.width : 0) + Measures.thick
                super.setPositionY(y)
                this.object.position.z = this.parent.skuInfo.p - this.depth
                break;
            default:
                super.setPosition(x, y, z)
        }

    }
}