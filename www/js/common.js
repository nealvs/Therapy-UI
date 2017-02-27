angular.module('therapyui.common', [])

.factory('Common', function($http) {
    var service = {};
    service.baseUrl = 'http://localhost:8686'

    service.get = function(path) {
        if(path != "/status") {
            console.log("GET " + path);
        }
        $q = $http({
            method: 'GET',
            url: service.baseUrl + path,
            timeout: 5000 // 5 second timeout on all get requests
        });
        return $q;
    };

    service.post = function(path, params) {
        console.log("POST " + path);
        console.log(params);
        $q = $http({
            method: 'POST',
            url: service.baseUrl + path,
            data: JSON.stringify(params)
        });
        return $q;
    };

    return service;
});
