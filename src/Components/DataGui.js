import * as dat from 'dat.gui';

let gui;
export const getGui = (stat) => {
    if (gui) return gui
    gui = new dat.GUI({ name: 'My GUI' });
    // var folder1 = gui.addFolder('Flow Field');
    // var person = { name: 'Sam' };
    // gui.add(person, 'name');
    var qq = { age: 45 };
    gui.add(qq, 'age', 0, 100);
    var palette = {
        color1: '#FF0000', // CSS string
        color2: [0, 128, 255], // RGB array
        color3: [0, 128, 255, 0.3], // RGB with alpha
        color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
    };
    gui.addColor(palette, 'color1');
    return gui
}
