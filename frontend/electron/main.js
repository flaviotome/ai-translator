const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron')
const path = require('path')

const isDev = !app.isPackaged
let win = null

function getWindowPosition() {
  const cursor = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursor)
  const { bounds } = display
  const winWidth = 420
  const winHeight = 280
  const margin = 16

  let x = cursor.x + margin
  let y = cursor.y + margin

  if (x + winWidth > bounds.x + bounds.width) x = cursor.x - winWidth - margin
  if (y + winHeight > bounds.y + bounds.height) y = cursor.y - winHeight - margin

  return { x, y }
}

function createWindow() {
  const { x, y } = getWindowPosition()

  win = new BrowserWindow({
    width: 420,
    height: 280,
    x,
    y,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => win.show())

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('window:close', () => win.close())
  ipcMain.handle('window:minimize', () => win.minimize())

  createWindow()

  globalShortcut.register('Ctrl+Shift+T', () => {
    if (!win) return
    if (win.isVisible()) {
      win.hide()
    } else {
      const { x, y } = getWindowPosition()
      win.setPosition(x, y)
      win.show()
      win.focus()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  app.quit()
})
