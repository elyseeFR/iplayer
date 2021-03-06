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
