varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float time;
uniform float pulseSpeed;
uniform float glowStrength;
uniform vec3 color1;
uniform vec3 color2;
uniform float opacity;

void main() {
    // Create a gradient based on position and normal
    float fresnel = pow(1.0 + dot(normalize(vPosition), normalize(vNormal)), 2.0);
    vec3 finalColor = mix(color1, color2, fresnel);
    
    // Add configurable pulsing glow
    float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
    finalColor *= 1.0 + pulse * glowStrength;
    
    gl_FragColor = vec4(finalColor, opacity);
} 