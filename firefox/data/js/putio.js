/*!
* Easy Put.io
*
* Created by Baptiste Vincent on 2011-07-25.
* Copyright (c) 2011 Baptiste Vincent. All rights reserved.
*
*/

Putio = {

    User : {
        info : function(output) {
            Putio._request('user', 'info','',function(data){
                output(data);
            });
        }
    },

    Transfer : {
        add : function(links,folder_id,output) {
            Putio._request('transfers', 'add', {
                'links' : links,
                'to_folder' : folder_id
            },function(data){
                output(data);
            });
        },
        list : function(output) {
            Putio._request('transfers', 'list','',function(data){
                output(data);
            });
        },
        cancel : function(transfert_id,output) {
            Putio._request('transfers', 'cancel', {
                'id' : transfert_id
            },function(data){
                output(data);
            });
        }
    },

    Url : {
        analyze : function(links,output) {
            Putio._request('urls', 'analyze', {
                'links' : links
            },function(data){
                output(data);
            });
        },
        extracturls : function(text,output) {
            var params = {
                'txt' : text
            };
            Putio._request('urls', 'extracturls', params,function(data){
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

    File : {
        dirmap : function(output) {
            Putio._request('files', 'dirmap','',function(data){
                output(data);
            });
        },
        info : function(id,output) {
            var params = {
                "id": id
            };

            Putio._request('files', 'info', params,function(data){
                output(data);
            });
        },
        rename : function(id,name, output) {
            var params = {
                'id' : id,
                'name':name
            };
            Putio._request('files', 'rename',params,function(data){
                output(data);
            });
        },
        move : function(id, parent_id, output) {
            var params = {
                'id' : id,
                'parent_id' : parent_id
            };
            Putio._request('files', 'move', params,function(data){
                output(data);
            });
        },
        del : function(id, output) {
            var params = {
                'id' : id
            };
            Putio._request('files', 'delete',params,function(data){
                output(data);
            });
        },
        list : function(parent_id,output) {
            var params = {
                'parent_id': parent_id,
                'orderby':'type_desc'

            };

            Putio._request('files', 'list', params,function(data){
                output(data);
            });
        },
        create_dir : function(parent_id,name,output) {
            var params = {
                'name': name,
                'parent_id':parent_id

            };

            Putio._request('files', 'create_dir', params,function(data){
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
        }
    },

    ApiRequest :function(api_key, api_secret, params) {
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

    _request : function(page, method, params, output) {
        $('#spinner').show();
        var api_key = localStorage["putio_apikey"] || 'a';
        var api_secret = localStorage["putio_apisecret"] || 'a';
        var API_SERVER  = "http://api.put.io/v1/";

        var url=API_SERVER+page+"?method="+method
        var request = Putio.ApiRequest(api_key, api_secret, params);
        url+="&request="+request;

        var chars = "abcdefghiklmnopqrstuvwxyz";
        var rnum = Math.floor(Math.random() * chars.length);
        var randomstring = '';
        randomstring += chars.substring(rnum,rnum+1);

        $.ajax({

            url: url,
            type: 'POST',
            crossDomain: true,
            dataType: 'jsonp',
            jsonpCallback:randomstring,
            async:false,
            success: function(data) {
                $('#spinner').hide();
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                output(data);

            },
            error: function(data) {

                function print_r(theObj){
  if(theObj.constructor == Array ||
     theObj.constructor == Object){
    $(".content").append("<ul>")
    for(var p in theObj){
      if(theObj[p].constructor == Array||
         theObj[p].constructor == Object){
$(".content").append("<li>["+p+"] => "+typeof(theObj)+"</li>");
        $(".content").append("<ul>")
        print_r(theObj[p]);
        $(".content").append("</ul>")
      } else {
$(".content").append("<li>["+p+"] => "+theObj[p]+"</li>");
      }
    }
    $(".content").append("</ul>")
  }
}
                print_r(data)

                $('#spinner').hide();
                Putio._message("An error ocurred on calling the method <b>" +
                    method + "</b> in path <b>" + page + "</b> with message: <b>"+
                    data.error_message+"</b>",'error');
            }
        });

    },
    request_google : function(type, name, output) {
        var search;
        name=name.replace(" ", "%20")
        switch (type) {
            case 'megaupload':
                search='%22megaupload.com%2f%3fd%22%20'+name;
                break;
            default:
                break;
        }

        var url="http://api.bing.net/json.aspx?AppId=A417D12EC431FB8DD3F52CD8CA731F7AE7CDA49C&Version=2.2&Market=en-US&Query="+search+"&Sources=web&Web.Count=20&JsonType=callback&JsonCallback=h"
        $.ajax({

            url: url,
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            jsonpCallback:'h',
            async:false,
            success: function(data) {
                $('#spinner').hide();
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                output(data);

            },
            error: function(data) {
                $('#spinner').hide();
                Putio._message("An error ocurred on calling the method <b>" +
                     + "</b> in path <b>" +  + "</b> with message: <b>"+
                    data.error_message+"</b>");
            }
        });

    },

    _message : function(msg, type) {
        $("#message").append("<span class="+type+">"+msg+"</span><br>");

    }
};