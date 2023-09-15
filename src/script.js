import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';

//new scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

//camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set(0,0,0);

// camera.position.y = 5;

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("sketch-container").appendChild( renderer.domElement );
renderer.shadowMap.enabled = true

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
// controls.target = new THREE.Vector3(0, 0, 0);
controls.update();

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



    // SPHERE
    const geometry = new THREE.SphereBufferGeometry(6, 128, 128);
    const sphere = new THREE.Mesh(geometry,
        new THREE.MeshStandardMaterial({
            map: waterBaseColor,
            normalMap: waterNormalMap,
            displacementMap: waterHeightMap, displacementScale: 0.01,
            roughnessMap: waterRoughness, roughness: 0,
            aoMap: waterAmbientOcclusion
        }));
    sphere.receiveShadow = true;
    sphere.castShadow = true;
    sphere.rotation.x = - Math.PI / 4;
    sphere.position.z = - 30;
    scene.add(sphere);

    // const count: number = geometry.attributes.position.count;
    
    // const position_clone = JSON.parse(JSON.stringify(geometry.attributes.position.array)) as Float32Array;
    // const normals_clone = JSON.parse(JSON.stringify(geometry.attributes.normal.array)) as Float32Array;
    // const damping = 0.2;





camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );


	renderer.render( scene, camera );
}

animate();

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    
    // windowW = window.innerWidth;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


}