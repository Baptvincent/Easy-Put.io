Putio_Function = {
    time : null,
    count : 0,
    folderList : undefined,

    bytesToSize:function(bytes,precision) {
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return ((i == 0)? (bytes / Math.pow(1024, i)) : (bytes / Math.pow(1024, i)).toFixed(precision)) + ' ' + sizes[i];
    },

    checkVersion : function(){
        today=new Date();
        today.setUTCHours(0);
        today.setUTCMinutes(0);
        today.setUTCSeconds(0);
        today.setUTCMilliseconds(0);
        today=today.getTime();

        if (!localStorage["date_check_version"] ){
            _gaq.push(['_trackEvent', 'version', localStorage["version"]]);
            localStorage["date_check_version"]=today;
        }
        else if(today!=localStorage["date_check_version"]){
            _gaq.push(['_trackEvent', 'version', localStorage["version"]]);
            localStorage["date_check_version"]=today;
        }
    },

    checkZip : function(zip_id){
        Putio.Zips.info(zip_id,function(data){
            if (data.url){
                Putio_Function.download(data.url);
            }
                

            else{
                setTimeout(function () {
                    checkZip(zip_id);
                }, 2000);
            }
        })
    },

    copy_links : function(download_links,link_element,color){
        Putio.Account.settings(function(data){
            if (data.settings.routing != localStorage['default_routing']){
                Putio.Account.change_route(localStorage['default_routing'],function(data){
                    background=chrome.extension.getBackgroundPage();
                    background.Background.copyToClipboard(download_links);
                    link_element.css('color',color);
                })
            }
            else{
                background=chrome.extension.getBackgroundPage();
                background.Background.copyToClipboard(download_links);
                link_element.css('color',color);
            }
        })
    },

    download : function(download_url){
        Storage.getData(function(storage){
            var ACCESS_TOKEN = storage["putio_token"];

            Putio.Account.settings(function(data){
                if (data.settings.routing != localStorage['default_routing']){
                    Putio.Account.change_route(localStorage['default_routing'],function(data){

                        if(localStorage["ask_save"]=="yes"){
                            chrome.downloads.download({
                            url:download_url+"?oauth_token="+ACCESS_TOKEN,saveAs:!0},function(){})
                        }
                        else{
                            chrome.tabs.getSelected(undefined,function(data){
                                chrome.tabs.update(data.id, {
                                    url:download_url+"?oauth_token="+ACCESS_TOKEN
                                });
                            });
                        }
                    })
                }
                else{
                    if(localStorage["ask_save"]=="yes"){
                        chrome.downloads.download({
                        url:download_url+"?oauth_token="+ACCESS_TOKEN,saveAs:!0},function(){})
                    }
                    else{
                        chrome.tabs.getSelected(undefined,function(data){
                            chrome.tabs.update(data.id, {
                                url:download_url+"?oauth_token="+ACCESS_TOKEN
                            });
                        });
                    }
            }
            })
        })
    },

    downloadZip : function(ids){
        Putio.Files.zip(ids,function(data){
            if(data.status=="OK"){
                Putio_Function.checkZip(data.zip_id);
            }
        })
    },

    displayPbResult : function(result,old){
        var content='';

        if (result.error){
            content+='<div class="alert alert-danger"><h4>Sorry!</h4>';
            content+=result.status+' '+result.statusText+'<div>';
        }
        else if(result.length>0){
            content+='<table class="table-condensed table-striped" id="result_list">';
            content+='<thead>';
            content+='<tr class="text-left">';
            content+='<th style="width: 11%">';
            content+='Category';
            content+='</th>';
            content+='<th style="width: 12%">';
            content+='Size';
            content+='</th>';
            content+='<th style="width: 57%">';
            content+='Name';
            content+='</th>';
            content+='<th style="width: 11%">';
            content+='Age';
            content+='</th>';
            content+='<th style="width: 9%">';
            content+='Seeders';
            content+='</th>';
            content+='</thead>';
            content+='<tbody>';

             $.each(result,function(index, value){
                if(value.category.indexOf("HD")!=-1)
                    value.category='HD'

                value.size=value.size.replace("i","");

                content+='<tr class="send_to_putio" from="PB" magnet="'+value.magnet+'">';
                content+='<td>';
                content+=value.category;
                content+='</td>';
                content+='<td>';
                content+=value.size;
                content+='</td>';
                content+='<td>';
                content+='<strong>'+value.name+'</strong>';
                content+='</td>';
                content+='<td>';
                content+=Putio_Function.pirateBayTimeToDuration(value.uploaded);
                content+='</td>';
                content+='<td>';
                content+=value.seeders;
                content+='</td>';
                content+='</tr>';
             })


            content+='</tbody>';
            content+='</table>';
        }
        else{
            content+='<div class="alert alert-warning"><h4>Nothing found!</h4>';
            content+='Your search "'+Piratebay.query+'" did not match any documents.<div>';
        }
        if(old==true)
            $("#old_pb_result").html(content);
        else
            $("#pb_result").html(content);
    },

    displayKatResult : function(result){
        var content='';

        if (result.error){
            content+='<div class="alert alert-danger"><h4>Sorry!</h4>';
            content+=result.status+' '+result.statusText+'<div>';
        }
        else if(result.channel && result.channel.item.length>0){
            content+='<table class="table-condensed table-striped" id="result_list">';
            content+='<thead>';
            content+='<tr class="text-left">';
            content+='<th style="width: 11%">';
            content+='Category';
            content+='</th>';
            content+='<th style="width: 12%">';
            content+='Size';
            content+='</th>';
            content+='<th style="width: 57%">';
            content+='Name';
            content+='</th>';
            content+='<th style="width: 11%">';
            content+='Age';
            content+='</th>';
            content+='<th style="width: 9%">';
            content+='Seeders';
            content+='</th>';
            content+='</thead>';
            content+='<tbody>';

             $.each(result.channel.item,function(index, value){
                var today = new Date();
                var pubDate= new Date(value.pubDate)
                var secondDifference = today - new Date(value.pubDate);

                pubDate = Putio_Function.millisecondsToString(secondDifference)

                category=value.category.split(">")

                content+='<tr class="send_to_putio" from="KAT" magnet="'+value.magnetURI+'">';
                content+='<td>';
                content+=category[0];
                content+='</td>';
                content+='<td>';
                content+=Putio_Function.bytesToSize(value.contentLength,2);
                content+='</td>';
                content+='<td>';
                content+='<strong>'+value.title+'</strong>';
                content+='</td>';
                content+='<td>';
                content+=pubDate;
                content+='</td>';
                content+='<td>';
                content+=value.seeds;
                content+='</td>';
                content+='</tr>';
             })


            content+='</tbody>';
            content+='</table>';
        }
        else{
            content+='<div class="alert alert-warning"><h4>Nothing found!</h4>';
            content+='Your search "'+Kickasstorrents.query+'" did not match any documents.<div>';
        }
        $("#kat_result").html(content);
    },

    displayLastMovies : function(result){

        //console.log(result);
        //console.log(result.data);
        //console.log(result.data.movies);

        var content='';
        if (result.error){
            content+='<div class="alert alert-danger"><h4>Sorry!</h4>';
            content+=result.status+' '+result.statusText+'<div>';
        }
        else if(result.data.movies.length>0){

            Yify.page=parseInt(Yify.page)

            content+='<table class="table-condensed table-striped" id="last_movies_list">';
            
            content+='<thead>';
            content+='<tr>';
            content+='<th colspan="4" class="text-left">';
            content+='<div id="powered_by" >Powered by <span id="go_to_yify">YIFY Torrents</span></div>';
            content+='<ul class="pagination pagination-xs">';
            
            content+='</ul>';
            content+='</th>';
            content+='</thead>';

            content+='<tfoot>';
            content+='<tr>';
            content+='<th colspan="4" class="text-right">';
            content+='<ul class="pagination pagination-xs">';
            content+='</ul>';
            content+='</th>';
            content+='</tfoot>';

            content+='<tbody>';
             $.each(result.data.movies,function(index, value){
                downloadButtons = "";
                torrentsInfo = "";
                genres = "";

                if(value.genres){
                    $.each(value.genres,function(genreIndex, genreValue){
                        genres+=genreValue+' / ';
                    })
                    genres = genres.substring(0, genres.length-3);
                }
                if(value.torrents){
                    $.each(value.torrents,function(torrentIndex, torrentValue){
                        downloadButtons+='<button html="true" data-toggle="tooltip" data-placement="top" title="" data-original-title="Size: '+torrentValue.size+'\nPeers: '+torrentValue.peers+'\nSeeds: '+torrentValue.seeds+'" class="btn btn-default btn-xs send_to_putio" from="YIFY" type="button" magnet="'+torrentValue.url+'">'+torrentValue.quality+'</button>';
                    })
                }

                info='<td class="%myclass%" style="width: 17%">';
                info+='<img src="'+value.medium_cover_image+'" imdb_id="'+value.imdb_code+'" class="thumbnail_yify"/>';
                info+='</td>';
                info+='<td class="%myclass%" style="width: 33%">';
                info+='<h5><strong>'+value.title_long+'</strong></h5>';
                info+='<strong>Genre: </strong>'+genres+'</br>';
                info+='<img src="img/logo-imdb.svg" class="show_on_imdb" url="http://www.imdb.com/title/'+value.imdb_code+'/" > : '+value.rating+'</br>';
                info+=downloadButtons;
                info+='</td>';

                if(index%2==0){
                    content+='<tr>';
                    info=info.replace(/%myclass%/g,"first");
                    content+=info;
                }
                else if(index%2==1){
                    info=info.replace(/%myclass%/g,"second");
                    content+=info;
                    content+='</tr>';
                }

             })
            content+='</tbody>';
            content+='</table>';
        }
        $("#yify_result").html(content);
        $('[data-toggle="tooltip"]').tooltip({'delay': { show: 200, hide: 200 }});
        $(".pagination").pagination({
            items: result.data.movie_count,
            itemsOnPage: 20,
            displayedPages:5,
            edges:1,
            currentPage : Yify.page,
            prevText :"&laquo;",
            nextText :"&raquo;",
            selectOnClick:false
        });
    },

    displaySubtitleResult : function(result){
        var content='';
        if (result.error){
            content+='<div class="alert alert-danger"><h4>Sorry!</h4>';
            content+=result.status+' '+result.statusText+'<div>';
        }
        else if(result.data){
            content+='<table class="table-condensed table-striped" id="subtitle_result_list">';
            content+='<thead>';
            content+='<tr class="text-left">';
            content+='<th width="14%">';
            content+='Language';
            content+='</th>';
            content+='<th width="86%">';
            content+='Name';
            content+='</th>';
            content+='</thead>';
            content+='<tbody>';

             $.each(result.data,function(index, value){
                content+='<tr class="download_subtitle" url="'+value.ZipDownloadLink+'">';
                content+='<td>';
                content+=value.LanguageName;
                content+='</td>';
                content+='<td>';
                content+='<strong>'+value.SubFileName+'</strong>';
                content+='</td>';
            })

        }
        else{
            content+='<div class="alert alert-warning"><h4>Nothing found!</h4>';
            content+='Your search "'+Opensubtitles.query+'" did not match any documents.<div>';
        }
        $("#os_result").html(content);
    },

    go : function(tab_name, folder_id){
            $("#content").html('');
            clearTimeout(this.time);
            $("#menu li").attr('class','');
            $('#'+tab_name).parent('li').attr('class','active');
            localStorage["tabName"] = tab_name;
            this.loadTabContent(tab_name,folder_id);
    },

    getDefaultFolderData : function(callback){
        folder=Putio_Function.getDefaultFolderToDisplay()

        if (!localStorage[folder])localStorage[folder]=0;

        Putio.Files.info(localStorage[folder],function(data){
            if(data.status=="ERROR" && data.error_type=="NotFound"){
                localStorage[folder]=0;
                Putio_Function.getDefaultFolderData();
            }
            else{
                $("#options").append(' | Download to <strong><a href="#" data-toggle="tooltip" data-placement="right" title="" data-original-title="Change" folder_id="'+localStorage[folder]+'" id="select_default_folder">'+data.file.name+'</a></strong>');
                }
            $('[data-toggle="tooltip"]').tooltip({'delay': { show: 1500, hide: 200 }});
        })
    },

    getDefaultFolderToDisplay : function(){
        if($("#search_category").val()=="kickasstorrents" || $("#search_category").val()=="piratebay"){
            switch($('input:radio[name=search_filter]:checked').val()){
                case "all":
                    folder="default_folder_id";
                break;
                case "movies":
                    folder="default_movies_folder_id";
                break;
                case "tvshows":
                    folder="default_tvshows_folder_id";
                break;
                case "music":
                    folder="default_music_folder_id";
                break;
                case "games":
                    folder="default_games_folder_id";
                break;
                case "applications":
                    folder="default_applications_folder_id";
                break;
                default:
            
                break
            }
        }

        else{
            folder="default_folder_id";
        }

        return folder;
    },

    goToFolder : function(id){
        Putio.Files.list(id,function(data){
            if(data.status=="ERROR"){
                Putio_Function.goToFolder(0)
            }
            else{
                localStorage["lastFolder"]=id;
                var files=data.files;
                var parent=data.parent;
                name=parent.name;
                name=Putio_Function.ucwords(name)

                var content='';

                content+='<table class="table-condensed table-striped" id="file_list">';

                content+='<thead>';
                content+='<tr class="text-left">';
                content+='<th style="width: 3%">';
                content+='<input type="checkbox" name="select_all" id="select_all">';
                content+='</th>';
                content+='<th style="width: 7%">';
                content+='<a id="delete_files" data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete Files" href="#"><span class="glyphicon glyphicon-remove"></span></a>';
                content+='<a id="move_files" data-toggle="tooltip" data-placement="top" title="" data-original-title="Move Files" href="#"><span class="glyphicon glyphicon-share"></span></a>';
                content+='<a id="download_zip" data-toggle="tooltip" data-placement="top" title="" data-original-title="Download Zip" href="#"><span class="glyphicon glyphicon-download-alt"></span></a>';
                content+='<a id="copy_links" data-toggle="tooltip" data-placement="top" title="" data-original-title="Copy Links" href="#"><span class="glyphicon glyphicon-paperclip"></span></a>';
                content+='</th>';
                if(parent.parent_id!=undefined){
                    content+='<th style="width: 7%">';
                    content+='<a class="folder" value='+parent.parent_id+' data-toggle="tooltip" data-placement="top" title="" data-original-title="Back" href="#"><span class="glyphicon glyphicon-arrow-left"></span></a>';
                    content+='<a class="folder" value="0" data-toggle="tooltip" data-placement="top" title="" data-original-title="Home" href="#"><span class="glyphicon glyphicon-home"></span></a>';
                    content+='</th>';
                    content+='<th style="width: 63%">';
                }
                else{
                    content+='<th style="width: 0%">';
                    content+='</th>';
                    content+='<th style="width: 70%">';
                }
                content+='<span>'+name+'</span>';
                content+='</div>';
                content+='</th>';
                content+='<th style="width: 14%">';
                content+='<small>'+Putio_Function.bytesToSize(parent.size,2)+'</small>';
                content+='</th>';
                content+='<th style="width: 6%">';
                content+='<a id="create_folder" data-toggle="tooltip" data-placement="left" title="" data-original-title="Create Folder" value="'+id+'" href="#"><span class="glyphicon glyphicon-plus"></span></a>';
                content+='</th>';
                content+='</tr>';
                content+='</thead>';

                content+='<tbody>';

                $.each(files,function(index, value){
                    content+='<tr>';
                    content+='<td>';
                    content+='<input type="checkbox" name="delete" value="'+value.id+'">';
                    content+='</td>';
                    content+='<td>';
                    content+='<img class="thumbnail_putio" src="'+value.icon+'"/>';
                    content+='</td>';

                    if(value.content_type=='application/x-directory'){
                        content+='<td class="folder" colspan="2" value='+value.id+'>';
                    }
                    else{
                        content+='<td class="files" colspan="2" value='+value.id+'>';
                    }

                    content+=value.name;
                    content+='</td>';
                    content+='<td>';
                    content+='<small>'+Putio_Function.bytesToSize(value.size,2)+'</small>';
                    content+='</td>';
                    content+='<td>';
                    content+='<a class="rename" data-toggle="tooltip" data-placement="left" title="" data-original-title="Rename" value="'+value.id+'" href="#"><span class="glyphicon glyphicon-edit"></span></a>';
                    if(value.opensubtitles_hash){
                       content+='<a class="search_subtile" data-toggle="tooltip" data-placement="left" title="" data-original-title="Subtitles" value="'+value.id+'" hash="'+value.opensubtitles_hash+'" size="'+value.size+'" href="#"><span class="glyphicon glyphicon-search"></span></a>'; 
                    }
                    content+='</td>';
                    content+='</tr>';
                });

                content+='</tbody>';
                content+='</table>';

                $("#tab_files").html(content);
                $('[data-toggle="tooltip"]').tooltip({'delay': { show: 1500, hide: 200 }});
            }
            
        });
    },

    init : function(tab_name){
        Putio_Function.checkVersion();
        Storage.getData(function(storage){
            if(storage["putio_token"]){
                Putio_Function.go(tab_name);
                Putio.Account.info(function(data){
                    if (data.error=='invalid_grant')
                    {
                        chrome.tabs.create({
                            url:chrome.extension.getURL("options.html")
                        });
                    }
                    else{
                        var datas=data.info;
                        var diskAvailable=Putio_Function.bytesToSize(datas.disk.avail,2);
                        var percent_available=datas.disk.used*100/datas.disk.size;
                        percent_available=Math.round(percent_available * 100) / 100;

                        if(percent_available>90){
                            style="progress-bar-danger";
                        }
                        else if(percent_available>80){
                            style="progress-bar-warning";
                        }
                        else {
                            style="progress-bar-success";
                        }

                        content='';
                        content+='<div class="progress storage_available">';
                        content+='<span id="disk_used">Used : '+percent_available+'% ('+diskAvailable+' Free)</span>';
                        content+='<div class="progress-bar '+style+'" role="progressbar" aria-valuenow="'+percent_available+'" aria-valuemin="0" aria-valuemax="100" style="width: '+percent_available+'%">';
                        content+='</div>';

                        $('#account_info').html(content);
                    }
                });
            }
            else{
                chrome.tabs.create({
                    url:chrome.extension.getURL("options.html")
                });
            }
        });
    },

    listFolder:function(padding, folder_id, select, callback){

        if(Putio_Function.folderList != undefined){
            $(select).html(Putio_Function.folderList)
            callback('done');
        }

        else{
            Putio_Function.count++;
            Putio.Files.list(folder_id,function(data){
                var files=data.files;
                $.each(files,function(index, value){
                    if (value.content_type=='application/x-directory' && !value.is_shared){
                        //$("#folder_id").append('<option value="'+value.id+'">'+padding+value.name+'</option>');
                        $('<option value="'+value.id+'">'+padding+value.name+'</option>').insertAfter(select+" option[value='"+folder_id+"']");
                        Putio_Function.listFolder(padding+'&nbsp;&nbsp;&nbsp;',value.id,select,callback);

                    }
                })
                Putio_Function.count--;
                if (Putio_Function.count == 0 && callback)
                    callback('done');
            })
        }
    },
    
    loadTabContent:function (tabName, folder_id){
        _gaq.push(['_trackPageview', tabName]);
        switch (tabName) {
            case 'files':
                $("#content").html('<div id="tab_files"></div>');
                if(folder_id || folder_id=='0')
                     this.goToFolder(folder_id)
                else
                    this.goToFolder(localStorage["lastFolder"] || '0');
                break;
            case 'transfers':
                $("#content").html('<div id="tab_transfers"></div>');
                this.transfersList();
                break;
            case 'search':
                $("#content").html('<div id="tab_search"></div>');
                if(!localStorage["kat_url"])
                    localStorage["kat_url"]="https://kat.cr"
                if(!localStorage["pb_url"])
                    localStorage["pb_url"]="https://thepiratebay.vg"
                this.search(function(data){
                    $("#send_link").focus()
                    $("#search_title").focus()
                });
                break;
            default:
                break;
        }
    },

    millisecondsToString:function(ms){
        x = ms / 1000
        seconds = x % 60
        x /= 60
        minutes = x % 60
        x /= 60
        hours = x % 24
        x /= 24
        days = x

        seconds = parseInt(seconds);
        minutes = parseInt(minutes);
        hours = parseInt(hours);
        days = parseInt(days);

        if(days==1){
            return days+" day"
        }
        else if(days>1){
            return days+" days"
        }
        else if(hours==1){
            return hours+" hour"
        }
        else if(hours>1){
            return hours+" hours"
        }
        else if(minutes==1){
            return minutes+" minute"
        }
        else if(minutes>1){
            return minutes+" minutes"
        }
        else if(seconds==1){
            return seconds+" second"
        }
        else if(seconds>1){
            return seconds+" seconds"
        } 
    },

    pirateBayTimeToDuration:function(time){
        if(time.indexOf("ago") != -1)return time.replace(' ago','');
        var today = new Date();
        var yesterday = new Date();
        yesterday.setDate(today.getDate()-1);
        var dateYear;
        var dayHour='00';
        var dayMinute='00';
        var daySecond='00';
        myDate=time.split(" ");
        switch(myDate[0]){
            case "Y-day":
                dateDay=yesterday.getDate();
                dateMonth=yesterday.getMonth();
                dateYear=yesterday.getFullYear();
            break;
            case "Today":
                dateDay=today.getDate();
                dateMonth=today.getMonth();
                dateYear=today.getFullYear();
            break;
            default:
                dayMonth=myDate[0].split("-");
                dateDay=dayMonth[1];
                dateMonth=dayMonth[0];
                while(dateDay.charAt(0) === '0')
                    dateDay = dateDay.substr(1);
                while(dateMonth.charAt(0) === '0')
                    dateMonth = dateMonth.substr(1);
                dateMonth--;
            break
        }

        if(myDate[1].indexOf(":") !== -1){
            hourMinute=myDate[1].split(":");
            dayHour=hourMinute[0];
            dayMinute=hourMinute[1];

            /*while(dayHour.charAt(0) === '0')
                dayHour = dayHour.substr(1);
            while(dayMinute.charAt(0) === '0')
                dayMinute = dayMinute.substr(1);*/

            if(!dateYear)dateYear=today.getFullYear();
        }
        else{
            dateYear=myDate[1];
        }

        var months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

        var formatedDate = new Date(months[dateMonth] + ' ' + dateDay + ', ' + dateYear + ' '+dayHour+':'+dayMinute+':'+daySecond+' GMT');
        //var formatedDate = new Date(dateYear,dateMonth,dateDay,dayHour,dayMinute,daySecond);

        var secondDifference = today - formatedDate;

        return Putio_Function.millisecondsToString(secondDifference)
    },

    reset_link : function(element){
        setTimeout(function(){
            element.css('color','#000000')},1000);
    },

    seconds_to_time: function($seconds, $long){
      if ($seconds == -1) {
        return '&infin;';
      }

        if ($seconds < 0 || $seconds == null){
        return '';
      }

      if ($long){
        $fsec =  'sec';
        $fmin = 'min';
        $fhour = 'hour';
        $fday = 'day';
      } else {
        $fsec =  's';
        $fmin = 'm';
        $fhour = 'h';
        $fday = 'd';
      }


      if ($seconds == 0){
        return '';
      }

      if ($seconds < 60){
        return $seconds +''+ $fsec;
      }

      if ($seconds > 60*60*24){
        $days = Math.floor($seconds / (60*60*24) );

        $h = ($seconds - ( $days * (60*60*24) )) / 60 / 60;
        $h = Math.round($h);

        if ($h > 0){
          $h = ' ' + $h + $fhour;
        } else {
          $h = '';
        }

        return $days + '' + $fday + $h;

      }


      if ($seconds >= 60*60){

        $h = Math.floor($seconds / (60*60) );

        $m = Math.round( ($seconds - ($h * 60 * 60)) / 60 );

        $mins = '';
        if ($m > 0){
          $mins = ' ' + $m + '' + $fmin;
        }

        return $h + '' +$fhour + $mins;
      }



      if ($seconds > 60){
        $m = Math.round($seconds/60);

        $sec = ($seconds - ($m * 60));

        return $m+''+$fmin+($sec>0 ? ' ' + $sec + $fsec : '' );
      }

      return '';
    },

    search : function(callback){

        if(!localStorage["searchCategory"]){
            localStorage["searchCategory"]='kickasstorrents';
        }

        if(!localStorage["searchFilter"]){
            localStorage["searchFilter"]='all';
        }

        if(localStorage["searchCategory"]=='opensubtitle'){
            placeholder="Search on OpenSubtitles";
            buttonText="Search"
            textareaStyle="none";
            inputStyle="inline-block";
        }
        else if(localStorage["searchCategory"]=='piratebay'){
            placeholder="Search on The Pirate Bay";
            buttonText="Search"
            textareaStyle="none";
            inputStyle="inline-block";
        }
        else if(localStorage["searchCategory"]=='kickasstorrents'){
            placeholder="Search on KickassTorrents";
            buttonText="Search"
            textareaStyle="none";
            inputStyle="inline-block";
        }
        else if(localStorage["searchCategory"]=='torrent_link'){
            placeholder="";
            buttonText="Fetch"
            textareaStyle="inline-block";
            inputStyle="disabled";
        }
        else{
            localStorage["searchCategory"]='kickasstorrents';
            placeholder="Search on KickassTorrents";
            buttonText="Search";
            textareaStyle="none";
            inputStyle="inline-block";
        }

        var content='';

        content+='<div class="form-inline" id="search_form">';

        content+='<select id="search_category" class="select form-control">';
        content+='<option value="kickasstorrents" >KAT</option>';
        content+='<option value="piratebay" >TPB</option>';
        content+='<option value="opensubtitle" >OS</option>';
        content+='<option value="torrent_link" >Links</option>';
        content+='</select>';

        content+='<input type="text" class="form-control" id="search_title" placeholder="'+placeholder+'">';

        content+='<button class="btn btn-primary" id="submit_search">'+buttonText+'</button>';
        content+='<button class="btn btn-default" id="last_movies_button" set="1">Latest Movies</button>';

        content+='<br><textarea rows="3" class="form-control" cols="50" id="send_link" placeholder="Add new files to Put.io" style="display:'+textareaStyle+';"></textarea>';
        content+='<div id="filter"><label class="radio"><input type="radio" name="search_filter" class="search_filter" value="all" checked>All</label>';
        content+='<label class="radio"><input type="radio" name="search_filter" class="search_filter" value="movies">Movies</label>';
        content+='<label class="radio"><input type="radio" name="search_filter" class="search_filter" value="tvshows">TV Shows</label>';
        content+='<label class="radio"><input type="radio" name="search_filter" class="search_filter" value="music">Music</label>';
        content+='<label class="radio"><input type="radio" name="search_filter" class="search_filter" value="games">Games</label>';
        content+='<label class="radio"><input type="radio" name="search_filter" class="search_filter" value="applications">Applications</label>';
        content+='</div><div id="options"><strong><a data-toggle="tooltip" data-placement="right" title="" data-original-title="Change" href="#" id="select_default_url">Options</a></strong>';
        content+=' | <strong><a data-toggle="tooltip" data-placement="right" title="" data-original-title="Buy Me a Beer" href="#" id="donate">Buy Me a Beer</a></strong></div>';
        content+='</div>';
        content+='<div id="search_result">';
        content+='</div>';

        $("#tab_search").html(content);
        $("#search_category").val(localStorage["searchCategory"])
        $("input:radio[value="+localStorage["searchFilter"]+"]").prop('checked', true);
        if (!localStorage["default_subtitle_code"] || localStorage["default_subtitle_code"]=="null")localStorage["default_subtitle_code"]='eng';
        $("#options").append(' | Subtitle In <strong><a href="#" data-toggle="tooltip" data-placement="right" title="" data-original-title="Change" id="select_default_language">'+VAR_LANGUAGES[localStorage["default_subtitle_code"]]+'</a></strong>');
        if(localStorage["searchCategory"]=='opensubtitle' || localStorage["searchCategory"]=='torrent_link'){
            $(".search_filter").prop('disabled', true);
        }
        Putio_Function.getDefaultFolderData();
        callback(true)
    },

    transfersList : function(){
        Putio.Transfers.list(function(data){
            var content='';
            if (data.transfers.length=='0'){
                content+='<div class="alert alert-success">You have no transfers right now.<div>';
            }
            else{

                content+='<table class="table-condensed table-striped" id="transfers_list">';
                content+='<tbody>';
                $.each(data.transfers,function(index, value){
                    content+='<tr>';
                    content+='<td>';

                    if(value.status=='COMPLETED')//green
                    {
                        value.percent_done=100;
                        content+='<div class="progress transfer_progress">';
                        type="progress-bar-success";
                    }
                    else if(value.status=='SEEDING' && value.percent_done=='100')//green active
                    {
                        value.percent_done=100;
                        content+='<div class="progress progress-striped active transfer_progress">';
                        type="progress-bar-success";
                    }
                    else if(value.down_speed==0 && value.status!='COMPLETING'){//orange
                        content+='<div class="progress progress-striped transfer_progress">';
                        type="progress-bar-warning";
                    }
                    else{//blue
                        content+='<div class="progress progress-striped active transfer_progress">';
                        type="";
                    }
                    content+='<span class="transfer_name">'+value.name+'</span><span class="edit_transfer">';

                    if(value.status=='COMPLETED' || (value.status=='SEEDING' && value.percent_done=='100'))
                    {
                        content+='<a class="remove" data-toggle="tooltip" data-placement="left" title="" data-original-title="Remove" value="'+value.id+'" href="#"><span class="glyphicon glyphicon-remove"></span></a>';
                        content+='<a class="copy_link" data-toggle="tooltip" data-placement="left" title="" data-original-title="Copy Link" value="'+value.file_id+'" href="#"><span class="glyphicon glyphicon-paperclip"></span></a>';
                        content+='<a class="download_file" data-toggle="tooltip" data-placement="left" title="" data-original-title="Download" value="'+value.file_id+'" href="#"><span class="glyphicon glyphicon-download-alt"></span></a>';
                        content+='<a class="show_file" data-toggle="tooltip" data-placement="left" title="" data-original-title="Show File" value="'+value.file_id+'" href="#"><span class="glyphicon glyphicon-folder-open"></span></a>';
                        content+='<a class="go_to_file" data-toggle="tooltip" data-placement="left" title="" data-original-title="See on Put.io" value="'+value.file_id+'" href="#"><span class="glyphicon glyphicon-chevron-right"></span></a>';
                    }
                    else if(value.status=='COMPLETING'){
                        content+='<a class="remove" data-toggle="tooltip" data-placement="left" title="" data-original-title="Remove" value="'+value.id+'" href="#"><span class="glyphicon glyphicon-remove"></span></a>';
                    }
                    else{
                        content+='<strong>'+Putio_Function.seconds_to_time(value.estimated_time,false)+' </strong>';
                        content+='<a class="remove" data-toggle="tooltip" data-placement="left" title="" data-original-title="Remove" value="'+value.id+'" href="#"><span class="glyphicon glyphicon-remove"></span></a>';
                    }

                    content+='</span>';
                    content+='<span class="status_message">';
                    content+=value.status_message;
                    content+='</span>';
                    content+='<span class="edit_transfer">';
                    
                    content+='</span>';
                    //content+='<div class="bar" style="width: '+parseInt(value.percent_done)+'%">';
                    content+='<div class="progress-bar '+type+'" role="progressbar" aria-valuenow="'+parseInt(value.percent_done)+'" aria-valuemin="0" aria-valuemax="100" style="width: '+parseInt(value.percent_done)+'%">';
                    content+='</div>';
                    content+='</div>';
                    content+='</td>';
                    content+='</tr>';
                });
                    content+='<tr>';
                    content+='<td class="text-center">';
                    content+='<button class="btn btn-xs btn-info" type="button" id="clean_button">Clear Finished</button>';
                    content+='</td>';
                    content+='</tr>';
                content+='</tbody>';
                content+='</table>';
            }
            $("#tab_transfers").html(content);
            $('[data-toggle="tooltip"]').tooltip({'delay': { show: 1500, hide: 200 }});
            Putio_Function.time=setTimeout( function () {
                Putio_Function.transfersList();
            }, 5000);

        })
    },

    ucwords :function(str) {
        return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
            return $1.toUpperCase();
        });
    },

    updateDefaultFolder : function(){
        folder=Putio_Function.getDefaultFolderToDisplay();
        if(!localStorage[folder])localStorage[folder]=0;
        if(localStorage[folder]!=$("#select_default_folder").attr("folder_id")){
             Putio.Files.info(localStorage[folder],function(data){
                if(data.status=="ERROR" && data.error_type=="NotFound"){
                    localStorage[folder]=0;
                    Putio.Files.info(localStorage[folder],function(data){
                        $("#select_default_folder").text(data.file.name);
                        $("#select_default_folder").attr("folder_id",localStorage[folder])
                    })
                }
                else{
                    $("#select_default_folder").text(data.file.name);
                    $("#select_default_folder").attr("folder_id",localStorage[folder])
                }
            })
        }
    }  
    
}