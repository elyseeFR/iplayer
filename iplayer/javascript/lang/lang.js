var iplayer_langs = {};
var iplayer_lang = 'en';

function _t(id) {
    if(!iplayer_langs[iplayer_lang])
        return iplayer_langs['en'][id];

    if(!iplayer_langs[iplayer_lang][id])
        return iplayer_langs['en'][id];

    return iplayer_langs[iplayer_lang][id];
}
