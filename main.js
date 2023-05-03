const electronApp = require('electron').app;
const electronBrowserWindow = require('electron').BrowserWindow;
const electronIpcMain = require('electron').ipcMain;

const nodePath = require('path');

const os = require("os");
const fs = require('fs');

const jsonFilePath = os.homedir() + '/Desktop/counter.json'
const { ReadCounterValue, WriteCounterValue } = require('./build/Release/filehandler.node')

// Prevent garbage collection.
let window;

var counterValue = 0

function createWindow() {
    const window = new electronBrowserWindow({
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        show: false,
        webPreferences: {
            preload: nodePath.join(__dirname, 'preload.js')
        }
    });

    window.loadFile('index.html')
        .then(() => { window.webContents.send('initCounterValue', counterValue); })
        .then(() => { window.show(); });

    return window;
}

electronApp.on('ready', () => {
		try {
			counterValue = ReadCounterValue(jsonFilePath)
		} catch (err) {
			console.log("Error reading json file", err);
		}
    window = createWindow();
});

electronApp.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electronApp.quit();
    }
});

electronApp.on('activate', () => {
    if (electronBrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

electronIpcMain.on('updateCounterValue', (event, value) => {
	try {
		WriteCounterValue(jsonFilePath, value)
	} catch (err) {
		console.log("Error writing json file", err);
	}
})

// ---