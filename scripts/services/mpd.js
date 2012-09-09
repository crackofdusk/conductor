define(['services/services', 'mpd'], function(services, MPD) {

    services.factory('mpd', ['$rootScope', function($rootScope) {

        var handlers = [];

        MPD.updateHandler = function(change) {
            if(handlers[change]) {
                handlers[change]();
            }
        }

        return {
            on: function(eventName, callback) {
                handlers[eventName] = callback;
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
