const cursor = document.getElementById('cell-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1'; 
    cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
});