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

            me.obj.find('.shares').append('<a target="_blank" title="Export cette vidéo" href="#" class="share export"><img src="/iplayer/images/export.png" alt="Exporter cette vidéo" /></a>');
            me.obj.find('.shares').append('<a target="_blank" title="Partager cette vidéo sur Twitter" href="'+twitterLink+'" class="share twitter"><img src="/iplayer/images/twitter.png" alt="Partager sur Twitter" /></a>');
            me.obj.find('.shares').append('<a target="_blank" title="Partager cette vidéo sur Facebook" href="'+facebookLink+'" class="share facebook"><img src="/iplayer/images/facebook.png" alt="Partager sur Facebook" /></a>');
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
                    'title': 'Exporter la vidéo',
                    'type':'html',
                    'hideBottom': true,
                    'noScroll': true,
                    'leftContent': '<form><div id="exportField"><label for="exportWidth">Largeur (px): </label><input type="text" value="'+options['general']['width']+'" id="exportWidth" /><br /><br /><input type="checkbox" id="exportAutoplay"><label for="exportAutoplay">Démarrer automatiquement</label></div><textarea id="exportCode"></textarea></form>'
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
}