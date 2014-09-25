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

