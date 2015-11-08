


chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        chrome.windows.create({"url": tabs[0].url, "incognito": true});
        
    });
   
})