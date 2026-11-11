const { app, BrowserWindow, Menu, protocol, net, ipcMain, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const vault = require('./vault');

protocol.registerSchemesAsPrivileged([
  { scheme: 'vault', privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true, bypassCSP: true } },
]);

let main;
let vaultWin;

function createMain() {
  main = new BrowserWindow({
    width: 1280, height: 800, minWidth: 420, minHeight: 600,
    backgroundColor: '#0a0c0f',
    title: 'Definitive 1# PC',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
  });
  main.on('page-title-updated', e => e.preventDefault());
  main.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  main.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

function openVault() {
  if (vaultWin && !vaultWin.isDestroyed()) return vaultWin.focus();
  vaultWin = new BrowserWindow({
    width: 1200, height: 800, title: 'Definitive 1# PC — Vault', backgroundColor: '#0a0c0f',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
  });
  vaultWin.setMenuBarVisibility(false);
  vaultWin.loadFile(path.join(__dirname, 'vault.html'));
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'File', submenu: [
      { label: 'Open Vault', accelerator: 'Ctrl+Shift+V', click: openVault },
      { label: 'Open Vault Folder', click: () => vault.openFolder() },
      { type: 'separator' }, { role: 'quit' },
    ]},
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { role: 'toggleDevTools' }] },
  ]));
}

app.whenReady().then(() => {
  vault.ensure();
  // vault://<category>/<file>  ->  file on disk (supports range requests for big GIF/video)
  protocol.handle('vault', (req) => {
    const u = new URL(req.url);
    const file = vault.safe(u.hostname, decodeURIComponent(u.pathname.slice(1)));
    return net.fetch(pathToFileURL(file).toString());
  });

  ipcMain.handle('vault:list', (_e, cat, opts) => vault.list(cat, opts));
  ipcMain.handle('vault:stats', () => vault.stats());
  ipcMain.handle('vault:root', () => vault.root());
  ipcMain.handle('vault:import', (e, cat) => vault.importFiles(BrowserWindow.fromWebContents(e.sender), cat));
  ipcMain.handle('vault:importFolder', (e, cat) => vault.importFolder(BrowserWindow.fromWebContents(e.sender), cat));
  ipcMain.handle('vault:drop', (_e, cat, paths) => vault.copyIn(cat, paths));
  ipcMain.handle('vault:open', (_e, cat) => vault.openFolder(cat));
  ipcMain.handle('vault:show', () => openVault());

  buildMenu();
  createMain();
});

app.on('window-all-closed', () => app.quit());
