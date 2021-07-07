//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.messageName)
      console.log("Background: ", request);
    // Open another window
    // chrome.tabs.create({
    //   url: chrome.runtime.getURL("ReactCode/reactcode/build/popup.html"),
    // });
  }
)
