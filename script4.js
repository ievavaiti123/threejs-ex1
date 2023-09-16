// https://github.com/bentoBAUX/Rhythm-of-Three_Threejs/blob/main/index.html

var noise = new SimplexNoise();
// var audio = new Audio("src/audio/Yushh - Look Mum No Hands - 01 Look Mum No Hands.mp3"); //"/media/The-Stars.mp3"

const audio = document.getElementById('audio');
    

// var play = false;
// console.log(audio)

startViz();

// const container = document.getElementById('container');
const playPauseButton = document.getElementById('playPauseButton');



    const audioLoader = new THREE.AudioLoader();
    playPauseButton.addEventListener('click', () => {
    //console.log("Play");
    if (isPlaying(audio)) {
        console.log("Pause");
        audio.pause();
        playPauseButton.textContent = "Play";
    } else {
        console.log("Play");
        audio.play();
        playPauseButton.textContent = "Pause";
    }
});

function isPlaying(audioIn) {
    return !audioIn.paused;
}


function startViz() {
    //audio anayser setup
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    //webgl
    var scene = new THREE.Scene();
    var group = new THREE.Group();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("#ffffff");

    document.getElementById("sketch-container").appendChild( renderer.domElement );


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
    target.position.z = -40;
    dirLight.target = target;
    dirLight.target.updateMatrixWorld();

    dirLight.shadow.camera.lookAt(0, 0, -20);
    scene.add(dirLight);

    // TEXTURES
    const textureLoader = new THREE.TextureLoader();

    const waterBaseColor = textureLoader.load("src/textures/Water_002_COLOR.jpg");
    const waterNormalMap = textureLoader.load("src/textures/Water_002_NORM.jpg");
    const waterHeightMap = textureLoader.load("src/textures/Water_002_DISP.png");
    const waterRoughness = textureLoader.load("src/textures/Water_002_ROUGH.jpg");
    const waterAmbientOcclusion = textureLoader.load("src/textures/Water_002_OCC.jpg");


    var geometry = new THREE.SphereGeometry(30, 50, 50);
    // geometry.positionData = [];
    // let v3 = new THREE.Vector3();
    // for (let i = 0; i < geometry.attributes.position.count; i++){
    //     v3.fromBufferAttribute(geometry.attributes.position, i);
    //     geometry.positionData.push(v3.clone());
    // }
    //var wireframe = new THREE.EdgesGeometry(geometry);
    //var material = new THREE.MeshLambertMaterial({ color: 0x383838, wireframe: true });



    var material = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
                value: new THREE.Color("#fff1eb")
            },
            color2: {
                value: new THREE.Color("#3d3d3d")
            }
        },
        vertexShader: `
          varying vec2 vUv;
      
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          
          varying vec2 vUv;
          
          void main() {
            gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
          }
        `,
        //wireframe: true
    });

    // var ambientLight = new THREE.AmbientLight(0xffffff);
    // //scene.add(ambientLight);

    var ball = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        map: waterBaseColor,
        normalMap: waterNormalMap,
        displacementMap: waterHeightMap, displacementScale: 0.01,
        roughnessMap: waterRoughness, roughness: 0,
        aoMap: waterAmbientOcclusion
    }));
    ball.receiveShadow = true;
    ball.castShadow = true;
    // ball.position.set(0, 0, 0);

    group.add(ball);
    scene.add(group);

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    function render() {
        analyser.getByteFrequencyData(dataArray);

        var lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
        var upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

        var overallAvg = avg(dataArray);
        var lowerMax = max(lowerHalfArray);
        var lowerAvg = avg(lowerHalfArray);
        var upperMax = max(upperHalfArray);
        var upperAvg = avg(upperHalfArray);

        var lowerMaxFr = lowerMax / lowerHalfArray.length;
        var lowerAvgFr = lowerAvg / lowerHalfArray.length;
        var upperMaxFr = upperMax / upperHalfArray.length;
        var upperAvgFr = upperAvg / upperHalfArray.length;

        ball.rotation.x += 0.001;
        ball.rotation.y += 0.005;
        ball.rotation.z += 0.002;


        WarpBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));


        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };

    function WarpBall(mesh, bassFr, treFr) {
        mesh.geometry.vertices.forEach(function (vertex, i) {
            var offset = mesh.geometry.parameters.radius;
            var amp = 5;
            var time = window.performance.now();
            vertex.normalize();
            var rf = 0.00001;
            var distance = (offset + bassFr) + noise.noise3D(vertex.x + time * rf * 6, vertex.y + time * rf * 7, vertex.z + time * rf * 8) * amp * treFr;
            vertex.multiplyScalar(distance);
        });
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
    }

    render();
};

//helper functions
function fractionate(val, minVal, maxVal) {
    return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr) {
    var total = arr.reduce(function (sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr) {
    return arr.reduce(function (a, b) { return Math.max(a, b); })
}