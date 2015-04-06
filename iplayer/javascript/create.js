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

var results_json = {
    'pulsar': {
        'number': 3,
        'duration': 3000,
        'width': 30,
        'image': 'images/circle-white.png'
    },
    'general': {},
    'hotspots' : [],
    'popups': [],
    'map': {}
};

var template = '';
var project = {};
var videoTag = '';

function updateTemplate(name, value) {
    if(name == '__CONFIG__') {
        project['__CONFIG__'] = results_json;

        $('#template').val(
            template.replace('__CONFIG__', $.toJSON(results_json))
        );
    }
    else {
        project[name] = value;
        project['__CONFIG__'] = results_json;

        template = template.replace(name, value);
        $('#template').val(
            template.replace('__CONFIG__', $.toJSON(results_json))
        );
    }
    $('#projectJSON').val($.toJSON(project));
}

function parse_moves() {
    var moves = [];
    var lst = $('#hotspot_moves').val().split("\n");
    if(lst[lst.length - 1] == "")
        lst.pop();
        
    if(lst.length == 1) {
        var vals = lst[0].split(',');        

        moves.push({
            'startsAt': parseFloat(vals[0]),
            'endsAt': parseFloat(vals[0]),
            'x1': parseInt(vals[1]),
            'y1': parseInt(vals[2]),
            'x2': parseInt(vals[1]),
            'y2': parseInt(vals[2]),
        });
    }
    else {
        for(var i = 0; i < lst.length - 1; i++) {
            var vals1 = lst[i].split(',');
            var vals2 = lst[i+1].split(',');
            
            moves.push({
                'startsAt': parseFloat(vals1[0]),
                'endsAt': parseFloat(vals2[0]),
                'x1': parseInt(vals1[1]),
                'y1': parseInt(vals1[2]),
                'x2': parseInt(vals2[1]),
                'y2': parseInt(vals2[2]),
            });
        }
    }
    return moves;
}

function update_hotspot(hotspot) {
    hotspot['moves'] = [];

    hotspot['name'] = $('#hotspot_name').val();
    hotspot['target'] = $('#hotspot_target').val();
    hotspot['link'] = $('#hotspot_link').val();
    hotspot['tooltip'] = $('#hotspot_tooltip').val();
    hotspot['tooltipTime'] = parseFloat($('#hotspot_tooltipTime').val());
    hotspot['startsAt'] = 0;
    hotspot['endsAt'] = 0
    hotspot['tooltipVisible'] = true;
    hotspot['image'] = 'pulsar';
    hotspot['visible'] = false;

    var moves = parse_moves();
    hotspot['moves'] = moves;
    hotspot['startsAt'] = moves[0].startsAt;
    hotspot['endsAt'] = moves[moves.length - 1].endsAt;
}

function get_form(id) {
    var fv = $(id).serializeArray();
    var values = {};
    for(var i = 0; i < fv.length; i++) {
        values[ fv[i].name ] = fv[i].value;
    }
    return values;
}

function load_form(id, values) {
    for(var name in values) {
        $(id).find('input[name="'+name+'"]').val(values[name]);
    }
}


function update_popup(popup) {
    popup['name'] = $('#popup_name').val();
    popup['title'] = $('#popup_title').val();
    popup['type'] = $('#popup_type').val();
    
    switch(popup['type']) {
        case 'mixed':
            popup['leftType'] = $('#popup_leftType').val();
            popup['leftContent'] = $('#popup_leftContent').val();
            popup['rightContent'] = $('#popup_rightContent').val();
            if(popup['leftType'] == 'video' || popup['leftType'] == 'htmlVideo') {
                popup['videoWidth'] = $('#popup_videoWidth').val();
                popup['videoHeight'] = $('#popup_videoHeight').val();
                popup['autoClose'] = $('#popup_autoClose').is(':checked');
            }
            break;
        default:
            if(popup['type'] == 'video' || popup['type'] == 'htmlVideo') {
                popup['videoWidth'] = $('#popup_videoWidth').val();
                popup['videoHeight'] = $('#popup_videoHeight').val();
                popup['autoClose'] = $('#popup_autoClose').is(':checked');
            }
            popup['leftType'] = '';
            popup['leftContent'] = $('#popup_leftContent').val();
            popup['rightContent'] = '';
            break;
    }
}

function update_frame(frame) {
    frame['title'] = $('#frame_title').val();
    frame['image'] = $('#frame_image').val();
    frame['width'] = $('#frame_width').val();
    frame['height'] = $('#frame_height').val();
    frame['group'] = $('#frame_group').val();
    frame['startsAt'] = $('#frame_startsAt').val();
    frame['zoom'] = $('#frame_zoom').val();
    
    frame['hotspot'] = {};
    frame['hotspot']['x'] = $('#frame_x').val();
    frame['hotspot']['y'] = $('#frame_y').val();
    frame['hotspot']['target'] = $('#frame_target').val();
    frame['hotspot']['link'] = $('#frame_link').val();
    frame['hotspot']['image1'] = $('#frame_imageHS1').val();
    frame['hotspot']['image2'] = $('#frame_imageHS2').val();
    frame['hotspot']['borderSize'] = $('#frame_borderSizeHS').val();
    frame['hotspot']['borderColor1'] = $('#frame_borderColorHS1').val();
    frame['hotspot']['borderColor2'] = $('#frame_borderColorHS2').val();
    frame['hotspot']['fillColor1'] = $('#frame_fillColorHS1').val();
    frame['hotspot']['fillColor2'] = $('#frame_fillColorHS2').val();
}


function load_hotspot(hotspot) {
    var moves = '';

    $('#hotspot_name').val(hotspot['name']);
    $('#hotspot_target').val(hotspot['target']);
    $('#hotspot_link').val(hotspot['link']);
    $('#hotspot_tooltip').val(hotspot['tooltip']);
    $('#hotspot_tooltipTime').val(hotspot['tooltipTime']);
    for(var i = 0; i < hotspot['moves'].length; i++) {
        moves += hotspot['moves'][i]['startsAt']+','+hotspot['moves'][i]['x1']+','+hotspot['moves'][i]['y1']+"\n";
        if(i == hotspot['moves'].length - 1)
            moves += hotspot['moves'][i]['endsAt']+','+hotspot['moves'][i]['x2']+','+hotspot['moves'][i]['y2']+"\n";
    }
    $('#hotspot_moves').val(moves);
}

function load_popup(popup) {
    $('#popup_name').val(popup['name']);
    $('#popup_title').val(popup['title']);
    $('#popup_type')
        .val(popup['type'])
        .change();

    $('#popup_leftType')
        .val(popup['leftType'])
        .change();
    $('#popup_leftContent').val(popup['leftContent']);
    $('#popup_rightContent').val(popup['rightContent']);
    $('#popup_autoClose').prop('checked', popup['autoClose']);

    $('#popup_videoWidth').val(popup['videoWidth']);
    $('#popup_videoHeight').val(popup['videoHeight']);
}

function load_frame(frame) {
    $('#frame_title').val(frame['title']);
    $('#frame_image').val(frame['image']);
    $('#frame_width').val(frame['width']);
    $('#frame_height').val(frame['height']);
    $('#frame_group').val(frame['group']);
    $('#frame_startsAt').val(frame['startsAt']);
    $('#frame_zoom').val(frame['zoom']);

    $('#frame_x').val(frame['hotspot']['x']);
    $('#frame_y').val(frame['hotspot']['y']);
    $('#frame_target').val(frame['hotspot']['target']);
    $('#frame_link').val(frame['hotspot']['link']);

    $('#frame_imageHS1').val(frame['hotspot']['image1']);
    $('#frame_imageHS2').val(frame['hotspot']['image2']);
    $('#frame_borderSizeHS').val(frame['hotspot']['borderSize']);
    $('#frame_borderColorHS1').val(frame['hotspot']['borderColor1']);
    $('#frame_borderColorHS2').val(frame['hotspot']['borderColor2']);
    $('#frame_fillColorHS1').val(frame['hotspot']['fillColor1']);
    $('#frame_fillColorHS2').val(frame['hotspot']['fillColor2']);
}

function showHotspotWindow(name) {
    var iplayer = null;
    
    $('#windowHotspot').dialog({
        width: 'auto',
        resizable: false,
        modal: true,
        title: (name ? 'Edit ' + name : 'Add a hotspot'),
        open: function( event, ui ) {
            var index = -1;
            if(videoTag) {
                $('#video_container').html(videoTag);
                iplayer = new InteractivePlayer('main_video', results_json);
            }
            if(name) {
                for(var i = 0; i < results_json['hotspots'].length; i++) {
                    if(results_json['hotspots'][i]['name'] == name) {
                        index = i;
                        load_hotspot(results_json['hotspots'][i]);
                        break;
                    }
                }
            }
            $('#hotspot_form').unbind('submit').submit(function() {
                if(index != -1) {
                    update_hotspot(results_json['hotspots'][index]);
                }
                else {
                    var hotspot = {};
                    update_hotspot(hotspot);
                    results_json['hotspots'].push(hotspot);                    
                }

                updateTemplate('__CONFIG__');
                loadHotspots();
                $('#windowHotspot').dialog('close');
                return false;
            });
        },
        close: function( event, ui ) {
            if(iplayer) {
                iplayer.destroy();
                iplayer = null;
            }
            $('#video_container').html('');
            $('#windowHotspot').dialog('destroy');
        },
        buttons: [ 
            {
                text: 'Tester', 
                click: function() { 
                    var moves = parse_moves();
                    var tc = moves[0].startsAt - 3 > 0 ? moves[0].startsAt - 3 : 0;
                    if(iplayer.testing) {
                        iplayer.stopTest(tc);
                        $('#main_video').removeClass('testplayer');
                    }
                    else {
                        $('#main_video').addClass('testplayer');
                        iplayer.test(tc);
                    }
                }
            },
            {
                text: 'Enregistrer', 
                click: function() { 
                    $('#hotspot_form').submit();
                } 
            },
            {
                text: 'Annuler', 
                click: function() { 
                    $(this).dialog( "close" ); 
                } 
            }
        ]
    });
}

function showPopupWindow(name) {
    $('#windowPopup').dialog({
        width: 800,
        resizable: false,
        modal: true,
        title: (name ? 'Edit ' + name : 'Add a popup'),
        open: function( event, ui ) {
        
            $('#popup_type').unbind('change').change(function() {
                $('#windowPopup .popupType').hide();
                $('#windowPopup .'+$(this).val()).show();
                if($(this).val() == 'mixed') {                    
                    $('#windowPopup .'+$(this).val()+'_'+$('#popup_leftType').val()).show();
                }
            });

            $('#popup_leftType').unbind('change').change(function() {
                $('#popup_type').change();
            });
            
            
            $('#popup_type').change();
            
        
            var index = -1;
            if(name) {
                for(var i = 0; i < results_json['popups'].length; i++) {
                    if(results_json['popups'][i]['name'] == name) {
                        index = i;
                        load_popup(results_json['popups'][i]);
                        break;
                    }
                }
            }
            
            $('#popup_form').unbind('submit').submit(function() {
                if(index != -1) {
                    update_popup(results_json['popups'][index]);
                }
                else {
                    var popup = {};
                    update_popup(popup);
                    results_json['popups'].push(popup);                    
                }

                updateTemplate('__CONFIG__');
                loadPopups();
                $('#windowPopup').dialog('close');
                return false;
            });
        },
        close: function( event, ui ) {
            $('#windowPopup').dialog('destroy');
        },
        buttons: [ 
            {
                text: 'Test', 
                click: function() { 
                    $('body').append('<div id="popuptest" class="video-js"></div>');
                
                    var config = {};
                    update_popup(config);
                    var hotspot = {
                        'on_popupClosed': function() {
                            $('#popuptest').remove();
                            $(window).unbind('resize');
                        },
                        'name': function() {
                            return 'test';
                        }
                    };
                    var player = {
                        'width': $(window).width(),
                        'height': $(window).height(),
                        'obj': $('#popuptest')
                    }
                    var popup = new Popup(config, hotspot, player, results_json);
                    
                    $(window).unbind('resize').resize(function() {
                        popup.on_resize($(window).width(), $(window).height());
                    });
                }
            },
            {
                text: 'Save', 
                click: function() { 
                    $('#popup_form').submit();
                }
            },
            {
                text: 'Cancel', 
                click: function() { 
                    $(this).dialog( "close" ); 
                }
            }
        ]
    });
}

function showFrameWindow(index) {
    $('#windowFrame').dialog({
        width: 800,
        resizable: false,
        modal: true,
        title: (index != -1 ? 'Modify a frame' : 'Add a frame'),
        open: function( event, ui ) {
            if(results_json['map'] == null)
                results_json['map'] = {'frames': []};
            else if(!results_json['map']['frames'])
                results_json['map']['frames'] = [];

            if(index != -1) {
                load_frame(results_json['map']['frames'][index]);
            }
            
            $('#frame_form').unbind('submit').submit(function() {
                if(index != -1) {
                    update_frame(results_json['map']['frames'][index]);
                }
                else {
                    var image = {};
                    update_frame(image);
                    results_json['map']['frames'].push(image);                    
                }

                updateTemplate('__CONFIG__');
                loadFrames();
                $('#windowFrame').dialog('close');
                return false;
            });
        },
        close: function( event, ui ) {
            $('#windowFrame').dialog('destroy');
        },
        buttons: [ 
            {
                text: 'Save', 
                click: function() { 
                    $('#frame_form').submit();
                }
            },
            {
                text: 'Cancel', 
                click: function() { 
                    $(this).dialog( "close" ); 
                }
            }
        ]
    });
}

function loadHotspots() {
    $('#hotspots ol').html('');

    for(var i = 0; i < results_json['hotspots'].length; i++) {
        $('#hotspots ol').append('<li data-name="'+results_json['hotspots'][i]['name']+'">'+results_json['hotspots'][i]['name']+'</li>')
    }
    $('#hotspots li').click(function() {
        showHotspotWindow($(this).data('name'));
    });
}

function loadPopups() {
    $('#popups ol').html('');

    for(var i = 0; i < results_json['popups'].length; i++) {
        $('#popups ol').append('<li data-name="'+results_json['popups'][i]['name']+'">'+results_json['popups'][i]['name']+'</li>')
    }
    $('#popups li').click(function() {
        showPopupWindow($(this).data('name'));
    });
}

function loadFrames() {
    $('#frames ol').html('');
    
    if(!results_json['map']['frames'])
        return;

    for(var i = 0; i < results_json['map']['frames'].length; i++) {
        $('#frames ol').append('<li data-index="'+i+'">'+results_json['map']['frames'][i]['title']+'</li>')
    }
    $('#frames li').click(function() {
        showFrameWindow($(this).data('index'));
    });
}


$(document).ready(function() {
    $.get('index.html.tpl', function(data) {
        template = data;
    });

    $('#general_form').submit(function() {
    
        var values = get_form('#general_form');
        for(var name in values) {
            results_json['general'][name] = values[name];
        }
        
        updateTemplate('__CONFIG__');

        $('#main_container').accordion('option', 'active', 1);

        return false;
    });

    $('#pulsar_form').submit(function() {
        results_json['pulsar'] = get_form('#pulsar_form');
        updateTemplate('__CONFIG__');

        $('#main_container').accordion('option', 'active', 2);
        return false;
    });

    $('#video_form').submit(function() {
        results_json['general']['width'] = parseInt($('#video_width').val());
        results_json['general']['height'] = parseInt($('#video_height').val());
    
        videoTag = '<video id="main_video" class="video-js vjs-default-skin" controls="controls" preload="none" width="'+$('#video_width').val()+'" height="'+$('#video_height').val()+'">';
        var tag = '';

        if($('#video_mp4').val()) {
            tag = '<source src="'+$('#video_mp4').val()+'" type="video/mp4" />';
            updateTemplate('__VIDEO_MP4__', tag);
            videoTag += tag;
        }
        else {
            updateTemplate('__VIDEO_MP4__', '');
        }
        project['__VIDEO_MP4_SRC__'] = $('#video_mp4').val();

        if($('#video_webm').val()) {
            tag = '<source src="'+$('#video_webm').val()+'" type="video/webm" />';
            updateTemplate('__VIDEO_WEBM__', tag);
            videoTag += tag;
        }
        else {
            updateTemplate('__VIDEO_WEBM__', '');
        }
        project['__VIDEO_WEBM_SRC__'] = $('#video_webm').val();

        if($('#video_ogv').val()) {
            tag = '<source src="'+$('#video_ogv').val()+'" type="video/ogg" />';
            updateTemplate('__VIDEO_OGV__', tag);
            videoTag += tag;
        }
        else {
            updateTemplate('__VIDEO_OGV__', '');
        }
        project['__VIDEO_OGV_SRC__'] = $('#video_ogv').val();

        if($('#video_subtitles').val()) {
            tag = '<track kind="subtitles" src="'+$('#video_subtitles').val()+'" srclang="fr" label="Français"></track>';
            updateTemplate('__VIDEO_SUBTITLES__', tag);
            videoTag += tag;
        }
        else {
            updateTemplate('__VIDEO_SUBTITLES__', '');
        }
        project['__VIDEO_SUBTITLES_SRC__'] = $('#video_subtitles').val();
        videoTag += '</video>';
        
        updateTemplate('__POSTER__', $('#video_poster').val());

        updateTemplate('__WIDTH__', $('#video_width').val()); 

        updateTemplate('__HEIGHT__', $('#video_height').val()); 
        
        $('#hotspots button,#popups button').button('option', 'disabled', false);
        
        return false;
    });
    
    $('#map_form').submit(function() {
        if(results_json['map'] == null)
            results_json['map'] = {'frames': []};
            
        results_json['map']['title'] = $('#map_title').val();
        
        updateTemplate('__CONFIG__');
        return false;
    });
    
    $('#loadProjectJSON').click(function() {
        project = JSON.parse($('#projectJSON').val());
        results_json = project['__CONFIG__'];
        
        load_form('#general_form', results_json['general']);
        load_form('#pulsar_form', results_json['pulsar']);

        $('#video_width').val(project['__WIDTH__']);
        $('#video_height').val(project['__HEIGHT__']);
        $('#video_poster').val(project['__POSTER__']);
        $('#video_mp4').val(project['__VIDEO_MP4_SRC__']);
        $('#video_webm').val(project['__VIDEO_WEBM_SRC__']);
        $('#video_ogv').val(project['__VIDEO_OGV_SRC__']);
        $('#video_subtitles').val(project['__VIDEO_SUBTITLES_SRC__']);

            
        if(results_json['map']) {
            $('#map_title').val(results_json['map']['title']);
            $('#map_width').val(results_json['map']['width']);
            $('#map_height').val(results_json['map']['height']);
        }

        
        loadHotspots();
        loadPopups();
        
        if(results_json['map']) {
            loadFrames();
        }
        
        
        
        $('#general_form').submit();
        $('#pulsar_form').submit();
        $('#video_form').submit();
        
        $('#main_container').accordion('option', 'active', 0);
        
        return false;
    });
    
    
    $('#addHotspot').click(function() {
        showHotspotWindow('');
        return false;
    });

    $('#addPopup').click(function() {
        showPopupWindow('');
        return false;
    });
    
    $('#addFrame').click(function() {
        showFrameWindow(-1);
        return false;
    });
    
    $('#main_container').accordion({
        heightStyle: 'content'
    });
    
    $('#main_container button').button();

    $('#hotspots button,#popups button').button('option', 'disabled', true);
});
