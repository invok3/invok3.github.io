import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('threejs-container').appendChild(renderer.domElement);

// Neural network parameters
const NODES_COUNT = 50;
const MAX_CONNECTIONS = 3;  // Maximum connections per node
const NETWORK_SIZE = 10;
const EXPLOSION_FORCE = 50;
const MOUSE_INFLUENCE_RADIUS = NETWORK_SIZE * 0.3;  // Reduced mouse influence radius
const MOUSE_FORCE = 0.8;

let nodes = [];
let connections = [];
let mousePosition = new THREE.Vector3();
let isExploding = false;
let explosionTime = 0;

function createNode() {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const node = new THREE.Mesh(geometry, material);
    
    // Random position within a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = NETWORK_SIZE * Math.cbrt(Math.random());
    
    node.position.x = r * Math.sin(phi) * Math.cos(theta);
    node.position.y = r * Math.sin(phi) * Math.sin(theta);
    node.position.z = r * Math.cos(phi);
    
    // Store initial position
    node.userData.initialPosition = node.position.clone();
    node.userData.velocity = new THREE.Vector3();
    node.userData.pulsePhase = Math.random() * Math.PI * 2;
    node.userData.baseScale = 1 + Math.random() * 0.5;
    
    return node;
}

function createConnection(node1, node2) {
    const points = [node1.position, node2.position];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2,
        linewidth: 1
    });
    const line = new THREE.Line(geometry, material);
    line.userData.pulsePhase = Math.random() * Math.PI * 2; // Random phase for pulsing
    return line;
}

function initNetwork() {
    // Create nodes
    for (let i = 0; i < NODES_COUNT; i++) {
        const node = createNode();
        nodes.push(node);
        scene.add(node);
    }
    
    // Initialize connection count map
    const connectionCounts = new Map(nodes.map(node => [node, 0]));
    
    // Create random connections
    // Shuffle nodes array copy for random distribution
    const shuffledNodes = [...nodes];
    for(let i = shuffledNodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledNodes[i], shuffledNodes[j]] = [shuffledNodes[j], shuffledNodes[i]];
    }
    
    shuffledNodes.forEach(node => {
        // Skip if node already has max connections
        if (connectionCounts.get(node) >= MAX_CONNECTIONS) return;
        
        // Get available nodes
        const availableNodes = shuffledNodes.filter(n => 
            n !== node && 
            connectionCounts.get(n) < MAX_CONNECTIONS &&
            !connections.some(c => 
                (c.node1 === node && c.node2 === n) ||
                (c.node1 === n && c.node2 === node)
            )
        );
        
        // Create random number of connections (1 to remaining available)
        const remainingConnections = MAX_CONNECTIONS - connectionCounts.get(node);
        const possibleConnections = Math.min(remainingConnections, availableNodes.length);
        const numConnections = Math.max(1, Math.floor(Math.random() * possibleConnections));
        
        // Create connections
        for(let i = 0; i < numConnections && i < availableNodes.length; i++) {
            const targetNode = availableNodes[i];
            const connection = createConnection(node, targetNode);
            
            connections.push({
                line: connection,
                node1: node,
                node2: targetNode
            });
            scene.add(connection);
            
            // Update connection counts
            connectionCounts.set(node, connectionCounts.get(node) + 1);
            connectionCounts.set(targetNode, connectionCounts.get(targetNode) + 1);
        }
    });
}

function explodeNodes() {
    isExploding = true;
    explosionTime = 0;
    
    nodes.forEach(node => {
        // Calculate direction from click position
        const direction = node.position.clone()
            .sub(mousePosition)
            .normalize();
            
        // Add more random variation
        direction.x += (Math.random() - 0.5) * 3;
        direction.y += (Math.random() - 0.5) * 3;
        direction.z += (Math.random() - 0.5) * 3;
        direction.normalize();
        
        // Set explosive velocity with distance-based force
        const distance = node.position.distanceTo(mousePosition);
        const force = Math.max(0.5, 1 - distance / (NETWORK_SIZE * 2)) * EXPLOSION_FORCE;
        node.userData.velocity.copy(direction.multiplyScalar(force));
    });
}

function updateNodePositions(deltaTime) {
    const time = performance.now() * 0.001;
    
    if (isExploding) {
        explosionTime += deltaTime;
        if (explosionTime > 2) {
            isExploding = false;
        }
    }
    
    nodes.forEach(node => {
        if (!isExploding) {
            // Mouse influence only within radius
            const mouseDistance = node.position.distanceTo(mousePosition);
            if (mouseDistance < MOUSE_INFLUENCE_RADIUS) {
                const mouseInfluence = 1 - mouseDistance / MOUSE_INFLUENCE_RADIUS;
                const mouseForce = mousePosition.clone()
                    .sub(node.position)
                    .normalize()
                    .multiplyScalar(mouseInfluence * MOUSE_FORCE);
                node.userData.velocity.add(mouseForce);
            }
            
            // Return force to initial position
            const toInitial = node.userData.initialPosition.clone()
                .sub(node.position);
            const distanceToInitial = toInitial.length();
            const returnForce = toInitial.normalize()
                .multiplyScalar(distanceToInitial * 0.2);  // Stronger return force
            node.userData.velocity.add(returnForce.multiplyScalar(deltaTime));
            
        } else {
            // During explosion, add stronger return force to initial position
            const toInitial = node.userData.initialPosition.clone()
                .sub(node.position);
            const returnForce = toInitial.multiplyScalar(deltaTime * 0.5);
            node.userData.velocity.add(returnForce);
        }
        
        // Stronger damping during normal state, lighter during explosion
        const damping = isExploding ? 0.98 : 0.95;
        node.userData.velocity.multiplyScalar(damping);
        
        // Update position
        node.position.add(node.userData.velocity.clone().multiplyScalar(deltaTime));
        
        // Pulsing effect - more intense during explosion
        const pulseIntensity = isExploding ? 0.4 : 0.2;
        const pulseSpeed = isExploding ? 4 : 2;
        const pulse = Math.sin(time * pulseSpeed + node.userData.pulsePhase) * pulseIntensity + 1;
        const scale = node.userData.baseScale * pulse;
        node.scale.set(scale, scale, scale);
        
        // Update node color based on velocity
        const speed = node.userData.velocity.length();
        const speedColor = Math.min(1, speed / 5);
        node.material.color.setRGB(
            speedColor,  // More red with speed
            1.0,
            1.0
        );
        node.material.opacity = 0.8 + speedColor * 0.2;
    });
    
    // Update connections with more dramatic effects during explosion
    connections.forEach(conn => {
        const points = [conn.node1.position, conn.node2.position];
        conn.line.geometry.setFromPoints(points);
        
        const distance = conn.node1.position.distanceTo(conn.node2.position);
        const maxDistance = NETWORK_SIZE * (isExploding ? 4 : 0.5);  // Increased max distance during explosion
        const baseOpacity = Math.max(0.1, 0.3 * (1 - distance / maxDistance));  // Increased minimum opacity
        
        // More intense pulsing during explosion
        const pulseIntensity = isExploding ? 0.5 : 0.3;
        const pulseSpeed = isExploding ? 5 : 3;
        const pulse = Math.sin(time * pulseSpeed + conn.line.userData.pulsePhase) * pulseIntensity + 0.7;
        conn.line.material.opacity = baseOpacity * pulse;
        
        // Color based on stretch with less aggressive color change
        const stretch = Math.min(1, distance / (NETWORK_SIZE * 2));  // Smoother color transition
        conn.line.material.color.setRGB(
            0.5 + stretch * 0.5,  // Less aggressive red shift
            1.0 - stretch * 0.2,  // Maintain some cyan
            1.0 - stretch * 0.2   // Maintain some cyan
        );
    });
}

// Camera position
camera.position.z = NETWORK_SIZE * 2;

// Mouse movement handler
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(intersectPlane, mousePosition);
});

// Animation loop
let lastTime = 0;
function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    const deltaTime = Math.min((currentTime - lastTime) * 0.001, 0.1);
    lastTime = currentTime;
    
    updateNodePositions(deltaTime);
    
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

// Initialize and start animation
initNetwork();
animate();

// Add click handler
document.addEventListener('click', () => {
    if (!isExploding) {
        explodeNodes();
    }
}); 