import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
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
        this.renderer = null;
        this.camera = null;
        
        this.model = null;
        this.initialRotationCompleted = false;

        this.init();
    }
    


    init() {
        
        this.container = document.getElementById(this.options.containerID);

		// Add event listener for window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Add event listeners for mouse click and touchstart
        this.container.addEventListener('mousedown', (event) => this.handleInteraction(event));
        this.container.addEventListener('touchstart', (event) => this.handleInteraction(event));
        
        this.calculations.chartWidth = Math.floor( this.container.clientWidth - 1 );
        this.calculations.chartHeight = Math.floor( this.calculations.chartWidth / this.options.aspectRatio );

        this.initScene();
    }
    
	handleResize(){
		// Update the calculations based on the new size
        this.calculations.chartWidth = Math.floor(this.container.clientWidth - 1);
        
        if(this.isFullscreen()){
			this.calculations.chartHeight = Math.floor(this.container.clientHeight);
		} else{
	        this.calculations.chartHeight = Math.floor(this.calculations.chartWidth / this.options.aspectRatio);
		}
			

        // Update the camera's aspect ratio
        this.camera.aspect = this.calculations.chartWidth / this.calculations.chartHeight;
        this.camera.updateProjectionMatrix();

        // Update the renderer's size
        this.renderer.setSize(this.calculations.chartWidth, this.calculations.chartHeight);
	}
    
	handleInteraction(event){
		
		if('canvas' != event.target.nodeName.toLowerCase()) {
			return;
		}
		
        this.initialRotationCompleted = true;

        // Remove the event listeners to prevent further checks
        this.container.removeEventListener('mousedown', this.handleInteraction);
        this.container.removeEventListener('touchstart', this.handleInteraction);

    }

    initScene() {
        const scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, this.calculations.chartWidth / this.calculations.chartHeight, 0.1, 1000);
        //this.camera = new THREE.OrthographicCamera(this.calculations.chartWidth / -this.cameraPlaneDivider, this.calculations.chartWidth / this.cameraPlaneDivider, this.calculations.chartHeight / this.cameraPlaneDivider, this.calculations.chartHeight / -this.cameraPlaneDivider, -200, 500);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 68;
        this.camera.lookAt( this.options.cameraTarget );


        const light4 = new THREE.DirectionalLight(0xffffff, 1);
        light4.position.set(-150, 0, 150);
        this.camera.add(light4);
        
        const light5 = new THREE.DirectionalLight(0xffffff, 1);
        light5.position.set(150, 0, 150);
        this.camera.add(light5);
        
        const light6 = new THREE.DirectionalLight(0xffffff, 1);
        light6.position.set(0, 150, 150);
        this.camera.add(light6);
        
        const light7 = new THREE.DirectionalLight(0xffffff, 1);
        light7.position.set(0, -150, 150);
        this.camera.add(light7);
        
        scene.add(this.camera);

        // create a render and set the size
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setClearColor(new THREE.Color(0x0A0A0A));
        this.renderer.setSize(this.calculations.chartWidth, this.calculations.chartHeight);
        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        // add the output of the renderer to the html element
        this.container.appendChild(this.renderer.domElement);

        // IMPORTANT: make sure that your container.append(this.renderer.domElement); is executed BEFORE initializing Controls
        const controls = new TrackballControls( this.camera, this.renderer.domElement );
        controls.rotateSpeed = 3.6;
        controls.zoomSpeed = 0.8;
        controls.panSpeed = 1.1;
        controls.staticMoving= true;
        controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

		const clock = new THREE.Clock();

        const render = () => {
            requestAnimationFrame(render);
            
            if( this.initialRotationCompleted == false ){
				// Get the elapsed time since the last frame
				const delta = clock.getDelta();

				// Rotate the loaded model around the X-axis with a specified speed
				const rotationSpeed = 0.15; // Adjust the rotation speed as needed
				if ( this.model ) {
					this.model.rotation.x -= rotationSpeed * delta;
				}
			}

            
            controls.update(); 
            this.renderer.render(scene, this.camera);
        };

        const loader = new GLTFLoader();
        const loadingContainer = document.getElementById('loading-container');
        const loadingProgress = document.getElementById('loading-progress');

        loader.load('./models/5_francs_1940_france.glb', (gltf) => {
            this.model = gltf.scene;

            scene.add(this.model);
            render();

            // По завершении загрузки, скрываем индикатор загрузки
            loadingContainer.style.display = 'none';
        }, (xhr) => {
            // Слушатель события прогресса загрузки
            let percentComplete = (xhr.loaded / xhr.total) * 100;
            if(percentComplete > 100){
                percentComplete = 100;
            }
            loadingProgress.innerHTML = `Loading: ${Math.round(percentComplete)}%`;
        });
    }
    
	isFullscreen() {
        return !!document.fullscreenElement ||
               !!document.mozFullScreenElement ||
               !!document.webkitFullscreenElement ||
               !!document.msFullscreenElement;
    }
}

const APP = new PAGE_APP();
