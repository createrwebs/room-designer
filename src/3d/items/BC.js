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
        const max = this.parent.skuInfo.H * 10 - this.height - Measures.thick
        const min = this.parent.getBottom(this.slot)
        switch (this.props.sku) {
            case "NYTABREP":// table repassage
                this.object.position.x = 80
                this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
                this.object.position.z = this.parent.skuInfo.p - this.depth - 80
                break;
            case "BC50000":// porte pantalon sous etagere
                this.object.position.x = 80
                this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
                this.object.position.z = this.parent.skuInfo.p - this.depth
                break;
            case "BC77000":// leds au-dessus du meuble
            case "BC78000":
                if (this.parent.skuInfo.type === "ANG") {
                    this.object.position.x = 620
                    this.object.position.z = 910
                    this.object.position.y = this.parent.skuInfo.H * 10
                    this.object.rotation.y = Math.PI / 4
                }
                else if (this.parent.skuInfo.isCoulissante) {
                    this.object.position.x = Measures.thick + (this.parent.skuInfo.l - this.width) / 2
                    this.object.position.y = this.parent.skuInfo.H * 10 - 60
                    this.object.position.z = this.parent.skuInfo.p - this.depth + 50
                }
                else {
                    this.object.position.x = Measures.thick + (this.parent.skuInfo.l - this.width) / 2
                    this.object.position.y = this.parent.skuInfo.H * 10
                    this.object.position.z = this.parent.skuInfo.p - this.depth + 100
                }
                break;
            case "BC80000":// spot led detecteur
                this.object.position.y = this.parent.getTop()
                if (this.parent.skuInfo.type === "ANG") {
                    this.object.position.x = 780
                    this.object.position.z = 800
                    this.object.rotation.y = Math.PI / 4
                }
                else if (this.parent.skuInfo.isCoulissante) {
                    this.object.position.x = Measures.thick + this.parent.skuInfo.l / 2//BC80000 is fbx centered!
                    this.object.position.z = this.parent.skuInfo.p - this.depth + 50
                }
                else {
                    this.object.position.x = Measures.thick + this.parent.skuInfo.l / 2//BC80000 is fbx centered!
                    this.object.position.z = this.parent.skuInfo.p - this.depth + 50
                }
                break;
            case "BC81000":// porte cintre pivotant sous etagere
                // this.object.position.x = 80
                super.setPositionX(x)
                this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
                this.object.position.z = this.parent.skuInfo.p - this.depth
                break;
            case "BC82000":// porte cintre extractible
                // this.object.position.x = 100
                super.setPositionX(x)
                this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
                this.object.position.z = this.parent.skuInfo.p - this.depth
                break;
            case "BC83000":// prise elec
                this.object.position.x = 80
                this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
                this.object.position.z = this.parent.depth - this.depth - 11//recul
                break;
            case "BC84000":// porte cravate
            case "BC84000G":
            case "BC84000D":
                const toLeft = !(this.props.sku.substr(-1, 1) == "D")
                this.object.position.x = (!toLeft ? this.parent.skuInfo.l - this.width : 0) + Measures.thick
                this.object.position.y = this.positionY = Math.min(max, Math.max(min, y === undefined ? 0 : y))
                this.object.position.z = this.parent.skuInfo.p - this.depth
                break;
            default:
                super.setPosition(x, y, z)
        }

    }
}