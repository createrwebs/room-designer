import {
    HemisphereLight,
    AmbientLight,
    HemisphereLightHelper,
    PointLight,
    PointLightHelper
} from "three";
import Room from '../Room';
import { localhost } from '../../api/Utils';

export const setupLights = (scene, scene_params) => {

    /* lumière moyenne ambiance */

    const light = new AmbientLight(0xFFFFFF, .6); // soft white light
    // const light = new HemisphereLight(0xFFFFFF, 0xFFFFFF, 1);

    scene.add(light);

    // const helper = new HemisphereLightHelper(light, 100);
    // if (localhost) scene.add(helper);

    /* plafonnier */

    const pointLight = new PointLight(0xffffff, .5, 0, 1);
    pointLight.position.set(Room.xmax / 2, Room.ymax * 2, Room.zmax / 2);

    pointLight.castShadow = true; // default false
    pointLight.shadow.mapSize.width = scene_params.lightsShadowMapSize.width; //2048; // default
    pointLight.shadow.mapSize.height = scene_params.lightsShadowMapSize.height; //2048 // default
    pointLight.shadow.camera.near = 0.5; // default
    pointLight.shadow.camera.far = 10000; // default

    scene.add(pointLight);

    const pointLightHelper = new PointLightHelper(pointLight, 100);
    if (localhost) scene.add(pointLightHelper);
}