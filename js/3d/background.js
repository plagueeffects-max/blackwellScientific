import * as THREE from 'three';

export const bgScene = new THREE.Scene();
export const bgCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
export const backgroundLayers = [];
let bgRenderer, fgRenderer;
export const fgScene = new THREE.Scene();

// Groups for the tilting galaxy of dust
export const particleGroup = new THREE.Group();
export const fgParticleGroup = new THREE.Group();

export function initBackground() {
    const bgCanvasContainer = document.createElement('div');
    bgCanvasContainer.id = 'bg-canvas-container';
    bgCanvasContainer.style.position = 'fixed';
    bgCanvasContainer.style.top = '0';
    bgCanvasContainer.style.left = '0';
    bgCanvasContainer.style.width = '100%';
    bgCanvasContainer.style.height = '100%';
    bgCanvasContainer.style.zIndex = '-1';
    bgCanvasContainer.style.pointerEvents = 'none';
    document.body.insertBefore(bgCanvasContainer, document.body.firstChild);

    bgCamera.position.z = 35;
    bgRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgCanvasContainer.appendChild(bgRenderer.domElement);

    const fgCanvasContainer = document.createElement('div');
    fgCanvasContainer.id = 'fg-canvas-container';
    fgCanvasContainer.style.position = 'fixed';
    fgCanvasContainer.style.top = '0';
    fgCanvasContainer.style.left = '0';
    fgCanvasContainer.style.width = '100%';
    fgCanvasContainer.style.height = '100%';
    fgCanvasContainer.style.zIndex = '9999';
    fgCanvasContainer.style.pointerEvents = 'none';
    document.body.appendChild(fgCanvasContainer);

    fgRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    fgRenderer.setSize(window.innerWidth, window.innerHeight);
    fgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    fgCanvasContainer.appendChild(fgRenderer.domElement);

    bgScene.add(particleGroup);
    fgScene.add(fgParticleGroup);

    // --- STREAMLINED PARTICLE SHADER ---
    function createParticleMaterial(colorHex, isBokeh) {
        return new THREE.ShaderMaterial({
            uniforms: { 
                uColor: { value: new THREE.Color(colorHex) }
            },
            vertexShader: `
                attribute float baseSize; 
                attribute float aOpacity;
                
                varying float vOpacity; 
                varying float vSize; 
                varying float vIsBokeh;
                
                void main() {
                    vOpacity = aOpacity; 
                    vIsBokeh = ${isBokeh ? '1.0' : '0.0'};
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    float finalSize = baseSize * (50.0 / -mvPosition.z);
                    vSize = finalSize; 
                    gl_PointSize = finalSize; 
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor; 
                
                varying float vOpacity; 
                varying float vSize; 
                varying float vIsBokeh;
                
                void main() {
                    vec2 pt = gl_PointCoord * 2.0 - 1.0; 

                    float r = length(pt); 
                    if (r > 1.0) discard;
                    
                    float alpha; 
                    float brightness = 1.0;
                    
                    if (vIsBokeh > 0.5) {
                        float ringThreshold = clamp(1.8 / vSize, 0.02, 0.4);
                        alpha = smoothstep(1.0, 1.0 - ringThreshold, r);
                        brightness = mix(1.0, 1.4, smoothstep(0.65, 1.0, r));
                    } else { 
                        alpha = smoothstep(1.0, 0.7, r); 
                    }

                    gl_FragColor = vec4(uColor * brightness, alpha * vOpacity);
                }
            `,
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
        });
    }

    function addLayer(count, sizeBase, zRange, colorHex, opacity, speedX, speedY, isBokeh) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const opacities = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i*3] = (Math.random() - 0.4) * 110;     
            positions[i*3+1] = (Math.random() - 0.5) * 110;   
            positions[i*3+2] = zRange[0] + Math.random() * (zRange[1] - zRange[0]); 
            sizes[i] = sizeBase * (0.8 + Math.random() * 0.4);
            opacities[i] = opacity * (0.5 + Math.random() * 0.5);
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('baseSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
        
        const skyPoints = new THREE.Points(geometry, createParticleMaterial(colorHex, isBokeh));
        
        if (isBokeh) {
            fgParticleGroup.add(skyPoints);
        } else {
            particleGroup.add(skyPoints); 
        } 

        backgroundLayers.push({ points: skyPoints, speedX, speedY });
    }

    addLayer(4500, 1.4, [-60, -10], '#ffffff', 0.2, -0.003, 0.002, false);
    addLayer(1500, 1.6, [-60, -10], '#ff2d3a', 0.12, -0.002, 0.001, false);
    addLayer(2000, 2.0, [-20, 20], '#ffffff', 0.35, -0.006, 0.004, false);
    addLayer(600, 2.2, [-20, 20], '#ff2d3a', 0.25, -0.005, 0.003, false);
    addLayer(300, 6.5, [15, 35], '#ffffff', 0.10, -0.015, 0.008, true);
    addLayer(150, 8.5, [15, 35], '#ff1a25', 0.07, -0.012, 0.006, true);
}

function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

export function updateBackground(time, currentS, bgMouseX, bgMouseY) {
    particleGroup.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.15, currentS); 
    particleGroup.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 0.6, ease(currentS)); 
    particleGroup.rotation.z = Math.sin(currentS * Math.PI) * 0.2; 
    
    fgParticleGroup.rotation.x = particleGroup.rotation.x;
    fgParticleGroup.rotation.y = particleGroup.rotation.y;
    fgParticleGroup.rotation.z = particleGroup.rotation.z; 

    bgCamera.position.x += ((bgMouseX * 10) - bgCamera.position.x) * 0.05;
    bgCamera.position.y += ((-bgMouseY * 10) - bgCamera.position.y) * 0.05;
    bgCamera.position.z += ((35 - (ease(currentS) * 22)) - bgCamera.position.z) * 0.05;
    bgCamera.lookAt(0, 0, 0);

    backgroundLayers.forEach((layer, index) => {
        const pos = layer.points.geometry.attributes.position.array;
        const depthDrift = Math.sin(time * 0.0002 + index) * 0.02;
        for(let i = 0; i < pos.length; i += 3) {
            pos[i] += layer.speedX; pos[i+1] += layer.speedY; pos[i+2] += depthDrift; 
            if (pos[i] < -65) pos[i] = 65; else if (pos[i] > 65) pos[i] = -65; 
            if (pos[i+1] > 55) pos[i+1] = -55; else if (pos[i+1] < -55) pos[i+1] = 55;
            if (pos[i+2] > 45) pos[i+2] = -65; else if (pos[i+2] < -65) pos[i+2] = 45;
        }
        layer.points.geometry.attributes.position.needsUpdate = true;
    });

    bgRenderer.render(bgScene, bgCamera);
    fgRenderer.render(fgScene, bgCamera);
}

export function resizeBackground() {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    fgRenderer.setSize(window.innerWidth, window.innerHeight);
}