import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

// WebSocket Connection
const socket = new WebSocket("ws://localhost:1001/ws");

socket.onopen = () => {
  console.log("Connected to WebSocket server");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received message from server:", data);

  if (data.type === "backgroundColor") {
    // Update background color in scene and GUI
    scene.background = new THREE.Color(data.value);
    gui.__controllers[0].setValue(data.value); // Update GUI
  }

  if (data.type === "cameraPosition") {
    // Update camera position
    camera.position.set(data.x, data.y, data.z);
    orbit.update();
  }
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
};

// Three.js Setup
const renderer = new THREE.WebGLRenderer({
    // antialias: true,
    // alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2f2f2f);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-10, 30, 30);

// Light setup
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
directionalLight.position.set(-30, 20, 0);
directionalLight.castShadow = true;

// Orbit controls setup
const orbit = new OrbitControls(camera, renderer.domElement);

// Axis helper
const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);

// Create box
const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
const boxMaterial = new THREE.MeshStandardMaterial({
  color: 0x00eeee,
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);
box.position.y = 5;
box.castShadow = true;
box.receiveShadow = true;

// Plane setup
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.ShadowMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  opacity: 0.5,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

// Grid helper setup
const size = 100;
const divisions = 100;
const colorCenterLine = 0x888888;
const colorGrid = 0x444444;
const gridHelper = new THREE.GridHelper(
  size,
  divisions,
  colorCenterLine,
  colorGrid
);
scene.add(gridHelper);

// dat.GUI Setup
const gui = new dat.GUI();
const params = {
  backgroundColor: "#2f2f2f", // Initial color as hex
};

gui
  .addColor(params, "backgroundColor")
  .name("Background Color")
  .onChange((value) => {
    scene.background = new THREE.Color(value); // Update background color dynamically
    // Send background color change to the server
    socket.send(JSON.stringify({ type: "backgroundColor", value }));
  });

// Listen for camera movement and broadcast it to other clients
orbit.addEventListener("change", () => {
  const { x, y, z } = camera.position;
  socket.send(JSON.stringify({ type: "cameraPosition", x, y, z }));
});

// Animation loop
function animate() {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
