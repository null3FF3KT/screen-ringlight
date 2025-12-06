// main.js
const { app, BrowserWindow, globalShortcut, screen } = require("electron");
const path = require("path");

let lightWindow;
let displays = [];
let currentDisplayIndex = 0;

function refreshDisplays() {
  displays = screen.getAllDisplays();
  if (currentDisplayIndex >= displays.length) {
    currentDisplayIndex = 0;
  }
}

function createLightWindow() {
  refreshDisplays();

  const display =
    displays[currentDisplayIndex] || screen.getPrimaryDisplay();
  const bounds = display.bounds;
  const workArea = display.workArea;

  lightWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    fullscreen: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Let mouse/keyboard events pass through to apps underneath
  lightWindow.setIgnoreMouseEvents(true, { forward: true });

  lightWindow.loadFile("index.html");

  // Send taskbar info to renderer after page loads
  lightWindow.webContents.on("did-finish-load", () => {
    const taskbarInfo = {
      top: workArea.y - bounds.y,
      bottom: bounds.y + bounds.height - (workArea.y + workArea.height),
      left: workArea.x - bounds.x,
      right: bounds.x + bounds.width - (workArea.x + workArea.width)
    };
    lightWindow.webContents.send("taskbar-info", taskbarInfo);
  });
}

function moveToDisplay(index) {
  if (!lightWindow) return;

  refreshDisplays();
  if (displays.length === 0) return;

  currentDisplayIndex = ((index % displays.length) + displays.length) % displays.length;
  const display = displays[currentDisplayIndex];
  const bounds = display.bounds;
  const workArea = display.workArea;

  lightWindow.setBounds({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  });

  const taskbarInfo = {
    top: workArea.y - bounds.y,
    bottom: bounds.y + bounds.height - (workArea.y + workArea.height),
    left: workArea.x - bounds.x,
    right: bounds.x + bounds.width - (workArea.x + workArea.width)
  };
  lightWindow.webContents.send("taskbar-info", taskbarInfo);
}

function moveToNextDisplay() {
  if (!lightWindow) return;
  if (displays.length <= 1) return;

  const nextIndex = (currentDisplayIndex + 1) % displays.length;
  moveToDisplay(nextIndex);
}

function registerShortcuts() {
  // Toggle visibility: Ctrl+Alt+Shift+R
  const okToggle = globalShortcut.register("CommandOrControl+Alt+Shift+R", () => {
    if (!lightWindow) return;

    if (lightWindow.isVisible()) {
      lightWindow.hide();
    } else {
      lightWindow.show();
    }
  });

  // Quit app completely: Ctrl+Alt+Shift+Q
  const okQuit = globalShortcut.register("CommandOrControl+Alt+Shift+Q", () => {
    app.quit();
  });

  // Move overlay to next monitor: Ctrl+Alt+Shift+M
  const okMove = globalShortcut.register("CommandOrControl+Alt+Shift+M", () => {
    moveToNextDisplay();
  });

  if (!okToggle || !okQuit || !okMove) {
    console.error("Failed to register one or more global shortcuts");
  }
}

app.whenReady().then(() => {
  createLightWindow();
  registerShortcuts();

  // If display config changes (plug/unplug monitor), refresh bounds
  screen.on("display-added", () => {
    refreshDisplays();
    moveToDisplay(currentDisplayIndex);
  });

  screen.on("display-removed", () => {
    refreshDisplays();
    moveToDisplay(currentDisplayIndex);
  });

  screen.on("display-metrics-changed", () => {
    refreshDisplays();
    moveToDisplay(currentDisplayIndex);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLightWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  app.quit();
});
