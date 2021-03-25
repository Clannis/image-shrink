const { app, BrowserWindow, Menu, globalShortcut } = require('electron')

// Set env
process.env.NODE_ENV = 'development'

// Set flags
const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

function createMainWindow () {
    mainWindow = new BrowserWindow({
        title: 'Image Shrink',
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white'
    })

    mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
    globalShortcut.register(isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', () => mainWindow.toggleDevTools())

    mainWindow.on('closed', () => mainWindow = null)
})

const menu = [
    ...(isMac ? [
        {
            role: 'appMenu'
        }
    ] : []),
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+W',
                click: () => app.quit()
            }
        ]
    }
]

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
    }
})

// Keeps app running when all windows closed
//
// app.on('window-all-closed', () => {
//     if (!isMac) {
//         app.quit()
//     }
// })