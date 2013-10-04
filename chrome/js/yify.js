/*
 * Easy Put.io
 *
 * Created by Baptiste Vincent on 2013-07-09.
 * Copyright (c) 2013 Baptiste Vincent. All rights reserved.
 *
 */

var RESULT_LIMIT = 20;
var SORT_BY = "date";

jQuery.extend({
    postJSON: function( url, data, callback) {
        return jQuery.post(url, data, callback, "jsonp");
    }
});

Yify = {
    page:null,

    Files : {
         list : function(page,output) {
            Yify.page=page;
                var params = {
                    "set": page,
                    "limit": RESULT_LIMIT,
                    "sort":SORT_BY,
                };
            Yify._request('list',params,'GET',function(data){
                output(data);
            });
        }
    },

    _request : function(method, params, type,output) {
        $('#spinner').show();
        var API_SERVER  = "http://yify-torrents.com/api/";        

        var url=API_SERVER+method+".json";
        
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