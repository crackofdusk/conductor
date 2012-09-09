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
        },
        'lib/angular': {
            exports: 'angular'
        },
    }
});

require([
        'app',
        'controllers/status',
        'controllers/playlist',
        ],function(app) {
            app.run();
});
