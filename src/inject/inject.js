console.log("Hello from content :D :D :D :D")
// make selection
// selection contains text
// send text wherever
// how to remember exactly what was highlighted?
// 

function highlight() {

	document.designMode = "on";
	// Get the current url to save highlight
	var url = window.location.href.toString();
	var text = window.getSelection();
	console.log("Before: ", text)
	var range = window.getSelection().getRangeAt(0);
	text.removeAllRanges();
	console.log("Aftert: ", text)
	text.addRange(range); // {Selection obj, anchorNode, focusNode, etc}
	var hTag = text.anchorNode.parentElement; // <span bg=(rgba)>...</span>
	var savedText = text;

	// highlight / remove highlight
	if (hTag.style.backgroundColor == 'rgb(199, 255, 216)') {
		hTag.style.backgroundColor = 'transparent';
		chrome.storage.sync.get('highlights', (results) => {
			highlights = results.highlights;
			var index = highlights[url].indexOf(savedText.anchorNode.textContent);
			var removedEl = highlights[url].splice(index, 1);
			chrome.storage.sync.set({ highlights }, () => {
				console.log('element removed: ' + removedEl);
			});
		});
	} else {
		document.execCommand("HiliteColor", false, '#C7FFD8');
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

	document.designMode = "off";
};

document.addEventListener("selectionchange", event => {
	let selection = document.getSelection()
	if (selection) {
		const oRange = selection.getRangeAt(0); //get the text range
		const { left: posX, top: posY } = oRange.getBoundingClientRect();
		// Actual text
		updatePopup(selection.toString(), posX, posY)
		// Highlight text and save to chrome storage
		highlight();
		// Send to background or popup.html
		sendMessage(selection.toString())
	}
})

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
	// check if there is a pop already
	// console.log(selectionText, posX, posY)
	if (document.getElementById('popup-time-gang-gang')) {
		const popup = document.getElementById('popup-time-gang-gang')
		const highlightText = document.getElementById("popup-text")
		highlightText.innerHTML = selectionText
		// POSITION	
		popup.style.top = posY - 100 + "px";
		popup.style.left = posX - 220 + "px";
	} else {
		const popupContainer = document.createElement("div");
		popupContainer.setAttribute("id", "popup-time-gang-gang")
		popupContainer.classList.add("position-popup")
		// POSITION	
		popupContainer.style.top = posY - 100 + "px";
		popupContainer.style.left = posX - 220 + "px";

		const title = document.createElement("h3")
		title.setAttribute("id", "popup-title")
		title.innerHTML = "Popup"
		popupContainer.appendChild(title);

		const highlightText = document.createElement("p")
		highlightText.setAttribute("id", "popup-text")
		highlightText.innerHTML = selectionText
		popupContainer.appendChild(highlightText);

		document.querySelector("body").appendChild(popupContainer);
	}
}


// const highlightAllPs = () => {
// 	const highlightedItems = document.querySelectorAll("p");
// 	highlightedItems.forEach((domItem) => {
// 		domItem.style.backgroundColor = "#EBE71F"
// 	});
// }

// highlightAllPs();
