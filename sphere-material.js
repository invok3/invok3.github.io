import * as THREE from 'three';

export default class SphereMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                time: { value: 0 },
                noiseScale: { value: 2.0 },
                noiseStrength: { value: 0.3 },
                pulseSpeed: { value: 2.0 },
                glowStrength: { value: 0.2 },
                color1: { value: new THREE.Color(0x00ffff) },  // Cyan
                color2: { value: new THREE.Color(0x87ceeb) },  // Light blue
                opacity: { value: 0.9 }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        this.vertexShader = null;
        this.fragmentShader = null;
    }

    async loadShaders() {
        try {
            const [vertResponse, fragResponse] = await Promise.all([
                fetch('sphere.vert'),
                fetch('sphere.frag')
            ]);
            
            this.vertexShader = await vertResponse.text();
            this.fragmentShader = await fragResponse.text();
            
            return true;
        } catch (error) {
            console.error('Error loading shaders:', error);
            return false;
        }
    }

    update(deltaTime) {
        this.uniforms.time.value += deltaTime;
    }

    // Setter methods for easy property adjustment
    setNoiseScale(scale) {
        this.uniforms.noiseScale.value = scale;
    }

    setNoiseStrength(strength) {
        this.uniforms.noiseStrength.value = strength;
    }

    setPulseSpeed(speed) {
        this.uniforms.pulseSpeed.value = speed;
    }

    setGlowStrength(strength) {
        this.uniforms.glowStrength.value = strength;
    }

    setColors(color1, color2) {
        this.uniforms.color1.value.set(color1);
        this.uniforms.color2.value.set(color2);
    }

    setOpacity(opacity) {
        this.uniforms.opacity.value = opacity;
    }
} 