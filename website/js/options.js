$(document).ready(function() {
    if(localStorage["hide_badge"]=="yes")
        $('#hide_badge').prop('checked', true);


    $(document.body).on('click', '#connect' ,function(e){
        
        extension_id = chrome.i18n.getMessage("@@extension_id");
        
        switch(extension_id){
            case 'ojjijgofhokdmbpllnkjiciihicgeebf'://Website Dev
                client_id = '1117';
            break;
            case 'hbjilidlcmlnlpfoglhijpnfajlggdfn'://dev
                client_id = '1117';
            break;
            case 'gbohaejoknbaiedjbggkhkkkjboiacdi'://website
                client_id = '230';
            break;
            case 'ekbocpjgbpkkheehgnimdnkmkapkagap'://store
                client_id = '893';
            break;
            default:
                client_id = '1117';
            break;
        }
            
        window.location = "https://api.put.io/v2/oauth2/authenticate?client_id="+client_id+"&response_type=token&redirect_uri=chrome-extension://"+extension_id+"/options.html"
    });

    $(document.body).on('click', '#gettoken' ,function(e){
        url = "https://api.put.io/v2/oauth2/authenticate?client_id=1121&response_type=token&redirect_uri=http://easy-putio.baptiste-vincent.fr/get_token.html";
        window.open(url, '_blank');
    });

    $(document.body).on('click', '#save_token' ,function(e){
        Storage.saveData('putio_token',$('#token_input').val());
        connectionCheck();
    });    

    $(document.body).on('click', '#disconnect' ,function(e){
        Storage.area.clear()
        $('#disconnect').attr('id','connect')
        $('#connect').text('Connect to Put.io')
        $('#token_input').val('');
    });

    $(document.body).on('click', '#hide_badge' ,function(e){
        if($('#hide_badge').prop('checked'))
            localStorage["hide_badge"]="yes";
        else
            localStorage["hide_badge"]="no";

        _gaq.push(['_trackEvent', 'background', 'hide_badge', localStorage["hide_badge"]]);
    });
    
    $(window).on('hashchange', function(e){
        saveToken();
    });

    function saveToken(){
         var url = location.href;

        if(url.indexOf('access_token') != -1)
        {
            access_token = url.slice(url.indexOf('=')+1,url.length);
            Storage.saveData('putio_token',access_token)
            if (access_token){
                chrome.tabs.getSelected(undefined,function(data){
                        chrome.tabs.remove(data.id);
                    });
            }
        }
    }

    function connectionCheck(){
        Storage.getData(function(storage){
            if(storage["putio_token"]){
                $('#token_input').val(storage["putio_token"]);
                Putio.Account.info(function(data){
                    if(!data.error){
                        $('#connect').attr('id','disconnect')
                        $('#disconnect').text('Disconnect from Put.io')
                    }
                })
            }
        })
    }
    saveToken();
    connectionCheck()
});