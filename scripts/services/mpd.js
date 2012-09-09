define(['services/services', 'mpd'], function(services, MPD) {

    services.factory('mpd', ['$rootScope', function($rootScope) {

        return {
            on: function (event, callback) {
                MPD.on(event, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(null, args);
                    });
                });
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
