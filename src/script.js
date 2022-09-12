import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import gsap from 'gsap';

/**
 *  Dat gui
 */

// const gui = new GUI();
/**
 *  Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar');
const loadingManager = new THREE.LoadingManager(
    //loaded
    () => {
        gsap.delayedCall(0.5, () => {
            gsap.to(overlay.material.uniforms.uAlpha, {duration: 3, value: 0});
            
            loadingBarElement.classList.add('ended');
            loadingBarElement.style.transform = '';
            window.setTimeout(() => {
                scene.remove(overlay);

            }, 2400);
        })
    }, 
    //progress
    (itemUrl, itemsLoaded, itemsTotal) => {

        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `ScaleX(${progressRatio})`
    }
);

const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 *  Overlay
 */
const overlay = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    new THREE.ShaderMaterial({
        transparent: true,
        wireframe: false,
        side: THREE.DoubleSide,
        uniforms: {
            uAlpha: {value: 1}
        },
        vertexShader: `
            void main()
            {
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
        uniform float uAlpha; 
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
        `
        
    })
);

scene.add(overlay);
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Update effect composer
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    effectComposer.setSize(sizes.height, sizes.height);
})
// mouse move 

let mouse = {
	x: 0,
	y: 0
};
window.addEventListener(
    'mousemove', 
    (event) => {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        let dir = vector.sub(camera.position).normalize();
        let distance = (-camera.position.z / dir.z) + 0.35;
        let pos = camera.position.clone().add(dir.multiplyScalar(distance));
        pointLight_1.position.copy(pos);

        
        if(head_temp.head) {
            head_temp.head.lookAt(new THREE.Vector3( pos.x, -1000 , 0));
        }

        sphere.position.copy(pos)

    },
    false
);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-0.29, 0.3, 0.85)

scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
/**
 *  Lights 
 */
// Spot light 
const spotLight = new THREE.SpotLight(0xffffff, 10);   
spotLight.target.position.set(1.35,-0.25, -0.43);
spotLight.position.set( -2, 2, 1 );
spotLight.intensity = 90
spotLight.angle = Math.PI / 65;
spotLight.penumbra = 1;
spotLight.decay = 0.4;
spotLight.distance = 3.9;
scene.add(spotLight, spotLight.target);

//// Spot light helper 
const spotLightHelper = new THREE.SpotLightHelper(spotLight);

// scene.add(spotLightHelper)

window.requestAnimationFrame(() => {
    spotLightHelper.update()
})

//ambiant light 
const ambiantLight = new THREE.AmbientLight();
ambiantLight.intensity = 2
// scene.add(ambiantLight);

// Point light 
const pointLight_1 = new THREE.PointLight(10);
pointLight_1.color = new THREE.Color('#ffffff')
pointLight_1.position.set(0, 0, 1)
scene.add(pointLight_1);

const pointLight_2 = new THREE.PointLight();
pointLight_2.intensity = 0.7
pointLight_2.color = new THREE.Color('#ffffff')
pointLight_2.position.set(0, 1, 0)
scene.add(pointLight_2);

const pointLight_3 = new THREE.PointLight();
pointLight_3.color = new THREE.Color('#ff0000');
pointLight_3.intensity = 1;
pointLight_3.position.set(0.36, 0.36, -0.25)

scene.add(pointLight_3)

//// Point light helper 
const pointLightHelper_1 = new THREE.PointLightHelper(pointLight_1, 0.01) ;
// scene.add(pointLightHelper_1);

const pointLightHelper_3 = new THREE.PointLightHelper(pointLight_3, 0.1);
// scene.add(pointLightHelper_3); 

/**
 * Floor
 */

// Floor instantiation 
let gMGeo = new THREE.PlaneBufferGeometry(50, 50, 1, 1)
let groundMirror= new Reflector(gMGeo, {
    // clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 'black',
    recursion: 1,
    encoding: THREE.sRGBEncoding,
})
groundMirror.position.set(0, -0.25, -1)
groundMirror.rotation.x = THREE.MathUtils.degToRad(-90);

scene.add(groundMirror);

/**
 *  Models
 */

let head_temp = {};
gltfLoader.load(
    '/lego23.glb',
    (gltf) => {
        // console.log(lightSaber_temp.saber);

        head_temp.head = gltf.scene.getObjectByName('UniqueID_25');
        gltf.scene.position.set(0,-0.25, -0.25);
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        gltf.scene.children[0].material = new THREE.MeshBasicMaterial({
            color:0xff0000
        })
        for(let i = 0; i < gltf.scene.children.length; i++) {
            gltf.scene.children[i].rotation.z += Math.PI * 0.15;
        }
        console.log(gltf.scene)
        scene.add(gltf.scene);
    }
 );
console.log(head_temp.head);

 /**
  * Stars 
  */
const starsTexture = textureLoader.load('/1.png');
const starsGeometry = new THREE.BufferGeometry();
const count = 2000;

const position = new Float32Array(3 * count);

for(let i = 0; i < count; i++) {
    position[i] = (Math.random() - 0.5) * 30;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
// Material
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    sizeAttenuation: true,
    side: THREE.DoubleSide
});
starsMaterial.transparent = true;
starsMaterial.alphaMap = starsTexture;
starsMaterial.alphaTest = 0.01; 
starsMaterial.depthTest = true;
starsMaterial.depthWrite = false;   
// starsMaterial.vertexColors = true;

// Points
const stars = new THREE.Points(starsGeometry, starsMaterial);
stars.position.x += 3;
scene.add(stars);

/**
 *  Sphere-lighter 
 */
 
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(), 
    new THREE.MeshBasicMaterial({
        color: 0xffffff,
    })
)
sphere.position.copy(pointLight_1.position)
sphere.scale.set(0.01, 0.01, 0.01)

scene.add(sphere)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post processing 
 */
// render target 
const renderTarget = new THREE.WebGLMultisampleRenderTarget(
    1366,
    768,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format:THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
)
 const effectComposer = new EffectComposer(renderer, renderTarget);


 const renderPass = new RenderPass(scene, camera);
 effectComposer.addPass(renderPass);
 /**
  *  Bloom 
  */
 const bloomPass = new UnrealBloomPass();
 bloomPass.sthrength = 0.;
 bloomPass.radius  = 0.3;
 bloomPass.threshold = 0.5;
 bloomPass.enabled = true;

 effectComposer.addPass(bloomPass);

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime
    // Rotate head 

    // Update camera 
    camera.position.x += ( mouse.x / 12 - camera.position.x ) * 0.05;
    camera.lookAt(0, 0.25, -0.25);

    // Update controls
    // controls.update()
    // Render
    // renderer.render(scene, camera)
    effectComposer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 *  Debug 
 */

// CameraDB
const cameraFolder = gui.addFolder('Camera');
cameraFolder.close();

//// Position
const cameraPositionFolder = cameraFolder.addFolder('Position')
cameraPositionFolder.add(camera.position, 'x', -10, 10)
    .onChange((val) => 
    {
        camera.position.x = val;
    })
    .name('CameraX');

cameraPositionFolder.add(camera.position, 'y', -10, 10)
    .onChange((val) =>
    {
        camera.position.y = val
    })
    .name('CameraY');

cameraPositionFolder.add(camera.position, 'z', -10, 10)
    .onChange((val) =>
    {
        camera.position.y = val
    })
    .name('CameraZ');

// LightsDB
const lightsFolder = gui.addFolder('Lights');
lightsFolder.close();

//// Point light 1
const poinlight_1_Folder = lightsFolder.addFolder('PL1');

////// Intensity 
poinlight_1_Folder.add(pointLight_1, 'intensity', 0, 5)
    .onChange((val) => 
    {
        pointLight_1.intensity = val;
    })
    .name('Intensity');

//// Point light 2
const poinlight_2_Folder = lightsFolder.addFolder('PL2');

////// Position
const poinlight_2_positionFolder = poinlight_2_Folder.addFolder('Position')

poinlight_2_positionFolder.add(pointLight_2.position, 'x', -10, 10)
    .onChange((val) => 
    {
        pointLight_2.position.x = val;
    })
    .name('PL2X');
poinlight_2_positionFolder.add(pointLight_2.position, 'y', -10, 10)
    .onChange((val) =>
    {
        pointLight_2.position.y = val
    })
    .name('PL2Y');

poinlight_2_positionFolder.add(pointLight_2.position, 'z', -10, 10)
    .onChange((val) =>
    {
        pointLight_2.position.y = val
    })
    .name('PL2Z');

////// Intesity
const pointlight_2_inensity = poinlight_2_Folder.addFolder('Intensity');
pointlight_2_inensity.close()

pointlight_2_inensity.add(pointLight_2, 'intensity', 0, 5)
    .onChange((val) => 
    {
        pointLight_2.intensity = val;
    })
    .name('PL2 intensity');

//// Point light 3
const pointlight_3_Folder = lightsFolder.addFolder('PL3');
pointlight_3_Folder.close();

////// Position 
const pointlight_3_positionFolder = pointlight_3_Folder.addFolder('Position');
pointlight_3_positionFolder.close();

pointlight_3_positionFolder.add(pointLight_3.position, 'x', -10, 10)
    .onChange((val) => 
    {
        pointLight_3.position.x = val;
    })
    .name('PL3X');

pointlight_3_positionFolder.add(pointLight_3.position, 'y', -10, 10)
    .onChange((val) =>
    {
        pointLight_3.position.y = val
    })
    .name('PL3Y');

pointlight_3_positionFolder.add(pointLight_3.position, 'z', -10, 10)
    .onChange((val) =>
    {
        pointLight_3.position.y = val
    })
    .name('PL3Z');

////// Intensity
const pointlight_3_intensityFolder = pointlight_3_Folder.addFolder('Intensity');
pointlight_3_intensityFolder.close();

pointlight_3_intensityFolder.add(pointLight_3, 'intensity', 0, 3)
    .onChange((val) =>
    {
        pointLight_3.intensity = val
    })
    .name('PL3 intensity');



