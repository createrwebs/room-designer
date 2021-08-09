import Item from './Item'
import { Measures } from '../Utils'

export default class AngAB extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        // const isRight = this.props.sku.substr(-1) === "R"

        // const base = this.object.children[0].clone()
        const base = this.object.clone()

        // console.log(base)
        // base.position.x = -100
        // base.position.y = Measures.thick / 2
        // base.position.z = 0

        this.object.children[0].visible = false
        this.object.position.x = 0
        this.object.position.y = 0
        this.object.position.z = 0
        this.object.name = this.object.children[0].name

        const L1 = (this.parent.skuInfo.L * 10 + (2 * Measures.thick)) * Math.cos(Math.PI / 4)
        const L2 = this.parent.skuInfo.P * 10 * (1 - Math.cos(Math.PI / 4))
        const L3 = this.parent.skuInfo.P * 10 * Math.sin(Math.PI / 4)

        // left triangles are wider !?
        const triangles = ["L0", "L1", "L2", "L3", "R0", "R1", "R2", "R3"].map(name => {
            const triangle = base.clone()
            const num = parseInt(name.substr(1, 2))
            triangle.name = `${name}${this.object.children[0].name}`
            triangle.position.y = (this.parent.skuInfo.H * 10 - Measures.thick) * (num / 3)
            triangle.position.x = 0
            triangle.position.z = 0
            if (name.substr(0, 1) === "R") {
                triangle.position.x = this.parent.skuInfo.L * 10 + Measures.thick + L3
                triangle.position.z = L2
                triangle.rotation.y = - Math.PI / 4
            }
            // parent.object.add(triangle)
            this.object.add(triangle)
            return triangle
        });
        this.object.remove(this.object.children[0])

        // window.tt = triangles[7]
        // this.setTexture()
    }
    setPosition(x, y, z) {
    }
}