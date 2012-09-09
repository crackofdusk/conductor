define(['controllers/controllers', 'services/mpd'], function(controllers) {
    controllers.controller('status', ['$scope', 'mpd', function($scope, mpd) {
        mpd.on('player', function() {
            mpd.get('status', function(data) {
                $scope.status = data;
            })
        })
    }])
})
