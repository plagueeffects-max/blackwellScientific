let isMobile = window.innerWidth <= 550;
let isTablet = window.innerWidth > 550 && window.innerWidth <= 1024;

// 2D Canvas Microbe Drawings
function drawVirusShell(ctx) { ctx.fillStyle = '#e54b4b'; ctx.strokeStyle = '#e54b4b'; ctx.lineWidth = 4; for(let i = 0; i < 10; i++) { let angle = (i / 10) * Math.PI * 2; let x = Math.cos(angle) * 35; let y = Math.sin(angle) * 35; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); } ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); }
function drawVirusCore(ctx) { ctx.fillStyle = '#7a1919'; ctx.beginPath(); ctx.arc(-8, -8, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(10, 5, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, -12, 1.5, 0, Math.PI * 2); ctx.fill(); }
function drawBacillusShell(ctx) { ctx.fillStyle = '#3d5a80'; ctx.beginPath(); ctx.arc(-25, 0, 18, Math.PI/2, Math.PI*1.5); ctx.lineTo(25, -18); ctx.arc(25, 0, 18, Math.PI*1.5, Math.PI/2); ctx.closePath(); ctx.fill(); }
function drawBacillusCore(ctx) { ctx.fillStyle = '#fdfdfd'; ctx.beginPath(); ctx.arc(-15, 0, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, 6, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(15, -4, 2.5, 0, Math.PI * 2); ctx.fill(); }
function drawWormShell(ctx) { ctx.fillStyle = '#e6ddc5'; for(let i = 0; i < 6; i++) { let xOffset = i * 14 - 35; let yOffset = Math.sin(i * 0.8) * 5; ctx.beginPath(); ctx.arc(xOffset, yOffset, 12, 0, Math.PI * 2); ctx.fill(); } }
function drawWormCore(ctx) { ctx.fillStyle = '#c4b89d'; ctx.beginPath(); ctx.arc(-25, 2, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(5, -2, 3, 0, Math.PI * 2); ctx.fill(); }
function drawTealCellShell(ctx) { ctx.fillStyle = 'rgba(42, 157, 143, 0.4)'; ctx.strokeStyle = 'rgba(72, 202, 228, 0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
function drawTealCellCore(ctx) { ctx.fillStyle = '#ff5400'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffbd00'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); }
function drawTealDividingCell(ctx, rawProgress) {
    let progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    let maxDist = 65;
    let dist = progress * maxDist;
    function drawOrganicSplit(fillColor, strokeColor, R, splitDist, snapThreshold) {
        ctx.fillStyle = fillColor;
        if(strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 3; }
        ctx.beginPath();
        let halfD = splitDist / 2;
        if (progress >= snapThreshold || halfD >= R * 1.5) {
            ctx.arc(-halfD, 0, R, 0, Math.PI*2); ctx.closePath(); ctx.fill(); if(strokeColor) ctx.stroke();
            ctx.beginPath(); ctx.arc(halfD, 0, R, 0, Math.PI*2); ctx.closePath(); ctx.fill(); if(strokeColor) ctx.stroke();
            return;
        }
        let stretchRatio = 1 + (progress / snapThreshold) * 0.8;
        let stretchR = R * stretchRatio;
        let cosTheta = halfD / stretchR;
        if (cosTheta > 0.999) cosTheta = 0.999;
        let pinchAngle = Math.acos(cosTheta);
        if (pinchAngle < 0.15 && progress < snapThreshold) pinchAngle = 0.15;
        let angleA = Math.PI - pinchAngle;
        let angleB = pinchAngle;
        let x1 = halfD + R * Math.cos(angleA); let y1 = R * Math.sin(angleA);
        let x2 = -halfD + R * Math.cos(angleB); let y2 = R * Math.sin(angleB);
        let k = Math.abs(x1 - x2) * 0.55; 
        let cp1x = x1 - k * Math.sin(pinchAngle); let cp1y = y1 - k * Math.cos(pinchAngle);
        let cp2x = x2 + k * Math.sin(pinchAngle); let cp2y = y2 - k * Math.cos(pinchAngle);
        let x3 = x2; let y3 = -y2;
        let x4 = x1; let y4 = -y1;
        let cp3x = x3 + k * Math.sin(pinchAngle); let cp3y = y3 + k * Math.cos(pinchAngle);
        let cp4x = x4 - k * Math.sin(pinchAngle); let cp4y = y4 + k * Math.cos(pinchAngle);
        ctx.arc(halfD, 0, R, -angleA, angleA, false);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
        ctx.arc(-halfD, 0, R, angleB, -angleB, false);
        ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, x4, y4);
        ctx.closePath(); ctx.fill(); if(strokeColor) ctx.stroke();
    }
    drawOrganicSplit('rgba(42, 157, 143, 0.4)', 'rgba(72, 202, 228, 0.8)', 24, dist, 0.98);
    drawOrganicSplit('#ff5400', null, 10, dist * 0.7, 0.94);
    ctx.fillStyle = '#ffbd00'; ctx.beginPath();
    let coreDist = dist * 0.7;
    if (progress < 0.3) {
        ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
    } else {
        ctx.arc(-coreDist/2, 0, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(coreDist/2, 0, 5, 0, Math.PI*2); ctx.fill();
    }
}

const mTypes = ['virus', 'bacillus', 'worm', 'teal_cell', 'dividing_cell'];

document.querySelectorAll('.step-card').forEach((card, index) => {
    const canvas = card.querySelector('.tile-canvas');
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');
    let mWidth, mHeight, microbes = [];
    let targetMx = 0, targetMy = 0, mx = 0, my = 0;
    let isCardVisible = false;

    class TileMicrobe {
        constructor(forcedType = null, canvasW, canvasH) {
            this.type = forcedType ? forcedType : mTypes[Math.floor(Math.random() * mTypes.length)];
            this.originX = (Math.random() - 0.5) * canvasW * 1.2 + canvasW / 2;
            this.originY = (Math.random() - 0.5) * canvasH * 1.2 + canvasH / 2;
            this.baseX = this.originX; this.baseY = this.originY;
            this.vx = 0; this.vy = 0;
            this.z = 0.4 + Math.random() * 2.1; 
            this.radius = 35 * this.z * 0.4; 
            this.angle = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.01;
            this.phaseX = Math.random() * Math.PI * 2; this.phaseY = Math.random() * Math.PI * 2;
            this.floatSpeed = 0.001 + Math.random() * 0.002;
            this.squishSpeed = 0.001 + Math.random() * 0.003; 
            this.squishAmount = 0.03 + Math.random() * 0.06;
            this.isDynamic = (this.type === 'dividing_cell');
            this.dead = false; this.divisionProgress = 0;

            if (!this.isDynamic) {
                this.cacheSize = 100;
                this.cacheShell = document.createElement('canvas'); this.cacheShell.width = this.cacheSize; this.cacheShell.height = this.cacheSize;
                let sCtx = this.cacheShell.getContext('2d');
                this.cacheCore = document.createElement('canvas'); this.cacheCore.width = this.cacheSize; this.cacheCore.height = this.cacheSize;
                let cCtx = this.cacheCore.getContext('2d');
                let blurAmount = Math.max(0, (2.5 - this.z) * 2.5); 
                if (blurAmount > 0.1) { sCtx.filter = `blur(${blurAmount}px)`; cCtx.filter = `blur(${blurAmount}px)`; }
                sCtx.translate(this.cacheSize / 2, this.cacheSize / 2); cCtx.translate(this.cacheSize / 2, this.cacheSize / 2);
                sCtx.scale(0.4, 0.4); cCtx.scale(0.4, 0.4);
                if (this.type === 'virus') { drawVirusShell(sCtx); drawVirusCore(cCtx); }
                else if (this.type === 'bacillus') { drawBacillusShell(sCtx); drawBacillusCore(cCtx); }
                else if (this.type === 'worm') { drawWormShell(sCtx); drawWormCore(cCtx); }
                else if (this.type === 'teal_cell') { drawTealCellShell(sCtx); drawTealCellCore(cCtx); }
            }
        }

        update(microbeList, time, localMx, localMy, canvasW, canvasH) {
            if (this.dead) return;
            this.vx += Math.sin(time * this.floatSpeed + this.phaseX) * 0.15;
            this.vy += Math.cos(time * this.floatSpeed + this.phaseY) * 0.15;
            this.vx += (this.originX - this.baseX) * 0.002;
            this.vy += (this.originY - this.baseY) * 0.002;
            let absMx = localMx + canvasW / 2; let absMy = localMy + canvasH / 2;
            let mdx = this.baseX - absMx; let mdy = this.baseY - absMy;
            let mDistSq = mdx*mdx + mdy*mdy;
            if (mDistSq < 14400 && mDistSq > 0.1) { 
                let mDist = Math.sqrt(mDistSq); let force = Math.pow((120 - mDist) / 120, 2) * 1.5; 
                this.vx += (mdx / mDist) * force; this.vy += (mdy / mDist) * force;
            }
            for (let other of microbeList) {
                if (other === this || other.dead) continue;
                let zDiff = Math.abs(this.z - other.z); let zMultiplier = Math.max(0, 1.0 - (zDiff * 0.8)); 
                if (zMultiplier <= 0) continue; 
                let cdx = this.baseX - other.baseX; let cdy = this.baseY - other.baseY;
                let distSq = cdx*cdx + cdy*cdy; let minDist = this.radius + other.radius;
                if (distSq < minDist * minDist && distSq > 0.01) {
                    let dist = Math.sqrt(distSq); let overlap = minDist - dist;
                    let force = overlap * 0.04 * zMultiplier; let pushRatio = other.z / (this.z + other.z); 
                    this.vx += (cdx / dist) * force * pushRatio; this.vy += (cdy / dist) * force * pushRatio;
                }
            }
            this.vx *= 0.88; this.vy *= 0.88; this.baseX += this.vx; this.baseY += this.vy;
        }

        draw(ctx, time, localMx, localMy, canvasW, canvasH) {
            if (this.dead) return;
            let pX = -localMx * this.z * 0.12; let pY = -localMy * this.z * 0.12;
            let finalX = this.baseX + pX; let finalY = this.baseY + pY;
            let depthAlpha = Math.min(0.4, this.z * 0.18); this.angle += this.rotSpeed;
            ctx.save(); ctx.translate(finalX, finalY);

            if (this.isDynamic) {
                this.divisionProgress += 0.0015; 
                if (this.divisionProgress >= 1.0) { this.dead = true; ctx.restore(); return; }
                ctx.rotate(this.angle); ctx.scale(this.z * 0.4, this.z * 0.4); ctx.globalAlpha = Math.max(0.1, depthAlpha * 0.8); 
                drawTealDividingCell(ctx, this.divisionProgress); 
            } else {
                let squish = Math.sin(time * this.squishSpeed + this.phaseX) * this.squishAmount;
                ctx.scale(this.z * (1 + squish), this.z * (1 - squish)); ctx.rotate(this.angle); 
                ctx.save(); ctx.globalAlpha = Math.max(0.08, depthAlpha * 0.6); ctx.drawImage(this.cacheShell, -this.cacheSize / 2, -this.cacheSize / 2); ctx.restore();
                let coreFloatX = Math.sin(time * 0.003 + this.phaseY) * 2; let coreFloatY = Math.cos(time * 0.003 + this.phaseX) * 2; let coreWobble = Math.sin(time * 0.002 + this.phaseX) * 0.15; 
                ctx.save(); ctx.translate(coreFloatX, coreFloatY); ctx.rotate(coreWobble); ctx.globalAlpha = Math.min(0.6, depthAlpha * 1.1); ctx.drawImage(this.cacheCore, -this.cacheSize / 2, -this.cacheSize / 2); ctx.restore();
            }
            ctx.restore();
        }
    }

    function resize() { 
        mWidth = card.offsetWidth; mHeight = card.offsetHeight;
        canvas.width = mWidth; canvas.height = mHeight; 
        microbes = [];
        let count = isMobile ? 12 : 25;
        if (index === 0) {
            const allowedTypes = mTypes;
            for (let i = 0; i < count; i++) microbes.push(new TileMicrobe(allowedTypes[Math.floor(Math.random() * allowedTypes.length)], mWidth, mHeight)); 
        } else if (index === 1) {
            const allowedTypes = ['virus', 'bacillus'];
            for (let i = 0; i < count; i++) microbes.push(new TileMicrobe(allowedTypes[Math.floor(Math.random() * allowedTypes.length)], mWidth, mHeight)); 
        }
        microbes.sort((a, b) => a.z - b.z);
    }
    
    function draw(time) { 
        if (isCardVisible) {
            mx += (targetMx - mx) * 0.06; my += (targetMy - my) * 0.06;
            ctx.clearRect(0,0, mWidth, mHeight); 
            for (let i = microbes.length - 1; i >= 0; i--) {
                if (microbes[i].dead) {
                    microbes.splice(i, 1);
                    const allowedTypes = index === 0 ? mTypes : ['virus', 'bacillus'];
                    microbes.push(new TileMicrobe(allowedTypes[Math.floor(Math.random() * allowedTypes.length)], mWidth, mHeight));
                }
            }
            microbes.sort((a, b) => a.z - b.z); 
            for (let microbe of microbes) microbe.update(microbes, time, mx, my, mWidth, mHeight);
            for (let microbe of microbes) microbe.draw(ctx, time, mx, my, mWidth, mHeight);
        }
        requestAnimationFrame(draw); 
    }
    resize(); requestAnimationFrame(draw); window.addEventListener('resize', resize);
    card.addEventListener('respawnMicrobes', resize);
    card.addEventListener('inView', () => isCardVisible = true);
    card.addEventListener('outView', () => isCardVisible = false);
});

// Timeline Logic
function updateTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;
    const progress = document.querySelector('.timeline-progress');
    const items = document.querySelectorAll('.timeline-item');
    if (window.innerWidth <= 1024) { progress.style.height = '100%'; items.forEach(item => item.classList.add('active')); return; }

    const rect = timelineContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.9;
    let pixelProgress = triggerPoint - rect.top;
    let scrollPercentage = Math.max(0, Math.min(1, pixelProgress / rect.height));

    progress.style.height = (scrollPercentage * 100) + '%';
    const currentLineBottom = scrollPercentage * rect.height;

    items.forEach((item) => {
        const dotPosition = item.offsetTop + 2; 
        if (currentLineBottom >= dotPosition) item.classList.add('active');
        else item.classList.remove('active');
    });
}
document.addEventListener("DOMContentLoaded", () => {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        let currentScroll = window.scrollY;
        if (currentScroll < lastScrollY) {
            document.documentElement.style.setProperty('--reveal-offset', '-60px');
        } else {
            document.documentElement.style.setProperty('--reveal-offset', '60px');
        }
        lastScrollY = currentScroll;
        
        requestAnimationFrame(updateTimeline);
    });
    
    window.addEventListener('resize', () => requestAnimationFrame(updateTimeline));
    updateTimeline(); 
});

// Intersection Observer Setup
const obs = new IntersectionObserver(es => es.forEach(e => { 
    if(e.isIntersecting) {
        e.target.classList.add('in-view'); 
        e.target.dispatchEvent(new Event('respawnMicrobes')); 
        e.target.dispatchEvent(new Event('inView'));
    } else {
        e.target.classList.remove('in-view'); 
        e.target.dispatchEvent(new Event('outView'));
    }
}), { threshold: 0.05 });
document.querySelectorAll('.fade-target, .cinematic-reveal').forEach(c => obs.observe(c));

// Hover Glow Dynamic Positioning
document.querySelectorAll('.step-card').forEach(card => {
    // Set initial state hidden/off-edge
    card.style.setProperty('--mouse-x', '0%');
    card.style.setProperty('--mouse-y', '50%');

    let glowAnimFrame;
    let isRevealed = false;
    let currentProgress = 0;

    function applyGlowPosition(progress) {
        // Map animation: Left-center (0%, 50%) -> Bottom-left (0%, 100%) -> Bottom-center (50%, 100%)
        let x = 0, y = 50;
        let path = progress * 2; 
        
        if (path <= 1) {
            y = 50 + (path * 50); // move down left edge
            x = 0;
        } else {
            y = 100;
            x = (path - 1) * 50; // move across bottom edge
        }
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    }

    function triggerSweep(targetProg, duration) {
        let startProg = currentProgress;
        let startTime = performance.now();
        
        cancelAnimationFrame(glowAnimFrame);
        function anim(t) {
            let dt = (t - startTime) / duration;
            if (dt >= 1) dt = 1;
            
            // ease out cubic
            let ease = 1 - Math.pow(1 - dt, 3);
            currentProgress = startProg + (targetProg - startProg) * ease;
            
            applyGlowPosition(currentProgress);
            
            if (dt < 1) {
                glowAnimFrame = requestAnimationFrame(anim);
            }
        }
        glowAnimFrame = requestAnimationFrame(anim);
    }

    card.addEventListener('inView', () => {
        if (isRevealed) return;
        isRevealed = true;
        triggerSweep(1.0, 1600); // 1.6s sweep in
    });

    card.addEventListener('outView', () => {
        if (!isRevealed) return;
        isRevealed = false;
        triggerSweep(0.0, 1000); // fast 1s sweep back out
    });

    card.addEventListener('mousemove', e => {
        if (!isRevealed || currentProgress < 1.0) return; // Wait for intro to finish before mouse takes over
        cancelAnimationFrame(glowAnimFrame);
        const rect = card.getBoundingClientRect();
        
        // Track glow
        const mouseXpx = e.clientX - rect.left;
        const mouseYpx = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${mouseXpx}px`);
        card.style.setProperty('--mouse-y', `${mouseYpx}px`);

        // Comet Card 3D Tilt
        if (!isMobile) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((mouseYpx - centerY) / centerY) * -6;
            const rotateY = ((mouseXpx - centerX) / centerX) * 6;
            
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            const canvas = card.querySelector('.tile-canvas');
            if (canvas) {
                canvas.style.transform = `translateX(${rotateY * -1.5}px) translateY(${rotateX * 1.5}px)`;
                canvas.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)';
            }
        }
    });

    card.addEventListener('mouseleave', () => {
        if (!isRevealed || currentProgress < 1.0) return;
        cancelAnimationFrame(glowAnimFrame);
        // Snap gracefully back to the bottom cluster when mouse leaves
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '100%');

        if (!isMobile) {
            // Reset 3D Tilt
            card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)`;
            card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            const canvas = card.querySelector('.tile-canvas');
            if (canvas) {
                canvas.style.transform = `translateX(0px) translateY(0px)`;
                canvas.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            }
        }
    });
});
