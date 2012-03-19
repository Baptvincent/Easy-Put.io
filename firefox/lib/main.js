var data = require("self").data;
var contextMenu = require("context-menu");
var simpleStorage = require("simple-storage");
var widget = require("widget");
var panel = require("panel");


if (!simpleStorage.storage.config)
  simpleStorage.storage.config = [];

/* create the panel */
var my_panel = panel.Panel({
  width: 454,
  contentURL: data.url("start.html"),
  contentScriptFile: [
      data.url('js/function.js'),
      data.url('js/jquery-1.6.2.min.js'),
      data.url('js/jquery.inc.js'),
      data.url('js/putio.js')
  ]
});

/* create the widget, supplying the panel */
var my_widget = widget.Widget({
  id: "google-link",
  label: "Widget with an image and a click handler",
  contentURL: data.url("icon16.png"),
  panel: my_panel
});

/* create the context menu */
var my_contextMenu = contextMenu.Item({
  label: "My Mozilla Item",
  contentScript: 'self.on("context", function (node) {' +
                 '  return /mozilla/.test(document.URL);' +
                 '});'
});

my_panel.port.on("save_config", function(apikey,apisecret) {
    simpleStorage.storage.config = { apikey: apikey, apisecret: apisecret };
});

my_panel.port.on("ask_config", function() {
    if(simpleStorage.storage.config){
        my_panel.port.emit("receive_config", simpleStorage.storage.config)
    }

});

if(simpleStorage.storage.config)console.log(simpleStorage.storage.config);

/*panel.port.on("return_config", function() {

    panel.port.emit("receive_config", data.url(id+'.html'))
})*/
/*
 * main JS
panel.port.on("send", function(id) {
    panel.port.emit("receive", data.url(id+'.html'))
  console.log(id)
});

panel JS
self.port.emit('send', id);
        self.port.on("receive", function(id) {
            $(".content").load(id);
        })
 */