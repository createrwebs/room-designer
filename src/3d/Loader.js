import {
    loadManagerStart,
    // loadManagerLoad,
    loadManagerProgress,
    loadManagerQueueFinished,
    loadManagerError
}
    from '../api/actions'
import store from '../api/store';

import { LoadingManager, TextureLoader } from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { getFileNameFromUrl } from '../api/Utils';

const manager = new LoadingManager()
manager.onStart = (url, itemsLoaded, itemsTotal) => {
}
manager.onLoad = () => {
    // store.dispatch(loadManagerLoad())
};
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    store.dispatch(loadManagerProgress(getFileNameFromUrl(url), itemsLoaded, itemsTotal))
    if (itemsLoaded === itemsTotal) {
        store.dispatch(loadManagerQueueFinished())
    }
}
manager.onError = (url) => {
    // console.log('There was an error loading ' + url);
    store.dispatch(loadManagerError(getFileNameFromUrl(url)))
}

const textureLoader = new TextureLoader(manager)
export const loadTexture = (url, callback) => {
    store.dispatch(loadManagerStart(getFileNameFromUrl(url)))
    textureLoader.load(url, callback)
}

const fbxLoader = new FBXLoader()//(manager)
const Fbxs = []
export const loadFbx = (url, callback) => {
    const filename = getFileNameFromUrl(url)
    const alreadyLoaded = Fbxs.find(fbx => fbx.userData.filename === filename)
    if (alreadyLoaded) {
        return callback(alreadyLoaded)
    }
    store.dispatch(loadManagerStart(filename))
    fbxLoader.load(url,
        (object) => {
            if (undefined == Fbxs.find(fbx => fbx.userData.filename === filename))
                Fbxs.push(object)
            object.userData.filename = filename
            callback(object)
        },
        (xhr) => {
            // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            store.dispatch(loadManagerProgress(filename, xhr.loaded / xhr.total))
            // if (itemsLoaded === itemsTotal) {
            if (xhr.loaded / xhr.total) {
                store.dispatch(loadManagerQueueFinished())
            }
        },
        (error) => {
            // console.log(error)
            store.dispatch(loadManagerError(filename))
        })
}

