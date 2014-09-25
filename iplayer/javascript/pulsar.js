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

