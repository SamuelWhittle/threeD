var camera, scene, renderer;
var floorGeometry, floorMaterial, floorMesh, floorTexture;
var boxGeometry, boxMaterial, boxMesh, boxTexture;
var controls;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function init() {
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

    playerControls();

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

init();
animate();