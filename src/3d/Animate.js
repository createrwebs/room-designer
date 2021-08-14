import { localhost } from '../api/Utils';
import MainScene from '../3d/MainScene';
import { startEngine, stopEngine } from './Utils';

// https://github.com/tweenjs/tween.js
// import TWEEN from '@tweenjs/tween.js';
const TWEEN = require('@tweenjs/tween.js')

let animationFrameId

/* animer les choses animables */
/*             scene.traverse(function (ob) {
    if (ob.animable) {
        var axe = ob.groupProps.axe;
        var from = parseInt(ob.groupProps.from);
        var to = parseInt(ob.groupProps.to);
        ob.position[`${axe}`] = Math.sin(Date.now() * 0.001) * Math.PI * to;
    }
    renderer.render(scene, camera);
}); */

export const cameraTo = (cameraPosition, cameraTarget, duration) => {
    var position = MainScene.camera.position
    var tween = new TWEEN.Tween({
        position: MainScene.camera.position,
        target: MainScene.orbitControls.target
    }).to({
        position: cameraPosition,
        target: cameraTarget
    }, duration);

    // https://github.com/tweenjs/tween.js/blob/master/examples/03_graphs.html
    tween.easing(TWEEN.Easing.Quadratic.In)

    tween.onUpdate(function () {
        MainScene.orbitControls.update();
    });
    tween.onComplete(function () {
        stopEngine()
    });
    tween.start();
    startEngine(TWEEN.update)
}
export const tweenTo = (start, end, duration) => {
    var tween = new TWEEN.Tween(start).to(end, duration);

    // https://github.com/tweenjs/tween.js/blob/master/examples/03_graphs.html
    tween.easing(TWEEN.Easing.Quadratic.In)

    tween.onUpdate(function () {
        MainScene.render()
    });
    tween.onComplete(function () {
        stopEngine()
    });
    tween.start();
    startEngine(TWEEN.update)
}