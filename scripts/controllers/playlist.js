define(['controllers/controllers', 'services/mpd'], function(controllers) {
    controllers.controller('playlist', ['$scope', 'mpd', function($scope, mpd) {
        mpd.on('playlist', function() {
            mpd.get('playlistinfo', function(data) {
                $scope.items = data;
            })
        })
    }])
})
