console.log("Hello from content :D :D :D :D")

const getCurrentSelection = () => {
	const url = window.location.href.toString(); // page url
	// stack overflow
	const text = window.getSelection();
	const range = window.getSelection().getRangeAt(0);
	text.removeAllRanges();
	text.addRange(range);
	const hTag = text.anchorNode.parentElement;
	const savedText = text;
	return [url, hTag, savedText]
}

const highlight = () => {
	const [url, hTag, savedText] = getCurrentSelection();
	document.designMode = "on";
	document.execCommand("HiliteColor", false, '#C7FFD8');
	document.designMode = "off";



	// saveHighlightToChrome();
};

const removeHighlight = () => {
	const [url, hTag, savedText] = getCurrentSelection();

	if (hTag.style.backgroundColor == 'rgb(199, 255, 216)') {
		hTag.style.backgroundColor = 'transparent';
		// removeHighlightFromChrome();
	}
}

const saveHighlightToChrome = () => {
	const [url, hTag, savedText] = getCurrentSelection();

	chrome.storage.sync.get('highlights', (results) => {
		if (!results.highlights[url]) {
			highlights[url] = [];
		} else {
			highlights = results.highlights;
		}

		highlights[url].push(savedText.anchorNode.textContent);
		chrome.storage.sync.set({ highlights }, () => {
			console.log('data saved: ' + highlights[url][highlights[url].length - 1]);
		});
	});
}

const removeHighlightFromChrome = () => {
	const [url, hTag, savedText] = getCurrentSelection();

	chrome.storage.sync.get('highlights', (results) => {
		highlights = results.highlights;
		var index = highlights[url].indexOf(savedText.anchorNode.textContent);
		var removedEl = highlights[url].splice(index, 1);
		chrome.storage.sync.set({ highlights }, () => {
			console.log('element removed: ' + removedEl);
		});
	});
}

document.addEventListener("selectionchange", () => {
	let selection = document.getSelection()
	if (selection.toString().length > 0) {
		const oRange = selection.getRangeAt(0); //get the text range
		const { left: posX, top: posY } = oRange.getBoundingClientRect();
		// Actual text
		updatePopup(selection.toString(), posX, posY)
	}
})

// Highlight text and save to chrome storage
// calling highlight function in this way avoids recursion (lol)
// document.onmouseup = highlight;

const sendMessage = (selection) => {
	chrome.extension.sendMessage({ messageName: selection }, function (response) {
		var readyStateCheckInterval = setInterval(function () {
			if (document.readyState === "complete") {
				clearInterval(readyStateCheckInterval);
			}
		}, 10);
	});
}

const updatePopup = (selectionText, posX, posY) => {
	// Create a popup or update if already exists.
	// Could do this many other ways, could also be good to create a CRUD
	if (document.getElementById('popup-time-gang-gang')) {
		updatePopupContent(selectionText, posX, posY)
	} else {
		createPopup(selectionText, posX, posY)
	}
}

const hidePopup = () => {
	const popup = document.getElementById('popup-time-gang-gang')
	popup.style.display = "none"
}

const updatePopupContent = (selectionText, posX, posY) => {
	const popup = document.getElementById('popup-time-gang-gang')

	popup.style.display = "block" // make sure it was not hidden
	const highlightText = document.getElementById("popup-text")
	highlightText.innerHTML = selectionText

	popup.style.top = posY - 100 + "px";
	popup.style.left = posX - 220 + "px";
}

const createPopup = (selectionText, posX, posY) => {
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
		sendMessage(selectionText)
		// Create actual highlight
		highlight()
	})
	popupContainer.appendChild(saveHighlightButton);

	// Dynamic Updates
	const highlightText = document.createElement("p")
	highlightText.setAttribute("id", "popup-text")
	highlightText.innerHTML = selectionText
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
