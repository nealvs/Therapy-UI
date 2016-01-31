angular.module('therapyui.machine-service', [])

.factory('Machine', function(Common) {
    var service = {};

    service.getStatus = function() {
        return Common.get('/status');
    };

    service.updateJoystick = function(value) {
        return Common.post('/updateJoystick', {'value': value});
    };

    service.reset = function(value) {
        return Common.post('/reset', {});
    };

    return service;
});
