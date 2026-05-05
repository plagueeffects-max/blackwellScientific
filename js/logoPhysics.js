document.addEventListener("DOMContentLoaded", async () => {
    // Ultimate Fallback array in case live-server blocks directory browsing
    let rawLogos = [
        "logos/Bruker.png",
        "logos/FELIX.png",
        "logos/PHCbi.png",
        "logos/azure%20biosystems.png",
        "logos/sigma.png"
    ];

    // --- Dynamic Auto-Discovery Engine ---
    // This scrapes the server's directory listing to automatically find new files!
    try {
        const directoryResponse = await fetch('./logos/');
        if (directoryResponse.ok) {
            const htmlText = await directoryResponse.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));
            
            // Extract only valid image files from the folder output
            const fetchedLogos = links
                .map(a => a.getAttribute('href'))
                .filter(href => href && href.match(/\.(png|jpe?g|svg|webp|gif)$/i))
                .map(href => `logos/${href.split('/').pop()}`); 
                
            if (fetchedLogos.length > 0) {
                rawLogos = fetchedLogos;
                console.log("Auto-discovered logos:", rawLogos);
            }
        }
    } catch(e) {
        console.warn("Directory indexing is blocked by server. Defaulting to fallback logos array.");
    }

    const viewport = document.getElementById("ticker-viewport");
    const track = document.getElementById("ticker-track");
    const progressBar = document.getElementById("ticker-progress-bar");
    const thumb = document.getElementById("ticker-thumb");

    if (!viewport || !track) return;

    // Create enough replicates (5 sets) to guarantee continuous smooth looping on ultra-wide screens
    const setMultiplier = 5; 
    for (let i = 0; i < setMultiplier; i++) {
        rawLogos.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            track.appendChild(img);
        });
    }

    const images = Array.from(track.querySelectorAll("img"));
    
    // Physics variables
    let x = 0;
    const getBaseSpeed = () => window.innerWidth < 768 ? 0.6 : 1.0; // Slower speed for mobile readability
    let currentSpeed = getBaseSpeed();
    let isHovered = false;
    
    // Drag variables
    let isDragging = false;
    let startX = 0;
    let lastDragDx = 0;
    
    let setWidth = 0;

    function calculateWidth() {
        if (images.length > rawLogos.length) {
            // Safe flexible measurement between set origins
            const item1 = images[0];
            const item2 = images[rawLogos.length];
            setWidth = item2.offsetLeft - item1.offsetLeft;
        }
    }

    // Ensure images load before calculating bounds, and re-calculate on resize
    setTimeout(calculateWidth, 150);
    window.addEventListener("resize", calculateWidth);

    function loopManager() {
        // Smoothly interpolate speed towards target (drag overrides this)
        if (!isDragging) {
            // Apply drift momentum
            if (Math.abs(lastDragDx) > 0.1) {
                x += lastDragDx;
                lastDragDx *= 0.92; // Friction
            } else {
                if (isHovered) {
                    currentSpeed = 0; // Instant perfect stop for maximum readability 
                } else {
                    currentSpeed += (getBaseSpeed() - currentSpeed) * 0.05; // Graceful soft resume
                }
                x -= currentSpeed;
            }
        }

        // --- Core Infinite Recirculation ---
        if (setWidth > 0) {
            if (x <= -setWidth) {
                x += setWidth;
            } else if (x > 0) {
                x -= setWidth;
            }
        }

        track.style.transform = `translate3d(${x}px, 0, 0)`;

        // --- Exact Zoom Focus Engine ---
        // Guaranteed to highlight *only* the single closest element preventing double focus
        const viewportCenter = window.innerWidth / 2;
        let closestImg = null;
        let closestDist = Infinity;

        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            // Culling optimization
            if (rect.right < 0 || rect.left > window.innerWidth) {
                img.classList.remove("focused");
                return;
            }

            const centerOffset = rect.left + rect.width / 2;
            const dist = Math.abs(viewportCenter - centerOffset);
            
            if (dist < closestDist) {
                closestDist = dist;
                closestImg = img;
            }
        });

        // Apply exactly one focus 
        images.forEach(img => {
            if (img === closestImg && closestDist < window.innerWidth * 0.25) {
                img.classList.add("focused");
            } else {
                img.classList.remove("focused");
            }
        });

        // --- Progress Bar Synchronization ---
        if (setWidth > 0 && progressBar && thumb) {
            const rawProgress = Math.abs(x) / setWidth;
            const maxTrack = progressBar.offsetWidth - thumb.offsetWidth;
            const thumbX = rawProgress * maxTrack;
            thumb.style.transform = `translate3d(${thumbX}px, 0, 0)`;
        }

        requestAnimationFrame(loopManager);
    }

    // Start engine
    requestAnimationFrame(loopManager);

    // --- Hover & Pause Events ---
    let hoverTimeout;
    const setHover = () => {
        clearTimeout(hoverTimeout); // Debounce random blips
        isHovered = true;
    };
    const unsetHover = () => {
        hoverTimeout = setTimeout(() => {
             isHovered = false;
             isDragging = false;
        }, 50); // Give the browser 50ms leeway to prevent weird micro-leaves between DOM nodes
    };
    
    // Attach to massive section to guarantee absolute capture
    const tickerSection = document.getElementById("pro-ticker-section");
    const hoverTargets = [viewport, tickerSection].filter(t => t);
    
    hoverTargets.forEach(el => {
        el.addEventListener("pointerenter", setHover);
        el.addEventListener("mouseenter", setHover);
        el.addEventListener("pointerleave", unsetHover);
        el.addEventListener("mouseleave", unsetHover);
    });

    // --- Viewport Infinite Mouse/Touch Drag ---
    viewport.addEventListener("pointerdown", (e) => {
        isDragging = true;
        isHovered = true;
        startX = e.clientX;
        lastDragDx = 0;
        viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        lastDragDx = dx;
        x += dx;
        startX = e.clientX;
    });

    viewport.addEventListener("pointerup", (e) => {
        isDragging = false;
        viewport.releasePointerCapture(e.pointerId);
    });

    // --- External Fast-Scrub Progress Thumb Drag ---
    let isDraggingThumb = false;
    let thumbStartPageX = 0;
    let startThumbProgress = 0;

    if (thumb && progressBar) {
        thumb.addEventListener("pointerdown", (e) => {
            isDraggingThumb = true;
            isHovered = true; 
            isDragging = true; 
            lastDragDx = 0;
            thumbStartPageX = e.clientX;
            
            if (setWidth > 0) {
               startThumbProgress = Math.abs(x) / setWidth;
            }
            thumb.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        thumb.addEventListener("pointermove", (e) => {
            if (!isDraggingThumb) return;
            const dx = e.clientX - thumbStartPageX;
            const maxTrack = progressBar.offsetWidth - thumb.offsetWidth;
            
            // Convert pixel delta back to progress space [-1, 1]
            const progressDelta = dx / maxTrack;
            let newProgress = startThumbProgress + progressDelta;
            
            // Loop scrollbar logic! Dragging all the way right loops to 0 gracefully
            if (newProgress > 1) { newProgress -= 1; thumbStartPageX = e.clientX; startThumbProgress = newProgress; }
            if (newProgress < 0) { newProgress += 1; thumbStartPageX = e.clientX; startThumbProgress = newProgress; }
            
            x = -(newProgress * setWidth);
        });

        thumb.addEventListener("pointerup", (e) => {
            isDraggingThumb = false;
            isHovered = false;
            isDragging = false;
            thumb.releasePointerCapture(e.pointerId);
        });
        
        // Point-and-click scrubbing inside progress bar
        progressBar.addEventListener("pointerdown", (e) => {
            if (e.target === thumb) return;
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const maxTrack = progressBar.offsetWidth - thumb.offsetWidth;
            let newProgress = clickX / maxTrack;
            if (newProgress < 0) newProgress = 0;
            if (newProgress > 1) newProgress = 1;
            x = -(newProgress * setWidth);
            lastDragDx = 0;
        });
    }
});
