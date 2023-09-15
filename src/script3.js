import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//ORBIT
new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
//SHAPES
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const planeGeometry = new THREE.PlaneGeometry(64,64,64,64);
// const planeMaterial = new THREE.MeshNormalMaterial({
//     wireframe: true
// })

let clock = new THREE.Clock();

let uniforms = {
    u_time: { type: "f", value: 1.0 },
    colorB: { type: "vec3", value: new THREE.Color(0xfff000) },
    colorA: { type: "vec3", value: new THREE.Color(0xffffff) },
  };
const planeCustomMaterial = new THREE.ShaderMaterial({
    // note: this is where the magic happens
    
    //uniforms: uniforms, // dataArray, time
    vertexShader: document.getElementById('vertex').textContent,
   // fragmentShader: document.getElementById('fragment').textContent,
    wireframe: true,
  });

  console.log(uniforms)

const planeMesh = new THREE.Mesh(planeGeometry, planeCustomMaterial);
planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
planeMesh.scale.x = 2;
planeMesh.scale.y = 2;
planeMesh.scale.z = 2;
planeMesh.position.y = 8;

scene.add(planeMesh);

camera.position.z = 100;

let analyser;

// const setupAudioContext = () => {
    let audioContext = new window.AudioContext();
    let audioElement = document.getElementById("myAudio");
    let source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);
//   };



  const render = () => {
    // note: update audio data
    
    analyser.getByteFrequencyData(dataArray);
    uniforms.u_time.value += clock.getDelta();
    // console.log(dataArray)
  
    // note: call render function on every animation frame
    requestAnimationFrame(render);
  };
  
  render();

function animate() {
	requestAnimationFrame( animate );
    // analyser.getByteFrequencyData(dataArray);

    // console.log(dataArray)

	renderer.render( scene, camera );
}

animate();


window.addEventListener("resize", () => { 
    camera.aspect = innerWidth / innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(innerWidth, innerHeight)
});
