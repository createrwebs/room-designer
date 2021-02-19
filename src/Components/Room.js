import React, { Component } from 'react';
import { connect } from 'react-redux';
import { select } from '../api/actions'
import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import * as THREE from "three";
import { WEBGL } from 'three/examples/jsm/WEBGL.js';
// import { Scene } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Controls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';

let camera, scene, renderer, orbitControls, stats, dragControls;

scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
// scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
// THREE.Object3D.DefaultUp.set(0, 0, 1);

// +Z is up in Blender, whereas + Y is up in three.js
camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 1, 40000);
camera.position.x = 0;
camera.position.y = 1650;
camera.position.z = 3000;
// camera.position.multiplyScalar(30);

stats = new Stats();
// stats.begin();
document.body.appendChild(stats.dom)

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.physicallyCorrectLights = true;
// renderer.shadowMap.enabled = true;
// renderer.localClippingEnable = false;

// renderer.setClearColor(0xFFFFFF);
/* renderer.domElement.addEventListener("click", onclick, true);
var selectedObject;
var raycaster = new THREE.Raycaster();
function onclick(event) {
	console.log("onclick")
	var mouse = new THREE.Vector2();
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(scene.children, false); //array
	if (intersects.length > 0) {
		selectedObject = intersects[0];
		console.log(selectedObject);
	}
} */

// const interaction = new Interaction(renderer, scene, camera);

/*
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);
*/

/* lights */

const ceilHeight = 2600//ceiling @2.6m

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(0, 200, 100);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;
dirLight.shadow.camera.left = - 120;
dirLight.shadow.camera.right = 120;
// scene.add(dirLight);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(600, ceilHeight, 700);
spotLight.target.position.set(spotLight.position.x, 0, spotLight.position.y);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
spotLight.distance = 6000;
spotLight.angle = Math.PI / 2;
spotLight.penumbra = .4;
scene.add(spotLight.target);
scene.add(spotLight);

const spotLight2 = new THREE.SpotLight(0xffffff).copy(spotLight);
spotLight2.position.set(1800, ceilHeight, 700);
spotLight2.target.position.set(spotLight2.position.x, 0, spotLight2.position.y);
scene.add(spotLight2.target);
scene.add(spotLight2);
/* const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper); */

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, .6);
scene.add(light);

/* 0,0,0 dot */

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

/* floor grid */

const grid = new THREE.GridHelper(10000, 100, 0x000000, 0x445544);
grid.material.opacity = 0.3;
// grid.material.transparent = true;
scene.add(grid);

/* mesh loader */

const FBXloader = new FBXLoader();

/* controls */

orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.addEventListener('change', webgl_render); // use if there is no animation loop
orbitControls.minDistance = 200;
orbitControls.maxDistance = 10000;//10m
orbitControls.target.set(200, 1400, 0);

function webgl_render() {
	stats.update();
	renderer.render(scene, camera);

	// console.log(`zoom ${camera.zoom} fov ${camera.fov} near ${camera.near} far ${camera.far} focus ${camera.focus}`);

	console.log(`position ${camera.position.x} ${camera.position.y} ${camera.position.z}`);


}

class App extends Component {
	constructor (props) {
		super(props);
		this.myRef = React.createRef();

		this.state = {
		};
	}
	startdrag(event) {
		console.log("dragstart", event)
		orbitControls.enabled = false;
		// event.object.material.emissive.set(0xaaaaaa);
		this.props.select(event.object)
	}
	enddrag(event) {
		console.log("dragend", event)
		orbitControls.enabled = true;
		// event.object.material.emissive.set(0x000000);
		this.props.select(null)
	}
	setDraggable(what) {
		var dd = [];
		dd.push(what);

		const dragControls = new DragControls(dd, camera, renderer.domElement);
		dragControls.transformGroup = true;

		dragControls.addEventListener('drag', function (event) {
			console.log("drag", event.object)
			event.object.position.y = 0;
			event.object.position.z = 0;
			webgl_render();
		});
		dragControls.addEventListener('dragstart', this.startdrag.bind(this))
		dragControls.addEventListener('dragend', this.enddrag.bind(this))
	}
	componentDidMount() {
		const node = this.myRef.current;


		node.appendChild(renderer.domElement);
		node.appendChild(stats.dom)


		var setDrag = this.setDraggable.bind(this);
		console.log('scene', scene)
		FBXloader.load('models/NYCOIFH238.fbx-2 Separations.fbx', function (object) {
			object.rotateX(-Math.PI / 2);
			// webgl_render();
			setDrag(object);
			scene.add(object);
		});
		/* 		FBXloader.load('models/NYCOIFH238.fbx', function (object) {
					object.rotateX(-Math.PI / 2);
					setDraggable(object);
					scene.add(object);
				}); */
		FBXloader.load('models/H219-L48-GLACE-Dr v2.fbx', function (object) {
			console.log('...', object)
			// object.scale.set(.1, .1, .1);
			object.traverse(function (child) {
				console.log('object.traverse', child)
			});
			object.rotateX(-Math.PI / 2);
			setDrag(object);
			scene.add(object);
		});


		FBXloader.load('models/NYH219P40L048.fbx', function (object) {

			NotificationManager.info('', 'loaded');
			console.log('NYH219P40L048', object)
			// object.scale.set(.1, .1, .1);
			object.traverse(function (child) {
				console.log('object.traverse', child)

				if (child.name.search("GLACE") > -1) {
					console.log('object........', child.name)
					// child.visible = false;
				}

				if (child.name.search("COTE") > -1 && child.name.search("-Dr") > -1) {
					console.log('object........', child.name)
					// child.visible = false;
				}

				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
				object.rotateX(Math.PI / 2);
			});
			setDrag(object);
			scene.add(object);

			/* 			object.cursor = 'pointer';
						object.on('click', function (ev) {
							console.log('object....click....', ev)
			
						});
						object.on('touchstart', function (ev) { });
						object.on('touchcancel', function (ev) { });
						object.on('touchmove', function (ev) { });
						object.on('touchend', function (ev) { });
						object.on('mousedown', function (ev) { });
						object.on('mouseout', function (ev) { });
						object.on('mouseover', function (ev) { });
						object.on('mousemove', function (ev) { });
						object.on('mouseup', function (ev) { }); */

		});
		// orbitControls.update();
	}
	render() {
		camera.fov = this.props.fov;
		camera.zoom = this.props.zoom;
		camera.focus = this.props.focus;
		camera.updateProjectionMatrix();
		if (this.props.light) {
			scene.add(spotLight);
			scene.add(spotLight2);
		}
		else {
			scene.remove(spotLight);
			scene.remove(spotLight2);
		}
		webgl_render();


		return (
			<div className="container"
				ref={this.myRef}
				style={{
					// backgroundColor: 'white',
					// position: 'absolute',
					top: '0',
					left: '0',
					// padding: '6px',
					display: 'block',
					// zIndex: 99999,
					width: "100%",
					height: "100%"
				}}>
			</div>
		)
	}
}
const mapStateToProps = (state) => {
	console.log("Room mapStateToProps", state)

	return {
		fov: state.camera.fov,
		zoom: state.camera.zoom,
		focus: state.camera.focus,
		light: state.light,
	}
}
const mapDispatchToProps = {
	select
};
export default connect(mapStateToProps, mapDispatchToProps)(App)