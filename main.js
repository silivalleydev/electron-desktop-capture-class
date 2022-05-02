const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const cropCapture = require('./cropCapture');

let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  })
  // mainWindow.webContents.openDevTools()
  mainWindow.loadFile('index.html')
}

let cropWin;
function createCropWindow () {
  setTimeout(() => {
    if (!cropWin) {
      cropWin = new BrowserWindow({
        width: 600,
        height: 400,
        title: 'cropWindow',
        transparent:true,
        frame: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        }
      });
      cropWin.setOpacity(0.6);
      cropWin.frame = false;
      cropWin.loadFile('crop.html');
      // cropWin.setPosition(0, 0);
      cropWin.on("close", () => {
        cropWin = null;
      })
    }
  }, 400);
}
ipcMain.on('openCropPopup', () => {
  createCropWindow();
});

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register('Enter', () => {
    if (cropWin) {
      const CropPosition = [].concat(cropWin.getPosition());
      const CropSize = [].concat(cropWin.getSize());
      cropWin.close();
      setTimeout(() => {
        cropCapture(CropPosition, CropSize);
      }, 200)
    }
  });
  globalShortcut.register('ESC', () => {
    if (cropWin) {
      cropWin.close();
    }
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});