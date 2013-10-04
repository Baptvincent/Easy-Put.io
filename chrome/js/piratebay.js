/*
 * Easy Put.io
 *
 * Created by Baptiste Vincent on 2013-09-11.
 * Copyright (c) 2013 Baptiste Vincent. All rights reserved.
 *
 */

//http://thepiratebay.sx/search/bad/0/7/200,300
Piratebay = {
    query:null,

    Files : {
         search : function(search,category,output) {
            Piratebay.query=search;
            Putio.category=category;
            switch (category) {
                case 'movies':
                    filter="201,202,207,209";
                break;
                case 'tvshows':
                    filter="205,208";
                break;
                case 'music':
                    filter="100";
                break;
                case 'applications':
                    filter="300";
                break;
                case 'games':
                    filter="400";
                break;
                default:
                     filter="0";
                break;
            }

            orderBy='0/7';//seeders

            Piratebay._request('search',search,orderBy, filter,'GET',function(data){
                output(data);
            });
        }
    },

    _request : function(method, search, orderBy, filter, type, output) {
        $('#spinner').show();
        var API_SERVER  = localStorage["pb_url"];        

        var url=API_SERVER+"/"+method+"/"+search+"/"+orderBy+"/"+filter;
        
        $.ajax({
            type: type,
            url: url,
            success: function(data) {
                $('#spinner').hide();
                data = $('<div/>').html(data).contents();
                var result = data.find('div[class="detName"]').closest('tr');
                allResult=new Array();
                result.each(function(i, e) {
                    myResult=new Object();
                    myResult.category = $(e).find('td:eq(0) a:last-child').text()
                    myResult.name = $(e).find('td:eq(1) .detName a:eq(0)').text();
                    myResult.magnet = $(e).find('td:eq(1) a[title="Download this torrent using magnet"]').attr("href")

                    var ageSize=$(e).find('td:eq(1) font[class="detDesc"]').text()
                    ageSize=ageSize.split(',');
                    age=ageSize[0].split('Uploaded ')
                    size=ageSize[1].split(' Size ')

                    age=age[1].replace(/\u00a0/g, " ");
                    size=size[1].replace(/\u00a0/g, " ");

                    myResult.uploaded=age
                    myResult.size=size
                    myResult.seeders = $(e).find('td:eq(2)').text();
                    allResult.push(myResult);
                })
                output(allResult);
            },
            error:function(data) {
                $('#spinner').hide();
                data.error=true;
                allResult=new Array();
                output(allResult);
            }
        });

    }
};