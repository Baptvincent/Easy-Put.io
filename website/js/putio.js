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

Putio = {
    category:null,
    Account : {
        info : function(output) {
            Putio._request('account', 'info','','GET',function(data){
                output(data);
            });
        },
        settings : function(output) {
            Putio._request('account', 'settings','','GET',function(data){
                output(data);
            });
        },
        change_route : function(value, output) {
            var params = {
                "routing": value,
            };
            Putio._request('account', 'settings',params,'POST',function(data){
                output(data);
            });
        }
    },

    Transfers : {
        add : function(url,folder_id,output) {
            if(!folder_id)folder_id=0
            var params = {
                "url": url,
                "save_parent_id" : folder_id
            };
            Putio._request('transfers', 'add',params,'POST',function(data){
                output(data);
            });
        },
        list : function(output) {
            Putio._request('transfers', 'list','','GET',function(data){
                output(data);
            });
        },
        cancel : function(id, output) {
            var params = {
                'transfer_ids' : id
            };
            Putio._request('transfers', 'cancel',params,'POST',function(data){
                output(data);
            });
        },
        clean : function(output) {
            Putio._request('transfers', 'clean','','POST',function(data){
                output(data);
            });
        }
    },

    Message : {
        list : function(output) {
            Putio._request('messages', 'list','',function(data){
                output(data);
            });
        },
        del : function(transfert_id,output) {
            Putio._request('messages', 'delete', {
                'id' : transfert_id
            },function(data){
                output(data);
            });
        }
    },

    Files : {
        list : function(id,output) {
            var params = {
                "parent_id": id
            };
            Putio._request('files', 'list', params,'GET',function(data){
                output(data);
            });
        },
        info : function(id,output) {

            Putio._request('files', id, '','GET',function(data){
                output(data);
            });
        },
        rename : function(id,name, output) {
            var params = {
                'file_id' : id,
                'name':name
            };
            Putio._request('files', 'rename',params,'POST',function(data){
                output(data);
            });
        },
        move : function(id, parent_id, output) {
            var params = {
                'file_ids' : id,
                'parent_id' : parent_id
            };
            Putio._request('files', 'move', params,'POST',function(data){
                output(data);
            });
        },
        del : function(ids, output) {
            var params = {
                'file_ids' : ids
            };
            Putio._request('files', 'delete',params,'POST',function(data){
                output(data);
            });
        },
        
        create_folder : function(parent_id,name,output) {
            var params = {
                'name': name,
                'parent_id':parent_id

            };

            Putio._request('files', 'create-folder', params,'POST',function(data){
                output(data);
            });
        },
        search : function(query,output) {
            var params = {
                'query': query

            };

            Putio._request('files', 'search', params,function(data){
                output(data);
            });
        },
        getDownloadLink : function(ids,output) {
            var params = {
                'file_ids' : ids
            };
            Putio._request('files', 'get-download-links', params,'POST',function(data){
                output(data);
            });
        },
        zip : function(ids,output) {
            var params = {
                'file_ids' : ids
            };
            Putio._request('files', 'zip', params,'GET',function(data){
                output(data);
            });
        }
    },

    Zips : {
        info : function(id,output) {

            Putio._request('zips', id, '','GET',function(data){
                output(data);
            });
        }
    },

    ApiRequest :function(code, api_secret, params) {
        if (!api_key || !api_secret) {
            return; //undefined
        }

        return {
            api_key : api_key,
            api_secret : api_secret,
            params : params || {},

            /**
             * Return a string containing this request as JSON.
             * This method depends on the JSON.stringify method.
             *
             * TODO: Multible browser support has not been tested.
             * For deployed applications this method should be rewritten or
             * the json2.js library, available in http://www.json.org/js.html, should
             * be used.
             */
            toString : function() {
                return JSON.stringify(this);
            }
        };
    },

    _request : function(page, method, params, type,output) {
        $('#spinner').show();
        var API_SERVER  = "https://api.put.io/v2/";        
        
        Storage.getData(function(storage){
            var ACCESS_TOKEN = storage["putio_token"];

            var url=API_SERVER+page+"/"+method+"?oauth_token="+ACCESS_TOKEN;

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
                    console.log('error');
                    output(JSON.parse(data.responseText));
                },
                dataType: 'json'
            });
        })

    }
};