// Scene setup with fog for depth
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.035);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('threejs-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x00ffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);

// Particle system
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 50;
    positions[i + 1] = (Math.random() - 0.5) * 50;
    positions[i + 2] = (Math.random() - 0.5) * 50;
    
    // Add some color variation between primary and secondary colors
    colors[i] = 0;     // R
    colors[i + 1] = Math.random();  // G (varies between 0 and 1)
    colors[i + 2] = 1;  // B
    
    // Vary the particle sizes
    sizes[i/3] = Math.random() * 0.1 + 0.02;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Floating code fragments
const codeFragments = [];
const fragmentCount = 5;
const textLoader = new THREE.TextureLoader();

// Code snippet textures (we'll create these images later)
const codeSnippets = [
    'code-java.png',
    'code-kotlin.png',
    'code-dart.png',
    'code-flutter.png',
    'code-android.png'
];

for (let i = 0; i < fragmentCount; i++) {
    const geometry = new THREE.PlaneGeometry(3, 2);
    const material = new THREE.MeshPhongMaterial({
        map: textLoader.load(codeSnippets[i]),
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        emissive: 0x00ffff,
        emissiveIntensity: 0.2
    });
    
    const fragment = new THREE.Mesh(geometry, material);
    fragment.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
    );
    fragment.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    scene.add(fragment);
    codeFragments.push({
        mesh: fragment,
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: Math.random() * 0.005 + 0.002,
        initialY: fragment.position.y
    });
}

// Camera position and controls
camera.position.z = 15;
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
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001; // Current time in seconds

    // Smooth camera movement
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate and float code fragments with improved motion
    codeFragments.forEach((fragment, i) => {
        fragment.mesh.rotation.x += fragment.rotationSpeed.x;
        fragment.mesh.rotation.y += fragment.rotationSpeed.y;
        fragment.mesh.rotation.z += fragment.rotationSpeed.z;
        
        // More natural floating animation with multiple sine waves
        const floatY = Math.sin(time * fragment.floatSpeed) * 0.5 + 
                      Math.sin(time * fragment.floatSpeed * 1.5) * 0.2;
        fragment.mesh.position.y = fragment.initialY + floatY;
        
        // Add subtle horizontal motion
        fragment.mesh.position.x += Math.sin(time * fragment.floatSpeed * 0.5) * 0.01;
    });

    // Animate particles
    const positions = particleSystem.geometry.attributes.position.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    
    for(let i = 0; i < particleCount; i++) {
        // Pulsing size effect
        sizes[i] = (Math.sin(time * 2 + i) * 0.05 + 0.1) * sizes[i];
        
        // Subtle spiral motion
        const idx = i * 3;
        const radius = Math.sqrt(positions[idx]**2 + positions[idx+2]**2);
        const theta = Math.atan2(positions[idx+2], positions[idx]) + 0.0001;
        
        positions[idx] = radius * Math.cos(theta);
        positions[idx+2] = radius * Math.sin(theta);
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
    particleSystem.rotation.y += 0.0002;
    
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

// Start animation
animate(); 