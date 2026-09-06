class PAGE_APP {
    // Constructor
    constructor() {
        this.options = {
            elID: 'webgl_chart',
            aspectRatio: 4/3,
            sphereRadius: 0.5,
            cameraTarget: new THREE.Vector3( 0, 3, 0 ),
            cameraPositionNormVector: new THREE.Vector3( 0.457495710997814, 0.457495710997814, 0.7624928516630234 ),
            chartWidthProductdistanceToCam: 22300,
            cameraPlaneDividerRatio: 13.22,
        };

        this.calculations = {
            chartWidth: null,
            chartHeight: null,
            distanceToCam: null,
            cameraPlaneDivider: null,
        };

        this.vectors = [
            {
                entity: new THREE.Vector3( 5, 2, 0 ),
                arrow_object: null,
                id:'vector_0',
                color: '#f4d03f',
                has_control: true,
                id_control: 'vector_0_control',
                control_object: null,
            },
            {
                entity: new THREE.Vector3( 2, 5, 0 ),
                arrow_object: null,
                id:'vector_1',
                color: '#d35400',
                has_control: true,
                id_control: 'vector_1_control',
                control_object: null,
            },
            {
                entity: new THREE.Vector3( 0, 2, 5 ),
                arrow_object: null,
                id:'vector_2',
                color: '#FFFFFF',
                has_control: false,
                id_control: null,
                control_object: null,
            },
        ];

        this.el = null;
        this.renderer = null;
        this.camera = null;
        this.fullscreenButton = null;

        this.unitResult = false;

        this.webglFailed = false;

        this.init();
    }

    init() {
        
        this.el = document.getElementById(this.options.elID);

        this.calculations.chartWidth = Math.floor( this.el.clientWidth - 1 );
        this.calculations.chartHeight = Math.floor( this.calculations.chartWidth / this.options.aspectRatio );
        this.distanceToCam = this.options.chartWidthProductdistanceToCam / this.calculations.chartWidth;
        this.cameraPlaneDivider = this.calculations.chartWidth / this.options.cameraPlaneDividerRatio;
        
        this.initScene();

        if( true === this.webglFailed ){
            return;
        }

        this.updateGraphics();
        this.updateCalculationTable();
        this.initEvents();

        window.addEventListener('resize', () => this.handleResize());

        this.fullscreenButton = document.getElementById('fullscreen-button');
        this.fullscreenButton.addEventListener('click', (event) => this.toggleFullscreen(event));
        this.setFullscreenBtnTo('fullscreen');

        document.addEventListener('fullscreenchange', (event) => this.handleFullscreenChange(event));
        document.addEventListener('mozfullscreenchange', (event) => this.handleFullscreenChange(event));
        document.addEventListener('webkitfullscreenchange', (event) => this.handleFullscreenChange(event));
        document.addEventListener('msfullscreenchange', (event) => this.handleFullscreenChange(event));
    }

    handleResize() {
        if( true === this.webglFailed ){
            return;
        }

        this.calculations.chartWidth = Math.floor(this.el.clientWidth - 1);

        if(this.isFullscreen()){
            this.calculations.chartHeight = Math.floor(this.el.clientHeight);
        } else{
            this.calculations.chartHeight = Math.floor(this.calculations.chartWidth / this.options.aspectRatio);
        }

        this.camera.left = this.calculations.chartWidth / -this.cameraPlaneDivider;
        this.camera.right = this.calculations.chartWidth / this.cameraPlaneDivider;
        this.camera.top = this.calculations.chartHeight / this.cameraPlaneDivider;
        this.camera.bottom = this.calculations.chartHeight / -this.cameraPlaneDivider;
        this.camera.updateProjectionMatrix();

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
            if (this.el.requestFullscreen) {
                this.el.requestFullscreen();
            } else if (this.el.mozRequestFullScreen) {
                this.el.mozRequestFullScreen();
            } else if (this.el.webkitRequestFullscreen) {
                this.el.webkitRequestFullscreen();
            } else if (this.el.msRequestFullscreen) {
                this.el.msRequestFullscreen();
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

    getBrowserName() {
        const userAgent = navigator.userAgent;

        if (userAgent.indexOf('Firefox') > -1) return 'Mozilla Firefox';
        if (userAgent.indexOf('Edg') > -1) return 'Microsoft Edge';
        if (userAgent.indexOf('OPR') > -1 || userAgent.indexOf('Opera') > -1) return 'Opera';
        if (userAgent.indexOf('Chrome') > -1) return 'Google Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';

        return 'your browser';
    }

    showWebGLError() {
        this.el.innerHTML = '';

        const message = document.createElement('div');
        message.id = 'webgl_error';
        message.innerHTML = '<p>WebGL is currently disabled, so the 3D visualization cannot be displayed.</p>' +
            '<p>Please google it or ask your favorite AI assistant: <i>"how to enable WebGL in ' + this.getBrowserName() + '"</i>.</p>';

        this.el.appendChild(message);
    }

    initScene() {

        this.calculateResultedVector();

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        const scene = new THREE.Scene();

        // show axes in the screen
        const axes = new THREE.AxesHelper(10);
        scene.add(axes);

        // create a camera, which defines where we're looking at.
        //this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera = new THREE.OrthographicCamera(this.calculations.chartWidth / -this.cameraPlaneDivider, this.calculations.chartWidth / this.cameraPlaneDivider, this.calculations.chartHeight / this.cameraPlaneDivider, this.calculations.chartHeight / -this.cameraPlaneDivider, -200, 500);

        // create a render and set the size
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
        } catch (error) {
            this.webglFailed = true;
            this.showWebGLError();
            return;
        }
        this.renderer.setClearColor(new THREE.Color(0x333333));
        this.renderer.setSize(this.calculations.chartWidth, this.calculations.chartHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        // position and point the camera to the center of the scene
        this.camera.position.x = this.options.cameraPositionNormVector.x * this.distanceToCam;
        this.camera.position.y = this.options.cameraPositionNormVector.y * this.distanceToCam;
        this.camera.position.z = this.options.cameraPositionNormVector.z * this.distanceToCam ;
        this.camera.lookAt(this.options.cameraTarget);

        // add spotlight for the shadows
        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(20, 20, 20);
        scene.add(spotLight);

        const draggedObjects = [];
        this.vectors.forEach((vector, vector_index) => {
            const dir = vector.entity.clone();

            //normalize the direction vector (convert to vector of length 1)
            dir.normalize();
        
            const origin = new THREE.Vector3( 0, 0, 0 );
            const length = vector.entity.length();
            const hex = vector.color;
        
            const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
            arrowHelper.name = vector.id;
            scene.add( arrowHelper );
            this.vectors[vector_index]['arrow_object'] = arrowHelper;
            
            if(true==vector.has_control){
                const sphereGeometry = new THREE.SphereGeometry(this.options.sphereRadius, 18, 18);
                const sphereMaterial = new THREE.MeshBasicMaterial({color: vector.color, transparent: true, opacity: 0.2});
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            
                sphere.name = vector.id_control;

                sphere.userData = {
                    vector_index: vector_index,
                    vector_id: vector.id
                }
                
                // position the sphere
                sphere.position.set(vector.entity.x, vector.entity.y, vector.entity.z);
        
                // add the sphere to the scene
                scene.add(sphere);

                this.vectors[vector_index]['control_object'] = sphere;

                draggedObjects.push(sphere);
            }
        });



        const planeSize = 10;
        const planeMaterial = new THREE.MeshLambertMaterial( {
            color: 0xeeeeee, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        } );
        const planeXYgeometry = new THREE.PlaneGeometry( planeSize, planeSize );
        const planeXY = new THREE.Mesh( planeXYgeometry, planeMaterial );
        const planeYZ = planeXY.clone();
        const planeXZ = planeXY.clone();
    
        planeXY.position.set(planeSize/2, planeSize/2, 0);
    
        planeYZ.rotateY( THREE.MathUtils.degToRad( 90 ) );
        planeYZ.position.set(0, planeSize/2, planeSize/2);
    
        planeXZ.rotateX( THREE.MathUtils.degToRad( 90 ) );
        planeXZ.position.set(planeSize/2, 0, planeSize/2);
    
    
        scene.add( planeXY );
        scene.add( planeYZ );
        scene.add( planeXZ );

        // add the output of the renderer to the html element
        this.el.appendChild(this.renderer.domElement);

        // IMPORTANT: make sure that your container.append(renderer.domElement); is executed BEFORE initializing OrbitControls( camera, renderer.domElement );
        const orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        orbitControls.enablePan = false;
        orbitControls.target = this.options.cameraTarget;
        orbitControls.update();

        const dragControls = new THREE.DragControls( draggedObjects, this.camera, this.renderer.domElement );
        // add event listener to highlight dragged objects
        dragControls.addEventListener( 'dragstart', function ( event ) {
            orbitControls.enabled = false;
        } );

        dragControls.addEventListener( 'drag', function ( event ) {
            APP.updateVector(
                event.object.userData.vector_index,
                event.object.position.x, 
                event.object.position.y, 
                event.object.position.z
            );

            APP.calculateResultedVector();
            APP.updateGraphics(true);
            APP.updateCalculationTable();
        } );

        dragControls.addEventListener( 'dragend', function ( event ) {

            orbitControls.enabled = true;
        } );

        dragControls.addEventListener( 'hoveron', function ( event ) {
            event.object.material.opacity = 0.6;
        } );

        dragControls.addEventListener( 'hoveroff', function ( event ) {
            event.object.material.opacity = 0.2;
        } );


        const render = () => {
  
            // required if orbitControls.enableDamping or orbitControls.autoRotate are set to true
            // orbitControls.update();
    
            // render using requestAnimationFrame
            requestAnimationFrame(render);
            this.renderer.render(scene, this.camera);
        };

        render();
    }

    initEvents() {
        d3.select('#t_0_x').on('input', (e) => {
            if( ! APP.isNumeric(e.target.value))
                return;

            const x = parseFloat(e.target.value);

            APP.updateVector(
                0,
                x, 
                APP.vectors[0].entity.y, 
                APP.vectors[0].entity.z, 
            );

            APP.calculateResultedVector();
            APP.updateGraphics();
            APP.updateCalculationTable();
        })

        d3.select('#t_0_y').on('input', (e) => {
            if( ! APP.isNumeric(e.target.value))
                return;

            const y = parseFloat(e.target.value);

            APP.updateVector(
                0,
                APP.vectors[0].entity.x, 
                y, 
                APP.vectors[0].entity.z, 
            );

            APP.calculateResultedVector();
            APP.updateGraphics();
            APP.updateCalculationTable();
        })

        d3.select('#t_0_z').on('input', (e) => {
            if( ! APP.isNumeric(e.target.value))
                return;

            const z = parseFloat(e.target.value);

            APP.updateVector(
                0,
                APP.vectors[0].entity.x, 
                APP.vectors[0].entity.y, 
                z, 
            );

            APP.calculateResultedVector();
            APP.updateGraphics();
            APP.updateCalculationTable();
        })

        d3.select('#t_1_x').on('input', (e) => {
            if( ! APP.isNumeric(e.target.value))
                return;

            const x = parseFloat(e.target.value);

            APP.updateVector(
                1,
                x, 
                APP.vectors[1].entity.y, 
                APP.vectors[1].entity.z, 
            );

            APP.calculateResultedVector();
            APP.updateGraphics();
            APP.updateCalculationTable();
        })

        d3.select('#t_1_y').on('input', (e) => {
            if( ! APP.isNumeric(e.target.value))
                return;

            const y = parseFloat(e.target.value);

            APP.updateVector(
                1,
                APP.vectors[1].entity.x, 
                y, 
                APP.vectors[1].entity.z, 
            );

            APP.calculateResultedVector();
            APP.updateGraphics();
            APP.updateCalculationTable();
        })

        d3.select('#t_1_z').on('input', (e) => {
            if( ! APP.isNumeric(e.target.value))
                return;

            const z = parseFloat(e.target.value);

            APP.updateVector(
                1,
                APP.vectors[1].entity.x, 
                APP.vectors[1].entity.y, 
                z, 
            );

            APP.calculateResultedVector();
            APP.updateGraphics();
            APP.updateCalculationTable();
        })

        d3.select('#unit_result_checkbox').on('change', (e) => {
            APP.unitResult = e.target.checked;
            APP.updateGraphics();
            APP.updateCalculationTable();
        })
    } // end initEvents()

    updateVector(index, x, y, z) {

        this.vectors[index].entity.setX(x);
        this.vectors[index].entity.setY(y);
        this.vectors[index].entity.setZ(z);
    }

    calculateResultedVector() {
        const resultedVectorIndex = 2;

        this.vectors[resultedVectorIndex].entity.setX(
            this.vectors[0].entity.y * this.vectors[1].entity.z - this.vectors[0].entity.z * this.vectors[1].entity.y
        );

        this.vectors[resultedVectorIndex].entity.setY(
            this.vectors[0].entity.z * this.vectors[1].entity.x - this.vectors[0].entity.x * this.vectors[1].entity.z
        );

        this.vectors[resultedVectorIndex].entity.setZ(
            this.vectors[0].entity.x * this.vectors[1].entity.y - this.vectors[0].entity.y * this.vectors[1].entity.x
        );
    }

    getDisplayResultedVector() {
        const resultedVector = this.vectors[2].entity.clone();

        if( true === this.unitResult ){
            resultedVector.normalize();
        }

        return resultedVector;
    }

    updateGraphics( dragging = false ) {
        this.vectors.forEach((vector, vector_index) => {
            const entity = 2 === vector_index ? this.getDisplayResultedVector() : vector.entity.clone();
            const dir = entity.clone();
            const length = dir.length();

            //normalize the direction vector (convert to vector of length 1)
            dir.normalize();

            vector.arrow_object.setDirection(dir);
            vector.arrow_object.setLength(length);

            if( false === dragging){
                if( true === vector.has_control) {
                    this.vectors[vector_index]['control_object'].position.set(vector.entity.x, vector.entity.y, vector.entity.z);
                }
            }
        });
    }

    updateCalculationTable(){

        const activeID = document.activeElement.id;

        if(activeID != 't_0_x'){
            d3.select('#t_0_x').property('value', this.vectors[0].entity.x.toFixed(2));
        }

        if(activeID != 't_0_y'){
            d3.select('#t_0_y').property('value', this.vectors[0].entity.y.toFixed(2));
        }

        if(activeID != 't_0_z'){
            d3.select('#t_0_z').property('value', this.vectors[0].entity.z.toFixed(2));
        }

        if(activeID != 't_1_x'){
            d3.select('#t_1_x').property('value', this.vectors[1].entity.x.toFixed(2));
        }

        if(activeID != 't_1_y'){
            d3.select('#t_1_y').property('value', this.vectors[1].entity.y.toFixed(2));
        }

        if(activeID != 't_1_z'){
            d3.select('#t_1_z').property('value', this.vectors[1].entity.z.toFixed(2));
        }

        const resultedVector = this.getDisplayResultedVector();
        d3.select('#t_2_x').text(resultedVector.x.toFixed(2));
        d3.select('#t_2_y').text(resultedVector.y.toFixed(2));
        d3.select('#t_2_z').text(resultedVector.z.toFixed(2));

        const alpha = this.calculateAlpha();
        d3.select('#t_alpha').text(alpha.toFixed(2));
        d3.select('#t_alpha_deg').text((alpha * (180/Math.PI)).toFixed(2));
    } // end updateCalculationTable()


    calculateAlpha(){
        const lengthP = this.vectors[0].entity.length();
        const lengthQ = this.vectors[1].entity.length();

        if( 0 == (lengthP * lengthQ)){
            return 0;
        }

        const dotProduct = this.vectors[0].entity.dot(this.vectors[1].entity);
        const cosA = Math.max(-1, Math.min(1, dotProduct / (lengthP * lengthQ)));

        return Math.acos(cosA);
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

const APP = new PAGE_APP();