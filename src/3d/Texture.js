import * as THREE from "three";
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';// miroir

export const loadTextures = (object, textures) => {
    console.log('loadTextures', object, textures);
    var promise = new Promise((resolveTexturesLoaded, rejectTexturesLoaded) => {

        const textureLoader = new THREE.TextureLoader();

        var texturePromises = [];

        for (var key in textures) {
            texturePromises.push(new Promise((resolve, reject) => {
                var metas = textures[key];
                var name = key;
                var url = metas.url;
                var angle_fil = metas.angle_fil;
                var label = metas.label;

                textureLoader.load(url, texture => {
                    texture.name = label;
                    metas.angle_fil = angle_fil;
                    metas.texture = texture;

                    if (metas.texture instanceof THREE.Texture) resolve({ name: name, metas });
                },
                    xhr => {
                        console.log(url + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                    },
                    xhr => {
                        reject(new Error(xhr + 'An error occurred loading while loading: ' + metas.url));
                    }
                );

            }));
        }

        Promise.all(texturePromises).then(loadedTextures => {

            // on a chargé et créé les textures, on les colle comme propriété dans le groupe pour pouvoir les retrouver facilement plus tard.
            object.textures = loadedTextures;
            texturesLoaded(object, loadedTextures);
            resolveTexturesLoaded(object.textures)
        });
    })
    return promise;
}
// export 
const texturesLoaded = (obj, textures) => {

    // affecter des materiaux sur les differents sous objets

    obj.traverse(function (child) {

        if (child.geometry) {
            child.geometry.computeBoundingSphere();
        }

        console.log(".", child.name)

        if (child.name.indexOf("Body") > -1) {

            // les bodies sont les elements en bois mineurs (supports, renforts etc ...)
            var text = obj.textures[1].metas.texture.clone();
            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;
            text.repeat.set(0.005, 0.005);

            var material_args = {
                //color:0xff0000,
                emissive: 0x0D0D0D,
                roughness: 0.35,
                map: text,
                bumpMap: text,
                bumpScale: 5,
                fog: false
            };
            var material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.005, 0.005);

            child.material = material;

        } else if (child.name.indexOf("porte") > -1) {

            /*
            mettre une texture sur la porte
            */
            var text = obj.textures[3].metas.texture.clone();
            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;
            text.repeat.set(0.01, 0.005);
            text.offset.set(0.5, 0.5);

            var material_args = {
                //color:0x000fff,
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: text,
                bumpMap: text,
                bumpScale: 2,
                fog: false
            };

            var material = new THREE.MeshStandardMaterial(material_args);
            child.material = material;

            /*
            grouper la porte avec sa poignée et les mettre invisibles
            */
            /*var childStrIndexarr = child.name.split("-");
            var childStrIndex = childStrIndexarr[ childStrIndexarr.length-1 ];

            for(var propName in obj.children) {
                if(obj.children.hasOwnProperty(propName)) {
                    if( obj.children[propName].name === 'metal-poignee-' + childStrIndex ){
                        const group = new THREE.Group();
                        group.name = 'groupe-coulissante-' + childStrIndex;

                        var porte = child.clone();
                        var poignee = obj.children[propName].clone();

                        group.add( porte );
                        group.add( poignee );

                        obj.add( group );

                        child.visible = false;
                        obj.children[propName].visible = false;

                        obj.updateMatrix();
                        
                    }
                    
                }
                
            }*/




        } else if (child.name.indexOf("panneau") > -1) {

            // panneaux prefabs droite et gauche
            var text = obj.textures[1].metas.texture.clone();
            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;
            text.repeat.set(1, 1);
            text.offset.set(0.5, 0.5);

            var material_args = {
                //color:0x000fff,
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: text,
                bumpMap: text,
                bumpScale: 1,
                fog: false
            };

            var material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.01, 0.005);
            child.material = material;

        } else if (child.name.indexOf("top") > -1 || child.name.indexOf("bottom") > -1) {

            // planche de dessus / dessous
            var text = obj.textures[0].metas.texture.clone();
            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;
            text.repeat.set(0.015, 0.010);
            text.offset.set(0.5, 0.5);

            var material_args = {
                //color:0x0000ff,
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: text,
                bumpMap: text,
                bumpScale: 1,
                fog: false
            };

            var material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.015, 0.010);
            child.material = material;

        } else if (child.name.indexOf("facade") > -1) {

            // facades fil horizontal (par exemple facade tiroir de la coiffeuse)
            var text = obj.textures[0].metas.texture.clone();
            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;
            text.repeat.set(0.015, 0.010);
            text.offset.set(0.5, 0.5);

            var material_args = {
                //color:0x0000ff,
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: text,
                bumpMap: text,
                bumpScale: 2.5,
                fog: false
            };

            var material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.015, 0.010);
            child.material = material;

        } else if (child.name.indexOf("cuir") > -1) {

            // habillage interieur cuir
            var text = obj.textures[2].metas.texture.clone();

            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;

            text.repeat.set(0.03, 0.03);
            text.offset.set(0.5, 0.5);

            var material_args = {
                //color:0xff00ff,
                roughness: 0.48,
                emissive: 0x030303,
                bumpMap: text,  // loader.load('textures/cuir-bump.jpg'),
                bumpScale: 7.5,
                map: text,
                fog: false,

            };
            var material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.03, 0.03);
            child.material = material;

        } else if (child.name.indexOf("etagere") > -1) {

            // étagères
            var text = obj.textures[2].metas.texture.clone();
            text.needsUpdate = true;
            text.wrapS = text.wrapT = THREE.RepeatWrapping;

            text.repeat.set(0.03, 0.03);
            text.offset.set(0.5, 0.5);

            var material_args = {
                //color:0xf0ff0f,
                roughness: 0.35,
                emissive: 0x0D0D0D,
                map: text,
                bumpMap: text,
                bumpScale: 5,
                fog: false
            };
            var material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.03, 0.03);
            child.material = material;

        } else if (child.name.indexOf("metal") > -1 || child.name.indexOf("poignee") > -1) {
            // trucs en métal
            var material_args = {
                //color: 0xD6E3E2,
                specular: 0xffffff,
                emissive: 0x0D0D0D,
                fog: false
            };
            var material = new THREE.MeshPhongMaterial(material_args);
            child.material = material;

        } else if (child.name.indexOf("miroir") > -1) {

            // poser un vrai miroir devant le modele
            var mirrorBox = new THREE.BoxBufferGeometry(72, 81, 1);
            mirrorBox.computeBoundingSphere();
            mirrorBox.matrixWorldNeedsUpdate = true;

            child.geometry.computeBoundingSphere();
            child.geometry.matrixWorldNeedsUpdate = true;

            //console.log( child.geometry.boundingSphere );

            var mirror = new Reflector(mirrorBox, {
                color: new THREE.Color(0x7F7F7F),
                textureWidth: window.innerWidth,
                textureHeight: window.innerHeight,
            });
            mirror.position.set(40, 136.5, 2.5);
            mirror.matrixWorldNeedsUpdate = true;
            mirror.geometry.computeBoundingSphere();

            child.add(mirror);

        } else if (child.name.indexOf("led") > -1) {

            // lumière de la led
            const rectLight = new THREE.RectAreaLight(0xFFFDEB, 70, 700, 10);
            rectLight.name = "LedLight"
            rectLight.position.set(400, 1780, 415);
            rectLight.rotation.set(-Math.PI / 1.8, 0, 0);
            //obj.add( rectLight ) // <-- il faudrait plutot attacher la lumière au child


            //const rectLightHelper = new THREE.RectAreaLightHelper( rectLight );
            //obj.add( rectLightHelper );

            var material_args = {
                color: 0xFFF196,
                emissiveIntensity: 5,
                emissive: 0x7D7C6F,
                fog: false
            };
            var material = new THREE.MeshLambertMaterial(material_args);
            child.material = material;

        } else {

        }



        child.castShadow = true;
        child.receiveShadow = true;


    });



}