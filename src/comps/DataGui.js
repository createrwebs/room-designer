import * as dat from 'dat.gui';
import MainScene from '../3d/MainScene';

let gui;
export const getGui = (stat) => {
    if (gui) return gui
    gui = new dat.GUI({ name: 'Minet3dGui' });

    // SHIFT+H
    // https://github.com/dataarts/dat.gui/blob/master/API.md

    var cameraFolder = gui.addFolder('Camera');

    // Camera frustum vertical field of view, from bottom to top of view, in degrees.Default is 50.
    var cameraFovSlider = cameraFolder.add(MainScene.camera, 'fov', 20, 120);
    cameraFovSlider.onChange(function (value) {
        MainScene.camera.updateProjectionMatrix()
        MainScene.render()
    });
    var cameraZoomSlider = cameraFolder.add(MainScene.camera, 'zoom', 0.5, 5, 0.1);
    cameraZoomSlider.onChange(function (value) {
        MainScene.camera.updateProjectionMatrix()
        MainScene.render()
    });

    /*     var palette = {
            color1: '#FF0000', // CSS string
            color2: [0, 128, 255], // RGB array
            color3: [0, 128, 255, 0.3], // RGB with alpha
            color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
        };
        gui.addColor(palette, 'color1'); */

    return gui
}
