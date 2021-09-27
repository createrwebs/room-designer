import MainScene from '../MainScene';
import { KinoEvent, goingToKino } from '../../api/Bridge'

const saveFile = function (strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}
export const takePix = (name) => {
    try {
        const imgData = MainScene.getRendererNodeElement().toDataURL("image/jpeg");
        // const image = new Image();
        // image.src = imgData
        // const w = window.open("");
        // w.document.write(image.outerHTML);

        goingToKino(KinoEvent.PICTURE_DATA, imgData)


        // to save it :
        // saveFile(imgData.replace("image/jpeg", "image/octet-stream"), name ? `${name}.png` : "scene-3d.png");
    } catch (e) {
        console.log('takePix error', e);
        return;
    }
}