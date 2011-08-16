var data = require("self").data;

/* Step 1: create the panel */
var panel = require("panel").Panel({
  width: 454,
  contentURL: data.url("start.html"),
  contentScriptFile: [
      data.url('js/function.js'),
      data.url('js/jquery-1.6.2.min.js'),
      data.url('js/jquery.inc.js'),
      data.url('js/putio.js'),
      data.url('js/test.js')
  ]
});

/* Step 2: create the widget, supplying the panel you just created */
var widget = require("widget").Widget({
  id: "google-link",
  label: "Widget with an image and a click handler",
  contentURL: data.url("icon16.png"),
  panel: panel
});

var contextMenu = require("context-menu");
        var myItem = contextMenu.Item({
  label: "My Mozilla Item",
  contentScript: 'self.on("context", function (node) {' +
                 '  return /mozilla/.test(document.URL);' +
                 '});'
});

Start = {
     start : function(){
         var ss = require("simple-storage");
         return ss;
     }
}