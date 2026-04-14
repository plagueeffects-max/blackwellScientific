import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createReflectionMaterial, updateReflectionPosition } from './reflections.js';

export const scene = new THREE.Scene();
export let camera, renderer, shadowFloor;
export const mainGroup = new THREE.Group();
export const innerGroup = new THREE.Group();
export const reflectionGroup = new THREE.Group();
export const particles = [];

export function initForeground(container, canvas, hq) {
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000); 
    camera.position.set(0, 0, 55);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); 
    renderer.setSize(container.clientWidth, container.clientHeight); 
    renderer.setPixelRatio(hq.pixelRatio);
    const pmrem = new THREE.PMREMGenerator(renderer); 
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    
    const light = new THREE.DirectionalLight(0xffffff, 3.5); 
    light.position.set(30, 60, 40); 
    light.castShadow = hq.shadows; 
    scene.add(light); 
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.ShadowMaterial({ opacity: 0.15 })); 
    shadowFloor.rotation.x = -Math.PI/2; 
    shadowFloor.position.y = -38; 
    if (hq.shadows) scene.add(shadowFloor);
    
    mainGroup.add(innerGroup); 
    mainGroup.add(reflectionGroup); 
    scene.add(mainGroup);
    
    const sphereGeom = new THREE.SphereGeometry(0.24, 64, 64); 
    const cubeGeom = new RoundedBoxGeometry(0.42, 0.42, 0.42, 6, 0.06);

    // Original Materials
    const mats = [
        new THREE.MeshPhysicalMaterial({ color: 0xde2136, roughness: 0.1, metalness: 0.5, clearcoat: 1.0 }),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1, clearcoat: 1.0 }),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.0, transmission: 1.0, ior: 1.55, thickness: 2.0, clearcoat: 1.0, transparent: true })
    ];

    let pCount = 0;
    function createP(x, y, z) {
        const matRoll = Math.random(); 
        let mat = matRoll < 0.333 ? mats[0] : (matRoll < 0.666 ? mats[1] : mats[2]);
        const mesh = new THREE.Mesh(pCount % 4 === 1 || pCount % 4 === 2 ? cubeGeom : sphereGeom, mat); 
        mesh.scale.setScalar(Math.random() * 0.5 + 0.7); 
        innerGroup.add(mesh);

        const rMat = createReflectionMaterial(mat);
        const rMesh = new THREE.Mesh(mesh.geometry, rMat);
        rMesh.scale.copy(mesh.scale); 
        reflectionGroup.add(rMesh);

        particles.push({ 
            m: mesh, rM: rMesh, 
            p1: [x, y, z], p2: [0,0,0], p3: [0,0,0], 
            rs: [(Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01], 
            vp: [Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2], 
            vs: 0.001 + Math.random()*0.001 
        }); 
        pCount++;
    }
    
    // --- REFINED DNA STRUCTURE ---
    const baseRadius = 5.5, heightStep = 0.6, twistSpeed = 0.12, spacing = 0.55;
    const bundleOffsets = [[0, 0], [-spacing, 0], [spacing, 0], [0, spacing], [0, -spacing]].slice(0, hq.bundles);
    
    for (let i = 0; i < 120; i++) {
        const t = i * twistSpeed, baseY = (i - 60) * heightStep;
        
        // The twisted backbones
        bundleOffsets.forEach(([dR, dY]) => { 
            createP(Math.cos(t)*(baseRadius+dR), baseY+dY, Math.sin(t)*(baseRadius+dR)); 
            createP(Math.cos(t+Math.PI)*(baseRadius+dR), baseY+dY, Math.sin(t+Math.PI)*(baseRadius+dR)); 
        });
        
        // The refined base pairs (rungs) with a central gap
        if (i % 6 === 0) { 
            for (let k = 1; k < hq.rungs; k++) { 
                let progress = k / hq.rungs;
                
                // Creates a clean, professional gap in the center
                if (progress > 0.42 && progress < 0.58) continue; 
                
                createP(
                    THREE.MathUtils.lerp(Math.cos(t)*baseRadius, Math.cos(t+Math.PI)*baseRadius, progress), 
                    baseY, 
                    THREE.MathUtils.lerp(Math.sin(t)*baseRadius, Math.sin(t+Math.PI)*baseRadius, progress)
                ); 
            } 
        }
    }
    
    // --- MORPH TARGET CALCULATION ---
    const gSize = Math.ceil(Math.cbrt(particles.length)), gOff = (gSize * 1.8) / 2; 
    particles.forEach((p, i) => {
        // Target 2: Cube
        p.p2 = [(i % gSize)*1.8 - gOff + 0.9, (Math.floor(i/gSize)%gSize)*1.8 - gOff + 0.9, (Math.floor(i/(gSize*gSize)))*1.8 - gOff + 0.9];
        
        // Target 3: Location Cone/Swirl
        const torusCount = Math.floor(particles.length * 0.85), phi = Math.PI * (3 - Math.sqrt(5));
        if (i < torusCount) { 
            const u = i/torusCount, theta = u*Math.PI*50, angle = i*phi; 
            p.p3 = [(4.5+2*Math.cos(theta))*Math.cos(angle), (4.5+2*Math.cos(theta))*Math.sin(angle), 2*Math.sin(theta)]; 
        } else { 
            const u = (i-torusCount)/(particles.length-torusCount), taper = Math.pow(1-u, 0.85); 
            p.p3 = [Math.cos(i*phi)*(5.7*taper), THREE.MathUtils.lerp(-0.9, -9, u), Math.sin(i*phi)*(5.7*taper)*0.8]; 
        }
    });
}

function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

export function updateForeground(delta, time, currentS, isMobile, isTablet) {
    const p1 = currentS < 0.5, progress = p1 ? currentS * 2 : (currentS - 0.5) * 2, eased = ease(THREE.MathUtils.clamp(progress, 0, 1));
    const groupRotSpeed = p1 ? 0.4 : (1.0 - eased) * 0.4; 
    innerGroup.rotation.y += delta * groupRotSpeed;
    
    if (!p1) innerGroup.rotation.y = THREE.MathUtils.lerp(innerGroup.rotation.y, Math.round(innerGroup.rotation.y/(Math.PI*2))*(Math.PI*2), eased * 0.1);
    
    let verticalAlignment = -1.5, groupScale = 1.0;
    if (isMobile) verticalAlignment = 11.5; else if (isTablet) { groupScale = 0.65; verticalAlignment = -1.5; }
    
    mainGroup.scale.setScalar(groupScale); 
    mainGroup.position.y = (Math.sin(time * 0.001) * 0.5) + verticalAlignment;
    
    if (p1) { 
        mainGroup.rotation.z = THREE.MathUtils.lerp(Math.PI / 9, 0, eased); 
        mainGroup.rotation.x = THREE.MathUtils.lerp(Math.PI / 18, 0, eased); 
    } else { 
        mainGroup.rotation.z = 0; 
        mainGroup.rotation.x = 0; 
    }
    
    shadowFloor.position.y = (p1 ? THREE.MathUtils.lerp(-38, -14, eased) : THREE.MathUtils.lerp(-14, -10, eased)) + verticalAlignment;
    
    const localFloorYBase = (2 * shadowFloor.position.y - 2 * mainGroup.position.y) / groupScale;

    particles.forEach(p => {
        let t_pos = p1 
            ? [THREE.MathUtils.lerp(p.p1[0], p.p2[0], eased), THREE.MathUtils.lerp(p.p1[1], p.p2[1], eased), THREE.MathUtils.lerp(p.p1[2], p.p2[2], eased)] 
            : [THREE.MathUtils.lerp(p.p2[0], p.p3[0], eased), THREE.MathUtils.lerp(p.p2[1], p.p3[1], eased), THREE.MathUtils.lerp(p.p2[2], p.p3[2], eased)];
            
        const curX = t_pos[0] + Math.sin(time * p.vs + p.vp[0]) * 0.08;
        const curY = t_pos[1] + Math.sin(time * p.vs + p.vp[1]) * 0.08;
        const curZ = t_pos[2] + Math.sin(time * p.vs + p.vp[2]) * 0.08;
        
        p.m.position.set(curX, curY, curZ); 
        p.m.rotation.x += p.rs[0]; 
        p.m.rotation.y += p.rs[1];

        updateReflectionPosition(p.rM, p.m, curX, curY, curZ, time, localFloorYBase);
    });
    
    renderer.render(scene, camera);
}

export function resizeForeground(container) {
    camera.aspect = container.clientWidth / container.clientHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(container.clientWidth, container.clientHeight); 
}