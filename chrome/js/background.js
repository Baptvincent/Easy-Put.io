Background = {
    time_notif:null,
    time_start:null,

    notification:function(){
        Putio.Transfer.list(function(data){
            var notif=data.response.total
            if (notif)notif+='';
            else notif=''
            if (notif!='0'){
                chrome.browserAction.setBadgeText({
                    'text':notif
                });
            }
            else{
                chrome.browserAction.setBadgeText({
                    'text':''
                });
            }
        })
        this.time_notif=setTimeout( function () {
            Background.notification();
        }, 10000)
    },

    extract_url:function (url){
        var regex = /([\w]+:\/\/[\w-?\%&;#~=\.\/\@\:\[\]\(\)\{\}\|]+[\w\/\[\]\(\)\{\}])/gi;
        var urls = url.match(regex)

        if (!urls){
            var notification = webkitNotifications.createNotification(
                'img/icon128.png',
                'Please only enter links starting with: http:// https:// ftp://' ,
                ''
                );
            notification.show();
            setTimeout( function () {
                notification.cancel();
            }, 4000);
            return;
        }

        return urls
    },


    sendtoputio:function (url, folder_id){
        var urls=Background.extract_url(url)
        Putio.Url.analyze(urls,function(data){
            var disk_avail = data.response.results.disk_avail;
            var results=data.response.results.items;
            var good_urls = [];
            $.each(results.error,function(index, value){
                var notification = webkitNotifications.createNotification(
                    'img/icon128.png',
                    value.url,
                    value.error
                    );
                notification.show();
                setTimeout( function () {
                    notification.cancel();
                }, 4000);
            })
            $.each(results.singleurl,function(index, value){
                if (parseInt(disk_avail) > parseInt(value.size)){
                    disk_avail-=value.size;
                    good_urls.push(value.url);
                    var notification = webkitNotifications.createNotification(
                        'img/icon128.png',
                        'Request Sent for',
                        value.name
                        );
                }
                else{
                    var notification = webkitNotifications.createNotification(
                        'img/icon128.png',
                        'There is not enought disk space to do that.',
                        'You could delete something to make room.'
                        );
                }
                notification.show();
                setTimeout( function () {
                    notification.cancel();
                }, 4000);
            })
            $.each(results.torrent,function(index, value){
                if (parseInt(disk_avail) > parseInt(value.size)){
                    disk_avail-=value.size;
                    good_urls.push(value.url);
                    var notification = webkitNotifications.createNotification(
                        'img/icon128.png',
                        'Request Sent for',
                        value.name
                        );
                }
                else{
                    var notification = webkitNotifications.createNotification(
                        'img/icon128.png',
                        'There is not enought disk space to do that.',
                        'You could delete something to make room.'
                        );
                }
                notification.show();
                setTimeout( function () {
                    notification.cancel();
                }, 4000);
            })
            Putio.Transfer.add(good_urls,folder_id,function(data){
             
                })
        })
    },


    folderlist:function(folder,parent_tab_id){
        var contexts = ["selection","link"];
        if(folder.dirs[0]){
            chrome.contextMenus.create({
                "parentId": parent_tab_id,
                "title": "/",
                "contexts":contexts,
                "onclick": function(data) {
                    if(data.linkUrl)var url=data.linkUrl
                    else var url=data.selectionText
                    Background.sendtoputio(url,folder.id);
                }
            });
        }
        $.each(folder.dirs,function(index, value){
            var parent_id=chrome.contextMenus.create({
                "parentId": parent_tab_id,
                "title": value.name,
                "contexts":contexts,
                "onclick": function(data) {
                    if(data.linkUrl)var url=data.linkUrl
                    else var url=data.selectionText
                    Background.sendtoputio(url,value.id);
                }
            });
            Background.folderlist(value,parent_id);
        })

    },

    start:function(){
        clearTimeout(this.time_start);
        this.time_start=setTimeout( function () {
            Background.start();
        }, 3600000)
        Putio.File.dirmap(function(data){
            chrome.contextMenus.removeAll();
            if (data.error==false){
                var results=data.response.results;
                var contexts = ["selection","link"];
                var parent_tab_id=chrome.contextMenus.create({
                    "title": "Send to Put.io",
                    "contexts":contexts,
                    "onclick": function(data) {
                        if(data.linkUrl)var url=data.linkUrl
                        else var url=data.selectionText
                        Background.sendtoputio(url,'0');
                    }
                });
                Background.folderlist(results,parent_tab_id);
            }
            else{
                this.time_start=setTimeout( function () {
                    Background.start();
                }, 10000)
            }
        });
    }
}