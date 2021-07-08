const button = document.getElementById('button-open-manager')
button.addEventListener('click', () => {
    // opens the amplify manager
    // must message Background script
    console.log('clicked manager button')
    chrome.extension.sendMessage({ openManager: 'open' }, (response) => {
        var readyStateCheckInterval = setInterval(function () {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
            }
        }, 10);
    });
})