Putio_Function = {
    time : null,

    go : function(id){
        Putio_Function.clear_error();
        $('#popup').hide();
        clearTimeout(this.time);
        $("#link a").attr('class','inactive');
        $("#"+id).attr('class','active');
        localStorage["id"] = id;
        $(".content").load(id+'.html')


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
            Putio_Function.folderlist(padding+'&nbsp;&nbsp;&nbsp;',value);
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
                name=Putio_Function.ucwords(name)
                $("#root").append('<div class="dirtitle" ><b></b><img class="'+
                    'create" title="Create Folder" id="'+id+'" src="img/add.png"/></div>')
                $(".dirtitle b").text(name).html()
                if(parent_id)$("#root").append('<div class="item" ><div '+
                    'class="folder" id="'+parent_id+'"><a href=# ><img '+
                    'class="file_icon" src="img/back.png"/> Back to Your '+
                    'Files</a></div><div class="edit">&nbsp;</div></div>');
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
                            '<input type="checkbox" class="checkbox" name="'+
                            'delete" value="'+value.id+'" /></div></div>');
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
                            'src="img/move.png"/><input type="checkbox" class='+
                            '"checkbox" name="delete" value="'+value.id+'" />'+
                            '</div></div>');
                        $("#name_"+value.id).text(' '+value.name+' ('+Putio_Function.bytesToSize(value.size,2)+')').html();
                        $("#name_"+value.id).attr('name',value.name);
                    }
                })
            })
        });
    },

    search : function(query){
        Putio_Function.clear_error();
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
                            '<input type="checkbox" class="checkbox" name="'+
                            'delete" value="'+value.id+'" /></div></div>');
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
                        'src="img/move.png"/><input type="checkbox" class="'+
                        'checkbox" name="delete" value="'+value.id+'" />'+
                        '</div></div>');
                    $("#name_"+value.id).text(' '+value.name+' ('+Putio_Function.bytesToSize(value.size,2)+')').html();
                    $("#name_"+value.id).attr('name',value.name);
                }
            })
        });
    },

    transfert_list : function(){
        Putio_Function.clear_error();
        Putio.Transfer.list(function(data){
            var results=data.response;
            if (results.total=='0'){
                Putio_Function.clear_error();
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
            Putio_Function.transfert_list();
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