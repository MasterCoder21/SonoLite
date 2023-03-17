const iframe = document.getElementById('paletteworks_editor');
const fullscreenButton = document.getElementById('paletteworks_editor_fullscreen');

fullscreenButton.addEventListener('click', () => {
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
});