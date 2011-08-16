Function = {
    time : null,

    go : function(id){
        Function.clear_error();
        $('#popup').hide();
        clearTimeout(this.time);
        $("#link a").attr('class','inactive');
        $("#"+id).attr('class','active');
        localStorage["id"] = id;
        switch (id) {
            case 'fetch':
                Putio.File.dirmap(function(data){
                    if (data.user_name==null && data.id==null
                        && data.error_message=='Service unavailable temporarily.'){
                        Function.go('config');
                        Putio._message("Please enter valid API Key and Api Secret","error")
                        return false;
                    }
                    else{
                        var results=data.response.results;
                        Function.folderlist('',results);
                    }
                });
                $(".content").html('<div class="field"><div class ="fieldname"'+
                    ' id="url">Urls : </div><div class ="input"><textarea '+
                    'rows="8" name="url" class="inputtext"/></div></div><div '+
                    'class="field"><div class ="fieldname" id="folder">'+
                    'Folder : </div><div class ="input"><select id="folder_id"'+
                    ' name="folder_id" class="inputtext"><option value="0">/'+
                    '</option></select></div></div><div class="field"><div '+
                    'class ="fieldname" id="folder">&nbsp;</div><div class '+
                    '="input"><input type="submit" id="send" value="Send to '+
                    'Put.io"></div></div>');
                break;
            case 'dashboard':
                $(".content").html('<div id="messages_list"></div>')
                Putio.Message.list(function(data){
                    var results=data.response.results;
                    $.each(results,function(index, value){
                        if(value.channel=='2'){
                            value.title='<b>'+value.title
                            value.title=value.title.replace("<span", "</b><span")
                        }
                        $("#messages_list").append('<div class="message">'+value.title+'</div>');
                        $("#messages_list a").removeAttr("href");
                        $("#messages_list a").removeAttr("class");
                        $("#messages_list a").removeAttr("rel");
                        $("#messages_list a").css('font-weight', 'bold');

                    })
                });

                break;
            case 'transfers':
                $(".content").html('<div id="root"></div>')
                Function.transfert_list();
                break;
            case 'files':
                $(".content").html('<div id="search"><input type="text" '+
                    'id="search_query" value="search"/><input type="submit" '+
                    'id="send_search" value=">"></div><div id="root"></div>')
                Function.gotofolder('0');
                break;
            case 'account':
                $(".content").html('<div><div id="info_name"><div class="info">'+
                    'Username:</div><div class="info">Available Storage</div>'+
                    '<div class="info">Available Bandwidth</div><div class='+
                    '"info">Inherited from last month:</div><div class="info">'+
                    'Friends:</div><div class="info">Shared Items:</div><div '+
                    'class="info">Shared Space:</div></div><div id="info_data">'+
                    '</div></div>')
                Putio.User.info(function(data){
                    var results=data.response.results[0];

                    results.disk_quota=Function.bytesToSize(results.disk_quota,2)
                    results.disk_quota_available=Function.bytesToSize(results.disk_quota_available,2)
                    results.bw_quota_available=Function.bytesToSize(results.bw_quota_available,2)
                    results.bw_avail_last_month=Function.bytesToSize(results.bw_avail_last_month,2)
                    results.shared_space=Function.bytesToSize(results.shared_space,2)
                    $("#info_data").append('<div class="info">'+results.name+'</div>');
                    $("#info_data").append('<div class="info">'+results.disk_quota_available+' / '+results.disk_quota+'</div>');
                    $("#info_data").append('<div class="info">'+results.bw_quota_available+'</div>');
                    $("#info_data").append('<div class="info">'+results.bw_avail_last_month+'</div>');
                    $("#info_data").append('<div class="info">'+results.friends_count+'</div>');
                    $("#info_data").append('<div class="info">'+results.shared_items+'</div>');
                    $("#info_data").append('<div class="info">'+results.shared_space+'</div>');
                });
                break;
            case 'config':
                $(".content").html('<div class="field"><div class ="fieldname"'+
                    ' id="apikey">API Key : </div><div class ="input"><input '+
                    'type="text" name="apikey" id="test" class="inputtext" '+
                    'value=""/></div></div><div class="field"><div class'+
                    '="fieldname" id="apisecret">API Secret : </div><div '+
                    'class="input"><input type="password" name="apisecret" '+
                    'class="inputtext" value=""/></div></div><div class='+
                    '"field"><div class ="fieldname" id="folder">&nbsp;</div>'+
                    '<div class ="input"><input type="submit" id="save" '+
                    'value="Save"></div></div>')
                var apikey=localStorage["putio_apikey"];
                var apisecret=localStorage["putio_apisecret"];
                $('input[name=apikey]').val(apikey);
                $('input[name=apisecret]').val(apisecret);
                break;
            default:
                break;
        }

    },

    clear_error:function (){
        $("#message").html('');
        $("#url, #title").css('color', '#605f5f');
        $("#apikey, #apisecret").css('color', '#605f5f');
    },

    ucwords :function(str) {
        return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
            return $1.toUpperCase();
        });
    },

    bytesToSize:function(bytes,precision) {
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return ((i == 0)? (bytes / Math.pow(1024, i)) : (bytes / Math.pow(1024, i)).toFixed(precision)) + ' ' + sizes[i];
    },

    folderlist:function(padding,folder){
        $.each(folder.dirs,function(index, value){
            $("#folder_id").append('<option value="'+value.id+'">'+padding+value.name+'</option>');
            Function.folderlist(padding+'&nbsp;&nbsp;&nbsp;',value);
        })
    },

    gotofolder : function(id){
        Putio.File.info(id,function(data){
            if (id!='0'){
                var results=data.response.results[0]
                var name=results.name
                var parent_id=results.parent_id;
                $("#root").html('<input name="parent_id" value='+id+' type="hidden"/>');
            }
            else {
                var name='Your Files'
                $("#root").html('<input name="parent_id" value="0" type="hidden"/>');
            }
            Putio.File.list(id,function(data){
                name=Function.ucwords(name)
                $("#root").append('<div class="dirtitle" ><b></b></div><div '+
                    'class="edit"><img class="create" title="create" id="'+
                    id+'" src="img/add.png"/>')
                $(".dirtitle b").text(name).html()
                if(parent_id)$("#root").append('<div class="item" ><div '+
                    'class="folder" id="'+parent_id+'"><a href=# ><img '+
                    'class="file_icon" src="img/back.png"/> Back to Your '+
                    'Files</a></div><div class="edit">&nbsp;</div></div>');
                var user_id=data.id;
                results=data.response.results;
                $.each(results,function(index, value){
                    value.name=String(value.name);
                    if(value.type=='folder'){
                        $("#root").append('<div class="item"><div class='+
                            '"folder" id="'+value.id+'"><a href=# ><img class='+
                            '"file_icon" src="'+value.file_icon_url+'"/><span '+
                            'id="name_'+value.id+'"></span></a></div><div class='+
                            '"edit"><img class="rename" title="rename" id="'+
                            value.id+'" src="img/rename.png"/><img class="move" '+
                            'title="move" id="'+value.id+'" src="img/move.png"/>'+
                            '<img class="delete" title="delete" id="'+value.id+
                            '" src="img/delete.png"/></div></div>');
                        $("#name_"+value.id).text(' '+value.name).html();
                        $("#name_"+value.id).attr('name',value.name);
                    }
                    else{
                        $("#root").append('<div class="item" ><div class="'+
                            'files" download_url="'+value.download_url+'"><a href="#">'+
                            '<img class="file_icon" src="'+value.file_icon_url+
                            '"/><span id="name_'+value.id+'"></span></a></div>'+
                            '<div class="edit"><img class="rename" title='+
                            '"rename" id="'+value.id+'" src="img/rename.png"/>'+
                            '<img class="move" title="move" id="'+value.id+'" '+
                            'src="img/move.png"/><img class="delete" title='+
                            '"delete" id="'+value.id+'" src="img/delete.png"/>'+
                            '</div></div>');
                        $("#name_"+value.id).text(' '+value.name+' ('+Function.bytesToSize(value.size,2)+')').html();
                        $("#name_"+value.id).attr('name',value.name);
                    }
                })
            })
        });
    },

    search : function(query){
        Putio.File.search(query,function(data){
            var results=data.response.results;
            $("#root").html('<input name="search_id" value="'+query+'" type="hidden"/>');
            $.each(results,function(index, value){
                value.name=String(value.name);
                if(value.type=='folder'){
                    $("#root").append('<div class="item"><div class='+
                        '"folder" id="'+value.id+'"><a href=# ><img class='+
                        '"file_icon" src="'+value.file_icon_url+'"/><span '+
                        'id="name_'+value.id+'"></span></a></div><div class='+
                        '"edit"><img class="rename" title="rename" id="'+
                        value.id+'" src="img/rename.png"/><img class="move" '+
                        'title="move" id="'+value.id+'" src="img/move.png"/>'+
                        '<img class="delete" title="delete" id="'+value.id+
                        '" src="img/delete.png"/></div></div>');
                    $("#name_"+value.id).text(' '+value.name).html();
                    $("#name_"+value.id).attr('name',value.name);
                }
                else{
                    $("#root").append('<div class="item" ><div class="'+
                        'files" download_url="'+value.download_url+'"><a href="#">'+
                        '<img class="file_icon" src="'+value.file_icon_url+
                        '"/><span id="name_'+value.id+'"></span></a></div>'+
                        '<div class="edit"><img class="rename" title='+
                        '"rename" id="'+value.id+'" src="img/rename.png"/>'+
                        '<img class="move" title="move" id="'+value.id+'" '+
                        'src="img/move.png"/><img class="delete" title='+
                        '"delete" id="'+value.id+'" src="img/delete.png"/>'+
                        '</div></div>');
                    $("#name_"+value.id).text(' '+value.name+' ('+Function.bytesToSize(value.size,2)+')').html();
                    $("#name_"+value.id).attr('name',value.name);
                }
            })
        });
    },

    transfert_list : function(){
        Function.clear_error();
        Putio.Transfer.list(function(data){
            var results=data.response;
            if (results.total=='0'){
                Function.clear_error();
                $('#popup').hide();
                $("#root").html('');
                Putio._message('No transfer',"good");
            }
            else{
                $("#root").html('');
                $.each(results.results,function(index, value){
                    value.percent_done=parseInt(value.percent_done)
                    var percent_done=(value.percent_done*435)/100
                    $("#root").append('<div class="download"><div class="'+
                        'percent_done" style="width:'+percent_done+'px">&nbsp;'+
                        '</div><div class="download_info"><b>'+value.name+'</b></br>'+
                        value.status+' ('+value.percent_done+'%)</div><div class="'+
                        'edit_transfert"><img class="cancel" title="cancel" id="'+value.id+
                        '" src="img/delete.png"/></div></div>');
                    $("#"+value.id).attr('name',value.name);
                })
            }
        })
        this.time=setTimeout( function () {
            Function.transfert_list();
        }, 5000);
    },

    extract_url : function(url){
        var regex = /([\w]+:\/\/[\w-?\%&;#~=\.\/\@\:\[\]\(\)\{\}\|]+[\w\/\[\]\(\)\{\}])/gi;
        var urls = url.match(regex)

        if (!urls){
            Putio._message('Please only enter links starting with: http:// https:// ftp:// ','error');
            return;
        }

        return urls
    }



}