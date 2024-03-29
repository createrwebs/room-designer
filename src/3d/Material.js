import {
    Texture,
    RepeatWrapping,
    ClampToEdgeWrapping,
    Box3,
    BoxBufferGeometry,
    Color,
    MeshStandardMaterial,
    MeshPhongMaterial,
    MeshLambertMaterial
} from "three";
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';// miroir
import { loadTexture } from './Loader'
import { getFileNameFromUrl } from '../api/Utils';

/*
    textures loading manager keeps already loaded textures in Textures[]
*/
const Textures = []
window.tx = Textures

let mId = 0
export const getId = () => {
    return parseInt(mId)
}
export const setId = (id) => {
    mId = parseInt(id)
}

export const getLaqueById = (id) => {
    return window.laques.find(m => m.id === parseInt(id))
}
export const getMaterialById = (id) => {
    return window.materials.find(m => m.id === parseInt(id))
}
export const setTransparent = (meuble, opacity, parts) => {
    meuble.object.children//c.type === "Mesh"
        .filter(c => c.material && (parts ? parts.some(element => c.name.includes(element)) : true))
        .forEach(c => {
            if (c.name === "mirror") {// Reflector not handling opacity
                c.visible = opacity == 1
            }
            else {
                c.material.transparent = true;
                c.material.opacity = opacity;
            }
        });
}
export const setVisible = (meuble, visible, parts) => {
    meuble.object.children//c.type === "Mesh"
        .filter(c => (parts ? parts.some(element => c.name.includes(element)) : true))
        .forEach(c => {
            c.visible = visible;
        });
}
/* for laque */

export const loadOne = (material) => {

    return new Promise((resolve, reject) => {

        // try to find already loaded texture
        const name = `laque-${material.name}-${getFileNameFromUrl(material.url)}`
        const textureLoaded = Textures.find(tx => tx.name === name)

        if (textureLoaded) {
            resolve({
                part: material.label,
                texture: textureLoaded,
                material_args: material.material_args
            });
        }
        else {
            loadTexture(material.url, texture => {
                if (texture instanceof Texture) {

                    texture.needsUpdate = true;
                    texture.wrapS = texture.wrapT = RepeatWrapping;
                    // texture.wrapS = texture.wrapT = ClampToEdgeWrapping

                    if (material.texture_args && material.texture_args.repeatX && material.texture_args.repeatY)
                        texture.repeat.set(material.texture_args.repeatX, material.texture_args.repeatY)
                    if (material.texture_args && material.texture_args.offsetX && material.texture_args.offsetY)
                        texture.offset.set(material.texture_args.offsetX, material.texture_args.offsetY)

                    texture.name = name

                    if (undefined == Textures.find(tx => tx.name == name))
                        Textures.push(texture)

                    resolve({
                        part: material.label,
                        texture: texture,
                        material_args: material.material_args
                    });
                }
            },
                xhr => {
                    console.log(url + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                xhr => {
                    reject(new Error(xhr + 'An error occurred loading while loading: ' + material.url));
                }
            )
        }
    });

}
export const load = (material) => {
    let texturePromises = [];
    return new Promise((resolveTexturesLoaded, rejectTexturesLoaded) => {
        Object.entries(material.textures).forEach(
            ([part, texture]) => {
                texturePromises.push(new Promise((resolve, reject) => {

                    // try to find already loaded texture
                    const name = `${material.name}-${getFileNameFromUrl(texture.url)}`
                    const textureLoaded = Textures.find(tx => tx.name === name)

                    if (textureLoaded) {
                        resolve({
                            part: part,
                            texture: textureLoaded,
                            material_args: texture.material_args
                        });
                    }
                    else {
                        loadTexture(texture.url, newTexture => {
                            if (newTexture instanceof Texture) {
                                newTexture.needsUpdate = true;
                                newTexture.wrapS = newTexture.wrapT = RepeatWrapping;
                                // newTexture.wrapS = newTexture.wrapT = ClampToEdgeWrapping

                                if (texture.texture_args && texture.texture_args.repeatX && texture.texture_args.repeatY)
                                    newTexture.repeat.set(texture.texture_args.repeatX, texture.texture_args.repeatY)
                                if (texture.texture_args && texture.texture_args.offsetX && texture.texture_args.offsetY)
                                    newTexture.offset.set(texture.texture_args.offsetX, texture.texture_args.offsetY)

                                newTexture.name = name

                                if (undefined == Textures.find(tx => tx.name === name))
                                    Textures.push(newTexture)

                                resolve({
                                    part: part,
                                    texture: newTexture,
                                    material_args: texture.material_args
                                });
                            }
                        },
                            xhr => {
                                console.log(url + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                            },
                            xhr => {
                                reject(new Error(xhr + 'An error occurred loading while loading: ' + texture.url));
                            }
                        );
                    }
                }));
            });
        Promise.all(texturePromises).then(loadedTextures => {
            resolveTexturesLoaded(loadedTextures)
        });
    })
}
export const apply = (materials, meuble) => {
    let material_args, material, mtl
    // console.log('Material : apply', materials, 'on', meuble)

    /*
    dynamic texture apply
    */

    meuble.object.children.forEach(child => {
        const materialMatch = child.name.match(/-mtl-(.*)/)

        // child object name that contains -mtl- should be textured with materialMatch[1]
        if (materialMatch && materialMatch.length > 0) {
            mtl = materials.find(m => m.part.includes(materialMatch[1]))
            if (mtl && mtl.texture && mtl.material_args) {

                material_args = Object.assign({}, mtl.material_args, {
                    map: mtl.texture,
                    bumpMap: mtl.texture,
                });

                if (mtl.part === "metal") {
                    material = new MeshPhongMaterial(material_args);
                }
                else {
                    material = new MeshStandardMaterial(material_args);
                }
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
            else {
                if (materialMatch) {
                    // console.warn(`No texture found "${materialMatch[1]}" for subobject "${child.name}"`)
                    // of ${meuble.props.sku} : meuble undefined if generating pix
                }
                else {
                }
            }
        }
    })

    // special cases outside because add/remove child dirties loop

    /* mirror */

    const mirrorMeshes = meuble.object
        .children.filter(child => child.name.indexOf("miroir") > -1)// array of several mirrors?
        .forEach(child => {
            if (!child.geometry.boundingBox) return// box is null when generating pix
            const box = new Box3().copy(child.geometry.boundingBox);
            box.applyMatrix4(child.matrix); // apply child scale & transforms to box
            const m_width = box.max.x - box.min.x
            const m_height = box.max.y - box.min.y
            const m_depth = box.max.z - box.min.z

            const mirrorBox = new BoxBufferGeometry(m_width, m_height, m_depth);
            const mirror = new Reflector(mirrorBox, {
                color: new Color(0x7F7F7F),
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
            });
            mirror.name = "mirror"
            mirror.position.set(box.min.x + m_width / 2, box.min.y + m_height / 2, box.min.z + m_depth / 2);
            child.parent.add(mirror);
            child.parent.remove(child);
        })

    /* light */

    const lightMesh = meuble.object.children.find(child => child.name.indexOf("led") > -1)// array of several lights?
    if (lightMesh) {

        // lumière de la led
        // const rectLight = new THREE.RectAreaLight(0xFFFDEB, 70, 700, 10);
        // rectLight.name = "LedLight"
        // rectLight.position.set(400, 1780, 415);
        // rectLight.rotation.set(-Math.PI / 1.8, 0, 0);
        //obj.add( rectLight ) // <-- il faudrait plutot attacher la lumière au child
        //const rectLightHelper = new THREE.RectAreaLightHelper( rectLight );
        //obj.add( rectLightHelper );

        material_args = {
            color: 0xFFF196,
            emissiveIntensity: 5,
            emissive: 0x7D7C6F,
            fog: false
        };
        material = new MeshLambertMaterial(material_args);
        lightMesh.material = material;
        if (meuble.props) console.warn(`Led light found in meuble ${meuble.props.sku}`, lightMesh.name)
    }
}

/* laquage d'un mesh subobject */

export const applyOnMesh = (mtl, child) => {
    // console.log('Material : applyOnMesh', mtl, 'on', child)
    let material_args, material

    // const materialMatch = child.name.match(/-mtl-(.*)/)
    // if (materialMatch && materialMatch.length > 0) {// child object name contains -mtl-
    // mtl = materials.find(m => m.part.includes(materialMatch[1]))

    if (mtl && mtl.texture) {

        material_args = Object.assign({}, mtl.material_args ? mtl.material_args : {}, {
            map: mtl.texture,
            bumpMap: mtl.texture,
        });

        if (mtl.part === "metal") {
            material = new MeshPhongMaterial(material_args);
        }
        else {
            material = new MeshStandardMaterial(material_args);
        }
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
    }
    else {
        console.warn('no material for child mesh', child)
    }
}