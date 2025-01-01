import * as THREE from 'three';
import SphereMaterial from './sphere-material.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('threejs-container').appendChild(renderer.domElement);

let sphere, sphereMaterial;

async function initScene() {
    // Create and load the material
    sphereMaterial = new SphereMaterial();
    const loaded = await sphereMaterial.loadShaders();
    if (!loaded) return;

    // Create the sphere
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    sphere = new THREE.Mesh(geometry, sphereMaterial);
    scene.add(sphere);

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x00ffff, 0.1);
    scene.add(ambientLight);

    // Start animation
    animate();
}

// Camera position and controls
camera.position.z = 5;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

// Mouse movement handler
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
});

// Animation loop
let lastTime = 0;
function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    // Calculate delta time
    const deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;

    // Update material
    sphereMaterial.update(deltaTime);

    // Smooth camera movement
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate sphere slowly
    sphere.rotation.y += 0.001;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Start the scene
initScene(); 