var urls = [];
var tab_global;
var loaded_flag = false;

function isPdf(url) {
  var regex = /\.pdf$/i; 
  var m = url.match(regex);
  return m != null;
}

function next() {

  console.log("next");
  console.log("urls is " + urls);

  if (urls.length == 0) {
  	console.log("urls is empty!");
  	return;
  }

  var head = urls[0];
  console.log("head is " + head);

  chrome.tabs.create({url: head}, createCallback);
  urls = urls.slice(1);
}

function createCallback(tab) {
  tab_global = tab;
  console.log(tab_global);
  // chrome.tabs.executeScript(tab.id, {file: "onload.js"}, doPrint);
  doPrint();
  // setTimeout(function() {chrome.tabs.executeScript(tab.id, {file: "onload.js"}, doPrint);}, 3000);
}

function doPrint(tab) {
  console.log("doPrint");

  waitLoadedFlag();
}

function waitLoadedFlag() {
   if (loaded_flag == false) {
      setTimeout(waitLoadedFlag, 50);
      return;
    }
    loaded_flag = false;

    chrome.tabs.update(tab_global.id, {url: "javascript:window.print();"}, doRemove);
}

function doRemove(tab) {
  console.log("doRemove");

  if (isPdf(tab.url) == false)
    chrome.tabs.remove(tab_global.id);
}

function clickedHandler(tab) {
  chrome.tabs.executeScript(
    {code: "var elements = document.getElementsByClassName(\"to_print\"); \
            var urls = [];\
            for(var i=0; i<elements.length; i++) {\
              if (elements[i].checked == true) \
                urls.push(elements[i].getAttribute('value'));\
            };\
            console.log(urls);\
            if (urls.length == 0) alert('No URLs to print!');\
            urls\
           "},
    function(result) {
      for(var i=0; i<result[0].length; i++) 
        urls[i] = result[0][i]
      next();
    }); 
}

chrome.browserAction.onClicked.addListener(
  function(tab) {
    clickedHandler(tab);
  }); 

chrome.tabs.onRemoved.addListener(
  function(tabId, removeInfo) {  
    console.log("tabId: " + tabId);
    if (tab_global != undefined && tabId == tab_global.id)
      next(); 
  });

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    console.log(tab.url + " loaded");
    if (tab_global != undefined && tabId == tab_global.id) {
      if (changeInfo.status == 'complete') {
        loaded_flag = true;
      }
    }
});