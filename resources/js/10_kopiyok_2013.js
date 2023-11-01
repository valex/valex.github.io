import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById( 'webgl_chart' );

const scene = new THREE.Scene();

console.log(container);
console.log(scene);