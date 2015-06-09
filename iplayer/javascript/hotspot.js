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
        
        if(me.pulsar) {
            me.xOffset -= parseInt((me.pulsar.width() / 2));
            me.yOffset -= parseInt((me.pulsar.height() / 2));
        }
        else {
            me.xOffset -= parseInt((me.obj.find('img').width() / 2));
            me.yOffset -= parseInt((me.obj.find('img').height() / 2));
        }
    }

    this.on_resize = function(width, height) {

        if(me.popup) {
            me.popup.on_resize(width, height);
        }

        if(!me.pulsar) {
            me.obj.find('img').attr({
                'width': parseInt(config.image_w * player.sizeFactorWidth),
                'height': parseInt(config.image_h * player.sizeFactorHeight)
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
            var x = move.x1 + ((move.x2 - move.x1) / (move.endsAt - move.startsAt)) * (currentTime - move.startsAt);
            var y = move.y1 + ((move.y2 - move.y1) / (move.endsAt - move.startsAt)) * (currentTime - move.startsAt);
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
        
        if(config.image == 'pulsar') {
            me.pulsar = new Pulsar({}, me, player);
        }
        else {
            me.obj.find('.hotspot_container').append('<img src="'+config.image+'" width="'+(parseInt(config.image_w * player.sizeFactorWidth))+'" height="'+(parseInt(config.image_h * player.sizeFactorHeight))+'" alt="" />');
        }
        if(config.tooltip) {
            me.obj.append('<span class="tooltip">'+config.tooltip+'</span>');
        }

        me._computeOffsets(player.player.width(), player.player.height());

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
                    player.player.currentTime(config.link);
                    return false;
            }

        });
        
    }
    
    this.build();
}
