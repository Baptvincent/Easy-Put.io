Background = {
    time_notif:null,

    notification:function(){
        Putio.Transfer.list(function(data){
            var notif=data.response.total
            notif+='';
            if (notif!='0'){
                chrome.browserAction.setBadgeText({
                    'text':notif
                });
                this.time_notif=setTimeout( function () {
                    Background.notification();
                }, 10000);
            }
            else{
                chrome.browserAction.setBadgeText({
                    'text':''
                });
            }
        })
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
                        setTimeout( function () {  notification.cancel(); }, 4000);
                return;
            }

        return urls
    },


    sendtoputio:function (url, folder_id){
    var notification = webkitNotifications.createNotification(
                        'img/icon128.png',
                        'Request Sent',
                        ''
                    );
                        notification.show();
                        setTimeout( function () {  notification.cancel(); }, 4000);
        var urls=Background.extract_url(url)
        Putio.Url.analyze(urls,function(data){
            var results=data.response.results.items;
            var good_urls = [];
            $.each(results.error,function(index, value){
                var notification = webkitNotifications.createNotification(
                'img/icon128.png',
                value.url,
                value.error
            );
                notification.show();
                setTimeout( function () {  notification.cancel(); }, 4000);
            })
            $.each(results.singleurl,function(index, value){
                good_urls.push(value.url);
            })
            $.each(results.torrent,function(index, value){
                good_urls.push(value.url);
            })
            Putio.Transfer.add(good_urls,folder_id,function(data){
                $.each(data.response.results,function(index, value){
                    var notification = webkitNotifications.createNotification(
                        'img/icon128.png',
                        value.name,
                        'is '+value.status
                    );
                        notification.show();
                        setTimeout( function () {  notification.cancel(); }, 4000);
                })
            })
        })
    },


    folderlist:function(folder,parent_tab_id){
        var contexts = ["selection","link"];
        if(folder.dirs[0]){
            chrome.contextMenus.create({"parentId": parent_tab_id,"title": "/","contexts":contexts,
                "onclick": function(data) {
                    if(data.linkUrl)var url=data.linkUrl
                    else var url=data.selectionText
                    Background.sendtoputio(url,folder.id);
                }
            });
        }
        $.each(folder.dirs,function(index, value){
            var parent_id=chrome.contextMenus.create({"parentId": parent_tab_id,"title": value.name,"contexts":contexts,
                "onclick": function(data) {
                    if(data.linkUrl)var url=data.linkUrl
                    else var url=data.selectionText
                    Background.sendtoputio(url,value.id);
                }
            });
            Background.folderlist(value,parent_id);
        })

    }
}