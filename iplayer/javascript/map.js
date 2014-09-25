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

        me.obj.find('.mapfullimage').attr('src', config.frames[index].image);
        me.width = config.frames[index].width;
        me.height = config.frames[index].height;

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
                    player.player.currentTime($(this).data('link'));
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
