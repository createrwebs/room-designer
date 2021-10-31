import Draggable from './Draggable'
import { Measures } from '../Utils'
import { Walls, Corners, Sides } from '../Constants';
import { create as createRuler } from '../helpers/Ruler';
import { KinoEvent, goingToKino } from '../../api/Bridge'

import poignee from '../../../assets/poignee.fbx'
import { LoadingManager } from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export default class LSM extends Draggable {
    turned = 0
    constructor(props, object, state, skuInfo) {
        super(props, object, state, skuInfo)

        // if (state.turned) this.turned = state.turned


        const fbxLoader = new FBXLoader()
        fbxLoader.load(poignee,
            (o) => {
                console.log("llll", o)
                object.add(o)
                o.position.x = 448
                o.position.y = 1000
                o.position.z = 200
                this.handle = o
            },
            (xhr) => {
            },
            (error) => {
                console.log("error", error)
            }
        )


    }
    /*     setupRuler() {
            if (this.ruler) this.object.remove(this.ruler);
            const mWidth = this.turned != 0 ? this.skuInfo.p : this.skuInfo.l + (this.skuInfo.hasSides ? 0 : 2 * Measures.thick)
            const mDepth = this.turned != 0 ? this.skuInfo.l + (this.skuInfo.hasSides ? 0 : 2 * Measures.thick) : this.skuInfo.p
            this.ruler = createRuler(this.props.sku, mWidth, this.height)
            this.ruler.position.z = mDepth + 20
            if (this.turned == -1) this.ruler.position.x = this.skuInfo.l + 2 * Measures.thick - this.skuInfo.p
        } */

    // turn module when panneaux loaded
    panneauLoaded(props, where, object) {
        super.panneauLoaded(props, where, object)
    }
    itemLoaded(props, state, skuInfo, object) {
        super.itemLoaded(props, state, skuInfo, object)
        /*         if (skuInfo.isPorte) {
                    this.rotatePorte(object)
                }
                if (skuInfo.isEtagere) {
                    this.rotateEtagere(object)
                } */
    }
    getJSON() {
        let meuble = super.getJSON()
        // meuble.turned = this.turned
        return meuble
    }
}