angular.module('therapyui.machine-service', [])

.factory('Machine', function(Common) {
    var service = {};

    service.getStatus = function() {
        return Common.get('/status');
    };
    service.getNetwork = function() {
        return Common.get('/network');
    };

    service.loadPatients = function(all) {
        return Common.get('/patientList?all=' + all);
    };
    service.loadPatient = function(id) {
        return Common.get('/patient/' + id);
    };

    service.createPatient = function(patient) {
        return Common.post('/createPatient', patient);
    };
    service.deletePatient = function(patientId) {
        return Common.post('/deletePatient', {'id': patientId});
    };
    service.deleteSession = function(sessionId) {
        return Common.post('/deleteSession', {'id': sessionId});
    };

    service.startSession = function(patientId, minutes) {
        return Common.post('/startSession', {'patientId': patientId, 'minutes': minutes});
    };
    service.resetSession = function() {
        return Common.post('/resetSession', {});
    };
    service.stopSession = function() {
        return Common.post('/stopSession', {});
    };
    service.loadSession = function(id) {
        return Common.get('/session/' + id);
    };

    service.calibrate = function() {
        return Common.post('/settings/calibrate');
    };
    service.setHoldTime = function(holdTime) {
        return Common.post('/settings/setHoldTime', {'value': holdTime});
    };
    service.setVolume = function(volume) {
        return Common.post('/settings/setVolume', {'value': volume});
    };
    service.setTimeZone = function(timeZone) {
        return Common.post('/settings/setTimeZone', {'value': timeZone});
    };
    service.setDateTime = function(timeZone, day, month, year, hour, minute) {
        return Common.post('/settings/setDateTime', {'timeZone': timeZone, 'day': day, 'month': month, 'year': year, 'hour': hour, 'minute': minute});
    };
    service.clearDatabase = function() {
        return Common.post('/settings/clearDatabase');
    };
    service.setPassword = function(newPassword) {
        return Common.post('/settings/setPassword', {'value': newPassword})
    };

    service.updateJoystick = function(value) {
        return Common.post('/updateJoystick', {'value': value});
    };

    service.applyAngleLimits = function() {
        return Common.post('/applyAngleLimits', {});
    };
    service.removeAngleLimits = function() {
        return Common.post('/removeAngleLimits', {});
    };

    service.joystickUp = function() {
        return Common.post('/joystickUp', {});
    };
    service.joystickStop = function() {
        return Common.post('/joystickStop', {});
    };
    service.joystickDown = function() {
        return Common.post('/joystickDown', {});
    };

    service.setGoals = function(goals) {
          return Common.post('/patient/setGoals', goals);
    };

    service.reset = function(value) {
        return Common.post('/reset', {});
    };


    // Power Commands
    service.restart = function() {
        return Common.post("/restart");
    };
    service.shutdown = function() {
        return Common.post("/shutdown");
    };


    return service;
});
