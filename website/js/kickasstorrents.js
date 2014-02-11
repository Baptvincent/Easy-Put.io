/*
 * Easy Put.io
 *
 * Created by Baptiste Vincent on 2013-08-14.
 * Copyright (c) 2013 Baptiste Vincent. All rights reserved.
 *
 */

Kickasstorrents = {
    query:null,

    Files : {
         search : function(search,category,output) {
            Kickasstorrents.query=search;
            Putio.category=category;
            switch (category) {
                case 'movies':
                    search+="&category:movies";
                break;
                case 'tvshows':
                    search+="&category:tv";
                break;
                case 'music':
                    search+="&category:music";
                break;
                case 'applications':
                    search+="&category:applications";
                break;
                case 'games':
                    search+="&category:games";
                break;
                default:
                break;
            }

            var params = {
                    "field": "seeders",
                    "sorder": "desc",
                    "rss": "1"
                };

            Kickasstorrents._request('usearch',encodeURIComponent(search),params,'GET',function(data){
                output(data);
            });
        }
    },

    _request : function(method, search,params, type,output) {
        $('#spinner').show();
        var API_SERVER  = localStorage["kat_url"];        

        var url=API_SERVER+'/'+method+"/"+search+"/";
        
        $.ajax({
            type: type,
            data:params,
            url: url,
            success: function(data) {
                $('#spinner').hide();
                data=$.xml2json(data);
                //console.log(data)
                output(data);
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