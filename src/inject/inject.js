console.log("Hello from content script:D :D :D :D")

// Get saved highlights
// window.onload = () => { // reloads on different pages
// 	const url = window.location.href.toString(); // page url
// 	// chrome.storage.sync.get('highlights', results => {
// 	// 	console.log(results)
// 	// 	results.highlights[url].forEach(highlight => {
// 	// 		styleRange(highlight)
// 	// 	})
// 	// })
// };

// const saveHighlightToChrome = (rangeToSave) => {
// const url = window.location.href.toString(); // page url
// chrome.storage.sync.get('highlights', (results) => {
// 	// create dict to store highlights on a page if it doesn't exist
// 	if (!results.highlights[url]) {
// 		results.highlights[url] = [];
// 	}
// 	results.highlights[url].push(rangeToSave);
// 	// store
// 	console.log('saving')
// 	chrome.storage.sync.set({ highlights: results }, () => {
// 		console.log('Saved highlight: ', highlights[url][highlights[url].length - 1]);
// 	});
// });
// }

const styleRange = (inputRange) => {
	const highlighter = document.createElement('span');
	highlighter.classList.add('highlight-identifier');
	highlighter.append(inputRange.extractContents());
	highlighter.addEventListener('click', () => {
		highlighter.classList.remove('highlight-identifier')
	})
	inputRange.insertNode(highlighter);
}

const highlight = () => {
	const sel = getSelection();
	const range = sel.getRangeAt(0);
	styleRange(range)
	// saveHighlightToChrome(range);
};

// const removeHighlightFromChrome = () => {
// 	const [url, hTag, savedText] = getCurrentSelection();

// 	chrome.storage.sync.get('highlights', (results) => {
// 		highlights = results.highlights;
// 		var index = highlights[url].indexOf(savedText.anchorNode.textContent);
// 		var removedEl = highlights[url].splice(index, 1);
// 		chrome.storage.sync.set({ highlights }, () => {
// 			console.log('element removed: ' + removedEl);
// 		});
// 	});
// }

document.addEventListener("selectionchange", () => {
	let selection = document.getSelection()
	if (selection.toString().length > 0) {
		const oRange = selection.getRangeAt(0); //get the text range
		const { left: posX, top: posY } = oRange.getBoundingClientRect();
		// Actual text
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
		highlight()
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


// const highlightAllPs = () => {
// 	const highlightedItems = document.querySelectorAll("p");
// 	highlightedItems.forEach((domItem) => {
// 		domItem.style.backgroundColor = "#EBE71F"
// 	});
// }

// highlightAllPs();
