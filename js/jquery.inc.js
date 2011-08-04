/*!
* Easy Put.io
*
* Created by Baptiste Vincent on 2011-07-25.
* Copyright (c) 2011 Baptiste Vincent. All rights reserved.
*
*/

$(document).ready(function() {

    $("#header a").live("click", function(){
        Function.clear_error();
        var id = $(this).attr("id");
        Function.go(id);
    });

    $(".item").live("mouseover mouseout", function(event) {
        if ( event.type == "mouseover" ) {
            $(this).css('background-color', '#ECECEC');
        } else {
            $(this).css('background-color', 'white');
        }
    });

    $(".folder").live("click", function(){
        Function.clear_error();
        $("#root").html('');
        
        var id = $(this).attr("id");
        Function.gotofolder(id);
    });

    $(".files").live("click", function(){
        Function.clear_error();

        var parent_id = $(this).attr("id");
        chrome.tabs.getSelected(undefined,function(data){
            chrome.tabs.update(data.id, {
                url:'https://put.io/download-file/'+parent_id
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
            Function.folderlist('',results);
        })
        $("#valid_popup").html('<img id="valid" type="move" value="'+id+'" src="img/valid.png">')
    });

    $(".delete").live("click", function(){
        var id=$(this).attr("id");
        var name=$("#name_"+id).attr("name");
        $('#popup').show();
        $("#text_popup").html('Are you sure you want to delete file '+name+'?')
        $("#input_popup").html('<img id="valid" type="delete" value="'+id+'" src="img/valid.png"><img id="close" src="img/delete.png">')
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
        var parent_id=$('input[name=parent_id]').attr('value')
        switch (type) {
            case 'create':
                var value=$('#input_value').attr("value");
                Putio.File.create_dir(id,value,function(data){
                    Function.gotofolder(parent_id);
                })
                break;
            case 'rename':
                var value=$('#input_value').attr("value");
                Putio.File.rename(id,value,function(data){
                    Function.gotofolder(parent_id);
                })
                break;
            case 'delete':
                Putio.File.del(id,function(data){
                    if(data.error==true){
                        Putio._message(data.error_message,"error");
                    }
                    Function.gotofolder(parent_id);
                })
                break;
            case 'move':
                var value=$('#folder_id').attr("value");
                Putio.File.move(id,value,function(data){
                    if(data.error==true){
                        Putio._message(data.error_message,"error");
                    }
                    Function.gotofolder(parent_id);
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
        Function.clear_error();
        var apikey=$('input[name=apikey]').attr('value');
        var apisecret=$('input[name=apisecret]').attr('value');
        if (apikey && apisecret){
            localStorage["putio_apikey"] = apikey;
            localStorage["putio_apisecret"] = apisecret;
            Function.go('grab');
        }
        else{
            Putio._message("Please enter valid API Key and Api Secret","error")
        }
    });

    $("#send").live("click", function(){
        Function.clear_error();
        var url=$('input[name=url]').attr('value');
        var title=$('input[name=title]').attr('value');
        var lang=$('input[name=lang]').attr('value');
        var source=$('input[name=source]').attr('value');
        if (url=='' && title==''){
            Putio._message("Please enter url","error");
            $("#url, #title").css('color', 'red');
        }
        else{
            if(url!=''){
                //url =toString(url);
                //Putio.Url.extracturls(url,function(data){
                //console.log(data);
                //})
                
                var urls = [];
                //urls.push('http://www.megaupload.com/?d=TK9CCPYG');
                urls.push(url);
                Putio.Url.analyze(urls,function(data){
                    var folder_id=$('select[name=folder_id]').attr('value');
                    results=data.response.results.items;
                    var urls = [];
                    $.each(results.error,function(index, value){
                        Putio._message(value.url+" : <br>"+value.error,"error");
                    })
                    $.each(results.singleurl,function(index, value){
                        urls.push(value.url);
                        Putio.Transfer.add(urls,folder_id,function(data){
                            results=data.response.results[0];
                            if (results.name!=null){
                                Putio._message(results.name+" is "+results.status,"good");
                            }
                            else{
                                Putio._message("download url is not valid","error");
                            }
                        })
                    })
                })
            }
            else if(title!=''){
                Putio.request_google(source,title,function(data){
                    results=data.SearchResponse.Web.Results;
                    $.each(results,function(index, value){
                        var test=value.Description.indexOf("www.megaupload.com/?d=",'0')
                        if(test>=0){
                            console.log(value.Description);
                            console.log(test);
                            value.Description=value.Description.substring(test,37)
                            console.log(value.Description);
                        }
                    })
                })
            }
        }

    });

    Function.go('grab');
});