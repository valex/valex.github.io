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

        this.init();
    }

    init() {
        
        this.el = document.getElementById(this.options.elID);

        this.calculations.chartWidth = Math.floor( this.el.clientWidth - 1 );
        this.calculations.chartHeight = Math.floor( this.calculations.chartWidth / this.options.aspectRatio );
        this.distanceToCam = this.options.chartWidthProductdistanceToCam / this.calculations.chartWidth;
        this.cameraPlaneDivider = this.calculations.chartWidth / this.options.cameraPlaneDividerRatio;
        
        this.initScene();

        this.updateCalculationTable();
        this.initEvents();
    }

    initScene() {

        this.calculateResultedVector();

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        const scene = new THREE.Scene();

        // show axes in the screen
        const axes = new THREE.AxesHelper(10);
        scene.add(axes);

        // create a camera, which defines where we're looking at.
        //const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const camera = new THREE.OrthographicCamera(this.calculations.chartWidth / -this.cameraPlaneDivider, this.calculations.chartWidth / this.cameraPlaneDivider, this.calculations.chartHeight / this.cameraPlaneDivider, this.calculations.chartHeight / -this.cameraPlaneDivider, -200, 500);

        // create a render and set the size
        const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
        webGLRenderer.setClearColor(new THREE.Color(0x333333));
        webGLRenderer.setSize(this.calculations.chartWidth, this.calculations.chartHeight);
        webGLRenderer.shadowMap.enabled = true;
        webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        // position and point the camera to the center of the scene
        camera.position.x = this.options.cameraPositionNormVector.x * this.distanceToCam;
        camera.position.y = this.options.cameraPositionNormVector.y * this.distanceToCam;
        camera.position.z = this.options.cameraPositionNormVector.z * this.distanceToCam ;
        camera.lookAt(this.options.cameraTarget);

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
        this.el.appendChild(webGLRenderer.domElement);

        // IMPORTANT: make sure that your container.append(renderer.domElement); is executed BEFORE initializing OrbitControls( camera, renderer.domElement );
        const orbitControls = new THREE.OrbitControls(camera, webGLRenderer.domElement);
        orbitControls.enablePan = false;
        orbitControls.target = this.options.cameraTarget;
        orbitControls.update();

        const dragControls = new THREE.DragControls( draggedObjects, camera, webGLRenderer.domElement );
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


        render();

        function render() {
  
            // required if orbitControls.enableDamping or orbitControls.autoRotate are set to true
            // orbitControls.update();
    
            // render using requestAnimationFrame
            requestAnimationFrame(render);
            webGLRenderer.render(scene, camera);
        }
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

    updateGraphics( dragging = false ) {
        this.vectors.forEach((vector, vector_index) => {
            const dir = vector.entity.clone();
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

        d3.select('#t_2_x').text(this.vectors[2].entity.x.toFixed(2));
        d3.select('#t_2_y').text(this.vectors[2].entity.y.toFixed(2));
        d3.select('#t_2_z').text(this.vectors[2].entity.z.toFixed(2));

        const alpha = this.calculateAlpha();
        d3.select('#t_alpha').text(alpha.toFixed(2));
        d3.select('#t_alpha_deg').text((alpha * (180/Math.PI)).toFixed(2));
    } // end updateCalculationTable()


    calculateAlpha(){
        const lengthP = this.vectors[0].entity.length();
        const lengthQ = this.vectors[1].entity.length();
        const lengthPxQ = this.vectors[2].entity.length();

        let sinA = 0;
        if( 0 != (lengthP * lengthQ)){
            sinA = lengthPxQ / (lengthP * lengthQ);
        }

        return Math.asin(sinA);
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

const APP = new PAGE_APP();