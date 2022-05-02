const { ipcRenderer } = require('electron');

console.log('electron??', ipcRenderer);

document.getElementById('openCropPopup').addEventListener('click', () => {
    ipcRenderer.send('openCropPopup');
});
document.getElementById('partialCapture').addEventListener('click', () => {
    ipcRenderer.send('partialCapture');
});