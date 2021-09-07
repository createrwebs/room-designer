import Draggable from './Draggable'
import { Measures } from '../Utils'
import { Walls, Corners, Sides } from '../Constants';
import { create as createRuler } from '../helpers/Ruler';

export default class RL057 extends Draggable {
    turned = 0
    setupRuler() {
        if (this.ruler) this.object.remove(this.ruler);
        const mWidth = this.turned != 0 ? this.skuInfo.p : this.skuInfo.l + (this.skuInfo.hasSides ? 0 : 2 * Measures.thick)
        const mDepth = this.turned != 0 ? this.skuInfo.l + (this.skuInfo.hasSides ? 0 : 2 * Measures.thick) : this.skuInfo.p
        this.ruler = createRuler(this.props.sku, mWidth, this.height)
        this.ruler.position.z = mDepth + 20
        if (this.turned == -1) this.ruler.position.x = this.skuInfo.l + 2 * Measures.thick - this.skuInfo.p
    }
    switchToNormalPos() {
        if (this.turned == 0) return
        this.object.children.forEach(child => {
            child.rotation.set(0, 0, 0)
            child.position.set(Measures.thick, 0, 0)
        })
        if (this.panneaux) {
            if (this.panneaux[Sides.L] && this.panneaux[Sides.L].object) {
                this.panneaux[Sides.L].object.position.x = 0
                this.panneaux[Sides.L].object.position.y = 0
                this.panneaux[Sides.L].object.position.z = 0;
            }
            if (this.panneaux[Sides.R] && this.panneaux[Sides.R].object) {
                this.panneaux[Sides.R].object.position.x = this.skuInfo.l + Measures.thick;
                this.panneaux[Sides.R].object.position.y = 0;
                this.panneaux[Sides.R].object.position.z = 0
            }
        }
        this.turned = 0
        this.setupRuler()
    }

    insideMeubleThreshold = 100// mm de drag dans un meuble pour pivoter

    // TODO 1/4 turn range chaussure porte + etagere item !
    insideDrag(inside, stickTo, target) {
        if ((inside < this.insideMeubleThreshold) || target == null) {
            this.switchToNormalPos()
            return
        }
        this.setupRuler()
        switch (stickTo) {
            case Sides.L:// 1/4 turn to right
                this.turned = 1
                if (target && target.skuInfo.PR != 62) return;
                this.object.children.forEach(child => {
                    child.position.set(0, 0, this.skuInfo.l + Measures.thick)
                    child.rotation.set(0, Math.PI / 2, 0)
                })
                this.panneaux[Sides.L].object.position.x = 0
                this.panneaux[Sides.L].object.position.y = 0
                this.panneaux[Sides.L].object.position.z = this.skuInfo.l + 2 * Measures.thick
                this.panneaux[Sides.R].object.position.x = 0
                this.panneaux[Sides.R].object.position.y = 0
                this.panneaux[Sides.R].object.position.z = Measures.thick
                break;
            case Sides.R:
                this.turned = -1
                if (target && target.skuInfo.PL != 62) return;
                this.object.children.forEach(child => {
                    child.rotation.set(0, -Math.PI / 2, 0)
                    child.position.set(this.skuInfo.l + 2 * Measures.thick, 0, Measures.thick)
                })
                this.panneaux[Sides.L].object.position.x = this.skuInfo.l + 2 * Measures.thick
                this.panneaux[Sides.L].object.position.y = 0
                this.panneaux[Sides.L].object.position.z = 0
                this.panneaux[Sides.R].object.position.x = this.skuInfo.l + 2 * Measures.thick
                this.panneaux[Sides.R].object.position.y = 0
                this.panneaux[Sides.R].object.position.z = this.skuInfo.l + Measures.thick
                break;
        }
    }
}