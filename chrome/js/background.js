Background = {
    time_notif:null,
    time_start:null,

    badge:function(){
        var downloading=0;
        var completed=0;
        Putio.Transfers.list(function(data){
            if (data.transfers.length>0) {
                $.each(data.transfers,function(index, value){
                    if(value.status=='DOWNLOADING' || value.status=='COMPLETING')
                    {
                        downloading++;
                    }
                    else if(value.status=='COMPLETED'|| (value.status=='SEEDING' && value.percent_done=='100'))
                    {
                        completed++;
                    }
                    if(downloading!='0' && completed!='0'){
                        chrome.browserAction.setBadgeText({
                            'text':downloading+'/'+completed
                        });
                        chrome.browserAction.setBadgeBackgroundColor({
                            'color':'#f89406'//orange
                        });
                    }
                    else if (downloading!='0'){
                        chrome.browserAction.setBadgeText({
                            'text':downloading+''
                        });
                        chrome.browserAction.setBadgeBackgroundColor({
                            'color':[0, 0, 0, 0]//red #FF0000
                        });
                    }
                    else if(completed!='0'){
                        chrome.browserAction.setBadgeText({
                            'text':completed+''
                        });
                        chrome.browserAction.setBadgeBackgroundColor({
                            'color':'#51a351'//green
                        });
                    }
                    else{
                        chrome.browserAction.setBadgeText({
                            'text':''
                        });
                    }
                        
                });
            }
            else{
                chrome.browserAction.setBadgeText({
                        'text':''
                    });
                }
        })
        this.time_notif=setTimeout( function () {
            Background.badge();
        }, 10000)
    },

    extract_url:function (url){
        lines = url.split("\n");
        magnet_urls = [];
        txt = '';                    
        for (var a=0; a<lines.length; a++){
            if (lines[a].indexOf('magnet:?')>-1){
                magnet_urls.push(lines[a])
            } else {
                txt += lines[a] + "\n";
            }
        }
        
        var regex =  /([\w]+:\/\/[\w-?\+\%&;#~=\.\/\@\:\[\]\(\)\{\}\|]+[\w\/\[\]\(\)\{\}\+])/gi;
        var urls = url.match(regex)
        
        if (!urls && magnet_urls.length == 0){
            var opt = {
              type: "basic",
              title: "Error",
              message: "Please only enter links starting with: http:// https:// ftp:// or magnet:?",
              iconUrl: 'img/icon128.png'
            }
            
            chrome.notifications.create('',opt,function(notif_id) {
                setTimeout( function () {
                    chrome.notifications.clear(notif_id, function(data){})
                }, 5000);
            });

            return;
        }
        
        if (!urls){
            urls = [];
        }

        for (var a=0; a<magnet_urls.length; a++){
            urls.push(magnet_urls[a]);
        }
        
        return urls;
    },


    sendtoputio:function (url, folder_id, from, event){
        var urls=Background.extract_url(url);
        
        if(urls){
            $.each(urls,function(index, value){
                Putio.Transfers.add(value,folder_id,function(data){
                    switch(data.status){
                        case 'ERROR':
                            var opt = {
                                type: "basic",
                                title: data.error_type,
                                message: data.error_message,
                                iconUrl: 'img/icon128.png'
                            } 
                        break;
                        case 'OK':
                            var opt = {
                                type: "basic",
                                title: "Request Sent for",
                                message: data.transfer.name,
                                iconUrl: 'img/icon128.png'
                            }
                            _gaq.push(['_trackEvent', from, event, data.transfer.name]);
                        break;
                    }
                    chrome.notifications.create('',opt,function(notif_id) {
                        setTimeout( function () {
                            chrome.notifications.clear(notif_id, function(data){})
                        }, 5000);
                    });
                })
            });
        }
   
    },


    folderlist:function(folder_id,parent_tab_id){
        var contexts = ["selection","link"];
        Putio.Files.list(folder_id,function(data){
            var files=data.files;
            var url;
            hasFolder=0;
            $.each(files,function(index, value){
                if (value.content_type=='application/x-directory' && !value.is_shared){
                    hasFolder++;
                }
            });

            if(hasFolder){
                chrome.contextMenus.create({
                    "parentId": parent_tab_id,
                    "title": "/",
                    "contexts":contexts,
                    "onclick": function(data) {
                        if(data.linkUrl)url=data.linkUrl
                        else url=data.selectionText
                        Background.sendtoputio(url,folder_id,'background','Send to Put.io');
                    }
                });
            }
            $.each(files,function(index, value){
                if (value.content_type=='application/x-directory' && !value.is_shared){
                    var parent_id=chrome.contextMenus.create({
                        "parentId": parent_tab_id,
                        "title": value.name,
                        "contexts":contexts,
                        "onclick": function(data) {
                            if(data.linkUrl)url=data.linkUrl
                            else url=data.selectionText
                            Background.sendtoputio(url,value.id,'background','Send to Put.io');
                        }
                    });
                    Background.folderlist(value.id,parent_id);
                }
            })
        });

    },

    start:function(){
        if(localStorage['putio_token']){
            Storage.saveData('putio_token',localStorage['putio_token']);
            localStorage.removeItem("putio_token");
        }

        clearTimeout(this.time_start);
        Storage.getData(function(storage){
            if(storage["putio_token"]){
                Putio.Account.info(function(data){
                    if (data.error=='invalid_grant')
                    {
                        Background.time_start=setTimeout( function () {
                            Background.start();
                        }, 1000);
                    }
                    else{ 
                        Background.time_start=setTimeout( function () {
                            Background.start();
                        }, 3600000);
                        clearTimeout(Background.time_notif);
                        Background.badge();
                        chrome.contextMenus.removeAll()
                        var contexts = ["selection","link"];
                        var url;
                        var parent_tab_id=chrome.contextMenus.create({
                            "title": "Send to Put.io",
                            "contexts":contexts,
                            "onclick": function(data) {
                                if(data.linkUrl)url=data.linkUrl
                                else url=data.selectionText
                                Background.sendtoputio(url,'0','background','Send to Put.io');
                            }
                        });
                        Background.folderlist('0',parent_tab_id);
                    }
                });
            }
            else{
                Background.time_start=setTimeout( function () {
                    Background.start();
                }, 1000);
            }
        })
    },

    checkVersion:function(){
        extension_id = chrome.i18n.getMessage("@@extension_id");

        switch(extension_id){
            case 'ojjijgofhokdmbpllnkjiciihicgeebf'://dev
                origin = 'Website Dev';
            break;
            case 'hbjilidlcmlnlpfoglhijpnfajlggdfn'://dev
                origin = 'Chrome Dev';
            break;
            case 'gbohaejoknbaiedjbggkhkkkjboiacdi'://website
                origin = 'Website';
            break;
            case 'ekbocpjgbpkkheehgnimdnkmkapkagap'://store
                origin = 'Chrome Store';
            break;
        }

        $.getJSON("manifest.json", function(manifest) {
            if (!localStorage["version"]){
                _gaq.push(['_trackEvent', origin, 'install',manifest.version]);
                localStorage["version"]=manifest.version;
            }
            else if (localStorage["version"]!=manifest.version){
                _gaq.push(['_trackEvent', 'update', manifest.version, localStorage["version"]]);
                _gaq.push(['_trackEvent', origin, 'update', manifest.version]);
                localStorage["version"]=manifest.version;
                $.getJSON("changelog.json", function(data) {
                    var changelog='';
                    $.each(data,function(index, value){
                        changelog+='- '+value;
                        if(index!=Object.keys(data).length)
                            changelog+='\n';
                    })

                    var opt = {
                        type: "basic",
                        title: "Easy Put.io has been updated",
                        message: changelog,
                        iconUrl: 'img/icon128.png'
                    }
                    chrome.notifications.create('',opt,function(data) {});
                })
            }

            today=new Date();
            today.setUTCHours(0);
            today.setUTCMinutes(0);
            today.setUTCSeconds(0);
            today.setUTCMilliseconds(0);
            today=today.getTime();

            if (!localStorage["date_check_version"] || today!=localStorage["date_check_version"]){
                _gaq.push(['_trackEvent', origin, 'version', manifest.version]);
                localStorage["date_check_version"]=today;
            }
        });
    }
}
Background.start();
setTimeout( function () {
    Background.checkVersion();
}, 100);
