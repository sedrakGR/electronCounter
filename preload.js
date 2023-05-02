// Import the necessary Electron components
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

// Exposed protected methods in the render process
contextBridge.exposeInMainWorld(
	'electronAPI', {
		// From render to main
        updateCounterValue: (message) => {
			console.log("ay qez ban 1")
            ipcRenderer.send('updateCounterValue', message)
        },
		initCounterValue: (message) => {
			console.log("ay qez ban")
            ipcRenderer.on('initCounterValue', message)
        }
    });