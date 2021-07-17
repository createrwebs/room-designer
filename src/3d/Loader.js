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

const fbxLoader = new FBXLoader(manager)
const textureLoader = new TextureLoader(manager)

export const loadFbx = (url, callback) => {
    store.dispatch(loadManagerStart(getFileNameFromUrl(url)))
    fbxLoader.load(url, callback)
}
export const loadTexture = (url, callback) => {
    store.dispatch(loadManagerStart(getFileNameFromUrl(url)))
    textureLoader.load(url, callback)
}
