import * as THREE from "three";

import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";
import vertexHead from "./shaders/vertex_head.glsl";
import vertexProject from "./shaders/vertex_project.glsl";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Lights
scene.add(new THREE.HemisphereLight(0x9f9f9f, 0xffffff, 1));
scene.add(new THREE.AmbientLight(0xffffff, 1));

const dirLight1 = new THREE.DirectionalLight(0x909090, 1);
dirLight1.position.set(-1, 0.5, 1);
dirLight1.position.multiplyScalar(10);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 4);
dirLight2.position.set(1, 0.5, 1);
dirLight2.position.multiplyScalar(10);

dirLight2.castShadow = true;
dirLight2.shadow.camera.left = -10;
dirLight2.shadow.camera.right = 10;
dirLight2.shadow.camera.top = 10;
dirLight2.shadow.camera.bottom = -10;
dirLight2.shadow.camera.far = 40;

dirLight2.shadow.mapSize.width = 2048;
dirLight2.shadow.mapSize.height = 2048;
scene.add(dirLight2);

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  cameraSize: 4,
};
sizes.aspectRatio = sizes.width / sizes.height;

// Resize
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.aspectRatio = sizes.width / sizes.height;

  // Update camera
  //   camera.aspect = sizes.width / sizes.height;
  camera.left = -sizes.cameraSize * sizes.aspectRatio;
  camera.right = sizes.cameraSize * sizes.aspectRatio;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.OrthographicCamera(
  -sizes.cameraSize * sizes.aspectRatio,
  sizes.cameraSize * sizes.aspectRatio,
  sizes.cameraSize,
  -sizes.cameraSize,
  0.1,
  100
);
camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 10;
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Grid
 */

const gridParams = {
  grid: 55,
  size: 0.5,
};
gridParams.gridSize = gridParams.grid * gridParams.size;

const uniforms = {
  uTime: new THREE.Uniform(0),
  uPos0: new THREE.Uniform(new THREE.Vector2()),
  uPos1: new THREE.Uniform(new THREE.Vector2()),
  uAnimate: new THREE.Uniform(0),
  uConfig: new THREE.Uniform(new THREE.Vector4(0, 0, 1)),
};

const geometry = new RoundedBoxGeometry(
  gridParams.size,
  gridParams.size,
  gridParams.size
);

const material = new THREE.MeshPhysicalMaterial({
  color: "#666",
  metalness: 0.5,
  roughness: 0.0,
});
const mesh = new THREE.InstancedMesh(
  geometry,
  material,
  gridParams.grid * gridParams.grid
);

mesh.castShadow = true;
mesh.receiveShadow = true;

const totalColor = material.color.r + material.color.g + material.color.b;
const color = new THREE.Vector3();
const weights = new THREE.Vector3();
weights.x = material.color.r;
weights.y = material.color.g;
weights.z = material.color.b;
weights.divideScalar(totalColor);
weights.multiplyScalar(-0.5);
weights.addScalar(1);

const dummy = new THREE.Object3D();

let i = 0;
for (let x = 0; x < gridParams.grid; x++)
  for (let y = 0; y < gridParams.grid; y++) {
    dummy.position.set(
      x * gridParams.size - gridParams.gridSize / 2 + gridParams.size / 2,
      0,
      y * gridParams.size - gridParams.gridSize / 2 + gridParams.size / 2
    );

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    const center = 1 - dummy.position.length() * 0.12 * 1;
    color.set(
      center * weights.x + (1 - weights.x),
      center * weights.y + (1 - weights.y),
      center * weights.z + (1 - weights.z)
    );
    mesh.setColorAt(i, color);

    i++;
  }

mesh.material.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    vertexHead
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <project_vertex>",
    vertexProject
  );
  shader.uniforms = {
    ...shader.uniforms,
    ...uniforms,
  };
};

mesh.customDepthMaterial = new THREE.MeshDepthMaterial();
mesh.customDepthMaterial.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    vertexHead
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <project_vertex>",
    vertexProject
  );
  shader.uniforms = {
    ...shader.uniforms,
    ...uniforms,
  };
};

mesh.customDepthMaterial.depthPacking = THREE.RGBADepthPacking;
scene.add(mesh);

const t1 = gsap.timeline();
t1.to(
  uniforms.uAnimate,
  {
    value: 1,
    duration: 3.0,
    ease: "none",
  },
  0.0
);

// Events
const hitplane = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial()
);
hitplane.scale.setScalar(20);
hitplane.rotation.x = -Math.PI / 2;
hitplane.updateMatrix();
hitplane.updateMatrixWorld();
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
const v2 = new THREE.Vector2();

window.addEventListener("mousemove", (ev) => {
  const x = ev.clientX / window.innerWidth - 0.5;
  const y = ev.clientY / window.innerHeight - 0.5;

  v2.x = x * 2;
  v2.y = -y * 2;
  raycaster.setFromCamera(v2, camera);

  const intersects = raycaster.intersectObject(hitplane);

  if (intersects.length > 0) {
    const first = intersects[0];
    mouse.x = first.point.x;
    mouse.y = first.point.z;
  }
});

/**
 * Animate
 */
const vel = new THREE.Vector2();
const clock = new THREE.Clock();

const v3 = new THREE.Vector2();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  uniforms.uTime.value = elapsedTime;

  v3.copy(mouse);
  v3.sub(uniforms.uPos0.value);
  v3.multiplyScalar(0.08);
  uniforms.uPos0.value.add(v3);

  // Calculate the change/velocity
  v3.copy(uniforms.uPos0.value);
  v3.sub(uniforms.uPos1.value);
  v3.multiplyScalar(0.05);

  // Lerp the change as well
  v3.sub(vel);
  v3.multiplyScalar(0.05);
  vel.add(v3);

  // Add the lerped velocity
  uniforms.uPos1.value.add(vel);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
