import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';

// thanks https://fjolt.com/article/javascript-three-js-morphing-sphere

// Scene
let scene = new THREE.Scene();

// CAMERA
let camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 );
camera.position.set(1.5, -0.5, 6);

// RENDERER
let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize( innerWidth, innerHeight );
// Append our renderer to the webpage. Basically, this appends the `canvas` to our webpage.
document.body.appendChild( renderer.domElement );

//ORBIT
new OrbitControls(camera, renderer.domElement);

// AMBIENT LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
// DIRECTIONAL LIGHT
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
dirLight.position.x += 20
dirLight.position.y += 20
dirLight.position.z += 20
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
const d = 10;
dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;
dirLight.position.z = -25;

let target = new THREE.Object3D();
target.position.z = -30;
dirLight.target = target;
dirLight.target.updateMatrixWorld();

dirLight.shadow.camera.lookAt(0, 0, -30);
scene.add(dirLight);

// TEXTURES
const textureLoader = new THREE.TextureLoader();

const waterBaseColor = textureLoader.load("textures/Water_002_COLOR.jpg");
const waterNormalMap = textureLoader.load("textures/Water_002_NORM.jpg");
const waterHeightMap = textureLoader.load("textures/Water_002_DISP.png");
const waterRoughness = textureLoader.load("textures/Water_002_ROUGH.jpg");
const waterAmbientOcclusion = textureLoader.load("textures/Water_002_OCC.jpg");

/////////////////////////////////////
// REACTIVE SPHERE /////////////////
///////////////////////////////////
let sphereGeometry = new THREE.SphereGeometry(1.5, 100, 100);
sphereGeometry.positionData = [];
let v3 = new THREE.Vector3();
for (let i = 0; i < sphereGeometry.attributes.position.count; i++){
    v3.fromBufferAttribute(sphereGeometry.attributes.position, i);
    sphereGeometry.positionData.push(v3.clone());
}

//material
// let sphereMesh = new THREE.ShaderMaterial({
//     uniforms: {      
//         colorA: {type: 'vec3', value: new THREE.Vector3(0.5, 0.5, 0.5)},

//     },
//     vertexShader: document.getElementById('vertex').textContent,
//     fragmentShader: document.getElementById('fragment').textContent,
// });

//add sphere
let sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({
    map: waterBaseColor,
    normalMap: waterNormalMap,
    displacementMap: waterHeightMap, displacementScale: 0.01,
    roughnessMap: waterRoughness, roughness: 0,
    aoMap: waterAmbientOcclusion
}));
sphere.receiveShadow = true;
sphere.castShadow = true;

scene.add(sphere);

///////////////////////////////////
////////////////////////////////////
////////////////////////////////////





window.addEventListener("resize", () => { 
    camera.aspect = innerWidth / innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(innerWidth, innerHeight)
});

let noise = openSimplexNoise.makeNoise4D(Date.now());
console.log(noise)
let clock = new THREE.Clock();

console.log(noise)
//ANIMATION

let setNoise;

renderer.setAnimationLoop( () => {
  let t = clock.getElapsedTime() / 1.;
    sphereGeometry.positionData.forEach((p, idx) => {
        setNoise = noise(p.x, p.y, p.z, t * 1);
        
        
        v3.copy(p).addScaledVector(p, setNoise);
        sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
    })
    
   
    sphereGeometry.computeVertexNormals();
    sphereGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
})