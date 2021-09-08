import Draggable from './Draggable'
import { Measures } from '../Utils'
import { Walls, Corners, Sides } from '../Constants';
import { create as createRuler } from '../helpers/Ruler';
import { KinoEvent, goingToKino } from '../../api/Bridge'

export default class RL057 extends Draggable {
    turned = 0
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        if (state.turned) this.turned = state.turned
    }
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

        const porte = this.items.find(i => i.skuInfo.isPorte)
        if (porte && porte.object) this.rotatePorte(porte.object, porte)
        this.items.filter(i => i.skuInfo.isEtagere).forEach(i => this.rotateEtagere(i.object, i))
    }

    insideMeubleThreshold = 80// mm de drag dans un meuble pour pivoter

    insideDrag(inside, stickTo, target) {
        if ((inside < this.insideMeubleThreshold) || target == null) {
            this.switchToNormalPos()
            return
        }
        if (target.skuInfo.isCoulissante) {
            goingToKino(KinoEvent.NO_RLTURN_ON_COULISSANTE)
            return
        }
        if (stickTo === Sides.L && target.skuInfo.PR != 62) {
            return
        }
        if (stickTo === Sides.R && target.skuInfo.PL != 62) {
            return
        }
        this.rotateModule(stickTo)
    }

    // turn module when panneaux loaded
    panneauLoaded(props, where, object) {
        super.panneauLoaded(props, where, object)
        if (this.turned == 1) this.rotateModule(Sides.L)
        if (this.turned == -1) this.rotateModule(Sides.R)
    }
    rotateModule(stickTo) {
        this.setupRuler()
        switch (stickTo) {
            case Sides.L:// 1/4 turn to right
                this.turned = 1
                this.object.children.forEach(child => {
                    child.position.set(0, 0, this.skuInfo.l + Measures.thick)
                    child.rotation.set(0, Math.PI / 2, 0)
                })
                if (this.panneaux[Sides.L]) {
                    this.panneaux[Sides.L].object.position.x = 0
                    this.panneaux[Sides.L].object.position.y = 0
                    this.panneaux[Sides.L].object.position.z = this.skuInfo.l + 2 * Measures.thick
                }
                if (this.panneaux[Sides.R]) {
                    this.panneaux[Sides.R].object.position.x = 0
                    this.panneaux[Sides.R].object.position.y = 0
                    this.panneaux[Sides.R].object.position.z = Measures.thick
                }
                break;
            case Sides.R:
                this.turned = -1
                this.object.children.forEach(child => {
                    child.rotation.set(0, -Math.PI / 2, 0)
                    child.position.set(this.skuInfo.l + 2 * Measures.thick, 0, Measures.thick)
                })
                if (this.panneaux[Sides.L]) {
                    this.panneaux[Sides.L].object.position.x = this.skuInfo.l + 2 * Measures.thick
                    this.panneaux[Sides.L].object.position.y = 0
                    this.panneaux[Sides.L].object.position.z = 0
                }
                if (this.panneaux[Sides.R]) {
                    this.panneaux[Sides.R].object.position.x = this.skuInfo.l + 2 * Measures.thick
                    this.panneaux[Sides.R].object.position.y = 0
                    this.panneaux[Sides.R].object.position.z = this.skuInfo.l + Measures.thick
                }
                break;
        }
        const porte = this.items.find(i => i.skuInfo.isPorte)
        if (porte && porte.object) this.rotatePorte(porte.object, porte)
        this.items.filter(i => i.skuInfo.isEtagere).forEach(i => this.rotateEtagere(i.object, i))
    }
    itemLoaded(props, state, skuInfo, object) {
        super.itemLoaded(props, state, skuInfo, object)
        if (skuInfo.isPorte) {
            this.rotatePorte(object)
        }
        if (skuInfo.isEtagere) {
            this.rotateEtagere(object)
        }
    }
    rotatePorte(object, item) {
        switch (this.turned) {
            case 1:
                object.position.x = this.skuInfo.p
                object.position.z = this.skuInfo.l + Measures.thick
                object.rotation.y = Math.PI / 2
                break;
            case -1:
                object.position.x = this.skuInfo.l + 2 * Measures.thick - this.skuInfo.p
                object.position.z = Measures.thick
                object.rotation.y = -Math.PI / 2
                break;
            case 0:
            default:
                if (item) {
                    item.setPositionX()
                    item.setPositionZ()
                }
                object.rotation.y = 0
        }
        if (item) {//?
            item.setPositionY()
        }
    }
    rotateEtagere(object, item) {
        switch (this.turned) {
            case 1:
                object.position.x = Measures.thick
                object.position.z = this.skuInfo.l + Measures.thick
                object.rotation.y = Math.PI / 2
                break;
            case -1:
                object.position.x = this.skuInfo.l + Measures.thick
                object.position.z = Measures.thick
                object.rotation.y = -Math.PI / 2
                break;
            case 0:
            default:
                object.position.x = Measures.thick
                object.position.z = this.skuInfo.zback
                object.rotation.y = 0
        }
        if (item) {
            item.setPositionY(item.positionY)
            item.setPositionX = () => {
            }
        }
    }
    getJSON() {
        let meuble = super.getJSON()
        meuble.turned = this.turned
        return meuble
    }
}