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
    
    this.options = $.extend(true, {}, options);
    
    this.player = null;
    
    this.width = options['general'].width;
    this.height = options['general'].height;
    this.originalWidth = options['general'].width;
    this.originalHeight = options['general'].height;
    this.sizeFactorWidth = 1;
    this.sizeFactorHeight = 1;
    
    this.hotspots = {};
    
    this.lastCurrentTime = 0;
    
    this.testing = false;

    this.VideoOffsets = {x: 0, y: 0};
    this.VideoSize = {width: options['general'].width, height: options['general'].width};

    this.obj = null;
    
    
    this.handleHotspots = function(currentTime, seek) {
        for(var i = 0; i < me.options['hotspots'].length; i++) {
            var hotspot = me.options['hotspots'][i];
            
            if(hotspot.visible) {
                if(currentTime < hotspot.startsAt) {
                    me.options['hotspots'][i].visible = false;
                    if(me.hotspots[hotspot.name]) {
                        me.hotspots[hotspot.name].destroy();
                        me.hotspots[hotspot.name] = null;
                    }
                }
                else if(currentTime >= hotspot.endsAt) {
                    me.options['hotspots'][i].visible = false;
                    if(me.hotspots[hotspot.name]) {
                        me.hotspots[hotspot.name].destroy();
                        me.hotspots[hotspot.name] = null;
                    }
                }
                else {
                    if(hotspot.tooltipTime &&
                       me.options['hotspots'][i].tooltipVisible &&
                       currentTime > (hotspot.tooltipTime + hotspot.startsAt)) {

                        me.options['hotspots'][i].tooltipVisible = false;
                        me.hotspots[hotspot.name].hideTooltip();
                    }
                    else if(hotspot.tooltipTime &&
                            !me.options['hotspots'][i].tooltipVisible &&
                            currentTime < (hotspot.tooltipTime + hotspot.startsAt)) {

                        me.options['hotspots'][i].tooltipVisible = true;
                        me.hotspots[hotspot.name].showTooltip();
                    }
                    
                    me.hotspots[hotspot.name].seek(currentTime);
                }
            }
            else if(!hotspot.visible &&
                    currentTime >= hotspot.startsAt &&
                    currentTime < hotspot.endsAt) {
                me.options['hotspots'][i].visible = true;
                me.hotspots[hotspot.name] = new Hotspot(hotspot, me, me.options);
                me.hotspots[hotspot.name].seek(currentTime);
            }
        }
    }
    
    this.on_seek = function(currentTime) {
        me.handleHotspots(currentTime);
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
    
    this.reset = function() {
        for(var name in me.hotspots) {
            if(!me.hotspots[name])
                continue;
            me.hotspots[name].destroy();
            me.hotspots[name] = null;
        }
        me.hotspots = {};
    }
    
    this.destroy = function() {
        me.reset();
        me.player.dispose();
    }
    
    this.loadHotspots = function() {
        var hotspot = {};
        update_hotspot(hotspot);
        me.options['hotspots'] = [ hotspot ];
        me.reset();
        me.on_seek(me.player.currentTime());
        
        $('.reddot').remove();
        if(hotspot.moves.length) {
            for(var i = 0; i < hotspot.moves.length; i++) {
                $('#video_grid').append('<div class="reddot"></div>');
                $('.reddot:eq('+i+')').css({
                    'left': hotspot.moves[i].x1,
                    'top': hotspot.moves[i].y1
                });
            }

            $('#video_grid').append('<div class="reddot"></div>');
            $('.reddot:eq('+hotspot.moves.length+')').css({
                'left': hotspot.moves[hotspot.moves.length - 1].x2,
                'top': hotspot.moves[hotspot.moves.length - 1].y2
            });
        }
        
    }
    
    this.test = function(tc) {
        me.testing = true;
        me.player.currentTime(tc);
        me.play();
    }
    
    this.stopTest = function(tc) {
        me.testing = false;
        me.pause();
        me.player.currentTime(tc);
    }
    
    this.build = function() {

        // Set pulsar default
        if(me.options['pulsar']) {
            if(me.options['pulsar']['duration'])
                Pulsar.duration = me.options['pulsar']['duration'];
            if(me.options['pulsar']['number'])
                Pulsar.numberCircles = me.options['pulsar']['number'];
            if(me.options['pulsar']['width'])
                Pulsar.width = me.options['pulsar']['width'];
            if(me.options['pulsar']['image'])
                Pulsar.image = me.options['pulsar']['image'];
        }
        
        videojs(id, {nativeControlsForTouch: false}, function() {
            me.player = this;

            me.obj = $('#'+id);
            
            me.player.usingNativeControls(false);
            
            me.player.on('timeupdate', function() {
                setTimeout(function() {
                    var currentTime = me.player.currentTime();
                    me.on_seek(currentTime);
                }, 1);
            });
            
            me.player.on('play', function() {
                /*
                if(!me.testing)
                    me.player.pause();
                */
            });

            me.player.on('firstplay', function() {
                me.loadHotspots();
            });

            $('#hotspot_moves').unbind('change').change(function() {
                me.loadHotspots();
            });

            me.player.on('resize', function() {
                Pulsar.on_resize(me);
            });

            $('#main_video').append('<div id="video_grid"></div>');
            $('#video_container').append('<div id="sliderGrid"></div>');
            $('#video_grid').css({
                'width': me.width,
                'height': me.height
            });
            
            $('#video_grid').click(function(e) {
                if(e.shiftKey) {
                    var x = Math.abs(parseInt($('#main_video').offset().left - e.clientX - $(window).scrollLeft()));
                    var y = Math.abs(parseInt($('#main_video').offset().top - e.clientY - $(window).scrollTop()));
                    $('#hotspot_moves').val($('#hotspot_moves').val()+(parseInt(me.player.currentTime()* 100) / 100)+','+x+','+y+"\n");
                    me.loadHotspots();
                }
            });
            
            $(window).unbind('keydown').keydown(function(e) {
                if(!e.shiftKey)
                    return;
                if(e.keyCode == 39) {
                    var currentTime = me.player.currentTime() + 0.04;
                    me.player.currentTime(currentTime);
                }
                else if(e.keyCode == 37) {
                    var currentTime = me.player.currentTime() - 0.04;
                    if(currentTime < 0) currentTime = 0;
                    me.player.currentTime(currentTime);
                }
            });
            
            $('#sliderGrid').slider({
                min: 10,
                max: 100,
                value: 40,
                slide: function( event, ui ) {
                    $('#video_grid').css({'background-size': ui.value+'px'});
                }
            });

        });
    }
    
    this.build();
}

