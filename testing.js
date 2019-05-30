var scene, camera, renderer;
var light;
var floorGeometry, floorMaterial, floorMesh;
var centerCubeGeometry, CenterCubeMaterial, centercenterCubeMesh;

// visual aids
var cameraLookVectorVisualGeometry, cameraLookVectorVisualMaterial, cameraLookVectorVisualMesh;

// if pointer lock is on this is true
var controlsEnabled = false;

// up direction for player
var upVector;
var lastUpVector;

// forward direction for player
var forwardVector;
// vector the camera rotates around to adjust when the up vector changes
var localSpaceForwardVector;

// strafe direction for player
var worldSpaceStrafeVector;
// vector the camera rotates on to look up and down
var localSpaceStrafeVector;

// the direction the camera is looking
var lookEuler;


//sensitivity
var sensitivity = Math.PI/2;

// main initialization function for setting things up before the rendering starts
var init = function () {
    // sets the request pointer lock to be able to handle any supported browser
    document.requestPointerLock = document.requestPointerLock ||
        document.mozRequestPointerLock ||
        document.webkitRequestPointerLock;

    // sets the exit pointer lock event to be able to handle any supported browser
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;

    //if clicked request pointer lock
    document.onclick = function(event) {
        document.body.requestPointerLock();
    }

    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

    // Hook pointer lock error events
    document.addEventListener('pointerlockerror', errorCallback, false);
    document.addEventListener('mozpointerlockerror', errorCallback, false);
    document.addEventListener('webkitpointerlockerror', errorCallback, false);

    // Basic three.js setup of scene(world) and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 1000 );

    // three js renderer
    renderer = new THREE.WebGLRenderer();
    // size of viewport into the scene
    renderer.setSize( window.innerWidth, window.innerHeight );
    // slap that rendered image into the html somewhere
	document.body.appendChild( renderer.domElement );

    // Dem phat cubes tho
	centerCubeGeometry = new THREE.CubeGeometry( 10, 10, 10 );
    centerCubeMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    // a Mesh is a material and a geometry
    centerCubeMesh = new THREE.Mesh( centerCubeGeometry, centerCubeMaterial );
    scene.add( centerCubeMesh );
    centerCubeMesh.position.y = 10;
    //centerCubeMesh.castShadow = true;

    // visual player axis vectors
    // look vector box
    cameraLookVectorVisualGeometry = new THREE.CubeGeometry(1, 1, 10);
    cameraLookVectorVisualMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
    cameraLookVectorVisualMesh = new THREE.Mesh(cameraLookVectorVisualGeometry, cameraLookVectorVisualMaterial);
    scene.add(cameraLookVectorVisualMesh);
    cameraLookVectorVisualMesh.position.y = 5;
    cameraLookVectorVisualMesh.position.z = 10;
    cameraLookVectorVisualMesh.rotation.y = Math.PI/2;
    
    // Create a HemisphereLight source
    light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    // Create a PlaneGeometry for the floor
    floorGeometry = new THREE.PlaneGeometry( 100, 100, 100, 100 );
    // Rotate the floor "down"
    floorGeometry.rotateX( - Math.PI / 2 );

    // Create a floor material
    floorMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floorMesh );
    //floorMesh.receiveShadow = true;

    // initialize player directional vectors
    // players up direction
    upVector = new THREE.Vector3();
    // if the upVector changes this stores the previous vector for reasons
    lastUpVector = new THREE.Vector3();

    // strafe direction for player
    worldSpaceStrafeVector = new THREE.Vector3();
    // set local vector constants
    localSpaceStrafeVector = new THREE.Vector3(1, 0, 0);
    
    // forward direction for player
    forwardVector = new THREE.Vector3();
    // local forward direction for player
    localSpaceForwardVector = new THREE.Vector3(0, 0, 1);

    // method tha takes the up vector and calculates the rest of the directional vectors
    setDirectionalVectors(new THREE.Vector3(0, 1, 0));

    // set original camera position
    camera.position.y = 10;
    camera.position.z = 50;

    //set original camera rotation
    camera.lookAt(camera.localToWorld(forwardVector));

    console.log('initialized');
};

// runs in a loop, does all the shit
var animate = function () {
    requestAnimationFrame( animate );

    // rotate dat phat cube there
	centerCubeMesh.rotation.x += 0.01;
    centerCubeMesh.rotation.y += 0.01;

    //render and display the scene
	renderer.render( scene, camera );
};

// sets the players directional vectors like forward and strafe based on the up vector
function setDirectionalVectors(newUpVector) {
    console.log("new up vector");
    console.log(newUpVector);

    // Record current upVector
    lastUpVector.copy(upVector);

    // change the upVector to the new upVector
    upVector.copy(newUpVector);

    // strafe direction for player
    worldSpaceStrafeVector.crossVectors(newUpVector, new THREE.Vector3(0, 0, 1));

    // if the cross product between up vector and the world y axis is 0, up vector must be either straight up or straight down
    if(worldSpaceStrafeVector.x == 0 && worldSpaceStrafeVector.y == 0 && worldSpaceStrafeVector.z == 0) {
        // set the x comp of the strafe vector equal to the y comp of the up vector
        worldSpaceStrafeVector.x = newUpVector.y;
    }

    // forward direction for player
    forwardVector.crossVectors(worldSpaceStrafeVector, newUpVector);

    //change the cameras saved up direction as the upVector
    camera.rotateOnAxis(localSpaceForwardVector, Math.acos(newUpVector.y)); console.log(Math.acos(newUpVector.y));
    console.log("directional vectors changed accordingly");
}

// is called when pointer is locked and the mouse is moved
function updateMouse(e) {
    // if there is a change in the up vector
    if(lastUpVector.equals(upVector)) {
        console.log("no change in upVector");
    } else {
        console.log('change in upVector');
        setDirectionalVectors(upVector);
    }
    // rotated angle is the ratio of pixels moved to total pixels multiplied by a number that is the sensitivity, these numbers are treated as radians
    var rotatedXAngle = sensitivity*(-e.movementX/(window.innerWidth/2));
    var rotatedYAngle = sensitivity*(-e.movementY/(window.innerHeight/2));

    // if the mouse has moved +/- X, change the camera rotation
    camera.rotateOnWorldAxis(upVector, rotatedXAngle);

    // update the worldSpaceStrafeVector according to the new forward direction

    // if the mouse has move +/- Y, change the camera rotation
    camera.rotateOnAxis(localSpaceStrafeVector, rotatedYAngle);

    //update all the visual aids
    cameraLookVectorVisualMesh.setRotationFromEuler(camera.rotation);
}

// runs when pointer lock state change is detected
function lockChangeAlert() {
    // check to see if the element that is pointer locked is equal to the requested event
    // cause if they're equal it means it worked
    if (document.pointerLockElement === document.body ||
        document.mozPointerLockElement === document.body ||
        document.webkitPointerLockElement === document.body) {
        console.log('The pointer lock status is now locked');
        controlsEnabled = true;
        // Pointer was just locked, enable mousemove listener
        document.addEventListener("mousemove", updateMouse, false);
    }else {
        console.log('The pointer lock status is now unlocked');
        controlsEnabled = false;
        // Pointer was just unlocked, disable mousemove listener
        document.removeEventListener("mousemove", updateMouse, false);
        document.exitPointerLock();
    }
}

// runs if when trying to change pointer lock states an error is created
function errorCallback(e) {
    console.log("Eh, idk pointer lock broke?");
}

init();
animate();