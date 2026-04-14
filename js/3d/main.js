import * as THREE from 'three';
import { initBackground, updateBackground, resizeBackground } from './background.js?v=17';
import { initForeground, updateForeground, resizeForeground } from './morph.js?v=17';

let isMobile = window.innerWidth <= 550;
let isTablet = window.innerWidth > 550 && window.innerWidth <= 1024;
let bgMouseX = 0, bgMouseY = 0;
let targetS = 0, currentS = 0;

// Hardware Tiering
const cpuCores = navigator.hardwareConcurrency || 4; 
let hardwareTier = 'high';
if (isMobile || isTablet) hardwareTier = cpuCores <= 4 ? 'low' : 'medium'; else if (cpuCores <= 4) hardwareTier = 'medium';
const hq = { bundles: hardwareTier === 'high' ? 5 : (hardwareTier === 'medium' ? 3 : 1), rungs: hardwareTier === 'high' ? 10 : (hardwareTier === 'medium' ? 5 : 3), pixelRatio: hardwareTier === 'low' ? 1 : Math.min(window.devicePixelRatio, 2), shadows: hardwareTier === 'high' };

// Initialize scenes
initBackground();
const container = document.getElementById('canvasContainer');
const canvas = document.getElementById('webgl-canvas');
initForeground(container, canvas, hq);

const clock = new THREE.Clock();

// Event Listeners
document.addEventListener('mousemove', (e) => {
    bgMouseX = (e.clientX - window.innerWidth / 2) * 0.002;
    bgMouseY = (e.clientY - window.innerHeight / 2) * 0.002;
});

window.addEventListener('scroll', () => { targetS = window.scrollY / (document.body.scrollHeight - window.innerHeight); });

window.addEventListener('resize', () => { 
    isMobile = window.innerWidth <= 550; isTablet = window.innerWidth > 550 && window.innerWidth <= 1024;
    resizeBackground(); resizeForeground(container);
});

// Main Loop
function animate() {
    requestAnimationFrame(animate); 
    const delta = clock.getDelta(), time = performance.now(); 
    currentS = THREE.MathUtils.lerp(currentS, targetS, 1 - Math.exp(-6 * delta));
    
    // UI Global gradient colors depending on scroll
    if (currentS < 0.33) { document.documentElement.style.setProperty('--sb-thumb', 'rgba(222, 33, 54, 0.45)'); document.documentElement.style.setProperty('--sb-border', 'transparent'); } 
    else if (currentS < 0.66) { document.documentElement.style.setProperty('--sb-thumb', 'rgba(255, 255, 255, 0.45)'); document.documentElement.style.setProperty('--sb-border', 'transparent'); } 
    else { document.documentElement.style.setProperty('--sb-thumb', 'rgba(255, 255, 255, 0.1)'); document.documentElement.style.setProperty('--sb-border', 'rgba(255, 255, 255, 0.55)'); }

    const gradX = isMobile ? 50 + (Math.sin(time * 0.0005) * 10) : 25 + (currentS * 50) + (Math.sin(time * 0.0003) * 5); 
    const gradY = 40 + (currentS * 40) + (Math.cos(time * 0.0004) * 5);
    const coreAlpha = 0.65 - (currentS * 0.35); 
    const rBase = Math.floor(22 + (currentS * 8)), gBase = Math.floor(26 - (currentS * 10)), bBase = Math.floor(35 - (currentS * 15)); 
    const rMid = Math.floor(14 + (currentS * 5)), gMid = Math.floor(16 - (currentS * 5)), bMid = Math.floor(22 - (currentS * 8));

    document.body.style.backgroundImage = `radial-gradient(120% 120% at ${gradX}% ${gradY}%, rgba(${rBase}, ${gBase}, ${bBase}, ${coreAlpha}) 0%, rgba(${rMid}, ${gMid}, ${bMid}, ${coreAlpha}) 35%, rgba(5, 6, 8, 0.95) 65%, rgba(1, 1, 2, 1) 85%, #000000 100%)`;

    // Render Sub-scenes
    updateBackground(time, currentS, bgMouseX, bgMouseY);
    updateForeground(delta, time, currentS, isMobile, isTablet);
}

animate();