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
        player.player.currentTime(0);
        player.player.play();
        me.obj.remove();
    }
    
    this.build();
}
