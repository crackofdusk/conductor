define(['controllers/controllers', 'services/mpd'], function(controllers) {
    controllers.controller('playlist', ['$scope', 'mpd', function($scope, mpd) {
        mpd.on('connect', function() {
            mpd.requestPlaylist();
        });

        mpd.on('playlist', function(data) {
            $scope.items = data;
        })
    }])
})
