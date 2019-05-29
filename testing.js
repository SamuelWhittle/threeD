var scene, camera, renderer;
var light;
var floorGeometry, floorMaterial, floorMesh;
var boxGeometry, boxMaterial, cubeMesh;

// if pointer lock is on this is true
var controlsEnabled = false;

// forward direction for player
var forwardVector = new THREE.Vector3(0, 0, 1);
// up direction for player
var upVector = new THREE.Vector3(0, 1, 0);
// strafe direction for player
var strafeVector = new THREE.Vector3(1, 0, 0);
// the direction the camera is looking
var lookVector = new THREE.Vector3(0, 0, 1);;

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

    // Dem cubes tho
	boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    boxMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    // a Mesh is a material and a geometry
    cubeMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    scene.add( cubeMesh );
    cubeMesh.position.y = 10;
    
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

    camera.position.y = 10;
    camera.position.z = 50;

    console.log('initialized');
};

var animate = function () {
	requestAnimationFrame( animate );

	cubeMesh.rotation.x += 0.01;
    cubeMesh.rotation.y += 0.01;

	renderer.render( scene, camera );
};

// is called when pointer is locked and the mouse is moved
function updateMouse(e) {
    // rotated angle is the ratio of pixels moved to total pixels multiplied by a number that is the sensitivity, these numbers are treated as radians
    var rotatedAngleX = sensitivity*(-e.movementX/(window.innerWidth/2));
    var rotatedAngleY = sensitivity*(-e.movementY/(window.innerHeight/2));
    // if the mouse has moved, change the camera rotation
    camera.rotateOnWorldAxis(upVector, rotatedAngleX);

    // update the players look direction to match the objects world direction
    camera.getWorldDirection(lookVector);

    //update the directional vectors based off what we know, the lookVector and the upVector

    // rotate camera on strafe axis to look up or down
    camera.rotateOnAxis(strafeVector, rotatedAngleY);
    
    console.log(camera.rotation);
    console.log(forwardVector);
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