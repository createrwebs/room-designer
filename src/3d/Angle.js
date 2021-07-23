import {
    select,
    drag,
    Tools
}
    from '../api/actions'
import store from '../api/store';

import MainScene from './MainScene';
import Draggable from './Draggable'

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { create as createCross } from './helpers/Cross';
import { Space, Room } from './Drag';
import Meuble from './Meuble'


export default class Angle extends Meuble {
    constructor(props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        this.width = this.getWidth()

    }

}
