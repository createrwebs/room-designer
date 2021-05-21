import * as THREE from "three";//TODO
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';// miroir
import { loadTexture } from './Loader'

export const setTransparent = (meuble, opacity, parts) => {
    meuble.object.children//c.type === "Mesh"
        .filter(c => c.material && (parts ? parts.some(element => c.name.includes(element)) : true))
        .forEach(c => {
            c.material.transparent = true;
            c.material.opacity = opacity;
        });
}
export const load = (materials) => {
    // console.log('load material', materials);
    let texturePromises = [];
    return new Promise((resolveTexturesLoaded, rejectTexturesLoaded) => {
        Object.entries(materials).forEach(
            ([part, material]) => {
                texturePromises.push(new Promise((resolve, reject) => {
                    loadTexture(material.url, texture => {
                        if (texture instanceof THREE.Texture) resolve({
                            label: material.label,
                            part: part,
                            texture: texture
                        });
                    },
                        xhr => {
                            console.log(url + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                        },
                        xhr => {
                            reject(new Error(xhr + 'An error occurred loading while loading: ' + material.url));
                        }
                    );

                }));
            });
        Promise.all(texturePromises).then(loadedTextures => {
            resolveTexturesLoaded(loadedTextures)
        });
    })
}
export const apply = (materials, meuble) => {
    // console.log('apply', materials, 'on', meuble)
    let texture, material_args, material, mtl
    meuble.object.traverse(function (child) {

        if (child.geometry) {//?
            child.geometry.computeBoundingSphere();
        }

        /*
        dynamic texture apply
        */
        const materialMatch = child.name.match(/-mtl-(.*)/)
        if (materialMatch && materialMatch.length > 0) {
            mtl = materials.find(m => m.part.includes(materialMatch[1]))
            if (mtl && mtl.texture) {
                material = new THREE.MeshStandardMaterial(mtl.texture);
                // material.bumpMap.repeat.set(0.005, 0.005);
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
            else {
                console.warn(`No texture found "${materialMatch[1]}" for subobject "${child.name}" of ${meuble.props.sku}`)
            }
            return
        }


        // TODO reste à virer :

        if (child.name.indexOf("Body") > -1) {

            texture = materials.find(m => m.part.includes('hori')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.005, 0.005);

            material_args = {
                emissive: 0x0D0D0D,
                roughness: 0.35,
                map: texture,
                bumpMap: texture,
                bumpScale: 5,
                fog: false
            };
            material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.005, 0.005);

            child.material = material;

        }
        else if (child.name.indexOf("porte") > -1) {
            texture = materials.find(m => m.part.includes('porte')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.01, 0.005);
            texture.offset.set(0.5, 0.5);

            material_args = {
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: texture,
                bumpMap: texture,
                bumpScale: 2,
                fog: false
            };

            material = new THREE.MeshStandardMaterial(material_args);
            child.material = material;

        } else if (child.name.indexOf("panneau") > -1) {
            texture = materials.find(m => m.part.includes('vert')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            texture.offset.set(0.5, 0.5);

            material_args = {
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: texture,
                bumpMap: texture,
                bumpScale: 1,
                fog: false
            };

            material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.01, 0.005);
            child.material = material;

        } else if (child.name.indexOf("top") > -1 || child.name.indexOf("bottom") > -1) {
            texture = materials.find(m => m.part.includes('hori')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.015, 0.010);
            texture.offset.set(0.5, 0.5);

            material_args = {
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: texture,
                bumpMap: texture,
                bumpScale: 1,
                fog: false
            };

            material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.015, 0.010);
            child.material = material;

        } else if (child.name.indexOf("facade") > -1) {
            texture = materials.find(m => m.part.includes('hori')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.015, 0.010);
            texture.offset.set(0.5, 0.5);

            material_args = {
                roughness: 0.45,
                emissive: 0x0D0D0D,
                map: texture,
                bumpMap: texture,
                bumpScale: 2.5,
                fog: false
            };

            material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.015, 0.010);
            child.material = material;

        } else if (child.name.indexOf("cuir") > -1) {
            texture = materials.find(m => m.part.includes('fond')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.03, 0.03);
            texture.offset.set(0.5, 0.5);

            material_args = {
                roughness: 0.48,
                emissive: 0x030303,
                bumpMap: texture,
                bumpScale: 7.5,
                map: texture,
                fog: false,

            };
            material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.03, 0.03);
            child.material = material;

        } else if (child.name.indexOf("etagere") > -1) {
            texture = materials.find(m => m.part.includes('fond')).texture
            texture.needsUpdate = true;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.03, 0.03);
            texture.offset.set(0.5, 0.5);
            material_args = {
                roughness: 0.35,
                emissive: 0x0D0D0D,
                map: texture,
                bumpMap: texture,
                bumpScale: 5,
                fog: false
            };
            material = new THREE.MeshStandardMaterial(material_args);
            material.bumpMap.repeat.set(0.03, 0.03);
            child.material = material;

        } else if (child.name.indexOf("metal") > -1 || child.name.indexOf("poignee") > -1) {
            material_args = {
                specular: 0xffffff,
                emissive: 0x0D0D0D,
                fog: false
            };
            material = new THREE.MeshPhongMaterial(material_args);
            child.material = material;

        } else if (child.name.indexOf("miroir") > -1) {

            // poser un vrai miroir devant le modele
            var mirrorBox = new THREE.BoxBufferGeometry(72, 81, 1);
            mirrorBox.computeBoundingSphere();
            mirrorBox.matrixWorldNeedsUpdate = true;

            child.geometry.computeBoundingSphere();
            child.geometry.matrixWorldNeedsUpdate = true;

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

            material_args = {
                color: 0xFFF196,
                emissiveIntensity: 5,
                emissive: 0x7D7C6F,
                fog: false
            };
            material = new THREE.MeshLambertMaterial(material_args);
            child.material = material;

        } else {

        }
        child.castShadow = true;
        child.receiveShadow = true;
    });
}