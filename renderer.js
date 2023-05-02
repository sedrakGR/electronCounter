let counterValue = document.getElementById('counterValue');

// Messages to main
document.getElementById('substractButton').addEventListener('click', () => {
	--counterValue.value;
	window.electronAPI.updateCounterValue(counterValue.value);
	
})
document.getElementById('addButton').addEventListener('click', () => {
	++counterValue.value;
	window.electronAPI.updateCounterValue(counterValue.value);
})

// handles message from main
window.electronAPI.initCounterValue((event, message) => {
    counterValue.value = message;
})