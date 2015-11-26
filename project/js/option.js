function setUp(option, subOptions){
	isCheck(option);
    for (var opt in subOptions){
        isCheck(subOptions[opt]);
        $("#"+subOptions[opt]).addClass("indent");
        if (!$("#"+option).is(":checked")){
            $("#"+subOptions[opt]).attr("disabled", "disabled");
        }
    }
    $("#"+option).change(function(){
        if ($("#"+option).is(":checked")){
            for (var opt in subOptions){
                $("#"+subOptions[opt]).removeAttr("disabled");
            }
        }
        else {
            for (var opt in subOptions){
                $("#"+subOptions[opt]).attr("disabled", "disabled");
                localStorage[subOptions[opt]] = "no";
            }
        }
        
    });
}

function isCheck(option){ ////read and write
    if (localStorage[option] == "yes"){
        $("#"+option).attr("checked","checked");
    }
    $("#"+option).change(function(){
        localStorage[option] = $(this).is(":checked") ? "yes" : "no";
    });
}
$(document).ready(function(){
   
   setUp("clearSessionCookies", ["clearAllCookies"]);
   setUp("clearHistory", ["clearRangeHistory"]);
    setUp("clearRecentCloseHistory", []);
    setUp("closeOriginalPage", ["closeOriginalWindow"]);
    setUp("openInTheSameWindow", []);
    setUp("doubleClick", []);
});