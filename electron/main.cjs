const { app, BrowserWindow, Menu, ipcMain, protocol, session } = require("electron")
const path = require("path")

const APP_PROTOCOL = "app"
const DIST_DIR = path.join(__dirname, "..", "dist")

const resolveDevServerUrl = () => {
  if (process.env.VITE_DEV_SERVER_URL) {
    return process.env.VITE_DEV_SERVER_URL
  }
  if (process.env.ELECTRON_DEV) {
    return "http://localhost:5173"
  }
  return null
}

const DEV_SERVER_URL = resolveDevServerUrl()

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: true,
    },
  },
])

const registerAppProtocol = () => {
  protocol.registerFileProtocol(APP_PROTOCOL, (request, callback) => {
    try {
      const url = new URL(request.url)
      let pathname = decodeURIComponent(url.pathname)
      if (!pathname || pathname === "/") {
        pathname = "/index.html"
      }

      const resolvedPath = path.resolve(DIST_DIR, `.${pathname}`)
      if (!resolvedPath.startsWith(DIST_DIR)) {
        callback({ path: path.join(DIST_DIR, "index.html") })
        return
      }

      callback({ path: resolvedPath })
    } catch (error) {
      callback({ path: path.join(DIST_DIR, "index.html") })
    }
  })
}

const setupPermissions = () => {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      if (permission !== "media") {
        callback(false)
        return
      }

      const requestUrl = details?.requestingUrl || webContents.getURL()
      // 允许自定义协议和本地开发服务器访问相机
      if (
        requestUrl.startsWith(`${APP_PROTOCOL}://`) ||
        requestUrl.startsWith("http://localhost:") ||
        requestUrl.startsWith("http://127.0.0.1:")
      ) {
        callback(true)
        return
      }

      callback(false)
    }
  )
}

const isTrustedUrlForIpc = (url) => {
  const s = String(url || "")
  return (
    s.startsWith(`${APP_PROTOCOL}://`) ||
    s.startsWith("http://localhost:") ||
    s.startsWith("http://127.0.0.1:")
  )
}

const assertTrustedIpcSender = (event) => {
  const senderUrl = event?.senderFrame?.url || event?.sender?.getURL?.() || ""
  if (!isTrustedUrlForIpc(senderUrl)) {
    throw new Error("Blocked IPC from untrusted origin")
  }
}

const createWindow = () => {
  const isWindowsPackaged = process.platform === "win32" && app.isPackaged

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    show: !isWindowsPackaged,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isWindowsPackaged) {
    win.setMenuBarVisibility(false)
    let didShow = false
    const showFullscreen = () => {
      if (didShow || win.isDestroyed()) return
      didShow = true
      win.maximize()
      win.setFullScreen(true)
      win.show()
    }

    win.once("ready-to-show", showFullscreen)
    win.webContents.once("did-fail-load", showFullscreen)
    setTimeout(showFullscreen, 8000)
  }

  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL)
  } else {
    win.loadURL(`${APP_PROTOCOL}://./index.html`)
  }

  return win
}

const setupIpcHandlers = () => {
  ipcMain.handle("artcamera:setFullscreen", async (event, enabled) => {
    assertTrustedIpcSender(event)
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    const next = Boolean(enabled)
    win.setFullScreen(next)
    if (!next) {
      win.maximize()
    }
  })

  ipcMain.handle("artcamera:isFullscreen", async (event) => {
    assertTrustedIpcSender(event)
    const win = BrowserWindow.fromWebContents(event.sender)
    return Boolean(win?.isFullScreen?.())
  })

  ipcMain.handle("artcamera:quit", async (event) => {
    assertTrustedIpcSender(event)
    app.quit()
  })
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.artcamera.desktop")

  const isWindowsPackaged = process.platform === "win32" && app.isPackaged
  if (isWindowsPackaged) {
    Menu.setApplicationMenu(null)
  }

  if (!DEV_SERVER_URL) {
    registerAppProtocol()
  }

  setupPermissions()
  setupIpcHandlers()
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
