/*
 * Easy Put.io
 *
 * Created by Baptiste Vincent on 2013-07-01.
 * Copyright (c) 2013 Baptiste Vincent. All rights reserved.
 *
 */

var MAX_SEARCH_RESULTS = 30;
var KEY="d94367852d4a430ca0728fbb2be9a8e2"

jQuery.extend({
    postJSON: function( url, data, callback) {
        return jQuery.post(url, data, callback, "jsonp");
    }
});

OldPiratebay = {
    query:null,

    Files : {
         search : function(search,category,output) {
            Piratebay.query=search;
            Putio.category=category;
            switch (category) {
                case 'movies':
                    filter="category eq 'Movies' or category eq 'HD - Movies'";
                break;
                case 'tvshows':
                    filter="category eq 'TV shows' or category eq 'HD - TV shows'";
                break;
                default:
                    filter="";
                break;
            }
            if(category=='movie'||category=='tvshow'){
                //var ORDER_BY = 'category, seeders desc';
                var ORDER_BY = 'seeders desc';
                var params = {
                    "$filter": filter,
                    "$orderby": ORDER_BY,
                    "$top":MAX_SEARCH_RESULTS,
                    "id":search
                };
            }
            else{
                var ORDER_BY = 'seeders desc';
                var params = {
                    "$orderby": ORDER_BY,
                    "$top":MAX_SEARCH_RESULTS,
                    "id":search
                }
            }
            OldPiratebay._request('search',params,'GET',function(data){
                output(data);
            });
        }
    },

    _request : function(method, params, type,output) {
        $('#spinner').show();
        var API_SERVER  = "http://apify.ifc0nfig.com/tpb/";        

        var url=API_SERVER+method+"?key="+KEY;
        
        $.ajax({
            type: type,
            url: url,
            data: params,
            success: function(data) {
                $('#spinner').hide();
                if (typeof data === 'string'){
                    data = JSON.parse(data);
                }
                output(data);    
            },
            error:function(data) {
                $('#spinner').hide();
                data.error=true;
                output(data);
            },
            dataType: 'json'
        });

    }
};