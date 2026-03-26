document.addEventListener("mousemove", (event) => {
    let mousex = event.clientX - 15;
    let mousey = event.clientY - 15;
    let curglow = document.querySelector('.cursor-glow');
    curglow.style.left = mousex / 16 + 'rem';
    curglow.style.top = mousey / 16 + 'rem';
});