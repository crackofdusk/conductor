define(['services/services', 'mpd'], function(services, MPD) {

    services.factory('mpd', ['$rootScope', function($rootScope) {

        var handlers = [];

        MPD.updateHandler = function(event) {
            if(!handlers[event]) return;

            handlers[event].forEach(function(handler) {
                handler();
            })
        }

        return {
            on: function(event, fn) {
                handlers[event] || (handlers[event] = []);
                handlers[event].push(fn);
            },

            set: function(command) {
                MPD.send(command);
            },

            get: function(command, callback) {
                $rootScope.$apply(function() {
                    MPD.send(command, callback);
                })
            },


            // shortcuts

            play: function() {
                MPD.send("play")
            },

            pause: function() {
                MPD.send("pause 1")
            },

            toggle: function() {
                MPD.send("pause")
            },

        }
    }])

})
