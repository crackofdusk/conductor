define([
        'lib/angular',
        'controllers/controllers',
        'services/services',
       ], function(angular) {
            return angular.module('conductor', [
                'controllers',
                'services',
                ])
       })
