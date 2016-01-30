angular.module('therapyui.common', [])

.factory('Common', function() {
    var service = {};
    service.baseUrl = 'http://localhost:8080'

    service.get = function(path) {
        $q = $http({
            method: 'GET',
            url: service.baseUrl + path
        });
        return $q;
    };

    service.post = function(path, params) {
        $q = $http({
            method: 'POST',
            url: service.baseUrl + path,
            data: params
        });
        return $q;
    };

    return service;
});
