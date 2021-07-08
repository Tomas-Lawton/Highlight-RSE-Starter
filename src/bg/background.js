//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.messageName) {
      console.log("Background: ", request);
    }

    if (request.openManager) {
      // Open another tab
      console.log('opening tab')
      chrome.tabs.create({
        url: "https://master.d3gp76booc8027.amplifyapp.com/",
      });
    }
  }

)
