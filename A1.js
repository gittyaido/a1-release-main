/*
 * UBC CPSC 314, Vsept2026
 * Assignment 1 Template
 */

// Setup and return the scene and related objects.
// You should look into js/setup.js to see what exactly is done here.
const {
  renderer,
  scene,
  camera,
  worldFrame,
} = setup();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Initialize uniform
const orbPosition = { type: 'v3', value: new THREE.Vector3(0.0, 1.0, 0.0) };
// TODO: Create uniform variable for the radius of the orb and pass it into the shaders,
// you will need them in the latter part of the assignment
const orbRadius = { type: 'f', value: 2.0 }

let isPulling = { type: 'b', value: false }
const grabPosition = { type: 'v3', value: new THREE.Vector3() };

let spring = 0;
let springVelocity = 0;

let springAmount = { type: 'f', value: 0.0 };
const maxStretch = {type: 'f', value: 10.0};


// Materials: specifying uniforms and shaders
// Diffuse texture map (this defines the main colors of the boxing glove)
const gloveColorMap = new THREE.TextureLoader().load('images/boxing_gloves_texture.png');
const boxingGloveMaterial = new THREE.MeshStandardMaterial({
  map: gloveColorMap,
});

// Boxing glove transforms
const gloveL = {
  position: {
    x: 5.5,
    y: 12.0,
    z: -3.0
  },

  rotation: {
    x: 0,
    y: Math.PI / 2 + 0.3,
    z: -Math.PI / 8
  },

  scale: 1.7
};

const gloveR = {
  position: {
    x: -6.5,
    y: 14.5,
    z: -3.0
  },

  rotation: {
    x: 0,
    y: Math.PI / 2 - 0.3,
    z: -Math.PI / 3.5
  },

  scale: 1.7
};


const armadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    orbPosition: orbPosition,
    orbRadius: orbRadius,
    isPulling: isPulling,
    grabPosition: grabPosition,
    springAmount: springAmount,
    maxStretch: maxStretch
  }
});
const sphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    orbPosition: orbPosition
  }
});

// Load shaders.
const shaderFiles = [
  'glsl/armadillo.vs.glsl',
  'glsl/armadillo.fs.glsl',
  'glsl/sphere.vs.glsl',
  'glsl/sphere.fs.glsl'
];


new THREE.SourceLoader().load(shaderFiles, function (shaders) {
  armadilloMaterial.vertexShader = shaders['glsl/armadillo.vs.glsl'];
  armadilloMaterial.fragmentShader = shaders['glsl/armadillo.fs.glsl'];

  sphereMaterial.vertexShader = shaders['glsl/sphere.vs.glsl'];
  sphereMaterial.fragmentShader = shaders['glsl/sphere.fs.glsl'];
})

// Load and place the Armadillo geometry
// Look at the definition of loadOBJ to familiarize yourself with how each parameter
// affects the loaded object.
loadAndPlaceOBJ('obj/armadillo.obj', armadilloMaterial, function (armadillo) {
  armadillo.position.set(0.0, 5.3, -8.0);
  armadillo.rotation.y = Math.PI;
  armadillo.scale.set(0.1, 0.1, 0.1);
  armadillo.parent = worldFrame;
  scene.add(armadillo);
});

// TODO: Add the boxing glove to the scene on top of the Armadillo similar to how the Armadillo
// is added to the scene
loadAndPlaceOBJ('obj/boxing_glove.obj', boxingGloveMaterial, function (boxingGlove) {
  boxingGlove.position.set(gloveL.position.x, gloveL.position.y, gloveL.position.z);
  boxingGlove.rotation.set(gloveL.rotation.x, gloveL.rotation.y, gloveL.rotation.z);
  boxingGlove.scale.set(gloveL.scale, gloveL.scale, gloveL.scale);
  boxingGlove.parent = worldFrame;
  scene.add(boxingGlove);
});

loadAndPlaceOBJ('obj/boxing_glove.obj', boxingGloveMaterial, function (boxingGlove) {
  boxingGlove.position.set(gloveR.position.x, gloveR.position.y, gloveR.position.z);
  boxingGlove.rotation.set(gloveR.rotation.x, gloveR.rotation.y, gloveR.rotation.z);
  boxingGlove.scale.set(gloveR.scale, gloveR.scale, gloveR.scale);
  boxingGlove.parent = worldFrame;
  scene.add(boxingGlove);
});

// Create the sphere geometry
// https://threejs.org/docs/#api/en/geometries/SphereGeometry
// TODO: Make the radius of the orb a variable
const sphereGeometry = new THREE.SphereGeometry(0.8, 32.0, 32.0);
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0.0, 0.0, 0.0);
sphere.parent = worldFrame;
scene.add(sphere);

const sphereLight = new THREE.PointLight(0xffffff, 1, 100);
scene.add(sphereLight);

// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
let wasSpacePressed = false;
function checkKeyboard() {
  const spacePressed = keyboard.pressed("space");
  const spaceDown = spacePressed && !wasSpacePressed;
  const spaceUp = !spacePressed && wasSpacePressed;

  const stiffness = 0.15;
  const damping = 0.90;
  const maxOrbSpeed = 0.3;
  let dist = grabPosition.value.distanceTo(orbPosition.value);
  let strength =  1.0 - Math.min(Math.max(dist / maxStretch.value, 0.0), 1.0); 
  let stretch = maxStretch.value * (1.0 - Math.exp(-strength * stiffness));
  let orbSpeed = maxOrbSpeed;

  if (spaceDown) {
    grabPosition.value.copy(orbPosition.value);
  }
  if (spacePressed) {
    spring = 1.0;
    springVelocity = 0.0;

    stretch = grabPosition.value.distanceTo(orbPosition.value);

    orbSpeed = maxOrbSpeed * (1.0 - Math.min(Math.max(stretch / maxStretch.value, 0.0), 1.0));
  }
  // spring back
  else {
    springVelocity += (0.0 - spring) * stiffness;
    springVelocity *= damping;
    spring += springVelocity;
  } 

  // hacky recoil
  if (spaceUp) {
    orbSpeed = maxOrbSpeed * 5.0;
  }
  springAmount.value = spring;
  

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

  if (keyboard.pressed("W"))
    orbPosition.value.z -= orbSpeed;
  else if (keyboard.pressed("S"))
    orbPosition.value.z += orbSpeed;

  if (keyboard.pressed("A"))
    orbPosition.value.x -= orbSpeed;
  else if (keyboard.pressed("D"))
    orbPosition.value.x += orbSpeed;

  if (keyboard.pressed("E"))
    orbPosition.value.y -= orbSpeed;
  else if (keyboard.pressed("Q"))
    orbPosition.value.y += orbSpeed;


  // The following tells three.js that some uniforms might have changed
  armadilloMaterial.needsUpdate = true;
  sphereMaterial.needsUpdate = true;

  // Move the sphere light in the scene. This allows the floor to reflect the light as it moves.
  sphereLight.position.set(orbPosition.value.x, orbPosition.value.y, orbPosition.value.z);

  wasSpacePressed = spacePressed;
}

// Setup update callback
function update() {
  checkKeyboard();

  // Requests the next update call, this creates a loop
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

// Start the animation loop.
update();
