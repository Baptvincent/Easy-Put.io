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

    $(document.body).on('click', '#copy_links' ,function(e){
        e.preventDefault();
        var ids=[];
        $("input[name=delete]:checked").each(function() {
            ids.push($(this).val());
        });
        if(ids.length>0){
            ids=ids.toString();
            link_elememt=$('#copy_links').children();
            Putio.Files.getDownloadLink(ids,function(data){
                if(data.download_links.length>0){
                    download_links = data.download_links.join("\n");
                    Putio_Function.copy_links(download_links,link_elememt,'#5cb85c');
                    _gaq.push(['_trackEvent', 'files tab', 'click', 'Copy Links']);
                }
                else{
                    link_elememt.css('color','#d9534f');
                }
            })
        }
    });

    $(document.body).on('mouseleave', '#copy_links' ,function(e){
        link=$(this).children();
        if(link.css('color')!='rgb(0, 0, 0)')
        Putio_Function.reset_link(link);
    });

    $(document.body).on('click', '.copy_link' ,function(e){
        e.preventDefault();
        link_elememt=$(this).children();
        Putio.Files.getDownloadLink($(this).attr("value"),function(data){
            if(data.download_links.length>0){
                download_links = data.download_links.join("\n");
                Putio_Function.copy_links(download_links,link_elememt,'#428bca');
                _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Copy Link']);
            }
            else{
                link_elememt.css('color','#d9534f');
            }
        })
    });

    $(document.body).on('mouseleave', '.copy_link' ,function(e){
        link=$(this).children();
        if(link.css('color')!='rgb(0, 0, 0)')
        Putio_Function.reset_link(link);
    });

    $(document.body).on('click', '.show_file' ,function(e){
        e.preventDefault();
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
        e.preventDefault();
        var file_url = "https://put.io/file/"+$(this).attr("value");
        _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Show File on Put.io']);
        chrome.tabs.create({
                url:file_url
            });
    });

    $(document.body).on('click', '.download_file' ,function(e){
        e.preventDefault();
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
        e.preventDefault();
        _gaq.push(['_trackEvent', 'transfers tab', 'click', 'Clean Transfer']);
        Putio.Transfers.clean(function(data){})
    });

    $(document.body).on('click', '.remove' ,function(e){
        e.preventDefault();
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

    $(document.body).on('click', '#select_all' ,function(e){
        if($(this).prop("checked"))
            $("input[name=delete]").prop( "checked" ,true);
        else
            $("input[name=delete]").prop( "checked" ,false);

    });

    $(document.body).on('click', '.rename' ,function(e){
        e.preventDefault();
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

    $(document.body).on('mouseleave', '#file_list th:nth-child(4), #file_list td:nth-child(3), #result_list td:nth-child(3), #subtitle_result_list td:nth-child(2)' ,function(e){
        $(this).stop();
        $(this).stop();
        $(this).animate({ scrollLeft: 0 });
    });

    $(document.body).on('mouseenter', '#file_list th:nth-child(4), #file_list td:nth-child(3), #result_list td:nth-child(3), #subtitle_result_list td:nth-child(2)' ,function(e){
        $(this).stop();
        scrollWidth=$(this)[0].scrollWidth
        $(this).delay(1000).animate({ scrollLeft: scrollWidth }, 5000);
    });

    $(document.body).on('click', '#donate_btn' ,function(e){
        _gaq.push(['_trackEvent', 'more tab', 'click', 'Donate']);
        url='https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CX9H4LRJD2QUJ&lc=US&item_name=Easy%20Put%2eio&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted';
        chrome.tabs.create({
            url:url
        });
    });

    $(document.body).on('click', '#get_full_extension' ,function(e){
        _gaq.push(['_trackEvent', 'more tab', 'click', 'Get Full Extension']);
        url='http://easy-putio.baptiste-vincent.fr/';
        chrome.tabs.create({
            url:url
        });
    });

    $('#myNameInputModal').on('shown', function () {
        $("#myNameInputModal input").focus()
    })

    if(localStorage["tabName"]=='search')localStorage["tabName"]='files';

    Putio_Function.init(localStorage["tabName"] || 'files');
});