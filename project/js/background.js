
var isAllow = false;  ///judge whether the web extension is allowed in incognito
var defaultOpenTime = new Date().getTime(); // record the time open the tab
var singleClick = null;
var recentId = -1; // store the window id to open tabs
var priv = chrome.privacy.websites.thirdPartyCookiesAllowed;
var blankPageUrl = chrome.extension.getURL("html/blank.html");


function deleteCookies(tab){   // Delete cookies
    if (localStorage["clearAllCookies"] == "yes"){
        chrome.cookies.getAll({url : tab.url}, function(allCookies){
            var sum = allCookies.length;
            var website = tab.url;
            var details = [];
            for (var cookie in allCookies) {
                chrome.cookies.remove({url: tab.url, name: allCookies[cookie].name, storeId: allCookies[cookie].storeId});
                details.push(allCookies[cookie].name);
            }
            if (localStorage["notifyMe"] == "yes"){
                notifyMe(sum, website, details);
            }
        });
    }
    else if (localStorage["clearSessionCookies"] == "yes"){
        chrome.cookies.getAll({url: tab.url, session: true}, function(allCookies){
            var sum = allCookies.length;
            var website = tab.url;
            var details = [];
            for (var cookie in allCookies) {
                chrome.cookies.remove({url: tab.url, name: allCookies[cookie].name, storeId: allCookies[cookie].storeId});
                details.push(allCookies[cookie].name);
            }
            if (localStorage["notifyMe"] == "yes"){
                notifyMe(sum, website, details);
            }
        });
    }
    
}

function deleteHistory(tab){  //Delete the history
    if (localStorage["clearHistory"] == "yes"){
        if (localStorage["clearRangeHistory"] == "yes"){
            chrome.history.deleteRange({startTime: defaultOpenTime, endTime: new Date().getTime()}, function(){});
        }
        chrome.history.deleteUrl({url: tab.url});
    }
}

function removeRecent(tab){ // Delete the recent close history
    if (localStorage["clearRecentCloseHistory"] == "yes"){
        console.log("oldid:"+tab.id);
        chrome.tabs.update(tab.id, {url: "chrome://settings/"}, function(mytab){
            console.log(mytab.url);
            setTimeout(function(){ chrome.tabs.remove(mytab.id); }, 500);        
        });
    }
    else{
        chrome.tabs.remove(tab.id);
    }
}
function notifyMe(num, website, details){
    var content = "";
    if (localStorage["clearHistory"]== "yes" | localStorage["clearRecentCloseHistory"] == "yes"){
        content += "Browsing history has been removed!\n";
    }
    content += num + " cookies from\n" + website + "have been removed.\n Click here to see details";
    chrome.notifications.create({'type':'basic','message':content,'iconUrl':"icon.png",'title':"KEEPrivate"}, function( notificationId){
    chrome.notifications.onClicked.addListener(function(){
        var details_content = "The deleted cookies are\n";
        for (var i in details){
            details_content += details[i] + "\n";
        }
        chrome.notifications.update(notificationId, {'message': details_content});
    });
});
}

function closeWindow(tab){ // close the previous page or window
    if (localStorage["closeOriginalWindow"] == "yes"){
        chrome.tabs.query({'lastFocusedWindow': true}, function (tabs) {
            for (var index in tabs){
                removeRecent(tabs[index]);
            }
        });
    }
    else if (localStorage["closeOriginalPage"] == "yes") {
        removeRecent(tab);
        
    }
}

function openIncognito(tab){  //Open the incognito mode
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

function wholeprocess(tab){  // Include the delete cookies, history, close window, open incognito mode
    deleteCookies(tab);
    deleteHistory(tab);
    closeWindow(tab);
    openIncognito(tab);
}

function doubleOrSingle(tab, type){ // double click to open all the pages
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

function checkURL(tab){  // chech the current url in blacklist
    var list = localStorage["blacklist"].split(",");
    for (var i = 0; i < list.length; i++){
        if (list[i] == ""){
            continue;
        }
        if (eval("/.?"+list[i]+".?/").test(tab.url)){
            wholeprocess(tab)
            break;
        }
        
    }
}



function cookiesSettingIni(updatedTab){ // Block the thirdparty cookies
    if (localStorage["refuseALLThirdParty"] == "yes"){
         priv.set({'value': false});
         priv.get({}, function(settings) {
          console.log("all:" + settings.value);
        });
    }

    else if (localStorage["refuseIncognitoThirdParty"] == "yes"){
        if(!updatedTab.incognito){
            priv.set({'value': true});
            priv.get({}, function(settings) {
              console.log("normal:" + settings.value);
            });
        }
        else {
            priv.set({'incognito':true, 'value': false});
            priv.get({}, function(settings) {
              alert("private:" + settings.value);
            });
        }
        
    }
    else {
        priv.set({'value': true});
         priv.get({}, function(settings) {
          console.log("allow:" + settings.value);
        });
    }
}

function javascriptSettingIni(){ // block javascript
    if (localStorage["refuseAllJS"] == "yes"){
        chrome.contentSettings.javascript.set({'primaryPattern':'<all_urls>','setting':'block'});
    }
    else {
        chrome.contentSettings.javascript.clear({});
    }
}

chrome.windows.onRemoved.addListener(function(windowId) { // listen the window close
    if (windowId = recentId){
        recentId = -1;
    }
});

chrome.tabs.onUpdated.addListener(function(updatedTabId, updatedInfo, updatedTab){ //open the change of page; like visit the page
    if (updatedTab.url != undefined && updatedInfo.status == "complete" && !updatedTab.incognito){
        if (localStorage["autoMatch"] == "yes"){
            checkURL(updatedTab);
        }
        cookiesSettingIni(updatedTab);
        javascriptSettingIni();
    }
	
});



chrome.browserAction.onClicked.addListener(function(tab) { //listen the click icon 
    if (/chrome./.test(tab.url)){
        return false;
    }
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
