
var isAllow = false;
var defaultOpenTime = new Date().getTime();
var singleClick = null;
var recentId = -1;




function deleteCookies(tab){
    if (localStorage["clearAllCookies"] == "yes"){
        chrome.cookies.getAll({url : tab.url}, function(allCookies){
            for (var cookie in allCookies) {
                chrome.cookies.remove({url: tab.url, name: allCookies[cookie].name, storeId: allCookies[cookie].storeId});
            }
        });
    }
    else if (localStorage["clearSessionCookies"] == "yes"){
        chrome.cookies.getAll({url: tab.url, session: true}, function(allCookies){
				for (var cookie in allCookies) {
					chrome.cookies.remove({url: tab.url, name: allCookies[cookie].name, storeId: allCookies[cookie].storeId});
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

function wholeprocess(tab){
    deleteCookies(tab);
    deleteHistory(tab);
    closeWindow(tab);
    openIncognito(tab);
}

function doubleOrSingle(tab, type){
    if (type == "single"){
        wholeprocess(tab);
    }
    else {
        var i = 0;
        while (/^chrome/.test(tab[i].url)){
            i++;
        }
        if (recentId == -1){
            chrome.windows.create({url: tab[i].url, incognito : true, type: "normal", focused: true}, function(window){
                recentId = window.id;
                for (var index = i + 1; index < tab.length; index++){
                    if (/^chrome/.test(tab[i].url)){
                        continue;
                    }
                    chrome.tabs.create({windowId: recentId, url: tab[index].url});
                }
            });
        }
        else {
            for (var index = i + 1; index < tab.length; index++){
                if (/^chrome/.test(tab[i].url)){
                    continue;
                }
                chrome.tabs.create({windowId: recentId, url: tab[index].url});
            }
        }
    }
}

function checkURL(tab){
    var list = localStorage["blacklist"].split(",");
    for (var i = 0; i < list.length; i++){
        if (eval("/.?"+list[i]+".?/").test(tab.url)){
            wholeprocess(tab)
            break;
        }
        
    }
}

chrome.windows.onRemoved.addListener(function(windowId) {
    if (windowId = recentId){
        recentId = -1;
    }
});

chrome.tabs.onUpdated.addListener(function(updatedTabId, updatedInfo, updatedTab){
    if (localStorage["autoMatch"] == "yes" && updatedTab.url != undefined && updatedInfo.status == "complete" && !updatedTab.incognito){
        checkURL(updatedTab);
    }
	
});

chrome.browserAction.onClicked.addListener(function(tab) {
    if (localStorage["doubleClick"] == "yes"){
        if (singleClick == null) {
			singleClick = setTimeout(function(){
				singleClick = null;
				doubleOrSingle(tab, "single");
			}, 500);
		}
		else {
			clearTimeout(singleClick);
			singleClick = null;
			chrome.tabs.query({'lastFocusedWindow': true}, function (tabs) {
                doubleOrSingle(tabs, "double")

            });
        }
        
    }
    else {
        doubleOrSingle(tab, "single");
    }
    
    
});
