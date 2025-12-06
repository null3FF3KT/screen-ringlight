# Screen Edge Ring Light

A tiny Electron overlay that turns the **edges of your monitor** into a soft, warm light while leaving the center of the screen fully usable.

- Sits **on top of all apps**
- Is **click-through** (you can still use everything under it)
- Supports **multiple monitors** and can move between them
- Controlled entirely by **global shortcuts**

Designed to make you look better on camera without buying extra hardware.

---

## Features

- Transparent, frameless window that hugs the edges of a single monitor
- Warm, soft edge glow that works as a pseudo ring light
- Global shortcuts to:
  - Toggle the light on/off
  - Move the light to the next monitor
  - Quit the app
- Automatically resizes if your display configuration changes

---

## Requirements

- Node.js (LTS recommended)
- npm
- Linux, Windows, or macOS  
  (Examples below assume Linux Mint, but the app itself is cross-platform.)

---

## Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/<your-username>/screen-ringlight.git
cd screen-ringlight
npm install
```

> Replace `<your-username>` with your GitHub handle if you are publishing this.

---

## Files

Key files in this project:

- `main.js`  
  Electron main process.  Creates the overlay window, manages displays, registers global shortcuts.

- `index.html`  
  Renders the light effect on the screen edges using CSS gradients.

- `preload.js`  
  Preload script (currently minimal; reserved for future use).

- `package.json`  
  Project metadata and scripts.

---

## Running the app

From the project folder:

```bash
npm start
```

This starts Electron and creates the edge light overlay on one of your monitors.

The overlay:

- Is **always on top**
- Is **transparent** in the center
- **Ignores mouse events**, so you can still click and type in your normal apps

---

## Global shortcuts

All shortcuts below use the `CommandOrControl` modifier, which means:

- On Linux / Windows: `Ctrl`
- On macOS: `Cmd`

These are defined in `main.js`:

### Toggle light

```text
Ctrl + Alt + Shift + R
```

- If the light is visible, it hides the overlay.
- If the light is hidden, it shows the overlay again.

### Move to next monitor

```text
Ctrl + Alt + Shift + M
```

- Cycles the overlay to the next available display.
- The overlay window is resized and repositioned to exactly match the target monitor’s bounds.
- If you only have one monitor, this shortcut does nothing.

### Quit the app

```text
Ctrl + Alt + Shift + Q
```

- Completely exits the Electron app.
- After quitting, you will need to run `npm start` again (or launch via a menu entry) to bring the light back.

---

## How display detection works

The app uses Electron’s `screen` API:

- On startup, it calls `screen.getAllDisplays()` and selects a display index.
- It creates a `BrowserWindow` whose bounds match the selected display.
- It listens for display events:
  - `display-added`
  - `display-removed`
  - `display-metrics-changed`

When any of those events fire, the app:

1. Refreshes the display list.
2. Repositions/resizes the overlay window to keep it aligned with the current display index.

Because `index.html` uses viewport units (`vh`, `vw`), the light automatically stays on the edges of the current monitor regardless of resolution or orientation.

---

## Linux Mint: menu entry and autostart

### Create a menu entry

1. Open a terminal and get the full path to the project folder:

   ```bash
   pwd
   # Example: /home/youruser/projects/screen-ringlight
   ```

2. Create a `.desktop` file:

   ```bash
   mkdir -p ~/.local/share/applications
   nano ~/.local/share/applications/screen-ringlight.desktop
   ```

3. Paste the following, adjusting the path and username:

   ```ini
   [Desktop Entry]
   Type=Application
   Name=Screen Edge Ring Light
   Exec=/usr/bin/env bash -lc "cd /home/youruser/projects/screen-ringlight && npm start"
   Terminal=false
   ```

4. Save and exit.  
   The app should now appear in your application menu as “Screen Edge Ring Light”.

### Optional: start automatically on login

1. Open **Startup Applications** in Mint.
2. Add a new startup program:
   - Name: `Screen Edge Ring Light`
   - Command:  
     ```bash
     /usr/bin/env bash -lc "cd /home/youruser/projects/screen-ringlight && npm start"
     ```
3. Save.  
   The app will now start with your session, and you can use the shortcuts to show/hide it.

---

## Customization

Most visual behavior is controlled in `index.html`:

- **Edge thickness**

  ```css
  #top, #bottom {
    height: 14vh;   /* adjust for more/less top/bottom light */
  }

  #left, #right {
    width: 10vw;    /* adjust for more/less side light */
  }
  ```

- **Color temperature and intensity**

  ```css
  #top {
    background: linear-gradient(
      to bottom,
      rgba(255, 240, 220, 0.95),
      rgba(255, 240, 220, 0.4),
      rgba(0, 0, 0, 0)
    );
  }
  ```

  - More “cool”: move toward `rgba(255, 255, 255, …)`
  - More “warm”: move toward `rgba(255, 230, 200, …)`
  - Brighter: increase the alpha (`0.95`, `0.4`, etc.)
  - Dimmer: decrease the alpha values.

---

## Security and privacy notes

- The app does not make network requests.
- It does not read or log your screen contents.
- It only draws on a transparent overlay window that ignores mouse events.
- It uses global shortcuts via Electron’s `globalShortcut` API, which requires the app to be running but does not affect other applications beyond the chosen key combinations.

---

## Troubleshooting

### Shortcut does nothing

- Make sure no desktop environment shortcuts conflict with:
  - `Ctrl + Alt + Shift + R`
  - `Ctrl + Alt + Shift + M`
  - `Ctrl + Alt + Shift + Q`
- In Linux Mint, check: **Settings → Keyboard → Keyboard shortcuts**,
  and adjust either the system bindings or the ones in `main.js`.

### Overlay appears on the wrong monitor

- Use `Ctrl + Alt + Shift + M` to cycle through monitors.
- If your display layout changes (plug/unplug a monitor, rotate a screen),
  the app should pick it up automatically.  
  If not, quit with `Ctrl + Alt + Shift + Q` and restart with `npm start`.

### Electron not found

If `npm start` fails with an Electron-related error:

```bash
npm install
npm install electron --save-dev
```

Then try `npm start` again.

---

## License

Choose a license and add it here (e.g., MIT, Apache 2.0).

```markdown
MIT License, see [LICENSE](LICENSE) for details.
```

(If you add a `LICENSE` file, update this section accordingly.)
