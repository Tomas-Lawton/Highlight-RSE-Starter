console.log("Hello from content script:D :D :D :D")

window.onload = () => {
	const url = window.location.href.toString(); // page url
	chrome.storage.sync.get([url], results => {
		console.log("Loaded: ", results)
		if (results[url]) {
			results[url].forEach(highlightRange => {
				console.log("Highlight is: ", highlightRange)
				styleRange(highlightRange)
			})
		}
	})
	// clears storage
	// chrome.storage.sync.clear((m) => {
	// 	console.log(m)
	// })
};
const saveHighlightToChrome = (rangeToSave) => {
	const url = window.location.href.toString(); // page url
	chrome.storage.sync.get([url], (results) => {
		console.log('res: ', results)
		let highlightObj = results[url] ? results[url] : [] //ternary operator
		highlightObj.push(rangeToSave);
		chrome.storage.sync.set({ [url]: highlightObj }, () => {
			console.log('Saved highlight: ', highlightObj);
		});
	});
}

const styleRange = (inputRange) => {
	console.log('highlight range: ', inputRange)
	if (Object.keys(inputRange)) {
		const highlighter = document.createElement('span');
		highlighter.classList.add('highlight-identifier');
		highlighter.append(inputRange.extractContents());
		highlighter.addEventListener('click', () => {
			highlighter.classList.remove('highlight-identifier')
		})
		inputRange.insertNode(highlighter);
	}
}

const highlight = (selection) => {
	const range = selection.getRangeAt(0);
	console.log("Sel is: ", range)
	styleRange(range)
	saveHighlightToChrome(range);
};

// Entry point
document.addEventListener("mouseup", () => { // works a lil better than selectionchange event
	let selection = document.getSelection()
	if (selection.toString().length > 0) {
		const oRange = selection.getRangeAt(0); //get the text range
		const { left: posX, top: posY } = oRange.getBoundingClientRect();
		updatePopup(selection, posX, posY)
	}
})

// Sending to background script. (Open the console on the extensions page)
const sendMessage = (selection) => {
	chrome.extension.sendMessage({ messageName: selection }, function (response) {
		var readyStateCheckInterval = setInterval(function () {
			if (document.readyState === "complete") {
				clearInterval(readyStateCheckInterval);
			}
		}, 10);
	});
}

const updatePopup = (selection, posX, posY) => {
	// Create a popup or update if already exists.
	// Could do this many other ways, could also be good to create a CRUD
	if (document.getElementById('popup-time-gang-gang')) {
		updatePopupContent(selection, posX, posY)
	} else {
		createPopup(selection, posX, posY)
	}
}

const hidePopup = () => {
	document.getElementById('popup-time-gang-gang').style.display = "none"
}

const updatePopupContent = (selection, posX, posY) => {
	const popup = document.getElementById('popup-time-gang-gang')

	popup.style.display = "block" // make sure it was not hidden
	const highlightText = document.getElementById("popup-text")
	highlightText.innerHTML = selection.toString()

	popup.style.top = posY - 100 + "px";
	popup.style.left = posX - 220 + "px";
}

const createPopup = (selection, posX, posY) => {
	const popupContainer = document.createElement("div");
	popupContainer.setAttribute("id", "popup-time-gang-gang")
	popupContainer.classList.add("position-popup")

	// Constants
	const hideButton = document.createElement("button")
	hideButton.setAttribute("id", "popup-save-button")
	hideButton.innerHTML = "X"
	hideButton.addEventListener('click', () => {
		hidePopup()
	})
	hideButton.classList.add("simple-cross")
	popupContainer.appendChild(hideButton);

	const title = document.createElement("h3")
	title.setAttribute("id", "popup-title")
	title.innerHTML = "Popup"
	popupContainer.appendChild(title);

	const saveHighlightButton = document.createElement("button")
	saveHighlightButton.setAttribute("id", "popup-save-button")
	saveHighlightButton.innerHTML = "SAVE"
	saveHighlightButton.addEventListener('click', () => {
		// Send plain text to background script
		sendMessage(selection.toString())
		// Create actual highlight
		highlight(selection)
		// hidepopup
		hidePopup()
	})
	popupContainer.appendChild(saveHighlightButton);

	// Dynamic Updates
	const highlightText = document.createElement("p")
	highlightText.setAttribute("id", "popup-text")
	highlightText.innerHTML = selection.toString()
	popupContainer.appendChild(highlightText);

	popupContainer.style.top = posY - 100 + "px";
	popupContainer.style.left = posX - 220 + "px";

	document.querySelector("body").appendChild(popupContainer);
}
