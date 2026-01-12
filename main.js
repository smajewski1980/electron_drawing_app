const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron/main");
const path = require("node:path");
let tray = null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(null);

  // i like it to open on top of everything
  win.setAlwaysOnTop(true);
  // this releases it so other windows can be on top again, the time is a magic number
  setTimeout(() => {
    win.setAlwaysOnTop(false);
  }, 500);
  // win.setAccentColor("firebrick"); <--this is just the part above the menu bar
  win.loadFile("index.html");
  // open the dev tools in development
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
  // this is where we set the tray icon

  // ipc handles here

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
