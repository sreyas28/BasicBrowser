const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      webviewTag: true,       // enable <webview> support
      nodeIntegration: true,  // allow JS in index.html
      contextIsolation: false
    }
  });


// win.webContents.openDevTools();

  const startUrl = url.format({
    pathname: path.join(__dirname, './browserStyle/dist/index.html'),
    protocol: 'file:',
    slashes: true
  });

  win.loadURL(startUrl);

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
