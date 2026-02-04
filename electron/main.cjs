const { app, BrowserWindow, protocol, session } = require("electron")
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

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL)
  } else {
    win.loadURL(`${APP_PROTOCOL}://./index.html`)
  }

  return win
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.artcamera.desktop")

  if (!DEV_SERVER_URL) {
    registerAppProtocol()
  }

  setupPermissions()
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
