const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  dialog,
} = require("electron/main");
const path = require("node:path");
const fs = require("node:fs");
let tray = null;

function getAutoIncrementedFileName(origPath) {
  const dir = path.dirname(origPath);
  const ext = path.extname(origPath);
  const basename = path.basename(origPath, ext);
  let newPath = origPath;
  let counter = 1;

  while (fs.existsSync(newPath)) {
    newPath = path.join(dir, `${basename} (${counter})${ext}`);
    counter++;
  }

  return newPath;
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
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
  ipcMain.handle("saveImage", async (e, data) => {
    const dloadsPath = app.getPath("downloads");
    const preferredPath = path.join(dloadsPath, "my-wonderful-image.png");
    const uniquePath = getAutoIncrementedFileName(preferredPath);

    const { filePath } = await dialog.showSaveDialog({
      filters: [{ name: "Image Files", extensions: ["png"] }],
      defaultPath: uniquePath,
    });
    if (filePath) {
      const buffer = Buffer.from(data);

      fs.writeFileSync(filePath, buffer);
      return "wonderful image saved";
    }
    console.log("dialog was closed before saving");
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
