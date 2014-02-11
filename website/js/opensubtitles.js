/*
 * Easy Put.io
 *
 * Created by Baptiste Vincent on 2011-07-25.
 * Copyright (c) 2011 Baptiste Vincent. All rights reserved.
 *
 */

jQuery.extend({
    postJSON: function( url, data, callback) {
        return jQuery.post(url, data, callback, "jsonp");
    }
});

Opensubtitles = {
	query:null,

    account : {
        login : function(output) {
        	methodName='LogIn';
        	params=['', '', 'en', 'chrome for baptboy01'];
            Opensubtitles._request(methodName,params,'POST',function(data){
                output(data);
            });
        }
    },

    search : {
        subtitle : function(token,query,output) {
        	methodName='SearchSubtitles';
        	Opensubtitles.query=query;
        	lang=localStorage["default_subtitle_code"];
        	//params=[token, new Array(new Array({query:query,sublanguageid:lang}),new Array({moviehash:query,sublanguageid:lang}))];
        	params=[token, new Array({query:query,sublanguageid:lang})];
        	//params=[token, new Array({moviehash:'62a39c90ccd8cb8f'})];
        	//62a39c90ccd8cb8f
            Opensubtitles._request(methodName,params,'POST',function(data){
                output(data);
            });
        },
        hash : function(token,hash,size,output) {
        	methodName='SearchSubtitles';
        	Opensubtitles.query=hash;
        	lang=localStorage["default_subtitle_code"];
        	params=[token, new Array({moviehash:hash,moviebytesize:size,sublanguageid:lang})];
            Opensubtitles._request(methodName,params,'POST',function(data){
                output(data);
            });
        }
    },

    _request : function(methodName, params, type,output) {
        $('#spinner').show();
        var API_SERVER  = "http://api.opensubtitles.org/xml-rpc";        

        var url=API_SERVER;

        $.xmlrpc({
		    url: url,
		    methodName: methodName,
		    params: params,
		    success: function(data) {
		    	$('#spinner').hide();
		    	//console.log('success');
		    	if (typeof data === 'string'){
                    data = JSON.parse(data);
                }
                output(data[0]);
		    	//console.log(data) 
		    },
    		error: function(data) {
    			$('#spinner').hide();
    			console.log('error');
                data.error=true;
    			output(data);
    		}
		});
	}
};