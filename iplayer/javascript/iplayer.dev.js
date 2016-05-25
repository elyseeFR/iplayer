
/*
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
*/

function parseUri(sourceUri) {
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
    var uri = {};

    for(var i = 0; i < 10; i++){
        uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }

    // Always end directoryPath with a trailing backslash if a path was
    // present in the source URI
    // Note that a trailing backslash is NOT automatically inserted within
    // or appended to the "path" key
    if(uri.directoryPath.length > 0){
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    return uri;
}


function setQueryVariables(url, name, value) {
    var purl = parseUri(url);
    var data = getQueryVariables(purl);
    data[name] = value;

    var query = [];
    for(name in data) {
        if(name == '')
            continue;
        query.push(name + '=' + encodeURIComponent(data[name]));
    }
    return (purl['protocol'] ? purl['protocol']+'://' : '')+purl['domain']+purl['path']+'?'+query.join('&');
}

function getQueryVariables(purl) {
    if(!purl['query'])
        return {};

    var data = {};
    var vars = purl['query'].split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        data[pair[0]] = decodeURIComponent(pair[1]).replace(/\+/g,' ');
    }
    return data;
}

;
var iplayer_langs = {};
var iplayer_lang = 'en';

function _t(id) {
    if(!iplayer_langs[iplayer_lang])
        return iplayer_langs['en'][id];

    if(!iplayer_langs[iplayer_lang][id])
        return iplayer_langs['en'][id];

    return iplayer_langs[iplayer_lang][id];
}
;
iplayer_langs['en'] = {
    'CLOSE': 'Close',
    'REPLAY': 'Replay video',
    'SHARE_VIDEO': 'Share this video',
    'SHARE_CONTENT': 'Share this content',
    'EXPORT_VIDEO': 'Export this video',
    'SHARE_FB': 'Share on Facebook',
    'SHARE_TW': 'Share on Twitter',
    'RETURN_MAIN_VIDEO': 'Return to main video',
    'EXPORT_WIDTH': 'Width',
    'EXPORT_AUTOPLAY': 'Autoplay',
    'LOADING_WAIT': 'Video is loading...'
};
;
iplayer_langs['fr'] = {
    'CLOSE': 'Fermer',
    'REPLAY': 'Rejouer cette vidéo',
    'SHARE_VIDEO': 'Partager cette vidéo',
    'SHARE_CONTENT': 'Partager ce contenu',
    'EXPORT_VIDEO': 'Exporter cette vidéo',
    'SHARE_FB': 'Partager sur Facebook',
    'SHARE_TW': 'Partager sur Twitter',
    'RETURN_MAIN_VIDEO': 'Retour à la vidéo principale',
    'EXPORT_WIDTH': 'Largeur',
    'EXPORT_AUTOPLAY': 'Démarrer automatiquement',
    'LOADING_WAIT': 'Chargement de la vidéo en cours...'
};
;
/*
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
*/


function InteractivePlayer(id, options) {
    var me = this;
    
    this.player = null;
    
    this.navigation = null;

    this.map = null;
    
    this.width = options['general'].width;
    this.height = options['general'].height;
    this.originalWidth = options['general'].width;
    this.originalHeight = options['general'].height;
    this.sizeFactorWidth = 1;
    this.sizeFactorHeight = 1;
    
    this.activeHotspots = {};
    this.openedHotspot = '';
    
    this.getvars = null;
    this.start = 0;
    this.playbackReady = false;
    this.startFinished = false;
    this.startProgressPopup = null;
    this.initialHotspot = null;
    
    this.seeking = false;
    this.lastCurrentTime = 0;

    this.VideoOffsets = {x: 0, y: 0};
    this.VideoSize = {width: 0, height: 0};
    
    this.obj = null;
    
    this.finalPopup = null;
    
    this.isFromDomain = true;
    this.isFullScreenEnabled = false;
    
    this.initialized = false;
    
    
    this.viewState = {
        '20': false,
        '40': false,
        '60': false,
        '80': false,
        '100': false
    };
    
    this.debug = function(text) {
        $('#debug').prepend('<p>'+text+'</p>');
    }

    
    this.handleHotspots = function(currentTime, seek) {
        if(me.map) {
            setTimeout(function() {
                me.map.currentTime(currentTime);
            }, 1);
        }

        for(var i = 0; i < options['hotspots'].length; i++) {
            var hotspot = options['hotspots'][i];
            
            if(hotspot['visible']) {
                if(currentTime < hotspot.startsAt) {
                    options['hotspots'][i]['visible'] = false;
                    if(me.activeHotspots[hotspot.name]) {
                        me.activeHotspots[hotspot.name].destroy();
                        me.activeHotspots[hotspot.name] = null;
                    }
                }
                else if(currentTime >= hotspot.endsAt) {
                    options['hotspots'][i]['visible'] = false;
                    if(me.activeHotspots[hotspot.name]) {
                        me.activeHotspots[hotspot.name].destroy();
                        me.activeHotspots[hotspot.name] = null;
                    }
                }
                else {
                    if(hotspot.tooltipTime &&
                       options['hotspots'][i].tooltipVisible &&
                       currentTime > (hotspot.tooltipTime + hotspot.startsAt)) {

                        options['hotspots'][i].tooltipVisible = false;
                        me.activeHotspots[hotspot.name].hideTooltip();
                    }
                    else if(hotspot.tooltipTime &&
                            !options['hotspots'][i].tooltipVisible &&
                            currentTime < (hotspot.tooltipTime + hotspot.startsAt)) {

                        options['hotspots'][i].tooltipVisible = true;
                        me.activeHotspots[hotspot.name].showTooltip();
                    }
                    
                    if(seek) {
                        me.activeHotspots[hotspot.name].seek(currentTime);
                    }
                    else {
                        me.activeHotspots[hotspot.name].animate(currentTime);
                    }
                }
            }
            else if(!hotspot['visible'] &&
               currentTime >= hotspot.startsAt &&
               currentTime < hotspot.endsAt) {
                options['hotspots'][i]['visible'] = true;
                me.activeHotspots[hotspot.name] = new Hotspot(hotspot, me, options);
                if(seek) {
                    me.activeHotspots[hotspot.name].seek(currentTime);
                }
                else {
                    me.activeHotspots[hotspot.name].animate(currentTime);
                }
                if(me.initialHotspot && me.initialHotspot.name == hotspot.name) {
                    me.initialHotspot = null;
                    me.activeHotspots[hotspot.name].click();
                }
            }
        }

    }
    
    this.on_seek = function(currentTime) {
        me.handleHotspots(currentTime, true);
    }
    
    this.timeupdate = function(currentTime) {
        me.handleHotspots(currentTime, false);
    }
    
    this.on_resize = function(currentTime, width, height) {
        me.width = width;
        me.height = height;
        
        var movieW = options['general'].width;
        var movieH = options['general'].height;
        var movieR = movieW / movieH;
        var playerR = width / height;
        
        if(playerR < movieR) {
            me.VideoSize.width = width;
            me.VideoSize.height = parseInt(width * (movieH / movieW));
            me.VideoOffsets.x = 0;
            me.VideoOffsets.y = parseInt((height - me.VideoSize.height) / 2);
        }
        else {
            me.VideoSize.width = parseInt(height * (movieW / movieH));
            me.VideoSize.height = height;
            me.VideoOffsets.x = parseInt((width - me.VideoSize.width) / 2);
            me.VideoOffsets.y = 0;
        }

        me.sizeFactorWidth = me.VideoSize.width / me.originalWidth;
        me.sizeFactorHeight = me.VideoSize.height / me.originalHeight;

        for(var name in me.activeHotspots) {
            if(!me.activeHotspots[name])
                continue;
            me.activeHotspots[name].on_resize(width, height);
        }
        
        if(me.navigation)
            me.navigation.on_resize(width, height);
        if(me.map)
            me.map.on_resize(width, height);
        if(me.finalPopup)
            me.finalPopup.on_resize(width, height);
        if(me.startProgressPopup)
            me.startProgressPopup.on_resize(width, height);
        
        Pulsar.on_resize(me);

        me.on_seek(currentTime);
    }
    
    this.on_play = function(currentTime) {
        for(var name in me.activeHotspots) {
            if(!me.activeHotspots[name])
                continue;
            me.activeHotspots[name].seek(currentTime);
            me.activeHotspots[name].on_play(currentTime);
        }
    }

    this.on_pause = function(currentTime) {
        me.lastCurrentTime = currentTime;

        for(var name in me.activeHotspots) {
            if(!me.activeHotspots[name])
                continue;
            me.activeHotspots[name].on_pause(currentTime);
        }
    }
    
    this.is_paused = function() {
        return me.player.paused();
    }

    this.pause = function() {
        me.player.pause();
    }
    
    this.play = function() {
        me.player.play();
    }
    
    this.currentTime = function() {
        if(arguments && arguments.length)
            return me.player.currentTime(arguments[0]);
        else
            return me.player.currentTime();
    }
    
    this.loadVideo = function(link) {
        var uri = parseUri(document.location);
        var tc = parseInt(me.player.currentTime());
        var ret = uri.path;
        if(tc > 5)
            ret += '?start='+(tc - 5);
        
        if(link.indexOf('?') == -1)
            link += '?';
        else
            link += '&';
        link += 'return='+encodeURIComponent(ret);

        document.location = link;
    }
    
    
    this.on_started = function() {
        if(me.initialized) {
            return;
        }
        me.initialized = true;

    
        if(_gaq) {
            _gaq.push(
                ['_trackEvent', options['general'].name, 'MainVideo-Run']
            );
        }

        // The video was first launched, add our controls


        me.navigation = new Navigation(me, options);

        if(options['general']['hd'] && !options['general']['sd']) {
            me.navigation.addControl('<button id="toggleSD" class="selectedQuality">SD</button>');
            me.navigation.addControl('<button id="toggleHD">HD</button>');
            $('#toggleHD').click(function() {
                var uri = options['general']['hd']+'?autoplay=1';
                var tc = parseInt(me.player.currentTime());
                if(tc > 5)
                    uri += '&start='+(tc - 5);
                document.location = uri;
                return false;
            });
        }
        else if(options['general']['sd'] && !options['general']['hd']) {
            me.navigation.addControl('<button id="toggleHD" class="selectedQuality">HD</button>');
            me.navigation.addControl('<button id="toggleSD">SD</button>');
            $('#toggleSD').click(function() {
                var uri = options['general']['sd']+'?autoplay=1';
                var tc = parseInt(me.player.currentTime());
                if(tc > 5)
                    uri += '&start='+(tc - 5);
                document.location = uri;
                return false;
            });
        }


        if(typeof options['map'] == 'object' && 
           typeof options['map']['frames'] == 'object' &&
           options['map']['frames'].length) {
            me.map = new Map(options['map'], me, options);
        }

        // Handle an optional return link
        if(options['general']['returnLink']) {

            me.navigation.addControl('<button id="returnVideo" title="'+_t('RETURN_MAIN_VIDEO')+'"><span>'+_t('RETURN_MAIN_VIDEO')+'</span></button>');
            $('#returnVideo').click(function() {
                document.location = options['general']['returnLink'];
                return false;
            });

            me.player.on('ended', function() {
                document.location = options['general']['returnLink'];
            });
        }
        
        // Handle iframe fullscreen
        if(!me.isFullScreenEnabled) {
            $('#main_video > .vjs-control-bar .vjs-fullscreen-control').click(function() {
                me.pause();
                
                var uri = setQueryVariables(document.location, 'start', parseInt(me.player.currentTime()));
                uri = setQueryVariables(uri, 'hotspot', '');
                uri = setQueryVariables(uri, 'autoplay', 1);

                var height = screen.height - 150;
                var width = parseInt(height * (me.originalWidth / me.originalHeight));
                
                if(width > screen.width) {
                    width = screen.width;
                    height = width * (me.originalHeight / me.originalWidth);
                }
            
                window.open(uri, 'player', 'titlebar=0,scrollbars=0,menubar=0,toolbar=0,status=0,channelmode=1,fullscreen=1,width='+width+',height='+height);
                return false;
            });
            me.navigation.addControl('<button id="toggleFS">Plein écran</button>');
            $('#toggleFS').click(function() {
                $('.vjs-fullscreen-control').click();
                return false;
            })
        }
        
        if(me.playbackReady) {
            me.on_playbackReady();
        }
        else {
            var cb = function() {
                if(me.playbackReady)
                    me.on_playbackReady();
                else
                    setTimeout(cb, 100);
            }
            setTimeout(cb, 100);
        }
    }
    
    this.on_playbackReady = function() {
        if(me.start) {
            me.pause();
            me.startFinished = false;
            me.startProgressPopup = new Popup(
            {
                'name': 'startProgressPopup',
                'title': _t('LOADING_WAIT'),
                'type':'html',
                'hideBottom': true,
                'noScroll': true,
                'leftContent': '<div id="startProgressBar"></div>'
            }, 
            {
                'name': function() { return 'startProgressPopup'; },
                'on_popupClosed': function() {
                    if(me.startFinished) {
                        me.player.currentTime(me.start);
                    }
                    if(me.initialHotspot || me.openedHotspot)
                        me.pause();
                    else
                        me.play();
                    me.start = 0;
                    me.startProgressPopup = null;
                }
            },
            me,
            options);
            
            me.checkBuffered = function() {
                // This function handles the initial seek
                // it makes sure the video is buffered
                // up to me.start before running
                
                if(!me.startProgressPopup)
                    return;
                
                var buffered = me.player.buffered();

                // Update the progress
                var max = 0;
                for(var i = 0; i < buffered.length; i++) {
                    if(buffered.end(i) > max &&
                       buffered.end(i) < me.start) {
                        max = buffered.end(i);
                    }
                }
                $('#startProgressBar').progressbar('option', 'value', max);
                
                
                for(var i = 0; i < buffered.length; i++) {
                    if(buffered.start(i) <= me.start &&
                       buffered.end(i) >= me.start) {
                        me.checkBuffered = null;
                        me.startFinished = true;
                        me.startProgressPopup.on_close();
                        return;
                    }
                }
                setTimeout(function() {
                    me.checkBuffered();
                }, 100);
            };

            
            $('#startProgressBar').progressbar({max: me.start});
            me.player.currentTime(me.start);
            me.checkBuffered();
        }
    }
    
    this.build = function() {
        if(window.navigator.userAgent.indexOf('iPad;') != -1) {
            $('html').addClass('iPad');
        }


        // Set pulsar default
        if(options['pulsar']) {
            if(options['pulsar']['duration'])
                Pulsar.duration = parseInt(options['pulsar']['duration']);
            if(options['pulsar']['numberCircles'])
                Pulsar.numberCircles = parseInt(options['pulsar']['numberCircles']);
            if(options['pulsar']['maxWidth'])
                Pulsar.maxWidth = parseInt(options['pulsar']['maxWidth']);
            if(options['pulsar']['image'])
                Pulsar.image = options['pulsar']['image'];
            if(options['pulsar']['borderColor'])
                Pulsar.borderColor = options['pulsar']['borderColor'];
            if(options['pulsar']['fillColor'])
                Pulsar.fillColor = options['pulsar']['fillColor'];
            if(options['pulsar']['borderSize'])
                Pulsar.borderSize = parseInt(options['pulsar']['borderSize']);
        }

        // Detect domain
        if(window!=window.top) {
            var parentUri = parseUri(document.referrer);
            var myUri = parseUri(document.location);
            var parentDomain = parentUri['domain'];
            var myDomain = myUri['domain'];
            
            var pos = parentDomain.lastIndexOf('.');
            if(pos != -1) {
                var pos = parentDomain.lastIndexOf('.', pos - 1);
                if(pos != -1)
                    parentDomain = parentDomain.substr(pos + 1);
            }
            
            pos = myDomain.lastIndexOf('.');
            if(pos != -1) {
                var pos = myDomain.lastIndexOf('.', pos - 1);
                if(pos != -1)
                    myDomain = myDomain.substr(pos + 1);
            }
            
            if(parentDomain != myDomain)
                me.isFromDomain = false;
        }
        
        // Is fullscreen allowed
        me.isFullScreenEnabled = (document.fullscreenEnabled ||
                                  document.msFullscreenEnabled ||
                                  document.mozFullScreenEnabled ||
                                  document.webkitFullscreenEnabled);


        // Load Twitter JS
        window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };
            return t;
        }(document, "script", "twitter-wjs"));

        videojs(id, {nativeControlsForTouch: false}, function() {
            me.player = this;
            
            me.obj = $('#'+id);
            
            me.player.usingNativeControls(false);
            
            
            
            var url = parseUri(document.location);
            me.getvars = getQueryVariables(url);

            
            me.player.on('seeked', function() {
                var currentTime = me.player.currentTime();
                me.on_seek(currentTime);
                me.seeking = false;
            });

            me.player.on('seeking', function() {
                me.seeking = true;
            });

            me.player.on('timeupdate', function() {
                var currentTime = me.player.currentTime();

                if(!me.seeking && me.lastCurrentTime != currentTime) {
                    me.timeupdate(currentTime);
                }
                
                if(_gaq) {
                    var percent = parseInt((currentTime / me.player.duration()) * 100);
                    if((percent % 20 == 0) && me.viewState[percent] == false) {
                        me.viewState[percent] = true;
                        setTimeout(function() {
                            _gaq.push(
                                ['_trackEvent', options['general'].name, 'MainVideo-Position', percent+'%']
                            );
                        }, 1);
                    }
                }

                me.lastCurrentTime = currentTime;
            });
            
            me.player.on('resize', function() {
                me.on_resize(me.player.currentTime(), me.player.width(), me.player.height());
            });

            me.player.on('firstplay', function() {
                me.on_started();
            });

            me.player.on('loadedmetadata', function() {
                me.playbackReady = true;
            });

            me.player.on('fullscreenchange', function() {
                if(me.player.isFullscreen() && _gaq) {
                    _gaq.push(
                        ['_trackEvent', options['general'].name, 'MainVideo-FullScreen']
                    );
                }
            });

            me.player.on('play', function() {
                me.on_play(me.player.currentTime());
            });

            me.player.on('pause', function() {
                me.on_pause(me.player.currentTime());
            });

            me.player.on('ended', function() {
                if(_gaq) {
                    _gaq.push(
                        ['_trackEvent', options['general'].name, 'MainVideo-Finished']
                    );
                }

                me.viewState = {
                    '20': false,
                    '40': false,
                    '60': false,
                    '80': false,
                    '100': false
                };
                me.finalPopup = new FinalPopup(options, me);
            });

            $(window).bind('resize orientationchange', function() {
                $('#playerContainer').css({
                    'width': '1px',
                    'height': '1px'
                });
                var width = $(window).width();
                var height = $(window).height();
                $('#playerContainer').css({
                    'width': 'auto',
                    'height': 'auto'
                });
                me.player.dimensions(width, height);
            });
            
            var width = $(window).width();
            var height = $(window).height();

            $('#playerContainer').css({
                'width': '1px',
                'height': '1px'
            });
            me.player.dimensions(width, height);
            $('#playerContainer').css({
                'width': 'auto',
                'height': 'auto'
            });
            
            if(me.getvars['hotspot']) {
                for(var i = 0; i < options['hotspots'].length; i++) {
                    var hotspot = options['hotspots'][i];
                    if(hotspot.name == me.getvars['hotspot']) {
                        if(_gaq) {
                            _gaq.push(
                                ['_trackEvent', options['general'].name, 'MainVideo-Hotspot', hotspot.name]
                            );
                        }
                        me.initialHotspot = hotspot;
                        me.start = me.initialHotspot['startsAt'];
                        break;
                    }
                }
            }
            else if(me.getvars['start'] && parseInt(me.getvars['start']) > 0) {
                if(_gaq) {
                    _gaq.push(
                        ['_trackEvent', options['general'].name, 'MainVideo-StartAt', parseInt(me.getvars['start'])]
                    );
                }
                me.start = parseInt(me.getvars['start']);
            }
            
            if(me.getvars['autoplay'] != '') {
                if(parseInt(me.getvars['autoplay']) > 0) {
                    me.autoplay = true;
                    me.play();
                }
            }
            else if(options['general']['autoplay'] != '') {
                if(parseInt(options['general']['autoplay']) > 0) {
                    me.autoplay = true;
                    me.play();
                }
            }
           
        });
    }

    
    this.build();
}
;
/*
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
*/

function Hotspot(config, player, options) {
    var me = this;
    
    this.obj = null;

    this.activeMove = -1;

    this.x = 0;
    this.y = 0;
    
    this.xOffset = 0;
    this.yOffset = 0;
    
    this.popup = null;
    this.pulsar = null;

    this.actionActivated = false;
    this.wasPaused = false;
    
    this.name = function() {
        return config.name;
    }
            
    this.destroy = function() {
        if(config['onBeforeHide'] && window[config['onBeforeHide']])
            window[config['onBeforeHide']](player, player.currentTime(), me.obj, config);
        if(me.popup) {
            me.popup.destroy();
            me.popup = null;
        }
        if(me.pulsar) {
            me.pulsar.destroy();
            me.pulsar = null;
        }
        me.obj.stop(true, false);
        me.obj.remove();
    }
    
    this.click = function() {
        me.wasPaused = player.is_paused();
        player.pause();
        me.obj.click();
    }
    
    this._computeOffsets = function() {
        me.xOffset = player.VideoOffsets.x;
        me.yOffset = player.VideoOffsets.y;
        
        if(config.image == 'pulsar') {
            me.xOffset -= parseInt((me.pulsar.width() / 2));
            me.yOffset -= parseInt((me.pulsar.height() / 2));
        }
        else {
            me.xOffset -= parseInt((config.image_w * player.sizeFactorWidth) / 2);
            me.yOffset -= parseInt((config.image_h * player.sizeFactorHeight) / 2);
        }
    }

    this.on_resize = function(width, height) {

        if(me.popup) {
            me.popup.on_resize(width, height);
        }

        if(config.image != 'pulsar') {
            me.obj.find('img').css({
                'width': parseInt(config.image_w * player.sizeFactorWidth)+'px',
                'height': parseInt(config.image_h * player.sizeFactorHeight)+'px'
            });
        }
        
        me._computeOffsets();
    }
    
    this.hideTooltip = function() {
        me.obj.find('.tooltip').fadeOut(function() {
            $(this).css('display', '');
        });
    }
    
    this.showTooltip = function() {
        me.obj.find('.tooltip').fadeIn();
    }
    
    this._getPosition = function(x, y) {   
        return {
            'left': (me.xOffset + parseInt(x * player.sizeFactorWidth))+'px',
            'top': (me.yOffset + parseInt(y * player.sizeFactorHeight))+'px'
        };
    }
    
    this.on_play = function(currentTime) {
        me.obj.removeClass('paused');
        me.actionActivated = false;
    
        if(me.activeMove == -1)
            return;
            
        var move = config.moves[me.activeMove];
            
        me.x = move.x2;
        me.y = move.y2;

        me.obj.animate(
            me._getPosition(me.x, me.y), 
            parseInt((move.endsAt - currentTime) * 1000), 
            'linear');
    }
    
    this.on_pause = function(currentTime) {
        me.obj.stop(true, false);
        me.seek(currentTime);
        me.obj.addClass('paused');
    }
    
    this.seek = function(currentTime) {
        // We are past the last move
        if(currentTime >= config.moves[config.moves.length - 1].endsAt) {
            me.obj.css(me._getPosition(config.moves[config.moves.length - 1].x2, config.moves[config.moves.length - 1].y2));
            return;                
        }

        for(var i = 0; i < config.moves.length; i++) {
            // Not in time frame
            if(currentTime < config.moves[i].startsAt || currentTime >= config.moves[i].endsAt) {
                continue;
            }
            me.activeMove = i;

            // Move hotspot to the current position of the translation
            var move = config.moves[me.activeMove];
            if(move.x1 == move.x2 &&
               move.y1 == move.y2) {
                var x = move.x1;
                var y = move.y1;
            }
            else {
                var x = move.x1 + ((move.x2 - move.x1) / (move.endsAt - move.startsAt)) * (currentTime - move.startsAt);
                var y = move.y1 + ((move.y2 - move.y1) / (move.endsAt - move.startsAt)) * (currentTime - move.startsAt);
            }
            me.obj.css(me._getPosition(x, y));

            // Run animation
            me.obj.stop(true, false);
            if(!player.is_paused()) {
                me.on_play(currentTime);
            }
            return;
        }
    }
    
    this.on_popupClosed = function() {
        player.openedHotspot = '';
        me.actionActivated = false;
        me.popup = null;
        if(!me.wasPaused)
            player.play();
    }
    
    this.animate = function(currentTime) {
        // We are past the last move
        if(currentTime >= config.moves[config.moves.length - 1].endsAt) {
            me.obj.css(me._getPosition(config.moves[config.moves.length - 1].x2, config.moves[config.moves.length - 1].y2));
            return;                
        }        
    
        for(var i = 0; i < config.moves.length; i++) {
            // Not in time frame
            if(currentTime < config.moves[i].startsAt) {
                continue;
            }
            
            if(i == me.activeMove) {
                if(currentTime >= config.moves[i].endsAt) {
                    // Are we finished
                    me.activeMove = -1;
                    continue;
                }
                return;
            }
            else if(currentTime >= config.moves[i].endsAt) {
                // Nothing to do with this old translation
                continue;
            }
            
            me.activeMove = i;
            
            // Run animation
            me.obj.stop(true, false);
            if(!player.is_paused()) {
                me.on_play(currentTime);
            }
            return;
        }
    }
    
    this.build = function() {

        player.obj.append('<a id="'+config.name+'" href="#" class="hotspot overlay_content"><span class="hotspot_container"></span></a>');
        me.obj = $('#'+config.name);
        
        var hasLink = false;
        if(config.target != 'popup') {
            me.obj.attr('href', config.link);
            if(config.target)
                me.obj.attr('target', config.target);
        }

        
        if(config['onBeforeShow'] && window[config['onBeforeShow']]) {
            window[config['onBeforeShow']](player, player.currentTime(), me.obj, config);
        }

        if(config.image == 'pulsar') {
            me.pulsar = new Pulsar({}, me, player);
        }
        else {
            me.obj.find('.hotspot_container').append('<img src="'+config.image+'" style="width: '+(parseInt(config.image_w * player.sizeFactorWidth))+'px;height: '+(parseInt(config.image_h * player.sizeFactorHeigh))+'px;" alt="" />');
        }
        if(config.tooltip) {
            me.obj.append('<span class="tooltip">'+config.tooltip+'</span>');
        }
        
        // If there is a Twitter link
        if(window.twttr && twttr && twttr.widgets) {
            twttr.widgets.load(me.obj.get(0));
        }

        me._computeOffsets();

        // Move object at the begining of the translation
        me.obj.css(me._getPosition(config.moves[0].x1, config.moves[0].y1));
        me.showTooltip();
        
        me.obj.hover(function() {
            me.wasPaused = player.is_paused();
            player.pause();
        }, function() {
            if(!me.actionActivated && !me.wasPaused)
                player.play();
        });
        
        me.obj.click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Hotspot-Click', config.name]
                );
            }
            player.openedHotspot = config.name;
            me.actionActivated = true;

            if(config['onClick'] && window[config['onClick']])
                window[config['onClick']](player, player.currentTime(), me.obj, config);

            switch(config.target) {
                case 'popup':
                    for(var i = 0; i < options['popups'].length; i++) {
                        if(options['popups'][i].name != config.link)
                            continue;
                        
                        me.popup = new Popup(options['popups'][i], me, player, options);
                        break;
                    }
                    return false;

                case 'video':
                    player.loadVideo(config.link);
                    return false;

                case 'timecode':
                    player.currentTime(config.link);
                    return false;
            }

        });
        
    }
    
    this.build();
}
;
/*
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
*/

function Pulsar(config, hotspot, player) {
    var me = this;
    
    this.obj = null;
    
    this.config = config;
    
    this.destroy = function() {
        me.obj.remove();
        Pulsar.removed();
    }
    
    
    this._setConfig = function(config) {
        me.config['borderColor'] = config['borderColor'] ? config['borderColor'] : Pulsar.borderColor;
        me.config['fillColor'] = config['fillColor'] ? config['fillColor'] : Pulsar.fillColor;
        me.config['borderSize'] = config['borderSize'] ? config['borderSize'] : Pulsar.borderSize;
        me.config['image'] = config['image'] ? config['image'] : Pulsar.image;
    }
    
    this.setConfig = function(config) {
        me._setConfig(config);
        
        if(Pulsar.hasSVG) {
            me.obj.find('circle').attr({
                'stroke': me.config['borderColor'],
                'fill': me.config['fillColor'],
                'stroke-width': me.config['borderSize']
            });
        }
        else {
            me.obj.find('img').attr('src', me.config['image']);
        }
    }

    this.addSVG = function() {
        var value = '';
        var time;
        var begin;
        var dur;
        var end;
        var id;
        
        for(var i = 0; i < Pulsar.numberCircles; i++) {
            id = 'pulsar_'+Pulsar.index+'_'+i;
            begin = parseInt(i * (Pulsar.duration / Pulsar.numberCircles))+'ms';
            dur = Pulsar.duration+'ms';
            value += '<circle cx="50%" cy="50%" r="1%" fill="'+me.config['fillColor']+'" stroke="'+me.config['borderColor']+'" stroke-width="'+me.config['borderSize']+'">';
            if(Pulsar.hasSMIL) {
                value += '  <animate id="'+id+'" attributeName="r" attributeType="XML" from="1%" to="50%" begin="'+begin+'" dur="'+dur+'" fill="remove" repeatCount="indefinite" />';
                value += '  <animate attributeName="opacity" from="1.8" to="0" begin="'+begin+'" dur="'+dur+'" repeatCount="indefinite" />';
            }
            value += '</circle>';
        }
        // To create a div inside a svg document, we need set the NS (namespace). //
        var d = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        // Add a svg tag and inside this, put the value argument
        d.innerHTML = '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+Pulsar.scalledWidth+'px" height="'+Pulsar.scalledWidth+'px">' + value + '</svg>';
        me.obj.get(0).appendChild(d);
    }
    
    this.addStandard = function() {
        for(var i = 0; i < Pulsar.numberCircles; i++) {
            me.obj.append('<img class="circle" src="'+me.config['image']+'" />');
        }
    }
    
    this.build = function() {
        hotspot.obj.find('.hotspot_container').append('<span class="pulsar" id="pulsar_'+Pulsar.index+'"></span>');
        me.obj = hotspot.obj.find('.pulsar');
        me.obj.css({
            'width': Pulsar.scalledWidth,
            'height': Pulsar.scalledWidth
        });
        
        if(Pulsar.hasSVG)
            me.addSVG();
        else
            me.addStandard();

        Pulsar.added();
    }
    
    
    this.width = function() {
        return Pulsar.scalledWidth;
    }

    this.height = function() {
        return Pulsar.scalledWidth;
    }
    
    this.hide = function() {
        me.obj.hide();
    }
    
    this.show = function() {
        me.obj.show();
    }
    
    this._setConfig(config);
    this.build();
}


/* Options for the pulsar animation */
Pulsar.duration = 3000;
Pulsar.numberCircles = 2;
Pulsar.maxWidth = 40;
Pulsar.image = '/iplayer/images/circle-white.png';
Pulsar.borderColor = '#000000';
Pulsar.borderSize = 2;
Pulsar.fillColor = '#ffffff';



/* Internal static values */
Pulsar.supportsSMIL = function() {
    if(window.navigator.userAgent.indexOf('Safari/') != -1)
        return false;

    return Modernizr.smil;
};
Pulsar.hasSVG = Modernizr.inlinesvg
Pulsar.hasSMIL = (Pulsar.hasSVG && Pulsar.supportsSMIL());
Pulsar.count = 0;
Pulsar.index = 0;
Pulsar.scalledWidth = 30;
Pulsar.timers = {};
Pulsar.animations = {};
Pulsar.first = '';


Pulsar.on_resize = function(player) {
    Pulsar.scalledWidth = parseInt(Pulsar.maxWidth * player.sizeFactorWidth);
    if(Pulsar.scalledWidth > Pulsar.maxWidth)
        Pulsar.scalledWidth = Pulsar.maxWidth;

    $('.pulsar').css({
        'width': Pulsar.scalledWidth,
        'height': Pulsar.scalledWidth
    });
    
    if(Pulsar.hasSVG) {
        $('.pulsar svg')
            .css({
                'width': Pulsar.scalledWidth,
                'height': Pulsar.scalledWidth
             });
    }
    
    if(!Pulsar.hasSMIL) {
        var index;
        for(index in Pulsar.animations) {
            if(Pulsar.animations[index]) {
                clearInterval(Pulsar.animations[index]); 
                Pulsar.animations[index] = null;
            }
        }
        for(index in Pulsar.timers) {
            if(Pulsar.timers[index]) {
                clearTimeout(Pulsar.timers[index]); 
                Pulsar.timers[index] = null;
            }
        }
        Pulsar.runPulsars();
    }
}

Pulsar.added = function() {
    Pulsar.index++;

    if(Pulsar.hasSMIL) {
        Pulsar.fixSVG();
    }
    else {
        if(Pulsar.count == 0) {
            Pulsar.runPulsars();
        }
    }
    Pulsar.count++;
}

Pulsar.removed = function() {
    Pulsar.count--;

    if(Pulsar.hasSMIL) {
        Pulsar.fixSVG();
    }
}

Pulsar.fixSVG = function() {
    $('.pulsar').each(function(index) {
        var is_first = (index == 0);
        if(is_first)
            Pulsar.first = $(this).attr('id');
        
        for(var i = 0; i < Pulsar.numberCircles; i++) {
            if(is_first) {
                begin = parseInt(i * (Pulsar.duration / Pulsar.numberCircles))+'ms';
            }
            else {
                begin = Pulsar.first+'_'+i+'.begin';
            }
            $(this).find('circle:eq('+i+') animate').attr('begin', begin);
        }
    });
}

Pulsar.applyStyle = function(circles, from, max, stepping, progress) {
    var name;
    var value;
    var cvalue;
    var style = '';
    var finished = true;
    var date = new Date();
    var start = date.getTime()
    var attr = {};

    for(name in from) {
        value = parseInt((from[name] + (stepping[name] * progress)) * 1000) / 1000;

        // Make sure we respect the limits
        if(stepping[name] < 0 && value <= max[name])
            value = max[name];
        else if(stepping[name] >= 0 && value >= max[name])
            value = max[name];
        else
            finished = false;
            
        if(Pulsar.hasSVG) {
            if(name != 'opacity') value += '%';
            attr[name] = value;
        }
        else {
            // Add the the style
            if(style) style += ';';
            style += name+':'+value;
            if(name != 'opacity') style += 'px';
        }
    }    

    if(Pulsar.hasSVG) {
        circles.attr(attr);
    }
    else {
        style += ';';
        for(var i = 0; i < circles.length; i++) {
            circles[i].setAttribute('style', style);
        }
    }

    return (!finished);
}

Pulsar.animate = function(index, circles, from, to, complete) {
    var name;
    var date = new Date();
    var start = date.getTime()

    var stepping = {};
    for(name in from) {
        stepping[name] = to[name] - from[name];
    }
    
    if(Pulsar.animations[index]) {
        clearInterval(Pulsar.animations[index]);
        Pulsar.animations[index] = null;
    }

    Pulsar.animations[index] = setInterval(function() {
        date = new Date();
        var progress = (date.getTime() - start) / Pulsar.duration;
        
        if(!Pulsar.applyStyle(circles, from, to, stepping, progress)) {
            // we are actually done
            if(Pulsar.animations[index]) {
                clearInterval(Pulsar.animations[index]);
                Pulsar.animations[index] = null;
            }
            if(complete)
                complete();
        }
    }, $.fx.interval);
}

Pulsar.animatePulsar = function(index) {
    var circles;
    var from;
    var to;
    
    if(Pulsar.hasSVG) {
        circles = $('.pulsar circle:nth-child('+(index+1)+')');
        from = {
            'r': 1,
            'opacity': 1.8
        };
        to = {
            'r': 50,
            'opacity': 0
        };
    }
    else {
        circles = $('.pulsar .circle:nth-child('+(index+1)+')');
        from = {
            'width': 1,
            'height': 1,
            'top': parseInt(Pulsar.scalledWidth / 2),
            'left': parseInt(Pulsar.scalledWidth / 2),
            'opacity': 1.8
        };
        to = {
            'width': Pulsar.scalledWidth,
            'height': Pulsar.scalledWidth,
            'top': 0,
            'left': 0,
            'opacity': 0
        };
    }
    
    Pulsar.animate(index, circles, from, to, function() {
        if(index == 0) {
            Pulsar.runPulsars();
        }
    });
}

Pulsar.runPulsar = function(index) {
    if(index == 0) {
        Pulsar.timers[index] = setTimeout(function() {
            Pulsar.timers[index] = null;
            Pulsar.animatePulsar(index);
        }, 10);
    }
    else {
        Pulsar.timers[index] = setTimeout(function() {
            Pulsar.timers[index] = null;
            Pulsar.animatePulsar(index);
        }, parseInt(index*(Pulsar.duration/Pulsar.numberCircles)));
    }
}

Pulsar.runPulsars = function() {
    for(var i = 0; i < Pulsar.numberCircles; i++) {
        Pulsar.runPulsar(i);
    }
}

;
/*
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
*/

function Popup(config, hotspot, player, options) {
    var me = this;

    this.obj = null;
    this.htmlVideo = null;
    
    
    this.handlSize = function(width, height) {
        me.obj.find('.popup').width(width);
        me.obj.find('.popup').height(height);
        me.obj.find('.popup').css({
            'margin-left': parseInt((player.width - width) / 2)+'px',
            'margin-top': parseInt((player.height - height) / 2)+'px'
        });
        me.obj.width(player.width);
        me.obj.height(player.height);

        var titleHeight = me.obj.find('.title').outerHeight(true);        
        var contentMargin = me.obj.find('.popup_content').outerHeight(true) - me.obj.find('.popup_content').height();
        var bottomBar = me.obj.find('.popup_bottom').outerHeight(true);

        me.obj.find('.popup_content').height(me.obj.find('.popup').height() - titleHeight - contentMargin - bottomBar);
    }
    
    this.contentWidth = function() {
        return me.obj.find('.popup_content').width();
    }

    this.contentHeight = function() {
        return me.obj.find('.popup_content').height();
    }

    this.on_resize = function(width, height) {
        me.handlSize(width - Popup.border, height - Popup.border);

        if(config.type == 'mixed') {
            me.resizeContent(config.leftType,
                             me.obj.find('.leftContainer'),
                             player.width < 1024 ? me.contentWidth() : parseInt(me.contentWidth() * 0.6),
                             me.contentHeight(),
                             true);
        }
        else {
            me.resizeContent(config.type, 
                             me.obj.find('.popup_content'), 
                             me.contentWidth(),
                             me.contentHeight(),
                             false);
            me.autoFit();
        }
    }
    
    this.resizeContent = function(type, container, maxWidth, maxHeight, mixed) {
        var size = null;

        switch(type) {
            case 'video':
                size = me.videoSize(maxWidth, maxHeight);
                container.find('iframe,object,embed').css({
                        'width': size.width+'px',
                        'height': size.height+'px',
                        'margin-left': size.marginLeft+'px',
                        'margin-top': (mixed ? '0px' : size.marginTop+'px')
                    });
                break;

            case 'htmlVideo':
                size = me.videoSize(maxWidth, maxHeight);
                $('#'+config.name+'_video').css({
                    'width': size.width+'px', 
                    'height': size.height+'px',
                    'margin-left': size.marginLeft+'px',
                    'margin-top': (mixed ? '0px' : size.marginTop+'px')
                });
                me.htmlVideo.dimensions(size.width, size.height);
                break;
            case 'picture':
                size = me.videoSize(maxWidth, maxHeight);
                $('#loadingImage').css({
                    'width': size.width+'px', 
                    'height': size.height+'px',
                    'margin-left': size.marginLeft+'px',
                    'margin-top': (mixed ? '0px' : size.marginTop+'px')
                });
                break;
            case 'slideshow': 
                // Slideshow needs to be rebuilt
                me.buildContent(type, 
                                config.leftContent, 
                                container, 
                                maxWidth,
                                maxHeight,
                                mixed);
                break;
            case 'html':
                container.find('iframe,object,embed').css({
                        'width': maxWidth+'px',
                        'height': maxHeight+'px',
                        'margin-left': '0px',
                        'margin-top': '0px'
                    });
                break;
        }
    }
    
    
    this.autoFit = function() {
        var content = '';

        switch(config.type) {
            case 'video':
                content = me.obj.find('.popup_content').find('iframe,object,embed');
                break;

            case 'htmlVideo':
                content = me.obj.find('.popup_content').find('video');
                break;

            case 'slideshow':
                content = me.obj.find('.popup_content').find('#banner-slide');
                break;

            case 'picture':
                content = me.obj.find('.popup_content').find('#loadingImage');
                break;

            default:
                return;
        }
        
        if(!content.length)
            return;

        var twidth = content.outerWidth(true);
        var theight = content.outerHeight(true);

        var cwidth = me.contentWidth();
        var cheight = me.contentHeight();
        
        me.handlSize(player.width - (cwidth - twidth) - Popup.border, player.height - (cheight - theight) - Popup.border);
    }

    this.destroy = function() {
        if(me.htmlVideo) me.htmlVideo.dispose();
        me.obj.stop(false, true);
        me.obj.remove();
    }
    
    this.buildBottom = function() {
        if(!options['general']['shareLink'] || !options['general']['shareText']) {
            return;
        }
        
        if(config['hideBottom'])
            return;

        me.obj.find('.popup').append('<div class="popup_bottom"><div class="shares"><span><strong>'+_t('SHARE_CONTENT')+' : </strong></span></div><div class="clear"></div></div>');
    
        var text = options['general']['shareText'] + ': '+ config.title;
        
        var shareUrl = parseUri(options['general']['shareLink']);
        shareUrl = getQueryVariables(shareUrl);

        var twitter = setQueryVariables(options['general']['shareLink'], 'hotspot', hotspot.name());
        var facebook = setQueryVariables(options['general']['shareLink'], 'hotspot', hotspot.name());        
        
        if(!shareUrl['utm_source']) {
            facebook = setQueryVariables(facebook, 'utm_source', options['general'].name);
            twitter = setQueryVariables(twitter, 'utm_source', options['general'].name);
        }

        if(!shareUrl['utm_campaign']) {
            facebook = setQueryVariables(facebook, 'utm_campaign', 'popup');
            twitter = setQueryVariables(twitter, 'utm_campaign', 'popup');
        }

        if(!shareUrl['utm_medium']) {
            facebook = setQueryVariables(facebook, 'utm_medium', 'facebook');
            twitter = setQueryVariables(twitter, 'utm_medium', 'twitter');
        }
        
        var facebookLink = 'https://www.facebook.com/sharer.php?t='+encodeURIComponent(text)+'&u='+encodeURIComponent(facebook);
        var twitterLink = 'https://twitter.com/share?url='+encodeURIComponent(twitter)+'&text='+encodeURIComponent(text);
        if(options['general']['twitterVia'])
            twitterLink += '&via='+encodeURIComponent(options['general']['twitterVia'])+'&related='+encodeURIComponent(options['general']['twitterVia']);
        if(options['general']['twitterHashtag'])
            twitterLink += '&hashtags='+encodeURIComponent(options['general']['twitterHashtag']);
            
        me.obj.find('.popup_bottom .shares').append('<a target="_blank" title="'+_t('SHARE_FB')+'" href="'+facebookLink+'" class="share facebook"><img src="/iplayer/images/facebook.png" alt="'+_t('SHARE_FB')+'" /></a>');
        me.obj.find('.popup_bottom .shares').append('<a target="_blank" title="'+_t('SHARE_TW')+'" href="'+twitterLink+'" class="share twitter"><img src="/iplayer/images/twitter.png" alt="'+_t('SHARE_TW')+'" /></a>');
        
        if(_gaq) {
            me.obj.find('.popup_bottom a.twitter').click(function() {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Popup-ClickTwitter', config.name]
                );
            });            
            me.obj.find('.popup_bottom a.facebook').click(function() {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Popup-ClickFacebook', config.name]
                );
            });
        }

        // If there is a Twitter link
        if(window.twttr && twttr && twttr.widgets) {
            twttr.widgets.load(me.obj.find('.popup_bottom').get(0));
        }
    }

    this.build = function() {
        player.obj.append('<div id="'+config.name+'" class="popup_overlay"><div class="popup"><div class="title">'+config.title+'<div title="'+_t('CLOSE')+'" class="close">X</div><div class="clear"></div></div><div class="popup_content"></div></div></div>');
        me.obj = $('#'+config.name);
        
        me.buildBottom();

        me.handlSize(player.width - Popup.border, player.height - Popup.border);
        
        me.obj.find('.close').click(function() {
            me.on_close();
            return false;
        });
        
        // Prevent any click to trigger on popup_overlay close event
        me.obj.find('.popup').click(function(e) {
            e.stopPropagation();
        });
        
        me.obj.click(function() {
            me.on_close();
            return false;
        });
                            
        switch(config.type) {
            case 'mixed':
                me.buildMixed();
                if(!config['noScroll']) {
                    me.obj.find('.popup_content').mCustomScrollbar({
                        theme: 'dark-thick'
                    });
                }
                break;

            case 'html':
                me.obj.find('.popup_content').append(config.leftContent);
                if(!config['noScroll']) {
                    me.obj.find('.popup_content').mCustomScrollbar({
                        theme: 'dark-thick'
                    });
                }
                me.obj.find('.popup_content').find('iframe,object,embed').css({
                        'width': me.contentWidth()+'px',
                        'height': me.contentHeight()+'px',
                        'margin-left': '0px',
                        'margin-top': '0px'
                    });
                break;

            default:
                me.buildContent(config.type, 
                                config.leftContent, 
                                me.obj.find('.popup_content'), 
                                me.contentWidth(),
                                me.contentHeight(),
                                false);
                me.autoFit();
                break;
        }
        // If there is a Twitter link
        if(window.twttr && twttr && twttr.widgets) {
            twttr.widgets.load(me.obj.find('.popup_content').get(0));
        }
    }
    
    this.buildContent = function(type, content, container, maxWidth, maxHeight, mixed) {
        switch(type) {
            case 'video':
                var size = me.videoSize(maxWidth, maxHeight);
                container.html(content);
                container.find('iframe,object,embed').css({
                        'width': size.width+'px',
                        'height': size.height+'px',
                        'margin-left': (mixed ? '0px' : size.marginLeft+'px'),
                        'margin-top': (mixed ? '0px' : size.marginTop+'px')
                    })
                    .attr('id', config.name+'_video')
                    .focus();
                break;

            case 'htmlVideo':
                container.html(content);
                container.find('video').attr('id', config.name+'_video');
                me.runVideo(maxWidth, maxHeight, mixed);
                break;

            case 'slideshow':
                var images = content.split("\n");
                if(images[images.length - 1] == '')
                    images.pop();

                container.html('<img id="loadingImage" style="visibility: hidden;" src="'+images[0]+'" />');
                // Get images width/height
                $('#loadingImage').one('load', function() {
                    var img = $(this);
                    setTimeout(function(){
                        config['videoWidth'] = img.width();
                        config['videoHeight'] = img.height();
                        
                        var size = me.videoSize(maxWidth, maxHeight);
                        
                        container.html('<div id="banner-slide"><ul class="bjqs"></ul></div><div class="clear"></div>');
                        for(var i = 0; i < images.length; i++) {
                            $('#banner-slide ul').append('<li><img width="'+size.width+'" height="'+size.height+'" src="'+images[i]+'" /></li>');
                        }

                        $('#banner-slide').bjqs({
                            'automatic': false,
                            'animtype': 'slide',
                            'width': size.width,
                            'height': size.height,
                            'responsive': false,
                            'randomstart': false,
                            'showcontrols': false,
                            'nexttext': 'Suiv.',
                            'prevtext': 'Préc.'
                        });

                        if(!mixed) {
                            $('#banner-slide').css({
                                'margin-left': size.marginLeft+'px',
                                'margin-top': size.marginTop+'px'
                            });
                        }

                    }, 0);
                });                
                break;

            case 'picture':
                var image = content.split("\n");
                if(image[image.length - 1] == '')
                    image.pop();
                image = image[0];

                container.html('<img id="loadingImage" src="'+image+'" />');
                // Get images width/height
                $('#loadingImage').one('load', function() {
                    var img = $(this);
                    setTimeout(function(){
                        config['videoWidth'] = img.width();
                        config['videoHeight'] = img.height();

                        var size = me.videoSize(maxWidth, maxHeight);
                        img.css({
                            'width': size.width+'px',
                            'height': size.height+'px',
                            'margin-left': (mixed ? '0px' : size.marginLeft+'px'),
                            'margin-top': (mixed ? '0px' : size.marginTop+'px')
                        });

                    }, 0);
                });                
                break;
        }
    }
                      
    this.videoSize = function(maxWidth, maxHeight) {
        var width = maxWidth;
        var height = parseInt((config.videoHeight / config.videoWidth) * maxWidth);
        var marginTop = 0;
        var marginLeft = 0;

        if(height > maxHeight) {
            height = maxHeight;
            width =  parseInt((config.videoWidth / config.videoHeight) * height);
            marginLeft = parseInt((maxWidth - width) / 2);
        }
        else {
            marginTop = parseInt((maxHeight - height) / 2);
        }
        marginTop = 0;
        marginLeft = 0;
        return {'width': width, 'height': height, 'marginTop': marginTop, 'marginLeft': marginLeft};
    }
    
    this.buildMixed = function() {
        me.obj.find('.popup_content').append('<div class="leftContainer"></div>'+config.rightContent+'<div class="clear"></div>');
        me.buildContent(config.leftType, 
                        config.leftContent, 
                        me.obj.find('.leftContainer'), 
                        player.width < 1024 ? me.contentWidth() : parseInt(me.contentWidth()*0.6),
                        me.contentHeight(),
                        true);
    }
    
    
    this.runVideo = function(maxWidth, maxHeight, mixed) {

        videojs(config.name+'_video', {}, function() {
            me.htmlVideo = this;

            this.on('firstplay', function() {
                if(_gaq) {
                    _gaq.push(
                        ['_trackEvent', options['general'].name, 'Popup-VideoRun', config.name]
                    );
                }
            });
            
            this.on('ended', function() {
                if(_gaq) {
                    _gaq.push(
                        ['_trackEvent', options['general'].name, 'Popup-VideoFinished', config.name]
                    );
                }
                if(config.autoClose) {
                    me.on_close();
                }
            });

            if(!player.isFullScreenEnabled) {
                $('#'+config.name+'_video .vjs-fullscreen-control').click(function() {
                    me.htmlVideo.pause();
                    
                    var uri = setQueryVariables(document.location, 'hotspot', hotspot.name());
                    setQueryVariables(uri, 'start', '');
                    uri = setQueryVariables(uri, 'autoplay', 1);

                    var height = screen.height - 150;
                    var width = parseInt(height * (player.originalWidth / player.originalHeight));
                    
                    if(width > screen.width) {
                        width = screen.width;
                        height = width * (player.originalHeight / player.originalWidth);
                    }

                    window.open(uri, 'player', 'titlebar=0,scrollbars=0,menubar=0,toolbar=0,status=0,channelmode=1,fullscreen=1,width='+width+',height='+height);
                    return false;
                });
            }
            
            var size = me.videoSize(maxWidth, maxHeight);
            me.htmlVideo.dimensions(size.width, size.height);

            $('#'+config.name+'_video').css({
                'width': size.width+'px', 
                'height': size.height+'px',
                'margin-left': (mixed ? '0px' : size.marginLeft+'px'),
                'margin-right': (mixed ? '0px' : size.marginLeft+'px'),
                'margin-top': (mixed ? '0px' : size.marginTop+'px')
            });
            $('#'+config.name+'_video > video').focus();
            
            setTimeout(function() {
                me.htmlVideo.play();
            }, 100);
        });
    }
    
    this.on_close = function() {
        if(me.htmlVideo) me.htmlVideo.dispose();
        me.obj.remove();
        hotspot.on_popupClosed();
    }
    
    this.build();
}

Popup.border = 50;
;
/*
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
*/

function Navigation(player, options) {
    var me = this;

    this.obj = null;
    this._height = 0;
    
    this._exportPopup = null;
    
    
    this.on_resize = function(width, height) {        
    }
    
    this.height = function() {
        return me.obj.outerHeight(true);
    }
    
    this.addControl = function(control) {
        me.obj.find('.controls').append(control);
    }
    
    this.build = function() {
        player.obj.prepend('<div id="header"><div class="controls"></div></div>');
        me.obj = $('#header');
        
        if(options['general']['logo'] && options['general']['logoLink']) {
            var logoUrl = parseUri(options['general']['logoLink']);
            logoUrl = getQueryVariables(logoUrl);
            var url = options['general']['logoLink'];
            
            if(!logoUrl['utm_source']) {
                url = setQueryVariables(url, 'utm_source', options['general'].name);
            }

            if(!logoUrl['utm_campaign']) {
                url = setQueryVariables(url, 'utm_campaign', 'navigation');
            }

            if(!logoUrl['utm_medium']) {
                url = setQueryVariables(url, 'utm_medium', 'iplayer');
            }

            me.obj.append('<a class="logo" href="'+url+'" target="_blank"><img src="'+options['general']['logo']+'" alt=""/></a>');
        }
        else if(options['general']['logo']) {
            me.obj.append('<img class="logo" src="'+options['general']['logo']+'" alt=""/>');
        }
        
        if(options['general']['shareLink'] && options['general']['shareText']) {
            me.obj.append('<div class="shares"></div>');

            var shareUrl = parseUri(options['general']['shareLink']);
            shareUrl = getQueryVariables(shareUrl);
            var twitter = options['general']['shareLink'];
            var facebook = options['general']['shareLink'];
            
            if(!shareUrl['utm_source']) {
                facebook = setQueryVariables(facebook, 'utm_source', options['general'].name);
                twitter = setQueryVariables(twitter, 'utm_source', options['general'].name);
            }

            if(!shareUrl['utm_campaign']) {
                facebook = setQueryVariables(facebook, 'utm_campaign', 'navigation');
                twitter = setQueryVariables(twitter, 'utm_campaign', 'navigation');
            }

            if(!shareUrl['utm_medium']) {
                facebook = setQueryVariables(facebook, 'utm_medium', 'facebook');
                twitter = setQueryVariables(twitter, 'utm_medium', 'twitter');
            }
            
            var facebookLink = 'https://www.facebook.com/sharer.php?t='+encodeURIComponent(options['general']['shareText'])+'&u='+encodeURIComponent(facebook);
            var twitterLink = 'https://twitter.com/share?url='+encodeURIComponent(twitter)+'&text='+encodeURIComponent(options['general']['shareText']);
            if(options['general']['twitterVia'])
                twitterLink += '&via='+encodeURIComponent(options['general']['twitterVia'])+'&related='+encodeURIComponent(options['general']['twitterVia']);
            if(options['general']['twitterHashtag'])
                twitterLink += '&hashtags='+encodeURIComponent(options['general']['twitterHashtag']);

            me.obj.find('.shares').append('<a target="_blank" title="'+_t('EXPORT_VIDEO')+'" href="#" class="share export"><img src="/iplayer/images/export.png" alt="'+_t('EXPORT_VIDEO')+'" /></a>');
            me.obj.find('.shares').append('<a target="_blank" title="'+_t('SHARE_TW')+'" href="'+twitterLink+'" class="share twitter"><img src="/iplayer/images/twitter.png" alt="'+_t('SHARE_TW')+'" /></a>');
            me.obj.find('.shares').append('<a target="_blank" title="'+_t('SHARE_FB')+'" href="'+facebookLink+'" class="share facebook"><img src="/iplayer/images/facebook.png" alt="'+_t('SHARE_FB')+'" /></a>');
        }
        me.obj.append('<div class="clear"></div>');
        
        me._height = me.obj.outerHeight(true);
        
        me.obj.find('a').click(function() {
            player.pause();
        });
        
        me.obj.find('a.logo').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Navigation-ClickLogo']
                );
            }
        });
        
        me.obj.find('a.twitter').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Navigation-ClickTwitter']
                );
            }
        });
        
        me.obj.find('a.facebook').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Navigation-ClickFacebook']
                );
            }
        });
        
        me.obj.find('a.export').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Navigation-ClickExport']
                );
            }

            player.pause();            
            me._exportPopup = new Popup(
                {
                    'name': 'exportPopup',
                    'title': _t('EXPORT_VIDEO'),
                    'type':'html',
                    'hideBottom': true,
                    'noScroll': true,
                    'leftContent': '<form><div id="exportField"><label for="exportWidth">'+_t('EXPORT_WIDTH')+' (px): </label><input type="text" value="'+options['general']['width']+'" id="exportWidth" /><br /><br /><input type="checkbox" id="exportAutoplay"><label for="exportAutoplay">'+_t('EXPORT_AUTOPLAY')+'</label></div><textarea id="exportCode"></textarea></form>'
                }, 
                {
                    'name': function() { return 'exportPopup'; },
                    'on_popupClosed': function() {
                        me._exportPopup = null;
                    }
                },
                player,
                options);
            
            $('#exportCode').height(
                $('#exportPopup .popup_content').height() - $('#exportField').outerHeight(true) - 20
            );
            

            var url = parseUri(document.location);
            var link = '//'+url.domain+url.path;
            
            $('#exportWidth')
                .keyup(function() {
                    var val = parseInt($(this).val());
                    $(this).val(val);
                    
                    var link2 = link;
                    if($('#exportAutoplay').is(':checked'))
                        link2 += '?autoplay=1';
                    $('#exportCode').val('<iframe frameborder="0" width="'+val+'" height="'+parseInt((options['general']['height'] / options['general']['width']) * val)+'" src="'+link2+'" allowfullscreen="true"></iframe>');
                 })
                 .keyup();

            $('#exportAutoplay').change(function() {
                $('#exportWidth').keyup();
            });
            
            return false;
        });        
    }    

    this.build();
};
/*
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
*/

function Map(config, player, options) {
    var me = this;
    
    this.obj = null;
    
    this.visible = false;
    this.wasPaused = false;

    this.activeFrame = -1;
    this.frameToLoad = -1;
    this.activeGroup = '';

    this.x = 0;
    this.y = 0;
    
    this.width = 0;
    this.height = 0;
    
    
    this.zoneWidth = 0;
    this.zoneHeight = 0;
    this.mapWidth = 0;
    this.mapHeight = 0;

    this.imageWidth = 0;
    this.imageHeight = 0;
    this.zoom = 1;
    
    this.pulsars = [];

    this.destroy = function() {
        me.destroyHotspots();
        me.obj.stop(false, true);
        me.obj.remove();
    }
    
    this.destroyHotspots = function() {
        if(me.pulsars) {
            for(var i = 0; i < me.pulsars.length; i++) {
                if(me.pulsars[i])
                    me.pulsars[i].destroy();
            }
            me.pulsars = [];
        }
        me.obj.find('.hotspot').remove();
    }
    
    this.loadFrame = function(index) {
        if(config.frames[index]['title']) {
            me.obj.find('.maptitle .title')
                .html(config.frames[index]['title'])
                .quickfit({
                    'max': 22
                });
        }
        
        
        if(config.frames[index].group != me.activeGroup) {
            me.loadHotspots(config.frames[index].group);
        }
        else if(me.activeFrame != -1 && me.activeFrame != index) {
            me.pulsars[me.activeFrame].setConfig({
                                          'image': config.frames[index].hotspot['image1'],
                                          'borderSize': config.frames[index].hotspot['borderSize'],
                                          'borderColor': config.frames[index].hotspot['borderColor1'],
                                          'fillColor': config.frames[index].hotspot['fillColor1']
                                       });
        }

        me.activeFrame = index;
        
        if(me.obj.find('.mapfullimage').attr('src') != config.frames[index].image) {
            me.obj.find('.mapfullimage').attr('src', config.frames[index].image);
            me.width = config.frames[index].width;
            me.height = config.frames[index].height;
        }

        me.zoomTo(config.frames[index].hotspot.x, config.frames[index].hotspot.y, config.frames[index].zoom, true);
        
        me.pulsars[index].setConfig({
                                      'image': config.frames[index].hotspot['image2'],
                                      'borderSize': config.frames[index].hotspot['borderSize'],
                                      'borderColor': config.frames[index].hotspot['borderColor2'],
                                      'fillColor': config.frames[index].hotspot['fillColor2']
                                   });
    }

    this.mapSize = function() {
        var pwidth = player.width;
        var pheight = player.height;

        me.mapWidth = pwidth - Popup.border;
        me.mapHeight = pheight - Popup.border;
    
        me.obj.css({
            'width': pwidth+'px',
            'height': pheight+'px'
        });
        me.obj.find('.map').css({
            'width': me.mapWidth+'px',
            'height': me.mapHeight+'px',
            'margin': parseInt(Popup.border/2)+'px',
        });
        

        var titleHeight = me.obj.find('.maptitle div').outerHeight(true);
        me.zoneHeight = me.mapHeight - titleHeight;
        me.zoneWidth = me.mapWidth;
        
        me.obj.find('.mapimage').css({
            'width': me.zoneWidth+'px',
            'height': me.zoneHeight+'px'
        });
        
        me.imageHeight = me.zoneHeight * me.zoom;
        me.imageWidth = parseInt((me.width / me.height) * me.imageHeight);
    }
    
    this.fixHotspots = function() {
        for(var i = 0; i < me.pulsars.length; i++) {
            if(me.pulsars[i])
                $('#__internal_map_hs'+i).css(me._getPosition(config.frames[i].hotspot.x, config.frames[i].hotspot.y));
        }
    }
    
    this.loadHotspots = function(group) {
        var i;
        me.activeGroup = group;
        
        me.destroyHotspots();
                
        for(i = 0; i < config.frames.length; i++) {
            // We need to maintain indexes to be the same as in config.frames
            if(config.frames[i]['group'] != group) {
                me.pulsars.push(null);
                continue;
            }
            
            me.obj.find('.mapcontainer').append('<a id="__internal_map_hs'+i+'" href="#" data-name="'+config.frames[i]['title']+'" data-target="'+config.frames[i]['hotspot'].target+'" data-link="'+config.frames[i]['hotspot'].link+'" class="hotspot overlay_content group_'+config.frames[i]['group']+'"><span class="hotspot_container"></span><span class="tooltip">'+config.frames[i]['title']+'</span></a>');
            
            // Handle the hotspot type
            switch(config.frames[i]['hotspot'].target) {
                case '_blank':
                case '_top':
                    $('#__internal_map_hs'+i).attr({
                        'href': config.frames[i]['hotspot'].link,
                        'target': config.frames[i]['hotspot'].target
                    });
                    break;
            }
            
            me.pulsars.push(new Pulsar(
                                  {
                                      'image': config.frames[i]['hotspot']['image1'],
                                      'borderSize': config.frames[i]['hotspot']['borderSize'],
                                      'borderColor': config.frames[i]['hotspot']['borderColor1'],
                                      'fillColor': config.frames[i]['hotspot']['fillColor1']
                                  },
                                  {'obj': me.obj.find('#__internal_map_hs'+i)}, 
                                  player
                           ));

        }

        // Handle the clicks
        me.obj.find('.hotspot').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'Map-Click', $(this).data('name')]
                );
            }
            switch($(this).data('target')) {
                case 'video':
                    player.loadVideo($(this).data('link'));
                    setTimeout(function() {
                        me.hide();
                    }, 500);
                    return false;

                case 'timecode':
                    player.currentTime($(this).data('link'));
                    setTimeout(function() {
                        me.hide();
                    }, 500);
                    return false;
            }
        });
    }
    
    this.hideHotspots = function() {
        me.obj.find('.hotspot').hide();
    }
    
    this.showHotspots = function() {
        if(me.activeFrame == -1)
            return;
        me.obj.find('.group_'+config.frames[me.activeFrame]['group']).show();
    }
    
    this.show = function() {
        if(me.visible)
            return;

        if(_gaq) {
            _gaq.push(
                ['_trackEvent', options['general'].name, 'Map-Show']
            );
        }

        me.wasPaused = player.is_paused();
        player.pause();

        me.obj.show();
        if(me.frameToLoad != -1)
            me.loadFrame(me.frameToLoad);

        me.visible = true;
    }
    
    this.hide = function() {
        if(!me.visible)
            return;

        me.activeFrame = -1;
        me.activeGroup = '';
        me.destroyHotspots();
        me.obj.hide();
        
        if(!me.wasPaused)
            player.play();

        me.visible = false;
    }
    
    this.on_resize = function(width, height) {
        if(me.activeFrame != -1) {
            me.zoomTo(config.frames[me.activeFrame].hotspot.x, config.frames[me.activeFrame].hotspot.y, config.frames[me.activeFrame].zoom, false);
        }
    }
    
    this._getPosition = function(x, y) {
        return {
            'left': parseInt(x * (me.imageWidth / me.width) - parseInt((me.pulsars[me.activeFrame].width() / 2)))+'px',
            'top': parseInt(y * (me.imageHeight / me.height) - parseInt((me.pulsars[me.activeFrame].height() / 2)))+'px'
        };
    }
    
    this.zoomTo = function(x, y, zoom, animate) {
        $('#__internal_map_zoom').slider('option', 'value', zoom);

        me.hideHotspots();
        me.zoom = zoom;
        me.mapSize();
        
        if(me.zoom == 1)
            me.obj.find('.mapcontainer').removeClass('movable');
        else
            me.obj.find('.mapcontainer').addClass('movable');
        
        var css = {
            'left': '0px',
            'top': '0px'
        };        
        var css2 = {
            'width': me.imageWidth+'px',
            'height': me.imageHeight+'px'
        };
        
        if(me.zoom != 1) {
            var position = me._getPosition(x, y);
            
            css['left'] = -(parseInt(position.left) - parseInt(me.zoneWidth / 2))+'px';
            css['top'] = -(parseInt(position.top) - parseInt(me.zoneHeight / 2))+'px';
        };

        me.obj.find('.mapcontainer,.mapfullimage').stop(true, false);
        if(animate) {
            me.obj.find('.mapcontainer').animate(css, 500, 'swing');
            me.obj.find('.mapfullimage').animate(css2, 500, 'swing', function() {
                me.fixHotspots();
                me.showHotspots();
            });
        }
        else {
            me.obj.find('.mapcontainer').css(css);
            me.obj.find('.mapfullimage').css(css2);
            me.fixHotspots();
            me.showHotspots();
        }
    }
    
    this.currentTime = function(currentTime) {
        for(var i = config.frames.length - 1; i >= 0; i--) {
            if(currentTime < config.frames[i].startsAt)
                continue;
            
            me.frameToLoad = i;
            if(me.visible) {
                if(me.activeFrame != i) {
                    me.loadFrame(i);
                }
            }
            break;
        }
    }
    
    this.fixFrame = function(index) {
        var i;
        var tofix = [ 'image', 'width', 'height', 'group' ];
        var tofixhs = [ 'borderSize', 'borderColor1', 'borderColor2', 
                        'fillColor1', 'fillColor2', 'image1', 'image2' ];

        for(i = 0; i < tofix.length; i++) {
            if(!config.frames[index][ tofix[i] ])
                config.frames[index][ tofix[i] ] = config.frames[index - 1][ tofix[i] ];
        }
        for(i = 0; i < tofixhs.length; i++) {
            if(!config.frames[index].hotspot[ tofixhs[i] ])
                config.frames[index].hotspot[ tofixhs[i] ] = config.frames[index - 1].hotspot[ tofixhs[i] ];
        }
    }
    
    this.build = function() {
        player.obj.append('<div id="__internal_map" class="map_overlay" style="display: none;"><div class="map"><div class="maptitle"><div title="Fermer" class="close">X</div><div class="title"></div><div class="clear"></div></div></div></div>');
        me.obj = $('#__internal_map');

        // Prevent any click to trigger on popup_overlay close event
        me.obj.find('.map').click(function(e) {
            e.stopPropagation();
        });
        
        var i;
        // Fix frames content
        for(i = 1; i < config.frames.length; i++) {
            me.fixFrame(i);
        }
        
        // Add zoom control
        me.obj.find('.map').append('<div class="mapimage"><div id="__internal_map_zoom" class="mapzoom"></div><div class="mapcontainer"><img class="mapfullimage" src="/iplayer/images/transparent.png" /></div></div>');
         $('#__internal_map_zoom').slider({
             orientation: "vertical",
             range: "min",
             min: 1,
             step: 1,
             max: 5,
             value: 1,
             slide: function( event, ui ) {
                 if(me.activeFrame != -1)
                     me.zoomTo(config.frames[me.activeFrame].hotspot.x, config.frames[me.activeFrame].hotspot.y, ui.value, false);
             }
        });
        
        
        me.obj.find('.mapcontainer').draggable({
            'start': function( event, ui ) {
                if(me.zoom == 1) {
                    return false;
                }
            }
        });


        
        // Add button to navigation
        player.navigation.addControl('<button id="toggleMap"><span>'+config.title+'</span></button>');
        $('#toggleMap').click(function() {
            me.show();
            return false;
        });
        
        me.obj.click(function() {
            me.hide();
        });

        me.obj.find('.close').click(function() {
            me.hide();
            return false;
        });
    }
    
    this.build();
}
;
/*
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
*/

function FinalPopup(options, player) {
    var me = this;

    this.obj = null;
    
    
    this.handlSize = function(width, height) {
        me.obj.find('.popup').width(width);
        me.obj.find('.popup').height(height);
        me.obj.find('.popup').css({
            'margin-left': parseInt((player.width - width) / 2)+'px',
            'margin-top': parseInt((player.height - height) / 2)+'px'
        });
        me.obj.width(player.width);
        me.obj.height(player.height);

        var contentMargin = me.obj.find('.popup_content').outerHeight(true) - me.obj.find('.popup_content').height();
        me.obj.find('.popup_content').height(me.obj.find('.popup').height() - contentMargin);
    }
    
    this.contentWidth = function() {
        return me.obj.find('.popup_content').width();
    }

    this.contentHeight = function() {
        return me.obj.find('.popup_content').height();
    }

    this.on_resize = function(width, height) {
        me.handlSize(width - Popup.border, height - Popup.border);
    }
    
    this.destroy = function() {
        me.obj.stop(false, true);
        me.obj.remove();
    }
    
    this.buildContent = function() {
        if(!options['general']['shareLink'] || !options['general']['shareText']) {
            return;
        }
        
        $('#finalShares').append('<span><strong>'+_t('SHARE_VIDEO')+' : </strong></span>');
    
        var text = options['general']['shareText'];
        
        var shareUrl = parseUri(options['general']['shareLink']);
        shareUrl = getQueryVariables(shareUrl);

        var twitter = options['general']['shareLink'];
        var facebook = options['general']['shareLink'];
        
        if(!shareUrl['utm_source']) {
            facebook = setQueryVariables(facebook, 'utm_source', options['general'].name);
            twitter = setQueryVariables(twitter, 'utm_source', options['general'].name);
        }

        if(!shareUrl['utm_campaign']) {
            facebook = setQueryVariables(facebook, 'utm_campaign', 'finalPopup');
            twitter = setQueryVariables(twitter, 'utm_campaign', 'finalPopup');
        }

        if(!shareUrl['utm_medium']) {
            facebook = setQueryVariables(facebook, 'utm_medium', 'facebook');
            twitter = setQueryVariables(twitter, 'utm_medium', 'twitter');
        }
        
        var facebookLink = 'https://www.facebook.com/sharer.php?t='+encodeURIComponent(text)+'&u='+encodeURIComponent(facebook);
        var twitterLink = 'https://twitter.com/share?url='+encodeURIComponent(twitter)+'&text='+encodeURIComponent(text);
        if(options['general']['twitterVia'])
            twitterLink += '&via='+encodeURIComponent(options['general']['twitterVia'])+'&related='+encodeURIComponent(options['general']['twitterVia']);
        if(options['general']['twitterHashtag'])
            twitterLink += '&hashtags='+encodeURIComponent(options['general']['twitterHashtag']);
            
        $('#finalShares').append('<a target="_blank" href="'+facebookLink+'" class="share facebook"><img src="/iplayer/images/facebook-big.png" alt="'+_t('SHARE_FB')+'" /></a>');
        $('#finalShares').append('<a target="_blank" href="'+twitterLink+'" class="share twitter"><img src="/iplayer/images/twitter-big.png" alt="'+_t('SHARE_TW')+'" /></a>');

        me.obj.find('.popup_bottom a.twitter').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'FinalPopup-ClickTwitter']
                );
            }
        });
        
        me.obj.find('.popup_bottom a.facebook').click(function() {
            if(_gaq) {
                _gaq.push(
                    ['_trackEvent', options['general'].name, 'FinalPopup-ClickFacebook']
                );
            }
        });
    }

    this.build = function() {
        player.obj.append('<div id="finalPopup" class="popup_overlay"><div class="popup"><div class="popup_content"><div id="finalShares"></div><div id="replayVideo"><button>'+_t('REPLAY')+'</button></div></div></div></div>');
        me.obj = $('#finalPopup');
        
        me.buildContent();

        me.handlSize(player.width - Popup.border, player.height - Popup.border);
        
        // Prevent any click to trigger on popup_overlay close event
        me.obj.find('.popup').click(function(e) {
            e.stopPropagation();
        });
        
        me.obj.click(function() {
            me.on_close();
            return false;
        });
        
        $('#replayVideo button').click(function() {
            me.on_close();
            return false;
        });
    }
        
    this.on_close = function() {
        player.currentTime(0);
        player.play();
        me.obj.remove();
    }
    
    this.build();
}
;
(function ($) {
  var Quickfit, QuickfitHelper, defaults, pluginName;

  pluginName = 'quickfit';

  defaults = {
    min: 8,
    max: 12,
    tolerance: 0.02,
    truncate: false,
    width: null,
    sampleNumberOfLetters: 10,
    sampleFontSize: 12
  };
  QuickfitHelper = (function () {

    var sharedInstance = null;

    QuickfitHelper.instance = function (options) {
      if (!sharedInstance) {
        sharedInstance = new QuickfitHelper(options);
      }
      return sharedInstance;
    };

    function QuickfitHelper(options) {
      this.options = options;

      this.item = $('<span id="meassure"></span>');
      this.item.css({
        position: 'absolute',
        left: '-1000px',
        top: '-1000px',
        'font-size': "" + this.options.sampleFontSize + "px"
      });
      $('body').append(this.item);

      this.meassures = {};
    }

    QuickfitHelper.prototype.getMeassure = function (letter) {
      var currentMeassure;
      currentMeassure = this.meassures[letter];
      if (!currentMeassure) {
        currentMeassure = this.setMeassure(letter);
      }
      return currentMeassure;
    };

    QuickfitHelper.prototype.setMeassure = function (letter) {
      var currentMeassure, index, sampleLetter, text, _ref;

      text = '';
      sampleLetter = letter === ' ' ? '&nbsp;' : letter;

      for (index = 0, _ref = this.options.sampleNumberOfLetters - 1; 0 <= _ref ? index <= _ref : index >= _ref; 0 <= _ref ? index++ : index--) {
        text += sampleLetter;
      }

      this.item.html(text);
      currentMeassure = this.item.width() / this.options.sampleNumberOfLetters / this.options.sampleFontSize;
      this.meassures[letter] = currentMeassure;

      return currentMeassure;
    };

    return QuickfitHelper;

  })();

  Quickfit = (function () {

    function Quickfit(element, options) {
      this.$element = element;
      this.options = $.extend({}, defaults, options);
      this.$element = $(this.$element);
      this._defaults = defaults;
      this._name = pluginName;
      this.quickfitHelper = QuickfitHelper.instance(this.options);
    }

    Quickfit.prototype.fit = function () {
      var elementWidth;
      if (!this.options.width) {
        elementWidth = this.$element.width();
        this.options.width = elementWidth - this.options.tolerance * elementWidth;
      }
      if (this.text = this.$element.attr('data-quickfit')) {
        this.previouslyTruncated = true;
      } else {
        this.text = this.$element.text();
      }
      this.calculateFontSize();

      if (this.options.truncate) this.truncate();

      return {
        $element: this.$element,
        size: this.fontSize
      };
    };

    Quickfit.prototype.calculateFontSize = function () {
      var letter, textWidth, i;

      textWidth = 0;
      for (i = 0; i < this.text.length; ++i) {
        letter = this.text.charAt(i);
        textWidth += this.quickfitHelper.getMeassure(letter);
      }

      this.targetFontSize = parseInt(this.options.width / textWidth);
      return this.fontSize = Math.max(this.options.min, Math.min(this.options.max, this.targetFontSize));
    };

    Quickfit.prototype.truncate = function () {
      var index, lastLetter, letter, textToAdd, textWidth;

      if (this.fontSize > this.targetFontSize) {
        textToAdd = '';
        textWidth = 3 * this.quickfitHelper.getMeassure('.') * this.fontSize;

        index = 0;
        while (textWidth < this.options.width && index < this.text.length) {
          letter = this.text[index++];
          if (lastLetter) textToAdd += lastLetter;
          textWidth += this.fontSize * this.quickfitHelper.getMeassure(letter);
          lastLetter = letter;
        }

        if (textToAdd.length + 1 === this.text.length) {
          textToAdd = this.text;
        } else {
          textToAdd += '...';
        }
        this.textWasTruncated = true;

        return this.$element.attr('data-quickfit', this.text).html(textToAdd);

      } else {
        if (this.previouslyTruncated) {
          return this.$element.html(this.text);
        }
      }
    };

    return Quickfit;

  })();

  return $.fn.quickfit = function (options) {
    var measurements = [];

    // Separate measurements from repaints
    // First calculate all measurements...
    var $elements = this.each(function () {
      var measurement = new Quickfit(this, options).fit();
      measurements.push(measurement);
      return measurement.$element;
    });

    // ... then apply the measurements.
    for (var i = 0; i < measurements.length; i++) {
      var measurement = measurements[i];

      measurement.$element.css({ fontSize: measurement.size + 'px' });
    }

    return $elements;
  };

})(jQuery, window);
;
/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function ($) {

  // Detect touch support
  $.support.touch = 'ontouchend' in document;

  // Ignore browsers without touch support
  if (!$.support.touch) {
    return;
  }

  var mouseProto = $.ui.mouse.prototype,
      _mouseInit = mouseProto._mouseInit,
      _mouseDestroy = mouseProto._mouseDestroy,
      touchHandled;

  /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
  function simulateMouseEvent (event, simulatedType) {

    // Ignore multi-touch events
    if (event.originalEvent.touches.length > 1) {
      return;
    }

    event.preventDefault();

    var touch = event.originalEvent.changedTouches[0],
        simulatedEvent = document.createEvent('MouseEvents');
    
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType,    // type
      true,             // bubbles                    
      true,             // cancelable                 
      window,           // view                       
      1,                // detail                     
      touch.screenX,    // screenX                    
      touch.screenY,    // screenY                    
      touch.clientX,    // clientX                    
      touch.clientY,    // clientY                    
      false,            // ctrlKey                    
      false,            // altKey                     
      false,            // shiftKey                   
      false,            // metaKey                    
      0,                // button                     
      null              // relatedTarget              
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }

  /**
   * Handle the jQuery UI widget's touchstart events
   * @param {Object} event The widget element's touchstart event
   */
  mouseProto._touchStart = function (event) {

    var self = this;

    // Ignore the event if another widget is already being handled
    if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
      return;
    }

    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;

    // Track movement to determine if interaction was a click
    self._touchMoved = false;

    // Simulate the mouseover event
    simulateMouseEvent(event, 'mouseover');

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');

    // Simulate the mousedown event
    simulateMouseEvent(event, 'mousedown');
  };

  /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
  mouseProto._touchMove = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Interaction was not a click
    this._touchMoved = true;

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');
  };

  /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
  mouseProto._touchEnd = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Simulate the mouseup event
    simulateMouseEvent(event, 'mouseup');

    // Simulate the mouseout event
    simulateMouseEvent(event, 'mouseout');

    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {

      // Simulate the click event
      simulateMouseEvent(event, 'click');
    }

    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
  };

  /**
   * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
   * This method extends the widget with bound touch event handlers that
   * translate touch events to mouse events and pass them to the widget's
   * original mouse event handling methods.
   */
  mouseProto._mouseInit = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element.bind({
      touchstart: $.proxy(self, '_touchStart'),
      touchmove: $.proxy(self, '_touchMove'),
      touchend: $.proxy(self, '_touchEnd')
    });

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
  };

  /**
   * Remove the touch event handlers
   */
  mouseProto._mouseDestroy = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element.unbind({
      touchstart: $.proxy(self, '_touchStart'),
      touchmove: $.proxy(self, '_touchMove'),
      touchend: $.proxy(self, '_touchEnd')
    });

    // Call the original $.ui.mouse destroy method
    _mouseDestroy.call(self);
  };

})(jQuery);;
/*! A fix for the iOS orientationchange zoom bug.
 Script by @scottjehl, rebound by @wilto.
 MIT / GPLv2 License.
*/
(function(w){
	
	// This fix addresses an iOS bug, so return early if the UA claims it's something else.
	var ua = navigator.userAgent;
	if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(ua) && ua.indexOf( "AppleWebKit" ) > -1 ) ){
		return;
	}

    var doc = w.document;

    if( !doc.querySelector ){ return; }

    var meta = doc.querySelector( "meta[name=viewport]" ),
        initialContent = meta && meta.getAttribute( "content" ),
        disabledZoom = initialContent + ",maximum-scale=1,minimum-scale=1,initial-scale=1,user-scalable=no",
        enabledZoom = initialContent + ",maximum-scale=5,minimum-scale=1,initial-scale=1,user-scalable=yes",
        enabled = true,
		x, y, z, aig;

    if( !meta ){ return; }

    function restoreZoom(){
        meta.setAttribute( "content", enabledZoom );
        enabled = true;
    }

    function disableZoom(){
        meta.setAttribute( "content", disabledZoom );
        enabled = false;
    }
	
    function checkTilt( e ){
		aig = e.accelerationIncludingGravity;
		x = Math.abs( aig.x );
		y = Math.abs( aig.y );
		z = Math.abs( aig.z );
				
		// If portrait orientation and in one of the danger zones
        if( (!w.orientation || w.orientation === 180) && ( x > 7 || ( ( z > 6 && y < 8 || z < 8 && y > 6 ) && x > 5 ) ) ){
			if( enabled ){
				disableZoom();
			}        	
        }
		else if( !enabled ){
			restoreZoom();
        }
    }
	
	w.addEventListener( "orientationchange", restoreZoom, false );
	w.addEventListener( "devicemotion", checkTilt, false );

})( this );;
