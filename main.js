const path = require('path')
const os = require('os')
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell, dialog } = require('electron')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash')
const log = require('electron-log')

// Set env
process.env.NODE_ENV = 'dev'

// Set flags
const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let aboutWindow

function createMainWindow () {
    mainWindow = new BrowserWindow({
        title: 'Image Shrink',
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
    })

    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow () {
    aboutWindow = new BrowserWindow({
        title: 'About Image Shrink',
        version: app.version,
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    })

    aboutWindow.loadFile('./app/about.html')
}

app.on('ready', () => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    mainWindow.on('closed', () => mainWindow = null)
})

const menu = [
    ...(isMac ? [
        {
            label: app.name,
            submenu: [
                { 
                    label: 'About',
                    click: createAboutWindow
                },
                { role: 'quit' }
            ]
        }
    ] : [
        {
            label: "Help",
            submenu: [
                { 
                    label: 'About',
                    click: createAboutWindow
                }
            ]
        }
    ]),
    {
        role: 'fileMenu'
    },
    ...(isDev ? [
        {
            label: 'Developer',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { type: 'separator' },
                { role: 'toggleDevTools' }
            ]
        }
    ] : [])
]

ipcMain.on('select-dirs', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    event.reply('dir:selected', result.filePaths)
})

ipcMain.on('about:load', (event) => {
    const version = app.getVersion()
    event.reply('about:version', version)
})

ipcMain.on('image:minimize', (e, options) => {
    options.destination = path.join(os.homedir(), 'imageshrink')
    shrinkImage(options)
    
})

async function shrinkImage({imgPath, quality, destination}) {
    try {
        const pngQuality = quality/100
        mainWindow.webContents.send('image:shrinking')
        const files = await imagemin([slash(imgPath)], {
            destination,
            plugins: [
                imageminMozjpeg({ quality }),
                imageminPngquant({
                    quality: [pngQuality, pngQuality]
                })
            ]
        })

        log.info(files)

        shell.openPath(destination)

        mainWindow.webContents.send('image:done')
    } catch (err) {
        log.error(err)
    }
}

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
    }
})

// Keeps app running when all windows closed

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})