Storage = {
    area:chrome.storage.sync,

    saveData:function(name,value){
        var save = {};
        save[name] = value;
        Storage.area.set(save)
    },

    getData:function(callback){
        Storage.area.get(function(items){
            callback(items)
        })
    }
}