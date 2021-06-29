import {
    HemisphereLight,
    HemisphereLightHelper,
    PointLight,
    PointLightHelper
} from "three";

export const setupLights = (scene, scene_params) => {

    /* lumière moyenne ambiance */

    const light = new HemisphereLight(0xFFFDF4, 0x000000, .6);
    light.position.set(2500, 1200, 2500);

    const helper = new HemisphereLightHelper(light, 100);

    scene.add(light);
    //scene.add( helper );

    /* plafonnier */

    const pointLight = new PointLight(0xffffff, .55, 0, 1);
    pointLight.position.set(2500, 3000, 2500);
    pointLight.castShadow = true; // default false


    pointLight.shadow.mapSize.width = scene_params.lightsShadowMapSize.width; //2048; // default
    pointLight.shadow.mapSize.height = scene_params.lightsShadowMapSize.height; //2048 // default
    pointLight.shadow.camera.near = 0.5; // default
    pointLight.shadow.camera.far = 10000; // default

    scene.add(pointLight);

    // const pointLightHelper = new PointLightHelper(pointLight, 100);
    // scene.add(pointLightHelper);
}