import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_hover;

varying vec2 vUv;

// Smooth minimum for SDF blob merging
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// 2D Circle SDF
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;

    // Normalize coordinates from -1 to 1, correcting for aspect ratio
    vec2 p = (vUv - 0.5) * 2.0;
    p.x *= aspect;

    // Spread the blobs across the entire width of the button
    vec2 pos1 = vec2(sin(u_time * 0.4) * (aspect * 0.4) - (aspect * 0.2), cos(u_time * 0.3) * 0.3);
    vec2 pos2 = vec2(cos(u_time * 0.3) * (aspect * 0.4) + (aspect * 0.2), sin(u_time * 0.4) * 0.2);
    vec2 pos3 = vec2(sin(u_time * 0.5) * (aspect * 0.5), cos(u_time * 0.6) * 0.4);

    // Radii made massive to create thick fluid
    float r1 = 0.9;
    float r2 = 0.8;
    float r3 = 1.0;
    
    // Core cursor tracking blob
    // Interpolate mouse blob size based on hover state
    float r4 = mix(0.0, 1.4, u_hover); 
    // Add smooth organic lag to mouse position based on time vs mouse
    vec2 mouseSDF = u_mouse;
    
    // Calculate SDFs
    float d1 = sdCircle(p - pos1, r1);
    float d2 = sdCircle(p - pos2, r2);
    float d3 = sdCircle(p - pos3, r3);
    float d4 = sdCircle(p - mouseSDF, r4);

    // Merge them mathematically using smin
    // A larger k value (e.g. 0.8) yields a thicker "viscous" liquid bridge
    float k = 0.6;
    float d = smin(d1, d2, k);
    d = smin(d, d3, k);
    d = smin(d, d4, k);

    // Generate crisp antialiased mask
    float aa = 3.0 / u_resolution.y; // Anti-aliasing threshold
    float alpha = smoothstep(aa, -aa, d);

    // Colors
    vec3 bgColor = vec3(0.05, 0.05, 0.06); /* slightly lighter dark background */
    
    // Vibrant brand red #ff2a40
    vec3 blobColor = vec3(1.0, 0.165, 0.25);
    
    // Inner depth glow (makes it look 3D and liquidy)
    float innerGlow = smoothstep(-0.2, -0.8, d);
    vec3 finalColor = mix(blobColor, vec3(0.6, 0.05, 0.15), innerGlow); // Dark rich blood red at the core

    vec3 col = mix(bgColor, finalColor, alpha);

    gl_FragColor = vec4(col, 1.0);
}
`;

export function initButtonGL() {
    console.log("Initializing WebGL Gooey Button...");
    const canvas = document.getElementById('btn-gl-canvas');
    if (!canvas) {
        console.error("WebGL Button Canvas not found!");
        return;
    }
    
    const wrapper = document.getElementById('gooey-btn');

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    
    // Use Orthographic camera since we are rendering a pure 2D shader
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_mouse: { value: new THREE.Vector2() },
        u_hover: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthWrite: false,
        depthTest: false,
        transparent: true
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Track mouse on the button wrapper
    let targetMouse = new THREE.Vector2();
    let currentMouse = new THREE.Vector2();
    let isHovering = false;
    let hoverValue = 0;

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        // Calculate X and Y from -1 to 1 based on button element
        let nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        let ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Correct for aspect ratio so the cursor blob feels 1:1 round and follows physical mouse exactly
        let aspect = rect.width / rect.height;
        nx *= aspect;
        
        targetMouse.set(nx, ny);
    });

    wrapper.addEventListener('mouseenter', () => isHovering = true);
    wrapper.addEventListener('mouseleave', () => isHovering = false);

    function resize() {
        const rect = wrapper.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        uniforms.u_resolution.value.set(rect.width, rect.height);
    }

    window.addEventListener('resize', resize);
    resize();

    // The render loop specifically for the button
    const clock = new THREE.Clock();

    function renderLoop() {
        requestAnimationFrame(renderLoop);
        
        const delta = clock.getDelta();
        uniforms.u_time.value = performance.now() * 0.001;
        
        // Smooth lerp mouse position and hover state
        currentMouse.lerp(targetMouse, 8.0 * delta);
        uniforms.u_mouse.value.copy(currentMouse);
        
        // Lerp hover value for smooth entry/exit of the cursor blob
        hoverValue = THREE.MathUtils.lerp(hoverValue, isHovering ? 1.0 : 0.0, 10.0 * delta);
        uniforms.u_hover.value = hoverValue;

        renderer.render(scene, camera);
    }
    
    renderLoop();
}
