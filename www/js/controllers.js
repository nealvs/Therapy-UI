angular.module('therapyui.controllers', ['ionic'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  $scope.$on('$ionicView.enter', function(e) {

  });

})

.controller('PatientsCtrl', function($scope, Machine) {
    $scope.$on('$ionicView.enter', function(e) {
        console.log("Patients...");
    });
    $scope.patients = [];

    $scope.loadPatients = function() {
        Machine.loadPatients().then(function(response) {
            $scope.patients.list = response.data.patients;
            console.log("Patients: " + $scope.patients.size);
        });
    };

    $scope.loadPatients();
})

.controller('PatientCtrl', function($scope, $stateParams, Machine) {
    $scope.$on('$ionicView.enter', function(e) {
        console.log("Patient..." + JSON.stringify($stateParams));
    });
    $scope.patient = {};
    $scope.loadPatient = function() {
        Machine.loadPatient($stateParams.patientId).then(function(response) {
            console.log(JSON.stringify(response.data));
            $scope.patient = response.data.patient;
        });
    };

    $scope.loadPatient();
})

.controller('SessionCtrl', function($scope, $stateParams, Machine) {
    $scope.$on('$ionicView.enter', function(e) {
        console.log("Session..." + JSON.stringify($stateParams));
    });
    $scope.session = {};
    $scope.loadSession = function() {
        Machine.loadSession($stateParams.sessionId).then(function(response) {
            console.log(JSON.stringify(response.data));
            $scope.session = response.data.session;
        });
    };
    $scope.loadSession();
})

.controller('DemoCtrl', function($scope, $interval, Machine) {

  $scope.machine = {};
  $scope.machine.joystick = 0;


  $scope.$on('$ionicView.enter', function(e) {
      console.log("Demo start...");
      $scope.running = true;
      var timer = $interval(function() {
          if($scope.running) {
            Machine.getStatus().then(function(response) {
                $scope.machine = response.data;
            });
          }
      }, 500);
  });

  $scope.$on('$ionicView.leave', function(e) {
      console.log("Leaving demo...");
      $scope.running = false;
  });

  $scope.stop = function() {
      console.log("stop session")
  };

  $scope.reset = function() {
      Machine.reset().then(function(response) {
          $scope.machine = response.data;
      });
  };

  $scope.updateJoystick = function() {
      Machine.updateJoystick($scope.machine.joystick).then(function(response) {
          $scope.machine = response.data;
      });
  };

})


