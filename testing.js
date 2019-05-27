var camera, scene, renderer;
var floorGeometry, floorMaterial, floorMesh, floorTexture;
var boxGeometry, boxMaterial, boxMesh, boxTexture;
var controls;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

// forward direction for camera
var forwardDirection = new THREE.Vector3();

// Does the document have pointer lock for mouse controls?
var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

// Main initialization function
function init() {
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

    // Create a camera
    // 	Set a Field of View (FOV) of 75 degrees
    // 	Set an Apsect Ratio of the inner width divided by the inner height of the window
    //	Set the 'Near' distance at which the camera will start rendering scene objects to 2
    //	Set the 'Far' (draw distance) at which objects will not be rendered to 1000
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    // Create a scene
    scene = new THREE.Scene();

    // Create a HemisphereLight source
    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    // Create First Person Controls
    controls = new THREE.FirstPersonControls( camera );
    controls.noFly = true;
    controls.object.position.z = 50;
    controls.object.position.y = 10;
    scene.add( controls.object );

    // Create a PlaneGeometry for the floor
    floorGeometry = new THREE.PlaneGeometry( 100, 100, 100, 100 );
    // Roate the floor "down"
    floorGeometry.rotateX( - Math.PI / 2 );

    // Create a floor material
    floorMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floorMesh );

    // Create a geometry
    // 	Create a box (cube) of 10 width, length, and height
    boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
    // Create a MeshPhongMaterial with a loaded texture
    boxMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000} );

    // Combine the geometry and material into a mesh
    boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    // Add the mesh to the scene
    scene.add( boxMesh );
    boxMesh.position.y = 5;

    // Create a WebGL Renderer
    renderer = new THREE.WebGLRenderer();
    // Set the size of the renderer to the inner width and inner height of the window
    renderer.setSize( window.innerWidth, window.innerHeight );
    // Add in the created DOM element to the body of the document
    document.body.appendChild( renderer.domElement );

}

function animate() {
    // kinda like interval but better
    requestAnimationFrame(animate);

    //update forward direction to camera direction
    controls.object.getWorldDirection(forwardDirection);
    console.log(forwardDirection);

    //rotate the cube
    boxMesh.rotation.y += 0.01;

    // Process player controls
    //playerControls();

    //render what the camera is seeing
    renderer.render(scene, camera);
}

function playerControls () {

    // Are the controls enabled? (Does the browser have pointer lock?)
    if ( controls.enabled ) {
        // Save the current time
        var time = performance.now();
        // Create a delta value based on current time
        var delta = ( time - prevTime ) / 1000;

        camera.getWorldDirection(forwardDirection);

        // Set the velocity.x and velocity.z using the calculated time delta
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // As velocity.y is our "gravity," calculate delta
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if ( controls.moveForward ) {
            velocity.z -= 400.0 * delta;
        }

        if ( controls.moveBackward ) {
            velocity.z += 400.0 * delta;
        }

        if ( controls.moveLeft ) {
            velocity.x -= 400.0 * delta;
        }

        if ( controls.moveRight ) {
            velocity.x += 400.0 * delta;
        }

        // Update the position using the changed delta
        controls.object.translateX( velocity.x * delta );
        controls.object.translateY( velocity.y * delta );
        controls.object.translateZ( velocity.z * delta );

        // Prevent the camera/player from falling out of the 'world'
        if ( controls.object.position.y < 10 ) {

            velocity.y = 0;
            controls.object.position.y = 10;

        }

        // Save the time for future delta calculations
        prevTime = time;
    }
}

// is called when pointer is locked and the mouse is moved
function updateMouse(e) {
    if(e.movementY < 0) {
        controls.object.rotation.x += 0.01;
    }else if(e.movementY > 0) {
        controls.object.rotation.x -= 0.01;
    }
    console.log(e.movementX, e.movementY);
}

// runs when pointer lock state change is detected
function lockChangeAlert() {
    // check to see if the element that is pointer locked is equal to the requested event
    // cause if they're equal it means it worked
    if (document.pointerLockElement === document.body ||
        document.mozPointerLockElement === document.body ||
        document.webkitPointerLockElement === document.body) {
        console.log('The pointer lock status is now locked');
        // Pointer was just locked, enable mousemove listener
        document.addEventListener("mousemove", updateMouse, false);
    }else {
        console.log('The pointer lock status is now unlocked');
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