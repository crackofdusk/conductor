define(['controllers/controllers', 'services/mpd'], function(controllers) {
    controllers.controller('status', ['$scope', 'mpd', function($scope, mpd) {
        mpd.on('status', function(data) {
            $scope.status = data;
        })
    }])
})
