Putio_Function = {
    time : null,
    count : 0,

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
                            style="bar-danger";
                        }
                        else if(percent_available>80){
                            style="bar-warning";
                        }
                        else {
                            style="bar-success";
                        }

                        content='';
                        content+='<div class="progress storage_available">';
                        content+='<span id="disk_used">Used : '+percent_available+'% ('+diskAvailable+' Free)</span>';
                        content+='<div class="bar '+style+'" style="width: '+percent_available+'%;"></div>';
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
    go : function(tab_name, folder_id){
            $("#content").html('');
            clearTimeout(this.time);
            $("#menu li").attr('class','');
            $('#'+tab_name).parent('li').attr('class','active');
            localStorage["tabName"] = tab_name;
            this.loadTabContent(tab_name,folder_id);
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
            default:
                break;
        }
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

    folderList:function(padding, folder_id, select, callback){
        Putio_Function.count++;
        Putio.Files.list(folder_id,function(data){
            var files=data.files;
            $.each(files,function(index, value){
                if (value.content_type=='application/x-directory' && !value.is_shared){
                    //$("#folder_id").append('<option value="'+value.id+'">'+padding+value.name+'</option>');
                    $('<option value="'+value.id+'">'+padding+value.name+'</option>').insertAfter(select+" option[value='"+folder_id+"']");
                    Putio_Function.folderList(padding+'&nbsp;&nbsp;&nbsp;',value.id,select,callback);

                }
            })
            Putio_Function.count--;
            if (Putio_Function.count == 0 && callback)
                callback('done');
        })
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
                content+='<th colspan="2" style="width: 9%">';
                content+='<a id="delete_files" data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete Files" href="#"><i class="icon-remove"></i></a>';
                content+='<a id="move_files" data-toggle="tooltip" data-placement="top" title="" data-original-title="Move Files" href="#"><i class="icon-share"></i></a>';
                content+='<a id="download_zip" data-toggle="tooltip" data-placement="top" title="" data-original-title="Download Zip" href="#"><i class="icon-download-alt"></i></a>';
                content+='</th>';
                if(parent.parent_id!=undefined){
                    content+='<th style="width: 7%">';
                    content+='<a class="folder" value='+parent.parent_id+' data-toggle="tooltip" data-placement="top" title="" data-original-title="Back" href="#"><i class="icon-arrow-left"></i></a>';
                    content+='<a class="folder" value="0" data-toggle="tooltip" data-placement="top" title="" data-original-title="Home" href="#"><i class="icon-home"></i></a>';
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
                content+='<th style="width: 7%">';
                content+='<a id="create_folder" data-toggle="tooltip" data-placement="left" title="" data-original-title="Create Folder" value="'+id+'" href="#"><i class="icon-plus"></i></a>';
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
                    content+='<a class="rename" data-toggle="tooltip" data-placement="left" title="" data-original-title="Rename" value="'+value.id+'" href="#"><i class="icon-edit"></i></a>';
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
                        content+='<div class="progress progress-success transfer_progress">';
                    }
                    else if(value.status=='SEEDING' && value.percent_done=='100')//green active
                    {
                        value.percent_done=100;
                        content+='<div class="progress progress-success progress-striped active transfer_progress">';
                    }
                    else if(value.down_speed==0 && value.status!='COMPLETING'){//orange
                        content+='<div class="progress progress-warning progress-striped transfer_progress">';
                    }
                    else{//blue
                        content+='<div class="progress progress-striped active transfer_progress">';
                    }
                    content+='<span class="transfer_name">'+value.name+'<span class="edit_transfer">';

                    if(value.status=='COMPLETED' || (value.status=='SEEDING' && value.percent_done=='100'))
                    {
                        content+='<a class="remove" data-toggle="tooltip" data-placement="left" title="" data-original-title="Remove" value="'+value.id+'" href="#"><i class="icon-remove"></i></a>';
                        content+='<a class="download_file" data-toggle="tooltip" data-placement="left" title="" data-original-title="Download" value="'+value.file_id+'" href="#"><i class="icon-download-alt"></i></a>';
                        content+='<a class="show_file" data-toggle="tooltip" data-placement="left" title="" data-original-title="Show File" value="'+value.file_id+'" href="#"><i class="icon-folder-open"></i></a>';
                        content+='<a class="go_to_file" data-toggle="tooltip" data-placement="left" title="" data-original-title="See on Put.io" value="'+value.file_id+'" href="#"><i class="icon-chevron-right"></i></a>';
                    }
                    else if(value.status=='COMPLETING'){
                        content+='<a class="remove" data-toggle="tooltip" data-placement="left" title="" data-original-title="Remove" value="'+value.id+'" href="#"><i class="icon-remove"></i></a>';
                    }
                    else{
                        content+='<strong>'+Putio_Function.seconds_to_time(value.estimated_time,false)+' </strong>';
                        content+='<a class="remove" data-toggle="tooltip" data-placement="left" title="" data-original-title="Remove" value="'+value.id+'" href="#"><i class="icon-remove"></i></a>';
                    }

                    content+='</span></span>';
                    content+='<span class="status_message">';
                    content+=value.status_message;
                    content+='</span>';
                    content+='<span class="edit_transfer">';
                    
                    content+='</span>';
                    content+='<div class="bar" style="width: '+parseInt(value.percent_done)+'%">';
                    content+='</div>';
                    content+='</div>';
                    content+='</td>';
                    content+='</tr>';
                });
                    content+='<tr>';
                    content+='<td class="text-center">';
                    content+='<button class="btn btn-mini btn-info" type="button" id="clean_button">Clear Finished</button>';
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
    }
}