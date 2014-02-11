/*
* Easy Put.io
*
* Created by Baptiste Vincent on 2011-07-25.
* Copyright (c) 2013 Baptiste Vincent. All rights reserved.
*
*/

$(document).ready(function() {

    $("#menu a").on("focus", function(){
        $("#menu a").blur();
        $("#search_title").focus()
    });

    $("#menu a").on("click", function(){
        Putio_Function.go(this.id);
    });

    $("#logo img").on("click", function(){
        activeTab=$("#menu .active a").attr('id');
        _gaq.push(['_trackEvent', activeTab+' tab', 'click', 'Logo']);
        switch(activeTab){
            case 'files':
                path='your-files'
            break;
            case 'transfers':
                path='transfers';
            break;
            default:
                path='';
            break;
        }

        chrome.tabs.query(
            {
                url:"https://put.io/*"
            }, 
            function(data){
                if(data.length>0){
                    chrome.tabs.update(data[0].id, {
                        active:true,
                    })
                }
                else{
                    chrome.tabs.create({
                        url:"https://put.io/"+path
                    });
                }
            }
        )

    });

    $(document.body).on('click', '.folder' ,function(e){
        var id = $(this).attr("value");
        Putio_Function.goToFolder(id);
        _gaq.push(['_trackEvent', 'files tab', 'click', 'Folder']);
    });

    $(document.body).on('click', '.files' ,function(e){
        var id = $(this).attr("value");
        var download_url = "https://api.put.io/v2/files/"+id+"/download";
        _gaq.push(['_trackEvent', 'files tab', 'click', 'File']);
        chrome.tabs.getSelected(undefined,function(data){
            chrome.tabs.update(data.id, {
                url:download_url
            });
        });
    });

    $(document.body).on('click', '.show_file' ,function(e){
        var fileId=$(this).attr("value");
        _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Show file on file tab']);
        Putio.Files.info(fileId,function(data){
            if(data.status!='ERROR'){
                if(data.file.content_type!='application/x-directory'){
                    fileId=data.file.parent_id
                }
                Putio_Function.go('files',fileId)
            }
        })
    });

    $(document.body).on('click', '.go_to_file' ,function(e){
        var file_url = "https://put.io/file/"+$(this).attr("value");
        _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Show File on Put.io']);
        chrome.tabs.create({
                url:file_url
            });
    });

    $(document.body).on('click', '.download_file' ,function(e){
        var fileId=$(this).attr("value");
        Putio.Files.info(fileId,function(data){
            if(data.status!='ERROR'){
                _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Download File']);
                if(data.file.content_type=='application/x-directory'){
                    var download_url = "https://api.put.io/v2/files/zip?file_ids="+fileId;
                    //var download_url = "https://put.io/v2/files/zip?file_ids="+fileId;
                }
                else{
                    var download_url = "https://api.put.io/v2/files/"+fileId+"/download";
                }
                chrome.tabs.getSelected(undefined,function(data){
                    chrome.tabs.update(data.id, {
                        url:download_url
                    });
                });
            }
        })
    });

    $(document.body).on('click', '#clean_button' ,function(e){
        _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Clean Transfer']);
        Putio.Transfers.clean(function(data){})
    });

    $(document.body).on('click', '.remove' ,function(e){
        $('#myAlertModal h4').text('Are you sure you want to remove the transfer?');
        $('#myAlertModal .yes').attr('type','remove_transfer');
        $('#myAlertModal .yes').attr('value',$(this).attr("value"));
        $('#myAlertModal').modal('show');
    });

    $('.yes').on('click' ,function(){
        var id=$(this).attr("value");
        var parent_id=$('#create_folder').attr("value");
        var type=$(this).attr("type");
        var query;
        switch (type) {
            case 'remove_transfer':
                _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Remove Transfer']);
                Putio.Transfers.cancel(id,function(data){})
            break;
            case 'rename':
                _gaq.push(['_trackEvent', 'files tab', 'click', 'Rename']);
                newName=$('#myNameInputModal input').val();
                Putio.Files.rename(id,newName,function(data){
                    if (query)Putio_Function.search(query);
                    else Putio_Function.goToFolder(parent_id);
                })
            break;
            case 'delete_files':
                _gaq.push(['_trackEvent', 'files tab', 'click', 'Delete']);
                if(id){
                    Putio.Files.del(id,function(data){
                        if (query)Putio_Function.search(query);
                        else Putio_Function.goToFolder(parent_id);
                    })
                }
            break;
            case 'move_files':
                _gaq.push(['_trackEvent', 'files tab', 'click', 'Move']);
                if(id){
                    direction=$('#folder_id').val();
                    if(direction!='loading')
                    Putio.Files.move(id,direction,function(data){
                        if (query)Putio_Function.search(query);
                        else Putio_Function.goToFolder(parent_id);
                    })
                }
            break;
            case 'create_folder':
                _gaq.push(['_trackEvent', 'files tab', 'click', 'Create Folder']);
                value=$('#myNameInputModal input').val();
                Putio.Files.create_folder(parent_id,value,function(data){
                    Putio_Function.goToFolder(parent_id);
                })
            break;
        }
        $('#myAlertModal').modal('hide');
        $('#myNameInputModal').modal('hide');
        $('#myNameFolderSelectModal').modal('hide');
    });

    $(document.body).on('click', '.rename' ,function(e){
        myFile=$('#file_list td[value='+$(this).attr("value")+']');
        $('#myNameInputModal h4').text('Rename to : ');
        $('#myNameInputModal input').val(myFile.text());
        $('#myNameInputModal .yes').attr('type','rename');
        $('#myNameInputModal .yes').attr('value',$(this).attr("value"));
        $('#myNameInputModal').modal('show');

    });

    $(document.body).on('click', '#delete_files' ,function(e){
        var ids=[];
        $("input[name=delete]:checked").each(function() {
            ids.push($(this).val());
        });
        var n = $("input[name=delete]:checked").length
        question='Are you sure you want to delete '+n+' file'
        if (n>1)question+='s'
        question+='?'
        $('#myAlertModal h4').text(question);
        $('#myAlertModal .yes').attr('type','delete_files');
        $('#myAlertModal .yes').attr('value',ids);
        $('#myAlertModal').modal('show');
    });

    $(document.body).on('click', '#move_files' ,function(e){
        $('#folder_id').prop('disabled', true);
        $("#folder_id").html('<option value="loading">Loading...</option>')
        $("#folder_id").append('<option value="0">/</option>')
        Putio_Function.count='0';
        Putio_Function.folderList('','0','#folder_id',function(data){
            $("#folder_id option[value='loading']").remove();
            $('#folder_id').prop('disabled', false);
        });
        var ids=[];
        $("input[name=delete]:checked").each(function() {
            ids.push($(this).val());
        });
        var n = $("input[name=delete]:checked").length
        text='Move '+n+' file';
        if (n>1)text+='s';
        text+=' to:';
        $('#myNameFolderSelectModal h4').text(text);
        $('#myNameFolderSelectModal .yes').text("Move");
        $('#myNameFolderSelectModal .yes').attr('type','move_files');
        $('#myNameFolderSelectModal .yes').attr('value',ids);
        $('#myNameFolderSelectModal').modal('show');
    });

    $(document.body).on('click', '#create_folder' ,function(e){
        $('#myNameInputModal h4').text('Create folder named : ');
        $('#myNameInputModal input').val('');
        $('#myNameInputModal .yes').attr('type','create_folder');
        $('#myNameInputModal').modal('show');
    });

    $(document.body).on('click', '#download_zip' ,function(e){
        _gaq.push(['_trackEvent', 'files tab', 'click', 'Download Zip']);
        var ids='';
        $("input[name=delete]:checked").each(function() {
            ids+=$(this).val()+',';
        });
        ids=ids.slice(0,-1);
        if(ids){
        var download_url = "https://api.put.io/v2/files/zip?file_ids="+ids;
        chrome.tabs.getSelected(undefined,function(data){
            chrome.tabs.update(data.id, {
                url:download_url
            });
        });
        }
    });

    $(document.body).on('keypress', '#myNameInputModal input' ,function(event){
        if(event.keyCode == 13){
            $("#myNameInputModal .yes").click();
        }
    });

    $(document.body).on('click', '.send_to_putio' ,function(e){
        from=$(this).attr('from');
        magnet=$(this).attr('magnet');
        background=chrome.extension.getBackgroundPage();

        if(from=='YIFY'){
            folder="default_movies_folder_id";
        }
        else {
            switch (Putio.category) {
                case 'movies':
                    folder="default_movies_folder_id";
                break;
                case 'tvshows':
                    folder="default_tvshows_folder_id";
                break;
                case 'music':
                    folder="default_music_folder_id";
                break;
                case 'games':
                    folder="default_games_folder_id";
                break;
                case 'applications':
                    folder="default_applications_folder_id";
                break;
                default:
                     folder="default_folder_id";
                break;
            }
        }

        background.Background.sendtoputio(magnet,localStorage[folder], 'search tab', from+' Send to Put.io');
    });

    /*$(document.body).on('click', '#last_movies_button' ,function(e){
        $("#search_result").html('<div id="yify_result"></div>');
        var page = $(this).attr("set");
        _gaq.push(['_trackEvent', 'search tab','click', "Latest Movie"]);
        Yify.Files.list(page,function(data){
            Putio_Function.displayLastMovies(data);
        })
    });*/
    

    $('#myNameInputModal').on('shown', function () {
        $("#myNameInputModal input").focus()
    })

    if(localStorage["tabName"]=='search')localStorage["tabName"]='files';

    Putio_Function.init(localStorage["tabName"] || 'files');
});