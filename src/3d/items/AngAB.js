import Item from './Item'
import { Measures } from '../Utils'

export default class AngAB extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        // .clone *3 *4 selon H !!!

        const isRight = this.props.sku.substr(-1) === "R"

        console.log(this)

        // trying to access triangles positioning, but meshes position are setup in fbx

        /*         this.object.children.forEach(child => child.visible = false)
                this.t1 = this.object.getObjectByName("angle1-mtl-hori")
                this.t2 = this.object.getObjectByName("angle7-mtl-hori")
                this.t1.visible = true
                this.t2.visible = true
                console.log(this.t1)
                console.log(this.t2)
         */

        this.object.position.y = this.parent.skuInfo.H * 10 - Measures.thick

        if (isRight) {
            this.object.position.x = (this.parent.skuInfo.L * 10 + (2 * Measures.thick)) * Math.cos(Math.PI / 4)
            this.object.position.z = 0
        }
        else {
            this.object.position.x = 0
            this.object.position.z = (this.parent.skuInfo.L * 10 + (2 * Measures.thick)) * Math.cos(Math.PI / 4)
        }
    }
    setPosition(x, y, z) {
        // this.object.position.x = 0
        // this.object.position.y = 0
        // this.object.position.z = 0
    }
}