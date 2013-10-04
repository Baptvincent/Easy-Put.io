$(document).ready(function() {
    $(document.body).on('click', '#connect' ,function(e){
        window.location = "https://api.put.io/v2/oauth2/authenticate?client_id=230&response_type=token&redirect_uri=http://baptiste-vincent.fr/easy-putio/authentication.php"
    });


    $(document.body).on('click', '#disconnect' ,function(e){
        Storage.area.clear()
        $('#disconnect').attr('id','connect')
        $('#connect').text('Connect to Put.io')
    });
    
    var url = location.href;
    
    if(url.indexOf('access_token') != -1)
    {
        var QueryString = function () {
            // This function is anonymous, is executed immediately and 
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = pair[1];
                // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [ query_string[pair[0]], pair[1] ];
                    query_string[pair[0]] = arr;
                // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            } 
            return query_string;
        } ();
        Storage.saveData('putio_token',QueryString.access_token)
        if (QueryString.access_token){
            chrome.tabs.getSelected(undefined,function(data){
                    chrome.tabs.remove(data.id);
                });
        }
    }

    function connectionCheck(){
        Storage.getData(function(storage){
            if(storage["putio_token"]){
                Putio.Account.info(function(data){
                    if(!data.error){
                        $('#connect').attr('id','disconnect')
                        $('#disconnect').text('Disconnect from Put.io')
                    }
                })
            }
        })
    }

    connectionCheck()
});