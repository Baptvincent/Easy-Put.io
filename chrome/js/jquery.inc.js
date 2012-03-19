/*!
* Easy Put.io
*
* Created by Baptiste Vincent on 2011-07-25.
* Copyright (c) 2011 Baptiste Vincent. All rights reserved.
*
*/

$(document).ready(function() {

    $("#header a").live("click", function(){
        Putio_Function.clear_error();
        var id = $(this).attr("id");
        Putio_Function.go(id);
    });

    $(".item").live("mouseover mouseout", function(event) {
        if ( event.type == "mouseover" ) {
            $(this).css('background-color', '#ECECEC');
        } else {
            $(this).css('background-color', 'white');
        }
    });

    $(".folder").live("click", function(){
        Putio_Function.clear_error();
        $("#root").html('');
        
        var id = $(this).attr("id");
        Putio_Function.gotofolder(id);
    });

    $(".files").live("click", function(){
        Putio_Function.clear_error();

        var download_url = $(this).attr("download_url");
        chrome.tabs.getSelected(undefined,function(data){
            chrome.tabs.update(data.id, {
                url:download_url
            });
        });
    });

    $(".create").live("click", function(){
        var id=$(this).attr("id");
        $('#popup').show();
        $("#text_popup").html('Create New Folder :')
        $("#input_popup").html('<input id="input_value" type="text" value="">')
        $("#valid_popup").html('<img id="valid" type="create" value="'+id+'" src="img/valid.png">')
    });

    $(".rename").live("click", function(){
        var id=$(this).attr("id");
        var name=$("#name_"+id).attr("name");
        $('#popup').show();
        $("#text_popup").html('Rename to :')
        $("#input_popup").html('<input id="input_value" type="text" value="'+name+'">')
        $("#valid_popup").html('<img id="valid" type="rename" value="'+id+'" src="img/valid.png">')
    });


    $(".move").live("click", function(){
        var id=$(this).attr("id");
        var name=$("#name_"+id).attr("name");
        $('#popup').show();
        $("#text_popup").html('Move '+name+' to :')
        $("#input_popup").html('Move '+name+' to :')
        $("#input_popup").html('<select id="folder_id"></select>')
        $("#folder_id").html('<option value="0">/</option>')
        Putio.File.dirmap(function(data){
            results=data.response.results;
            Putio_Function.folderlist('',results);
        })
        $("#valid_popup").html('<img id="valid" type="move" value="'+id+'" src="img/valid.png">')
    });

    $(".delete").live("click", function(){
        var ids=[];
        $("input[name=delete]:checked").each(function() {
            ids.push($(this).val());
        });
        var n = $("input[name=delete]:checked").length
        $('#popup').show();
        $("#text_popup").html('Are you sure you want to delete '+n+' file(s)?')
        $("#input_popup").html('<img id="valid" type="delete" value="'+ids+'" src="img/valid.png"><img id="close" src="img/delete.png">')
        $("#valid_popup").html('')
    });

    $(".cancel").live("click", function(){
        var id=$(this).attr("id");
        var name=$("#"+id).attr("name");
        $('#popup').show();
        $("#text_popup").html('Are you sure you want to cancel file '+name+'?')
        $("#input_popup").html('<img id="valid" type="cancel" value="'+id+'" src="img/valid.png"><img id="close" src="img/delete.png">')
        $("#valid_popup").html('')
    });

    $("#valid").live("click", function(){
        var id=$(this).attr("value");
        var type=$(this).attr("type");
        var query=$('input[name=search_id]').attr('value');
        var parent_id=$('input[name=parent_id]').attr('value')
        switch (type) {
            case 'create':
                var value=$('#input_value').attr("value");
                Putio.File.create_dir(id,value,function(data){
                    if(data.error==true){
                        Putio._message(data.error_message,"error");
                    }
                    Putio_Function.gotofolder(parent_id);
                })
                break;
            case 'rename':
                var value=$('#input_value').attr("value");
                Putio.File.rename(id,value,function(data){
                    if(data.error==true){
                        Putio._message(data.error_message,"error");
                    }
                    if (query)Putio_Function.search(query);
                    else Putio_Function.gotofolder(parent_id);
                })
                break;
            case 'delete':
                var ids = id.split(',');
                $.each(ids,function(index, value){
                    Putio.File.del(value,function(data){
                        if(data.error==true){
                            Putio._message(data.error_message,"error");
                        }
                    })
                })
                if (query)Putio_Function.search(query);
                else Putio_Function.gotofolder(parent_id);
                break;
            case 'move':
                var value=$('#folder_id').attr("value");
                Putio.File.move(id,value,function(data){
                    if(data.error==true){
                        Putio._message(data.error_message,"error");
                    }
                    if (query)Putio_Function.search(query);
                    else Putio_Function.gotofolder(parent_id);
                })
                break;
            case 'cancel':
                Putio.Transfer.cancel(id,function(data){
                    if(data.error==true){
                        Putio._message(data.error_message,"error");
                    }
                })
                break;
            default:
                break;
        }
        $('#popup').hide();
    });

    $("#close").live("click", function(){
        $('#popup').hide();
    });

    $("#save").live("click", function(){
        Putio_Function.clear_error();
        var apikey=$('input[name=apikey]').attr('value');
        var apisecret=$('input[name=apisecret]').attr('value');
        if (apikey && apisecret){
            localStorage["putio_apikey"] = apikey;
            localStorage["putio_apisecret"] = apisecret;
            Putio_Function.go('fetch');
        }
        else{
            Putio._message("Please enter valid API Key and Api Secret","error")
        }
    });

    $("#search_query").live("click",function(event){
        var query=$('#search_query').attr('value');
        if(query=='search')$('#search_query').attr('value','');
    });

    $("#search_query").live("keypress",function(event){
        if(event.keyCode == 13){
            $("#send_search").click();
        }
    });
    $("#send_search").live("click",function(event){
        var query=$('#search_query').attr('value');
        if (query=='')Putio_Function.gotofolder('0');
        else Putio_Function.search(query);
    });

    $("#send").live("click", function(){
        Putio_Function.clear_error();
        var url=$('textarea[name=url]').attr('value');
        var title=$('input[name=title]').attr('value');
        var lang=$('input[name=lang]').attr('value');
        var source=$('input[name=source]').attr('value');
        if (url=='' && title==''){
            Putio._message("Please enter url","error");
            $("#url, #title").css('color', 'red');
        }
        else{
            if(url!=''){
                var urls=Putio_Function.extract_url(url)
                Putio.Url.analyze(urls,function(data){
                    var folder_id=$('select[name=folder_id]').attr('value');
                    var results=data.response.results.items;
                    var disk_avail = data.response.results.disk_avail;
                    var good_urls=[];
                    var good_name=[];
                    
                    $.each(results.error,function(index, value){//lien envoyé est mort
                        Putio._message(value.url+" : <br>"+value.error,"error");
                    })

                    $.each(results.singleurl,function(index, value){
                        if (parseInt(disk_avail) > parseInt(value.size)){
                        disk_avail-=value.size;
                        good_urls.push(value.url);
                        good_name.push(value.name);
                        }
                        else{
                            Putio._message('There is not enought disk space to do that.',"error");
                        }
                    })
                    $.each(results.torrent,function(index, value){
                        if (parseInt(disk_avail) > parseInt(value.size)){
                        disk_avail-=value.size;
                        good_urls.push(value.url);
                        good_name.push(value.name);
                        }
                        else{
                            Putio._message('There is not enought disk space to do that.',"error");
                        }
                    })
                    
                    $.each(good_name,function(index, value){
                        Putio._message(value,"good");
                    })
                    Putio.Transfer.add(good_urls,folder_id,function(data){
                        })
                    
                })
            }
            else if(title!=''){
                Putio.request_google(source,title,function(data){
                    results=data.SearchResponse.Web.Results;
                    $.each(results,function(index, value){
                        var test=value.Description.indexOf("www.megaupload.com/?d=",'0')
                        if(test>=0){
                            value.Description=value.Description.substring(test,37)
                        }
                    })
                })
            }
        }

    });

    Putio_Function.go(localStorage["id"] || 'fetch');
});