import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class PAGE_APP {
    constructor() {
        this.options = {
            containerID: 'webgl_chart',
            aspectRatio: 4/3,
            sphereRadius: 0.5,
            cameraTarget: new THREE.Vector3( 0, 0, 0 ),
        };

        this.calculations = {
            chartWidth: null,
            chartHeight: null,
        };

        this.container = null;

        this.init();
    }

    init() {
        
        this.container = document.getElementById(this.options.containerID);

        this.calculations.chartWidth = Math.floor( this.container.clientWidth - 1 );
        this.calculations.chartHeight = Math.floor( this.calculations.chartWidth / this.options.aspectRatio );

        this.initScene();
    }

    initScene() {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(60, this.calculations.chartWidth / this.calculations.chartHeight, 0.1, 1000);
        //const camera = new THREE.OrthographicCamera(this.calculations.chartWidth / -this.cameraPlaneDivider, this.calculations.chartWidth / this.cameraPlaneDivider, this.calculations.chartHeight / this.cameraPlaneDivider, this.calculations.chartHeight / -this.cameraPlaneDivider, -200, 500);
        camera.position.x = -7;
        camera.position.y = -2;
        camera.position.z = -16;
        camera.lookAt( this.options.cameraTarget );


        const light4 = new THREE.DirectionalLight(0xffffff, 1);
        light4.position.set(-150, 0, 150);
        camera.add(light4);
        
        const light5 = new THREE.DirectionalLight(0xffffff, 1);
        light5.position.set(150, 0, 150);
        camera.add(light5);
        
        const light6 = new THREE.DirectionalLight(0xffffff, 1);
        light6.position.set(0, 150, 150);
        camera.add(light6);
        
        const light7 = new THREE.DirectionalLight(0xffffff, 1);
        light7.position.set(0, -150, 150);
        camera.add(light7);
        
        scene.add(camera);

        // create a render and set the size
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setClearColor(new THREE.Color(0x0A0A0A));
        renderer.setSize(this.calculations.chartWidth, this.calculations.chartHeight);
        renderer.shadowMap.enabled = false;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        // add the output of the renderer to the html element
        this.container.appendChild(renderer.domElement);

        // IMPORTANT: make sure that your container.append(renderer.domElement); is executed BEFORE initializing OrbitControls( camera, renderer.domElement );
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        //orbitControls.enablePan = false;
        orbitControls.target = this.options.cameraTarget;
        orbitControls.update();

        const render = () => {
            requestAnimationFrame(render);
            orbitControls.update(); 
            renderer.render(scene, camera);
        };

        const loader = new GLTFLoader();

        loader.load('./models/10_kopiyok_2013_ukraine.glb', (gltf) => {
            const model = gltf.scene;

            scene.add(model);
            render();
        });
    }
}

const APP = new PAGE_APP();