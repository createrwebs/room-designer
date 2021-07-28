import Item from './Item'
import { Measures } from '../Utils'

export default class BC extends Item {
    setPosition(x, y, z) {
        switch (this.props.sku) {
            case "BC50000":// porte pantalon sous etagere
                this.object.position.x = 80
                super.setPositionY(y)
                this.object.position.y += 10
                this.object.position.z = this.parent.skuInfo.P * 10 - this.depth
                break;
            case "BC77000":// led au-dessus du meuble, nicht draggable!
                this.object.position.x = Measures.thick + (this.parent.skuInfo.L - this.width) / 2
                this.object.position.y = this.parent.skuInfo.H * 10
                this.object.position.z = this.parent.skuInfo.P * 10 - this.depth + 100
                break;
            case "BC8000___":// spot led detecteur
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
            case "BC84000":// porte cravate... D et G?
                this.object.position.x = this.parent.skuInfo.L - this.width + Measures.thick
                super.setPositionY(y)
                this.object.position.z = this.parent.skuInfo.P * 10 - this.depth
                break;
            default:
                super.setPosition(x, y, z)
        }

    }
}