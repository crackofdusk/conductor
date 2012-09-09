define(['controllers/controllers', 'services/mpd'], function(controllers) {
    controllers.controller('playlist', ['$scope', 'mpd', function($scope, mpd) {

        var getPlaylist = function() {
            mpd.get('playlistinfo', function(data) {
                $scope.items = data;
            })
        };

        mpd.on('playlist', getPlaylist);
        mpd.on('player', getPlaylist);
    }])
})
