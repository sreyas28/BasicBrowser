const { app, BrowserWindow, session, Menu } = require('electron');
const url = require('url');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,   // safer: disable Node.js in renderer
      contextIsolation: true,   // keep isolation
      sandbox: true,            // extra security
      webviewTag: true          // allow <webview>
    }
  });


  // win.webContents.openDevTools();

  /* Menu Setup */
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Remove Websites',
          click: () => {
            win.webContents.send('cmd:toggle-remove-mode');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  const startUrl = url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });

  win.loadURL(startUrl);

}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src * 'self' data: blob:; " +
          "script-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "style-src * 'self' 'unsafe-inline' data: blob:; " +
          "img-src * 'self' data: blob:; " +
          "connect-src * 'self' data: blob:; " +
          "frame-src * 'self' data: blob:;"
        ]
      }
    });
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
