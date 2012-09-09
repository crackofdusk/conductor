define(['controllers/controllers', 'services/mpd'], function(controllers) {
    controllers.controller('status', ['$scope', 'mpd', function($scope, mpd) {
        mpd.on('connect', function() {
            mpd.requestStatus();
        });

        mpd.on('status', function(status) {
            $scope.status = status;
        });
    }])
})
