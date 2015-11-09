

function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        chrome.tabs.remove(tabs[0].id);
        chrome.windows.create({"url": tabs[0].url, "incognito": true});
        chrome.cookies.getAll({"url" : tabs[0].url}, function(cookies){
            console.log("The website "+tabs[0].url+" has "+cookies.length+" cookies");
            for (var i = 0; i < cookies.length; i++){
                console.log(cookies[i].name);
                
            }
            for (var i = 0; i < cookies.length; i++){
                console.log("cancel:" + cookies[i].name);
                chrome.cookies.remove({"url" : tabs[0].url, "name" : cookies[i].name});
            }
        });
    });
});
