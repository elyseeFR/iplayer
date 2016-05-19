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
            return player.currentTime(arguments[0]);
        else
            return player.currentTime();
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
