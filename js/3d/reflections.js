import * as THREE from 'three';
// We import shadowFloor directly to perfectly lock the ocean's physical height
import { scene, shadowFloor } from './morph.js'; 

let oceanInstance = null;
let lastTime = 0;
const oceanUniforms = { uTime: { value: 0 } };

// Hijack the material creation to instantiate the vast rolling ocean ONCE.
export function createReflectionMaterial(baseMaterial) {
    if (!oceanInstance) {
        // Massive high-resolution geometry to allow for physical 3D wave displacement
        const oceanGeo = new THREE.PlaneGeometry(3000, 3000, 256, 256);

        // Standard Material catches the DirectionalLight from morph.js beautifully
        // without acting like a mirror to the 3D geometry above it.
        const oceanMat = new THREE.MeshStandardMaterial({
            color: 0x020612,     // Deep, dark oceanic abyss (Vercel style)
            roughness: 0.15,     // Very smooth to catch sharp light glints
            metalness: 0.9       // High metalness creates the "liquid surface" effect
        });

        // INJECT CUSTOM SHADER: Gerstner Wave Physics
        oceanMat.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = oceanUniforms.uTime;

            // 1. Inject the Gerstner Wave formula to calculate 3D position and analytical normals
            shader.vertexShader = `
                uniform float uTime;

                // Physics formula for realistic oceanic swells
                vec3 GerstnerWave (vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
                    float steepness = wave.z;
                    float wavelength = wave.w;
                    float k = 2.0 * 3.14159 / wavelength;
                    float c = sqrt(9.8 / k);
                    vec2 d = normalize(wave.xy);
                    float f = k * (dot(d, p.xy) - c * uTime * 1.5); // Speed multiplier
                    float a = steepness / k;

                    // Calculate how light should bend off the curves of the waves
                    tangent += vec3(
                        -d.x * d.x * (steepness * sin(f)),
                        -d.x * d.y * (steepness * sin(f)),
                        d.x * (steepness * cos(f))
                    );
                    binormal += vec3(
                        -d.x * d.y * (steepness * sin(f)),
                        -d.y * d.y * (steepness * sin(f)),
                        d.y * (steepness * cos(f))
                    );
                    
                    // Return the physical displacement
                    return vec3(
                        d.x * (a * cos(f)),
                        d.y * (a * cos(f)),
                        a * sin(f)
                    );
                }

                ${shader.vertexShader}
            `.replace(
                `#include <begin_vertex>`,
                `
                vec3 gridPoint = position;
                vec3 tangent = vec3(1.0, 0.0, 0.0);
                vec3 binormal = vec3(0.0, 1.0, 0.0);
                vec3 p = gridPoint;

                // Wave Definitions: vec4(dirX, dirY, steepness, wavelength)
                // Layering 4 different frequencies creates chaotic, natural water motion
                p += GerstnerWave(vec4(1.0, 0.5, 0.15, 60.0), gridPoint, tangent, binormal);   // Big slow swells
                p += GerstnerWave(vec4(0.8, -0.6, 0.15, 30.0), gridPoint, tangent, binormal);  // Medium crossing swells
                p += GerstnerWave(vec4(-0.2, 0.9, 0.10, 15.0), gridPoint, tangent, binormal);  // Surface chop
                p += GerstnerWave(vec4(-0.6, -0.3, 0.05, 8.0), gridPoint, tangent, binormal);  // Micro ripples

                vec3 transformed = p;
                `
            ).replace(
                `#include <beginnormal_vertex>`,
                `
                // Apply the calculated light-bouncing physics to the mesh
                vec3 objectNormal = normalize(cross(binormal, tangent));
                `
            );
        };

        oceanInstance = new THREE.Mesh(oceanGeo, oceanMat);
        oceanInstance.rotation.x = -Math.PI / 2;
        
        // Push the ocean far back so it spans seamlessly to the edge of the universe
        oceanInstance.position.z = -50; 
        
        scene.add(oceanInstance);
    }

    // Return an INVISIBLE material to morph.js! 
    // This perfectly hides all the duplicate red/white objects morph.js tries to draw.
    return new THREE.MeshBasicMaterial({ visible: false });
}

// Hijack the update loop to sync the ocean height and animate the waves
export function updateReflectionPosition(reflectionMesh, originalMesh, curX, curY, curZ, time, localFloorYBase) {
    if (oceanInstance) {
        
        // THE FIX: Lock the ocean surface directly to the visible shadow floor level
        if (shadowFloor) {
            oceanInstance.position.y = shadowFloor.position.y;
        }
        
        // This function is called 120 times per frame by morph.js. 
        // We ensure the water physics only advance once per frame.
        if (time !== lastTime) {
            oceanUniforms.uTime.value = time * 0.001; 
            lastTime = time;
        }
    }
}