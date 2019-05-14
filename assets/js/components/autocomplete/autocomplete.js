function initCaching() {
    var store = window.top;

    if (typeof store.cachePage == 'undefined') {
        store.cachePage = new Array();
        store.cacheData = new Array();
    }

    correntIssueExcuteCodeOnIE(store);
    if (findItemInArr(location.href, store.cachePage) == -1) {
        store.cachePage.push(location.href);
        store.cacheData.push([new Array(), new Array()]);
    }

    cacheQuery = store.cacheData[cachePageIndex][0];
    cacheSuggestion = store.cacheData[cachePageIndex][1];
    cachePageIndex = findItemInArr(location.href, store.cachePage);
}

function correntIssueExcuteCodeOnIE(store) {
    // This fix issue on IE: SCRIPT5011: Can't execute code from a freed script 
    if (top.isNewSite && store.cachePage.length == 1) {
        store.cachePage = [];
        var tempArray = {};
        top.$.extend(tempArray, store.cacheData);
        store.cacheData = [];
        var array = tempArray[0];
        for (var i = 0, length = tempArray.length; i < length; i++) {
            store.cacheData.push(tempArray[i]);
        }
    }
};

var maxCache = 200;

var cachePageIndex = 0;

var cacheQuery = null;
var cacheSuggestion = null;

var outp;
var oldins;
var posi = -1;
var words = new Array();
var input;
var key;
var tId = 0;
var url = null;
var txtObj = null;
var completedCallback = null;

function setVisible(visi) {
    var x = document.getElementById("shadow");
    x.style.position = 'absolute';
    x.style.top = findPosY(txtObj) + "px";
    x.style.left = findPosX(txtObj) + "px";
    x.style.visibility = visi;

    outp.style.visibility = visi;
}

function initAutoComplete(suggestionTextbox, queryUrl, completed) {
    txtObj = suggestionTextbox;

    initCaching();

    url = queryUrl;
    txtObj.setAttribute('autocomplete', 'off');
    bindEventForElement(txtObj, 'blur', function () {
        setTimeout('setVisible("hidden")', 500);
    });

    outp = document.getElementById("output");
    setVisible("hidden");

    bindEventForElement(txtObj, 'keydown', keygetter); //needed for Opera...
    bindEventForElement(txtObj, 'keyup', keyHandler);

    if (!cacheQuery || cacheQuery.length == 0) {
        cacheQuery = [];
        cacheSuggestion = [];

        cacheQuery.push('');
        cacheSuggestion.push([]);
    }

    completedCallback = completed;
}

function findPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    }
    else if (obj.x) {
        curleft += obj.x;
    }

    return curleft;
}

function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        curtop += obj.offsetHeight;

        while (obj.offsetParent) {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        }
    }
    else if (obj.y) {
        curtop += obj.y;
        curtop += obj.height;
    }

    return curtop;
}

var oldValue = '';
var oldIdx = -1;

function getSuggestions() {
    if (txtObj.value.length < 2) {
        suggestions = [];
        lookAt({});
        return;
    }

    if (cacheSuggestion[oldIdx] && oldValue != '' &&
        txtObj.value.indexOf(oldValue) != -1 &&
        oldIdx != -1 &&
        cacheSuggestion[oldIdx].length == 0) {
        return;
    }

    oldValue = txtObj.value;
    oldIdx = findItemInArr(oldValue.toLowerCase(), cacheQuery);

    if (oldIdx != -1 && cacheQuery.length < maxCache) {
        suggestions = cacheSuggestion[oldIdx];
        lookAt({});
    } else {
        if (cacheQuery.length >= maxCache) {
            cacheQuery.slice(1, maxCache - 1);
            cacheSuggestion.slice(1, maxCache - 1)
        };

        requestData(url + '&query=' + oldValue, lookAt, 'get');
    }
}

function lookAt(data) {
    window.suggestions = data.suggestions;

    if (findItemInArr(oldValue.toLowerCase(), cacheQuery) == -1) {
        try {
            cacheQuery.push(oldValue.toLowerCase());
            cacheSuggestion.push(suggestions);

            oldIdx = cacheQuery.length - 1;
        } catch (exception) {
        }
    }

    var ins = txtObj.value;
    if (oldins == ins) {
        return;
    }

    if (ins.length > 0) {
        words = getWord(ins);

        if (words.length > 0) {
            clearOutput();
            for (var i = 0; i < words.length; ++i) {
                addWord(words[i]);
            }

            setVisible("visible");
            input = txtObj.value;
        }
        else {
            setVisible("hidden");
            posi = -1;
        }
    }
    else {
        setVisible("hidden");
        posi = -1;
    }

    oldins = ins;
}

function addWord(word) {
    var sp = document.createElement("div");
    sp.className = 'opOut';
    sp.innerHTML = word;
    sp.onmouseover = mouseHandler;
    sp.onmouseout = mouseHandlerOut;
    sp.onclick = mouseClick;
    outp.appendChild(sp);
}

function clearOutput() {
    while (outp.hasChildNodes()) {
        noten = outp.firstChild;
        outp.removeChild(noten);
    }

    posi = -1;
}

function getWord(beginning) {
    var words = new Array();
    var content;

    if (suggestions) {
        for (var i = 0; i < suggestions.length; ++i) {
            words[words.length] = suggestions[i][0] + (suggestions[i][3] != null && suggestions[i][3] != "" ? " (" + suggestions[i][3] + ")" : "") + "<div class='opSpan'>" + suggestions[i][1] + ' ' + suggestions[i][2] + '</div>';
        }
    }

    return words;
}

function keygetter(event) {
    if (!event && window.event) {
        event = window.event;
    }

    if (event) {
        key = event.keyCode;
    }
    else {
        key = event.which;
    }
}

function keyHandler(event) {
    if (document.getElementById("shadow").style.visibility == "visible") {
        if (key == 40) { //Key down
            if (words.length > 0 && posi < words.length - 1) {
                if (posi >= 0) {
                    outp.childNodes[posi].className = 'opOut';
                    outp.childNodes[posi].lastChild.className = 'opSpan'
                }
                else {
                    input = txtObj.value;
                }

                outp.childNodes[++posi].className = 'opOver';
                outp.childNodes[posi].lastChild.className = 'opSpanOver';
                txtObj.value = outp.childNodes[posi].firstChild.nodeValue.replace(/\(\S+?\)/g, "").trim();
            }
        }
        else if (key == 38) { //Key up
            if (words.length > 0 && posi >= 0) {
                if (posi >= 1) {
                    outp.childNodes[posi].className = 'opOut';
                    outp.childNodes[posi].lastChild.className = 'opSpan'
                    outp.childNodes[--posi].className = 'opOver';
                    outp.childNodes[posi].lastChild.className = 'opSpanOver'
                    txtObj.value = outp.childNodes[posi].firstChild.nodeValue.replace(/\(\S+?\)/g, "").trim();
                }
                else {
                    outp.childNodes[posi].className = 'opOut';
                    outp.childNodes[posi].lastChild.className = 'opSpan'
                    txtObj.value = input;
                    txtObj.focus();
                    posi--;
                }
            }
        }
        else if (key == 27) { // Esc
            txtObj.value = input;
            setVisible("hidden");
            posi = -1;
            oldins = input;
        }
        else if (key == 8) { // Backspace
            posi = -1;
            oldins = -1;
        }
    }

    if (key != 40 && key != 38 && key != 27) {
        if (tId > 0) {
            clearTimeout(tId);
        }

        tId = setTimeout(getSuggestions, 200);
    }
}

var mouseHandler = function () {
    this.className = 'opOver';
    this.lastChild.className = 'opSpanOver'
}

var mouseHandlerOut = function () {
    this.className = 'opOut';
    this.lastChild.className = 'opSpan'
}

var mouseClick = function () {
    txtObj.value = this.firstChild.nodeValue.replace(/\(\S+?\)/g, "").trim();
    setVisible("hidden");
    posi = -1;
    oldins = this.firstChild.nodeValue.replace(/\(\S+?\)/g, "").trim();
    txtObj.focus();

    if (completedCallback) {
        completedCallback();
    }
}

function findItemInArr(item, array) {
    if (typeof array != 'object') {
        return -1;
    }

    var c = array.length;
    if (typeof c == 'undefined') {
        return -1;
    }

    for (var i = c; i >= 0; i--) {
        if (array[i] == item) {
            return i;
        }
    }

    return -1;
}

function bindEventForElement(el, evname, func, addOnce) {
    if (el.attachEvent && addOnce != true) { // IE
        el.attachEvent("on" + evname, func);
    } else if (el.addEventListener && addOnce != true) { // Gecko / W3C
        el.addEventListener(evname, func, true);
    } else { // Opera (or old browsers)
        el["on" + evname] = func;
    }
}

function requestData(url, successFunction, methodType) {
    $.ajax({
        type: methodType,
        url: url,
        data: {},
        responseType: "json",
        success: function (result) {
            var data = eval('(' + result + ')');
            successFunction(data);
        }
    });
}