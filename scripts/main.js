requirejs.config({
    shim: {
        'lib/websock': {
            deps: ['lib/util', 'lib/base64'],
            exports: 'Websock'
        },
        'lib/util': {
            exports: 'Util'
        },
        'lib/base64': {
            exports: 'Base64'
        }
    }
});

require(['mpd'], function(MPD) {
    var mpd = new MPD("localhost", 9000);
    mpd.connect();
    window.mpd = mpd;
});
