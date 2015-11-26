
var isAllow = false;
var defaultOpenTime = new Date().getTime();
var singleClick = null;
var recentId = -1;



chrome.extension.isAllowedIncognitoAccess(function(isIt){
	isAllowed = isIt;
});
function deleteCookies(tab){
    if (localStorage["clearSessionCookies"] == "no" && localStorage["clearAllCookies"] == "no"){
        return;
    }
    else if (localStorage["clearAllCookies"] == "yes"){
        alert("all");
        chrome.cookies.getAll({"url" : tab.url}, function(cookies){
            for (var i = 0; i < cookies.length; i++){
                chrome.cookies.remove({"url" : tab.url, "name" : cookies[i].name});
            }
        });
    }
    else if (localStorage["clearSessionCookies"] == "yes"){
        alert("session");
        chrome.cookies.getAll({url: tab.url, session: true}, function(allCookies){
				for (var cookie in allCookies) {
					chrome.cookies.remove({url: tab.url, name: allCookies[cookie].name, storeId: allCookies[cookie].storeId});
                    chrome.cookies.remove({"url" : tab.url, "name" : cookies[i].name});
				}
        });
    }
    
}

function deleteHistory(tab){
    if (localStorage["clearHistory"] == "yes"){
        if (localStorage["clearRangeHistory"] == "yes"){
            chrome.history.deleteRange({startTime: defaultOpenTime, endTime: new Date().getTime()}, function(){});
        }
        chrome.history.deleteUrl({url: tab.url});
    }
    if (localStorage["clearRecentCloseHistory"] == "yes"){
        
        
    }
}

function closeWindow(tab){
    if (localStorage["closeOriginalWindow"] == "yes"){
        chrome.windows.remove(tab.windowId);
    }
    else if (localStorage["closeOriginalPage"] == "yes") {
        chrome.tabs.remove(tab.id);
    }
}
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
function openIncognito(tab){
    if (localStorage["openInTheSameWindow"] == "yes"){
        if (recentId == -1){
            chrome.windows.create({url: tab.url, incognito : true, type: "normal", focused: true}, function(window){
                recentId = window.id;
            });
        }
        else {
            chrome.tabs.create({windowId: recentId, url: tab.url});
        }
    }
    else {
        chrome.windows.create({url: tab.url, incognito : true, type: "normal", focused: true});
    }
}

function doubleOrSingle(tab){
    deleteCookies(tab);
    deleteHistory(tab);
    closeWindow(tab);
    openIncognito(tab);
}
chrome.windows.onRemoved.addListener(function(windowId) {
    if (windowId = recentId){
        recentId = -1;
    }
});


chrome.browserAction.onClicked.addListener(function(tab) {
    if (localStorage["doubleClick"] == "yes"){
        if (singleClick == null) {
			singleClick = setTimeout(function(){
				singleClick = null;
				doubleOrSingle(tab);
			}, 500);
		}
		else {
			clearTimeout(singleClick);
			singleClick = null;
			chrome.tabs.query({'lastFocusedWindow': true}, function (tabs) {
                for (var index in tabs){
                    if (/^chrome/.test(tabs[index].url)){
                        continue;
                    }
                    window.setTimeout(function(){}, 500);
                    doubleOrSingle(tabs[index]);
                    console.log(tabs[index].title + " " + tabs[index].id);
                }
            });
        }
        
    }
    else {
        doubleOrSingle(tab);
    }
    
    
});
