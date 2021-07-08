console.log("Hello from content script:D :D :D :D")
let color = 'red'

window.onload = () => {
	const url = window.location.href.toString(); // page url
	chrome.storage.sync.get([url], results => {
		console.log("Loaded: ", results)
		if (results[url]) {
			results[url].forEach(highlightRange => {
				const createRange = convertToRange(highlightRange)
				console.log(createRange)
				styleRange(createRange)
			})
		}
	})
	// clears storage
	// chrome.storage.sync.clear((m) => {
	// 	console.log('Cleared Sync Storage')
	// })
};

function getNodeIndex(n) {
	var i = 0;
	if (n) {
		while (n = n.previousSibling) i++;
	}
	return i;
}


// Stack overflow time. Obj must be serialised to save it
const convertFromRange = (range) => {
	var sC = range.startContainer, eC = range.endContainer;
	var A = [];
	const endOfDOM = document.querySelector('body')
	while (sC !== endOfDOM && sC) {
		A.push(getNodeIndex(sC));
		sC = sC.parentNode;
	}
	var B = [];
	while (eC && eC !== endOfDOM) {
		B.push(getNodeIndex(eC));
		eC = eC.parentNode;
	}
	if (B.length == 0) {
		B = A;
		eC = sC;
	}
	const rangePosition = { "sC": A, "sO": range.startOffset, "eC": B, "eO": range.endOffset };
	return rangePosition
}
// Stack overflow time. Obj must be serialised to save it
convertToRange = (serial) => {

	const editor = document.querySelector('body')
	var caretPosition = serial;
	var sel = window.getSelection();
	var range = document.createRange();
	var x, C, sC = editor, eC = editor;

	if (caretPosition.sC) {
		C = caretPosition.sC;
		x = C.length;
		while (x--) {
			var t = C[x];
			if (sC) {
				var a = sC.childNodes[t];
				if (a == undefined) {
					caretPosition.sO = 0;
					break;
				}
				sC = a;

			}
		}
	}


	if (caretPosition.eC) {
		C = caretPosition.eC;
		x = C.length;

		while (x--) {
			if (!eC) break;
			var a = eC.childNodes[C[x]];
			if (a == undefined) {
				caretPosition.eO = 0;
				break;
			}
			eC = a;

		}
	}

	if (sC) {
		range.setStart(sC, caretPosition.sO);
	}


	if (eC) {
		var endPos = caretPosition.eO;
		if (eC.nodeValue && endPos > eC.nodeValue.length) {
			endPos = eC.length;
		}

		try {
			range.setEnd(eC, endPos);
		}
		catch (e) {
			console.log('caret restore not allowed');
		}
	}
	sel.removeAllRanges();
	sel.addRange(range);
	return range
}

const saveHighlightToChrome = (rangeToSave) => {
	const url = window.location.href.toString(); // page url
	const serialisedRange = convertFromRange(rangeToSave)

	chrome.storage.sync.get(url, (results) => {
		let highlightObj = results[url] ? results[url] : [] //ternary operator
		highlightObj.push(serialisedRange);
		chrome.storage.sync.set({ [url]: highlightObj }, () => {
			console.log('Saved highlight: ', highlightObj);
		});
	});
}

const styleRange = (inputRange) => {
	if (Object.keys(inputRange)) {
		const highlighter = document.createElement('span');
		highlighter.classList.add(`highlight-identifier-${color}`);
		highlighter.append(inputRange.extractContents());
		highlighter.addEventListener('click', () => {
			highlighter.classList.remove(`highlight-identifier-red`)
			highlighter.classList.remove(`highlight-identifier-green`)
			highlighter.classList.remove(`highlight-identifier-yellow`)
		})
		inputRange.insertNode(highlighter);
	}
}

const highlight = (selection) => {
	const range = selection.getRangeAt(0);
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

const createColorButtons = () => {
	const colors = ['red', 'green', 'yellow']
	for (const thisColor of colors) {
		let colorButton = document.createElement("button")
		colorButton.innerHTML = thisColor
		colorButton.classList.add(thisColor);
		colorButton.addEventListener('click', () => {
			color = thisColor
		})
		document.getElementById('popup-time-gang-gang').appendChild(colorButton);
	}
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
	createColorButtons();

}
