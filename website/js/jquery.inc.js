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
        Putio_Function.download(download_url);
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

                Putio_Function.download(download_url);
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
            case 'default_folder':
                if($('#folder_id_all').val()!='loading'){
                    localStorage["default_folder_id"]=$('#folder_id_all').val();
                    localStorage["default_movies_folder_id"]=$('#folder_id_movies').val();
                    localStorage["default_tvshows_folder_id"]=$('#folder_id_tvshows').val();
                    localStorage["default_music_folder_id"]=$('#folder_id_music').val();
                    localStorage["default_games_folder_id"]=$('#folder_id_games').val();
                    localStorage["default_applications_folder_id"]=$('#folder_id_applications').val();
                    _gaq.push(['_trackEvent', 'search tab', 'Default Folder All', $('#folder_id_all>option:selected').text()]);
                    _gaq.push(['_trackEvent', 'search tab', 'Default Folder Movies', $('#folder_id_movies>option:selected').text()]);
                    _gaq.push(['_trackEvent', 'search tab', 'Default Folder TV Shows', $('#folder_id_tvshows>option:selected').text()]);
                    _gaq.push(['_trackEvent', 'search tab', 'Default Folder Music', $('#folder_id_music>option:selected').text()]);
                    _gaq.push(['_trackEvent', 'search tab', 'Default Folder Games', $('#folder_id_games>option:selected').text()]);
                    _gaq.push(['_trackEvent', 'search tab', 'Default Folder Applications', $('#folder_id_applications>option:selected').text()]);

                    Putio_Function.updateDefaultFolder();
                }
            break;
            case 'default_subtitle':
                localStorage["default_subtitle_code"]=$('#subtitle_code').val();
                _gaq.push(['_trackEvent', 'search tab', 'Change Default Subtitle', localStorage["default_subtitle_code"]]);
                $("#select_default_language").text(VAR_LANGUAGES[localStorage["default_subtitle_code"]]);
            break;
            case 'default_url':
                if ($('#pb_url').val())
                    localStorage["pb_url"]=$('#pb_url').val();
                else
                    localStorage["pb_url"]="http://thepiratebay.sx";

                if ($('#kat_url').val())
                    localStorage["kat_url"]=$('#kat_url').val();
                else
                    localStorage["kat_url"]="http://kickass.to";

                if ($('#old_api').is(':checked')){
                    localStorage["old_api"]="true";
                    _gaq.push(['_trackEvent', 'search tab', 'click', 'Use old Api']);
                }
                else{
                    localStorage["old_api"]="false";
                    _gaq.push(['_trackEvent', 'search tab', 'click', 'Use new Api']);
                }

                localStorage["default_routing"] = $('#routing').val();
                Putio.Account.change_route(localStorage['default_routing'],function(data){})

                _gaq.push(['_trackEvent', 'search tab', 'pb url', localStorage["pb_url"]]);
                _gaq.push(['_trackEvent', 'search tab', 'kat url', localStorage["kat_url"]]);
                _gaq.push(['_trackEvent', 'search tab', 'routing', localStorage["default_routing"]]);
                $('#defaultUrlModal').modal('hide');
            break;
        }
        $('#myAlertModal').modal('hide');
        $('#myNameInputModal').modal('hide');
        $('#myNameFolderSelectModal').modal('hide');
        $('#defaultSubtitleSelectModal').modal('hide');
        $('#defaultFolderModal').modal('hide');
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
            Putio_Function.download(download_url);
        }
    });

    $(document.body).on('click', '#submit_search' ,function(e){
        category=$('#search_category').val();
        filter=$('input:radio[name=search_filter]:checked').val();
        if(category=='torrent_link'){
            title=$('#send_link').val();
            title=title.replace(" magnet:?", "\nmagnet:?");
            title=title.replace(" http", "\nhttp");
        }
        else{
            title=$('#search_title').val();
        }

        if(title){
            _gaq.push(['_trackEvent', 'search tab', category, title]);
            switch (category) {
                case 'kickasstorrents':
                    $("#search_result").html('<div id="kat_result"></div>');
                    Kickasstorrents.Files.search(title,filter,function(data){
                        Putio_Function.displayKatResult(data);
                    })
                break;
                case 'piratebay':
                if (localStorage["old_api"]=="true"){
                    _gaq.push(['_trackEvent', 'search tab', 'old_pb_api','true']);
                    $("#search_result").html('<div id="old_pb_result"></div>');
                    OldPiratebay.Files.search(title,filter,function(data){
                        Putio_Function.displayPbResult(data,true);
                    })
                }
                else
                    _gaq.push(['_trackEvent', 'search tab', 'old_pb_api','false']);
                    $("#search_result").html('<div id="pb_result"></div>');
                    Piratebay.Files.search(title,filter,function(data){
                        Putio_Function.displayPbResult(data,false);
                    })
                break;
                case 'opensubtitle':
                    $("#search_result").html('<div id="os_result"></div>');
                    Opensubtitles.account.login(function(data){
                        Opensubtitles.search.subtitle(data.token,title,function(data){
                            Putio_Function.displaySubtitleResult(data);
                        })
                    })
                break;
                case 'torrent_link':
                    background=chrome.extension.getBackgroundPage()
                    background.Background.sendtoputio(title,localStorage["default_folder_id"],'search tab', 'Add new files to Put.io')
                break;
            }
        }
    });


    $(document.body).on('keypress', '#search_title' ,function(event){
        if(event.keyCode == 13){
            $("#submit_search").click();
        }
    });

    $(document.body).on('keypress', '#myNameInputModal input' ,function(event){
        if(event.keyCode == 13){
            $("#myNameInputModal .yes").click();
        }
    });

    $(document.body).on('click', '.download_subtitle' ,function(e){
        download_url=$(this).attr('url');
        _gaq.push(['_trackEvent', 'search tab', 'click','Download Subtitle']);
        chrome.tabs.getSelected(undefined,function(data){
            chrome.tabs.update(data.id, {
                url:download_url
            });
        });
    });

    $(document.body).on('click', '.search_subtile' ,function(e){
        localStorage["searchCategory"]="opensubtitle";
        hash=$(this).attr('hash');
        size=$(this).attr('size');
        id=$(this).attr("value");
        myFile=$('#file_list td[value='+id+']').text();
        _gaq.push(['_trackEvent', 'files tab', 'click','Search Subtitle']);
        Putio_Function.go('search');
        $('#search_title').val(myFile)
        $("#search_result").html('<div id="os_result"></div>');
        Opensubtitles.account.login(function(data){
            Opensubtitles.search.hash(data.token,hash,size,function(result){
                if(!result.data){
                    $("#submit_search").click();
                }
                else{
                    Putio_Function.displaySubtitleResult(result);
                }
            })
        })
        
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

    //$("html, body").animate({ scrollTop: $(document).height() }, "slow");

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

    $(document.body).on('click', '#last_movies_button' ,function(e){
        $("#search_result").html('<div id="yify_result"></div>');
        var page = $(this).attr("set");
        _gaq.push(['_trackEvent', 'search tab','click', "Latest Movie"]);
        Yify.Files.list(page,function(data){
            Putio_Function.displayLastMovies(data);
        })
    });
    
    $(document.body).on('click', '.page-link' ,function(e){
        var page = $(this).attr("href");
        var page=page.replace("#page-","");
        Yify.Files.list(page,function(data){
            Putio_Function.displayLastMovies(data);
            $('body').scrollTop(0);
        })
    });

    $(document.body).on('click', '.show_on_imdb' ,function(e){
        var file_url = $(this).attr("url");
        _gaq.push(['_trackEvent', 'search tab', 'click', 'Show On Imdb']);
        chrome.tabs.create({
                url:file_url
            });
    });

    $(document.body).on('click', '#go_to_yify' ,function(e){
        url = 'http://yify-torrents.com/'
        _gaq.push(['_trackEvent', 'search tab', 'click', 'Go To YIFY']);
        chrome.tabs.create({
                url:url
            });
    });

    $(document.body).on('mouseenter', '#last_movies_list .first' ,function(e){
        $(this).closest('tr').children('td.first').css("background-color", "#428bca");
        $(this).closest('tr').children('td.first').css("color", "#FFFFFF");
    });

    $(document.body).on('mouseleave', '#last_movies_list .first' ,function(e){
        $(this).closest('tr').children('td.first').css("background-color", "");
        $(this).closest('tr').children('td.first').css("color", "");
    });

    $(document.body).on('mouseenter', '#last_movies_list .second' ,function(e){
        $(this).closest('tr').children('td.second').css("background-color", "#428bca");
        $(this).closest('tr').children('td.second').css("color", "#FFFFFF");
    });

    $(document.body).on('mouseleave', '#last_movies_list .second' ,function(e){
        $(this).closest('tr').children('td.second').css("background-color", "");
        $(this).closest('tr').children('td.second').css("color", "");
    });

    $('#myNameInputModal').on('shown', function () {
        $("#myNameInputModal input").focus()
    })

    $(document.body).on('click', '.thumbnail_yify' ,function(e){
        _gaq.push(['_trackEvent', 'search tab', 'click', 'YIFY Thumbnail']);
        /*var imdb_id = $(this).attr("imdb_id");
        $.get('http://mymovieapi.com/?id='+imdb_id+'&type=json&plot=none&episode=0&lang=en-US&aka=simple&release=simple&business=0&tech=0', function(data) {
          data = JSON.parse(data);
          src = data.poster.replace(/\._V1.*\./, '._V1._SX600_SY600_.');
            $('#thumbnail_modal').html('<img data-dismiss="modal" src="'+src+'"/>');
            $('#thumbnail_modal').modal('show');
        });*/
        var src = $(this).attr("src");
        src=src.replace("_med.","_large.");
        $('#thumbnail_modal').html('<img data-dismiss="modal" src="'+src+'"/>');
        $('#thumbnail_modal').modal('show');
    });

    $(document.body).on('click', '#select_default_folder' ,function(e){
        $("body").css('min-height', '340px');
        $(".default_folder_list").prop('disabled', true);
        $(".default_folder_list").html('<option value="loading">Loading...</option>')
        $(".default_folder_list").append('<option value="0">/</option>')
        Putio_Function.count='0';
        Putio_Function.folderList('','0','.default_folder_list',function(data){
            $(".default_folder_list option[value='loading']").remove();
            $('#folder_id_all option[value="'+localStorage["default_folder_id"]+'"]').prop("selected",true);
            $('#folder_id_movies option[value="'+localStorage["default_movies_folder_id"]+'"]').prop("selected",true);
            $('#folder_id_tvshows option[value="'+localStorage["default_tvshows_folder_id"]+'"]').prop("selected",true);
            $('#folder_id_music option[value="'+localStorage["default_music_folder_id"]+'"]').prop("selected",true);
            $('#folder_id_games option[value="'+localStorage["default_games_folder_id"]+'"]').prop("selected",true);
            $('#folder_id_applications option[value="'+localStorage["default_applications_folder_id"]+'"]').prop("selected",true);
            $('.default_folder_list').prop('disabled', false);
        });
        $('#defaultFolderModal').modal('show');
    });

    $(document.body).on('click', '#select_default_language' ,function(e){
        $('#subtitle_code').html('');
         $.each(VAR_LANGUAGES,function(index, value){
            selected=(localStorage["default_subtitle_code"]==index) ? "selected" : "";
            $('#subtitle_code').append('<option value="'+index+'" '+selected+'>'+value+'</option>')
         })
        $('#defaultSubtitleSelectModal').modal('show');
    });

    $(document.body).on('click', '#select_default_url' ,function(e){
        $('#pb_url').val(localStorage["pb_url"]);
        $('#kat_url').val(localStorage["kat_url"]);
        if(localStorage["old_api"]=="true"){
            $('#old_api').prop('checked', true);
            $("#pb_url").prop('disabled', true);
        }
        $('#defaultUrlModal').modal('show');
        $('#routing').html('');
        $.each(VAR_ROUTES,function(index, value){
            selected=(localStorage["default_routing"]==value.name) ? "selected" : "";
            $('#routing').append('<option value="'+value.name+'" '+selected+'>'+value.description+'</option>')
         })
    });

    $(document.body).on('click', '#donate' ,function(e){
        _gaq.push(['_trackEvent', 'more tab', 'click', 'Donate']);
        url='https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CX9H4LRJD2QUJ&lc=US&item_name=Easy%20Put%2eio&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted';
        chrome.tabs.create({
            url:url
        });
    });

    $(document.body).on('change', '#old_api' ,function(e){
        if($('#old_api').is(':checked'))
            $("#pb_url").prop('disabled', true);
        else
            $("#pb_url").prop('disabled', false);
    })

    $(document.body).on('change', '#search_category' ,function(e){
        search_category=$(this).val();
        if(search_category!='opensubtitle'){
            Putio_Function.updateDefaultFolder()
        }

        if(search_category=='opensubtitle'){
            placeholder="Search on OpenSubtitles";
            $(".search_filter").prop('disabled', true);
            $("#submit_search").text('Search');
            $('#send_link').hide();
            $('#search_title').prop('disabled', false);
        }
        else if(search_category=='torrent_link'){
            placeholder="";
            $(".search_filter").prop('disabled', true);
            $("#submit_search").text('Fetch');
            $('#search_title').prop('disabled', true);
            $('#send_link').show();
        }
        else if(search_category=='piratebay'){
            placeholder="Search on The Pirate Bay";
            $(".search_filter").prop('disabled', false);
            $("#submit_search").text('Search')
            $('#send_link').hide();
            $('#search_title').prop('disabled', false);
        }
        else if(search_category=='kickasstorrents'){
            placeholder="Search on KickassTorrents";
            $(".search_filter").prop('disabled', false);
            $("#submit_search").text('Search')
            $('#send_link').hide();
            $('#search_title').prop('disabled', false);
        }

        $('#search_title').attr('placeholder',placeholder);
        _gaq.push(['_trackEvent', 'search tab', 'category', search_category]);
        localStorage["searchCategory"]=search_category;
        $("#send_link").focus()
        $("#search_title").focus()
    })

    $(document.body).on('change', '[name=search_filter]' ,function(e){
        search_filter=$(this).val();
        _gaq.push(['_trackEvent', 'search tab', 'filter', search_filter]);
        localStorage["searchFilter"]=search_filter;

        Putio_Function.updateDefaultFolder();
    })

    Putio_Function.init(localStorage["tabName"] || 'files');
});