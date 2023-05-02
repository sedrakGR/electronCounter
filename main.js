const electronApp = require('electron').app;
const electronBrowserWindow = require('electron').BrowserWindow;
const electronIpcMain = require('electron').ipcMain;

const nodePath = require('path');

const os = require("os");
const fs = require('fs');

const jsonFilePath = os.homedir() + '/Desktop/counter.json'
const counterKey = 'counterStartingPoint'

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
	// load from file first, then create the window
	// all file operations to be sync
	if (fs.existsSync(jsonFilePath)) {
		var fileContent = fs.readFileSync(jsonFilePath);
		try {
			const json = JSON.parse(fileContent);
			if (json.hasOwnProperty(counterKey)) {
				var localValue = json[counterKey]
				if (typeof localValue == 'number')
				{
					counterValue = localValue
				} else {
					console.log('invalid value for counter');
				}
			} else {
				console.log('counter key does not exist in file!');
			}
		} catch (err) {
			console.log("Error parsing JSON file content", err);
		}

	} else {
		console.log('file not found!');
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
	// all file operations to be sync
	var content = '{"' + counterKey + '":' + value + '}'
	fs.writeFileSync(jsonFilePath, content)
})

// ---