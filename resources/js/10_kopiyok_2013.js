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
        this.renderer = null;
        this.camera = null;
        this.fullscreenButton = null;

        this.initialRotationCompleted = false;

        this.init();
    }

    init() {

        this.container = document.getElementById(this.options.containerID);

		// Add event listener for window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Add event listener for the fullscreen button
        this.fullscreenButton = document.getElementById('fullscreen-button');
        this.fullscreenButton.addEventListener('click', (event) => this.toggleFullscreen(event));
		this.setFullscreenBtnTo('fullscreen');
		
		// Add event listener for the fullscreen change event
        document.addEventListener('fullscreenchange', (event) => this.handleFullscreenChange(event));
        document.addEventListener('mozfullscreenchange', (event) => this.handleFullscreenChange(event));
        document.addEventListener('webkitfullscreenchange', (event) => this.handleFullscreenChange(event));
        document.addEventListener('msfullscreenchange', (event) => this.handleFullscreenChange(event));


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
	
	handleFullscreenChange(event){
		if ( this.isFullscreen() ) {
			this.setFullscreenBtnTo('normal');
		} else {
			this.setFullscreenBtnTo('fullscreen');
		}
	}
		
    toggleFullscreen(event){
       
        if ( ! this.isFullscreen() ) {
            if (this.container.requestFullscreen) {
                this.container.requestFullscreen();
            } else if (this.container.mozRequestFullScreen) {
                this.container.mozRequestFullScreen();
            } else if (this.container.webkitRequestFullscreen) {
                this.container.webkitRequestFullscreen();
            } else if (this.container.msRequestFullscreen) {
                this.container.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    isFullscreen() {
        return !!document.fullscreenElement ||
               !!document.mozFullScreenElement ||
               !!document.webkitFullscreenElement ||
               !!document.msFullscreenElement;
    }
    
    setFullscreenBtnTo(mode){
		switch(mode){
			case 'fullscreen':
				this.fullscreenButton.innerHTML = `<svg fill="#dddddd" height="40px" width="40px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
					<g stroke-width="0"></g>
					<g stroke-linecap="round" stroke-linejoin="round"></g>
					<g>
						<g>
							<path d="M192,64H32C14.328,64,0,78.328,0,96v96c0,17.672,14.328,32,32,32s32-14.328,32-32v-64h128c17.672,0,32-14.328,32-32 S209.672,64,192,64z"></path>
							<path d="M480,64H320c-17.672,0-32,14.328-32,32s14.328,32,32,32h128v64c0,17.672,14.328,32,32,32s32-14.328,32-32V96 C512,78.328,497.672,64,480,64z"></path>
							<path d="M480,288c-17.672,0-32,14.328-32,32v64H320c-17.672,0-32,14.328-32,32s14.328,32,32,32h160c17.672,0,32-14.328,32-32v-96 C512,302.328,497.672,288,480,288z"></path>
							<path d="M192,384H64v-64c0-17.672-14.328-32-32-32S0,302.328,0,320v96c0,17.672,14.328,32,32,32h160c17.672,0,32-14.328,32-32 S209.672,384,192,384z"></path>
						</g>
					</g>
				</svg>`;
			break;
			
			case 'normal':
				this.fullscreenButton.innerHTML = `<svg fill="#dddddd" height="40px" width="40px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
					<g stroke-width="0"></g>
					<g stroke-linecap="round" stroke-linejoin="round"></g>
					<g > 
						<g> 
							<path d="M192,64c-17.672,0-32,14.328-32,32v64H32c-17.672,0-32,14.328-32,32s14.328,32,32,32h160c17.672,0,32-14.328,32-32V96 C224,78.328,209.672,64,192,64z"></path> <path d="M320,224h160c17.672,0,32-14.328,32-32s-14.328-32-32-32H352V96c0-17.672-14.328-32-32-32s-32,14.328-32,32v96 C288,209.672,302.328,224,320,224z"></path> <path d="M480,288H320c-17.672,0-32,14.328-32,32v96c0,17.672,14.328,32,32,32s32-14.328,32-32v-64h128c17.672,0,32-14.328,32-32 S497.672,288,480,288z"></path> <path d="M192,288H32c-17.672,0-32,14.328-32,32s14.328,32,32,32h128v64c0,17.672,14.328,32,32,32s32-14.328,32-32v-96 C224,302.328,209.672,288,192,288z"></path> 
						</g> 
					</g>
					</svg>`;
			break;
		}
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
        //const camera = new THREE.OrthographicCamera(this.calculations.chartWidth / -this.cameraPlaneDivider, this.calculations.chartWidth / this.cameraPlaneDivider, this.calculations.chartHeight / this.cameraPlaneDivider, this.calculations.chartHeight / -this.cameraPlaneDivider, -200, 500);
        this.camera.position.x = -9;
        this.camera.position.y = -2;
        this.camera.position.z = -16;
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

        // IMPORTANT: make sure that your container.append(renderer.domElement); is executed BEFORE initializing OrbitControls( camera, renderer.domElement );
        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        //orbitControls.enablePan = false;
        orbitControls.target = this.options.cameraTarget;

        orbitControls.autoRotate = true;
        orbitControls.autoRotateSpeed = 2;

        orbitControls.update();

        const render = () => {
            requestAnimationFrame(render);

            if( orbitControls.autoRotate == true && this.initialRotationCompleted == true ){
                orbitControls.autoRotate = false;
            }

            orbitControls.update(); 
            this.renderer.render(scene, this.camera);
        };

        const loader = new GLTFLoader();
        const loadingContainer = document.getElementById('loading-container');
        const loadingProgress = document.getElementById('loading-progress');

        loader.load('./models/10_kopiyok_2013_ukraine.glb', (gltf) => {
            const model = gltf.scene;

            scene.add(model);
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
}

const APP = new PAGE_APP();
