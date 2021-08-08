import MainScene from '../MainScene';

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

    var imgData;
    var strDownloadMime = "image/octet-stream";

    try {
        var strMime = "image/jpeg";
        imgData = MainScene.getRendererNodeElement().toDataURL(strMime);

        saveFile(imgData.replace(strMime, strDownloadMime), name ? `${name}.png` : "scene-3d.png");
    } catch (e) {
        console.log('takePix error', e);
        return;
    }
}