<?php

// The Regular Expression filter
$reg_exUrl = "/(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/";

// The Text you want to filter for urls
$text = "/www.megaupload.com/?d=JMR87SRS\" target=\"_blank\">Breaking Bad - 1x07 - A No-Rough-Stuff Type Deal</a><br /><br /><a href=\"http://www.megaupload.com/?d=TK9CCPYG\" ";

// Check if there is a url in the text
if(preg_match($reg_exUrl, $text, $url)) {

       // make the urls hyper links
       print_r($url);

} else {

       // if no urls in the text just return the text
       echo $text;

}
?>