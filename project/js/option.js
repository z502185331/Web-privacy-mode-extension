
//Initiate the option. Give constraint between options and suboptions
//If the option are not selected according to the localStorage, disable all the suboption and add through line
//Add change listener, if users select the option, remove the disabled attributes in suboptions
function setUp(option, subOptions){
	isCheck(option);
    for (var opt in subOptions){
        isCheck(subOptions[opt]);
        if (!$("#"+option).is(":checked")){
            $("#"+subOptions[opt]).attr("disabled", "disabled");
            $('label[for="'+ subOptions[opt] +'"]').attr("style", "text-decoration:line-through");
        }
    }
    $("#"+option).change(function(){
        if ($("#"+option).is(":checked")){
            for (var opt in subOptions){
                $("#"+subOptions[opt]).removeAttr("disabled");
                $('label[for="'+ subOptions[opt] +'"]').attr("style", "");
            }
        }
        else {
            for (var opt in subOptions){
                $("#"+subOptions[opt]).attr("disabled", "disabled");
                $('label[for="'+ subOptions[opt] +'"]').attr("style", "text-decoration:line-through");
                localStorage[subOptions[opt]] = "no";
            }
        }
        
    });
}

//Initiate the option according to the value in localStorage
//Add change listener :
//If users select the option, save "yes", else save "no"
function isCheck(option){ 
    if (localStorage[option] == "yes"){
        $("#"+option).attr("checked","checked");
    }
    $("#"+option).change(function(){
        localStorage[option] = $(this).is(":checked") ? "yes" : "no";
    });
}

//Initiate the tokenfield
function initTokenfield(){
    $("#tokenfield").tokenfield();
    if (localStorage["blacklist"] == null){
            localStorage["blacklist"] = [];
    }
    var tokenlist = localStorage["blacklist"].split(",");
    $("#tokenfield").tokenfield('setTokens', localStorage["blacklist"]);
    $("#tokenfield").on('tokenfield:createtoken', function (e) {    
        tokenlist.push(e.attrs.value);
        localStorage["blacklist"] = tokenlist;
  })
    .on('tokenfield:removetoken', function(e){
        for (var i = 0; i < tokenlist.length; i++){
            if (tokenlist[i] == e.attrs.value){
                tokenlist.splice(i, 1);
                break;
            }
        }
        localStorage["blacklist"] = tokenlist;
    })
    if (localStorage["autoMatch"] == "yes"){
        $("#auto").slideDown(100);
    }
    $("#autoMatch").change(function(){
        localStorage["autoMatch"] = $(this).is(":checked") ? "yes" : "no";
        $("#auto").slideToggle(100);
    });
}
$(document).ready(function(){
   
   setUp("refuseIncognitoThirdParty", ["refuseALLThirdParty"]);
    setUp("clearSessionCookies", ["clearAllCookies"]);
   setUp("clearRangeHistory", []);
    setUp("clearRecentCloseHistory", []);
    setUp("closeOriginalPage", ["closeOriginalWindow"]);
    setUp("openInTheSameWindow", []);
    setUp("doubleClick", []);
    setUp("autoMatch", []);
    setUp("refuseAllJS", []);
    setUp("notifyMe", []);
    initTokenfield()
    
    
});