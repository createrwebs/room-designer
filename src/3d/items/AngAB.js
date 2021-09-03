import Item from './Item'
import { Measures } from '../Utils'
import { Sides } from "../Constants";

export default class AngAB extends Item {
    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo, parent)

        const base = this.object.clone()

        this.object.children[0].visible = false
        this.object.position.x = 0
        this.object.position.y = 0
        this.object.position.z = 0
        this.object.name = this.object.children[0].name

        // empirique
        const DX = (this.parent.skuInfo.P === 62 ? 606 : 380) * Math.sin(Math.PI / 4)
        const DZ = (this.parent.skuInfo.P === 62 ? 650 : 432) * (1 - Math.cos(Math.PI / 4))
        const side = this.props.sku.substr(-1) === "R" ? Sides.R : Sides.L

        const nbTriangles = 3
        const triangles = [...Array(nbTriangles).keys()].map(num => {
            const triangle = base.clone()
            triangle.name = `${this.props.sku.substr(-1)}${num}${this.object.children[0].name}`
            triangle.position.y = (this.parent.skuInfo.H * 10 - Measures.thick) * (num / (nbTriangles - 1))
            triangle.position.z = DZ
            if (side === Sides.L) {
                triangle.position.x = - DX
                triangle.rotation.y = Math.PI / 4
            }
            if (side === Sides.R) {
                triangle.position.x = this.parent.skuInfo.l + 2 * Measures.thick + DX
                triangle.rotation.y = -Math.PI / 4
            }
            this.object.add(triangle)
            return triangle
        });
        this.object.remove(this.object.children[0])
    }
    setPosition(x, y, z) {
    }
}