var scene, camera, renderer;
var light;
var floorGeometry, floorMaterial, floorMesh;
var centerCubeGeometry, CenterCubeMaterial, centercenterCubeMesh;

// visual aids
var object;
var parent;
var cameraLookVectorVisualGeometry, cameraLookVectorVisualMaterial, cameraLookVectorVisualMesh;
var cameraStrafeVectorVisualMesh;

// if pointer lock is on this is true
var controlsEnabled = false;

// up direction for player
var objectSpaceUpVector;
// just to have a (0, 1, 0) vector handy
var localSpaceUpVector;

// last up vector to check if it has changed
var lastUpVector;

// forward direction for player
var objectSpaceForwardVector;
// vector the camera rotates around to adjust when the up vector changes
var localSpaceForwardVector;

// strafe direction for player
var objectSpaceStrafeVector;
// vector the camera rotates on to look up and down
var localSpaceStrafeVector;

// the direction the camera is looking
var lookEuler;

// sensitivity
var sensitivity = Math.PI/2;

// is the camera moving?
var moving = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 1
};

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

    // visual representation of player axis directions
    // lil shape that is on the player look vector
    cameraLookVectorVisualMesh = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 10), new THREE.MeshPhongMaterial({color: 0x0000ff}));
    scene.add(cameraLookVectorVisualMesh);
    cameraLookVectorVisualMesh.position.y = 5;
    cameraLookVectorVisualMesh.position.z = 10;

    // lil shape that points in the direction of the objectSpaceStrafeVector
    parent = new THREE.Object3D();
    scene.add(parent);
    cameraStrafeVectorVisualMesh = new THREE.Mesh(new THREE.CubeGeometry(10, 1, 1), new THREE.MeshPhongMaterial({color: 0x00ffff}));
    cameraStrafeVectorVisualMesh.position.x = 5;
    parent.position.y = 5;
    parent.position.z = 10;
    parent.add(cameraStrafeVectorVisualMesh);
    
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

    // initialize player directional vectors
    //  world space up direction
    objectSpaceUpVector = new THREE.Vector3(0, 1, 0);
    //  local space up direction
    localSpaceUpVector = new THREE.Vector3(0, 1, 0);
    //  last known world space up vector before the current
    lastUpVector = new THREE.Vector3(0, 1, 0);

    //  world space strafe direction
    objectSpaceStrafeVector = new THREE.Vector3(1, 0, 0);
    //  local space strafe direction, should never change
    localSpaceStrafeVector = new THREE.Vector3(1, 0, 0);
    
    // world space forward direction
    objectSpaceForwardVector = new THREE.Vector3(0, 0, -1);
    // local space forward direction, should never change
    localSpaceForwardVector = new THREE.Vector3(0, 0, -1);

    // set original camera position
    camera.position.y = 10;
    camera.position.z = 50;

    console.log('initialized');
};

// is called directioly after the init() function, runs in a loop, does all the shit that should happen every frame
var animate = function () {
    requestAnimationFrame( animate );

    // rotate dat phat cube there
	centerCubeMesh.rotation.z += 0.01;
    centerCubeMesh.rotation.y += 0.01;
    //centerCubeMesh.translateX(0.1);

    updatePosition();

    //render and display the scene
	renderer.render( scene, camera );
};

// is called when pointer is locked and the mouse is moved
function updateMouse(e) {
    // if there is a change in the up vector
    if(!lastUpVector.equals(objectSpaceUpVector)) {
        setDirectionalVectors(objectSpaceUpVector);
    }

    // rotated angle is the ratio of pixels moved by the mouse to total pixels on screen, multiplied by a number that is the sensitivity, 
    //  these numbers are treated as radians and used by quaternions to rotate the camera

    // xRotQuat is a quaternion representing the mouses movement in the x direction as a rotation around a specified up axis
    var xRotQuat = new THREE.Quaternion();
    // set the quaternion by an axis of rotation and a rotation angle
    xRotQuat.setFromAxisAngle(objectSpaceUpVector, -sensitivity*(e.movementX/(window.innerWidth/2)));
    // apply the quaternion to the camera
    camera.applyQuaternion(xRotQuat);
    // apply the quaternion to the objectSpaceStrafeVector and forwardVector
    objectSpaceStrafeVector.applyQuaternion(xRotQuat).normalize();
    objectSpaceForwardVector.applyQuaternion(xRotQuat).normalize();

    // yRotQuat is basically the same as xRotQuat in function but rotates the camera around the cameras strafe vector
    var yRotQuat = new THREE.Quaternion();
    yRotQuat.setFromAxisAngle(objectSpaceStrafeVector, -sensitivity*(e.movementY/(window.innerHeight/2)));
    camera.applyQuaternion(yRotQuat);
    
    // update all the visual aids
    cameraLookVectorVisualMesh.applyQuaternion(xRotQuat);
    cameraLookVectorVisualMesh.applyQuaternion(yRotQuat);
    // cameraStrafeVectorVisualMesh.applyQuaternion(xRotQuat);
    parent.applyQuaternion(xRotQuat);
}

// sets the players directional vectors like forward and strafe based on the up vector given
function setDirectionalVectors(newUpVector) {
    console.log("function start");
    console.log(objectSpaceUpVector);
    console.log(objectSpaceStrafeVector);
    console.log(objectSpaceForwardVector);

    // Record current directional vectors
    //  last up 
    lastUpVector.copy(objectSpaceUpVector);
    //  last strafe
    var lastStrafeVector = new THREE.Vector3();
    lastStrafeVector.copy(objectSpaceStrafeVector);
    //  save current forward Vector
    var lastForwardVector = new THREE.Vector3();
    lastForwardVector.copy(objectSpaceForwardVector);

    // Set new directional vectors
    //  new Up
    objectSpaceUpVector.copy(newUpVector.normalize());
    //  new strafe
    objectSpaceStrafeVector.crossVectors(lastForwardVector, objectSpaceUpVector);
    objectSpaceStrafeVector.normalize();

    //  if the cross product is 0, dont change it from what it was?
    if(objectSpaceStrafeVector.x == 0 && objectSpaceStrafeVector.y == 0 && objectSpaceStrafeVector.z == 0) {
        // revert to previous strafe vector
        objectSpaceStrafeVector.copy(lastStrafeVector);console.log("no need to change strafe vector");
    }

    //  new forward
    objectSpaceForwardVector.crossVectors(objectSpaceUpVector, objectSpaceStrafeVector);

    // so theoretically now the camera is set up to only need to rotate around its forward axis to adjust for the new gravity
    // yeah lets do that now i guess
    camera.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(camera.getWorldDirection(new THREE.Vector3()),
        lastUpVector.clone()
            .cross(lastForwardVector)
            .angleTo(objectSpaceUpVector.clone()
                .cross(objectSpaceForwardVector))));
    
    console.log("directional vectors changed accordingly");console.log(objectSpaceUpVector);console.log(objectSpaceStrafeVector);console.log(objectSpaceForwardVector);
}

// if the controls are enabled the camera will move depending on keyboard input
function updatePosition() {
    if(controlsEnabled) {
        console.log("controls are active, update position");
        if(moving.forward) {
            camera.position.x += objectSpaceForwardVector.x * moving.speed;
            camera.position.y += objectSpaceForwardVector.y * moving.speed;
            camera.position.z += objectSpaceForwardVector.z * moving.speed;
        }
        if(moving.backward) {
            camera.position.x += objectSpaceForwardVector.x * -moving.speed;
            camera.position.y += objectSpaceForwardVector.y * -moving.speed;
            camera.position.z += objectSpaceForwardVector.z * -moving.speed;
        }
        if(moving.right) {
            camera.position.x += objectSpaceStrafeVector.x * moving.speed;
            camera.position.y += objectSpaceStrafeVector.y * moving.speed;
            camera.position.z += objectSpaceStrafeVector.z * moving.speed;
        }
        if(moving.left) {
            camera.position.x += objectSpaceStrafeVector.x * -moving.speed;
            camera.position.y += objectSpaceStrafeVector.y * -moving.speed;
            camera.position.z += objectSpaceStrafeVector.z * -moving.speed;
        }
    }
}

// on keydown event run this function, it runs the code for the different keys hit
function keyDown(e) {
    switch (e.keyCode) {
        case 87:
            moving.forward = true;
            break;
        case 83:
            moving.backward = true;
            break;
        case 65:
            moving.left = true;
            break;
        case 68:
            moving.right = true;
            break;
    }
}

// on keyup event run this function, it runs the code for when a key that is pressed is released
function keyUp(e) {
    switch (e.keyCode) {
        case 87:
            moving.forward = false;
            break;
        case 83:
            moving.backward = false;
            break;
        case 65:
            moving.left = false;
            break;
        case 68:
            moving.right = false;
            break;
    }
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
        // enable keyboard listening
        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);
    }else {
        console.log('The pointer lock status is now unlocked');
        controlsEnabled = false;
        // Pointer was just unlocked, disable mousemove listener
        document.removeEventListener("mousemove", updateMouse, false);
        // disable keyboard listening
        document.removeEventListener('keydown', keyDown, false);
        document.removeEventListener('keyup', keyUp, false);
        document.exitPointerLock();
    }
}

// runs if when trying to change pointer lock states an error is created
function errorCallback(e) {
    console.log("Eh, idk pointer lock broke?");
}

init();
animate();