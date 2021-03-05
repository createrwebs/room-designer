import {
    allLoaded
}
    from '../api/actions'
import store from '../api/store';

import { NotificationManager } from 'react-notifications';
import { LoadingManager } from "three";

export default {
    manager: new LoadingManager(),
    setup(config) {
        this.manager.onStart = this.loadManagerStart.bind(this);
        this.manager.onLoad = this.loadManagerLoad.bind(this);
        this.manager.onProgress = this.loadManagerProgress.bind(this);
        this.manager.onError = this.loadManagerError.bind(this);
    },
    loadManagerStart(url, itemsLoaded, itemsTotal) {
         console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    },
    loadManagerLoad() {
        store.dispatch(allLoaded())
    },
    loadManagerProgress(url, itemsLoaded, itemsTotal) {
         console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
         if( itemsLoaded == itemsTotal ){
            console.log('y nous zont tout loadé', document);
            document.getElementById('loading_splash').style.display = "none";
         }
    },
    loadManagerError(url) {
        // console.log('There was an error loading ' + url);
        NotificationManager.warning(`${url}`, "Erreur chargement", 400);
    }
}