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
  const allowedOrigins = new Set([
    `${APP_PROTOCOL}://.`,
    DEV_SERVER_URL ? new URL(DEV_SERVER_URL).origin : null,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean))

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      if (permission !== "media") {
        callback(false)
        return
      }

      const requestUrl = details?.requestingUrl || webContents.getURL()
      try {
        const origin = new URL(requestUrl).origin
        callback(allowedOrigins.has(origin))
      } catch (error) {
        callback(false)
      }
    }
  )
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
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
