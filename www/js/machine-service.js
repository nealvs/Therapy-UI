angular.module('therapyui.machine-service', [])

.factory('Machine', function(Common) {
    var service = {};

    service.getStatus = function() {
        return Common.get('/status');
    };

    service.loadPatients = function() {
        return Common.get('/patientList');
    };
    service.loadPatient = function(id) {
        return Common.get('/patient/' + id);
    };
    service.loadSession = function(id) {
        return Common.get('/session/' + id);
    };

    service.updateJoystick = function(value) {
        return Common.post('/updateJoystick', {'value': value});
    };

    service.reset = function(value) {
        return Common.post('/reset', {});
    };

    return service;
});
