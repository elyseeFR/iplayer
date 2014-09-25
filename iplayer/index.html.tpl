<!--
iplayer: The free interactive HTML5 player
https://github.com/elyseeFR/iplayer

Copyright (C) 2014  Frederic Giudicelli - Presidence de la Republique Française

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
-->
<!DOCTYPE html>
<html>
<head>
  <title>Interactive Player</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

  <link rel="stylesheet" href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css">

  <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
  <script src="//code.jquery.com/ui/1.10.4/jquery-ui.min.js"></script>
  
  <link href="../iplayer/css/video-js.css" rel="stylesheet" type="text/css">
  <link href="../iplayer/css/iplayer.lib.css" rel="stylesheet" type="text/css">

  <script src="../iplayer/javascript/lib/modernizr.min.js"></script>
  <script src="../iplayer/javascript/lib/video.js"></script>
  <script src="../iplayer/javascript/iplayer.lib.js"></script>
  <script src="../iplayer/javascript/lib/bjqs-1.3.min.js"></script>
  <script src="../iplayer/javascript/lib/jquery.mCustomScrollbar.concat.min.js"></script>
  <script>
    videojs.options.flash.swf = "../iplayer/video-js.swf";
  </script>
</head>
<body class="player">
    <div id="playerContainer">
        <video id="main_video" class="video-js vjs-default-skin" controls preload="auto" width="__WIDTH__" height="__HEIGHT__" poster="__POSTER__">
            __VIDEO_MP4__
            __VIDEO_WEBM__
            __VIDEO_OGV__
            __VIDEO_SUBTITLES__	
        </video>
    </div>
    <script type="text/javascript">
    //<![CDATA[
        var player_options = __CONFIG__;

        iplayer_lang = player_options['general']['lang'];

        var _gaq = _gaq || [];
        if(player_options['general']['ga']) {
            _gaq.push(['_setAccount', player_options['general']['ga']]);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();
        }

        var player = new InteractivePlayer('main_video', player_options);
    //]]>
    </script>
</body>
</html>
