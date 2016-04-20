angular.module('therapyui.controllers', ['ionic'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  $scope.$on('$ionicView.enter', function(e) {

  });

})

.controller('PatientsCtrl', function($scope, Machine, $location, $ionicPopup, $ionicListDelegate) {
    $scope.$on('$ionicView.enter', function(e) {

    });

    $scope.form = {search: ""};
    $scope.patients = [];
    $scope.newPatient = {firstName: "", lastName: ""};

    $scope.loadPatients = function() {
        Machine.loadPatients().then(function(response) {
            $scope.patients.list = response.data.patients;
            console.log("Patients: " + $scope.patients.list.length);
            $scope.$digest();
        });
    };

    $scope.clearSearch = function() {
        console.log('Clear Search');
        $scope.form.search = "";
        $ionicListDelegate.closeOptionButtons();
    };

    $scope.patientSelected = function() {
        $ionicListDelegate.closeOptionButtons();
    };

    $scope.showPatient = function(patient) {
        if($scope.form.search && patient) {
            var modifiedSearchString = $scope.form.search.replace(/\W/g, ' ');
            var parts = modifiedSearchString.split(" ");
            var containsAllParts = true;
            for(p=0; p<parts.length; p++) {
                part = parts[p].toLowerCase().trim();
                if(part && patient.firstName.toLowerCase().indexOf(part) < 0 && patient.lastName.toLowerCase().indexOf(part) < 0) {
                    containsAllParts = false;
                    break;
                }
            }
            return containsAllParts;
        }
        return true;
    };

    $scope.addPatient = function() {
        $scope.newPatient.firstName = "";
        $scope.newPatient.lastName = "";
        $scope.showNewPatientForm = true;
    };

    $scope.cancel = function() {
        $scope.newPatient.firstName = "";
        $scope.newPatient.lastName = "";
        $scope.showNewPatientForm = false;
    };

    $scope.createPatient = function() {
        if($scope.newPatient.firstName && $scope.newPatient.lastName) {
            Machine.createPatient($scope.newPatient)
            .success(function(response) {
                console.log(JSON.stringify(response));
                $scope.showNewPatientForm = false;
                $scope.loadPatients();
                $location.path("/app/patient/" + response.id);
            }).error(function(response) {
                $ionicPopup.alert({
                   title: 'Error',
                   template: 'Error adding patient'
                });
            });
        } else {
            $ionicPopup.alert({
               title: 'Missing Data',
               template: 'Please provide a First Name and Last Name'
            });
        }
    };

     $scope.deletePatient = function(patient) {

          var confirmPopup = $ionicPopup.confirm({
              title: 'Delete Patient',
              template: 'Are you sure you want to delete this patient?'
          });

          confirmPopup.then(function(res) {
              if(res) {
                  Machine.deletePatient(patient.id)
                     .success(function(response) {
                          console.log(JSON.stringify(response.data));
                          $scope.loadPatients();
                          $ionicListDelegate.closeOptionButtons();
                     }).error(function(response) {
                         $ionicPopup.alert({
                            title: 'Error',
                            template: 'Error deleting patient'
                         });
                     });
              } else {
                  // No
                  $ionicListDelegate.closeOptionButtons();
              }
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

.controller('CurrentSessionCtrl', function($scope, $interval, Machine) {

  $scope.machine = {};
  $scope.machine.joystick = 0;


  $scope.$on('$ionicView.enter', function(e) {
      console.log("Demo start...");
      $scope.running = true;
      var timer = $interval(function() {
          if($scope.running) {
            Machine.getStatus().then(function(response) {
                if($scope.machine) {
                  response.data.joystickSlider = $scope.machine.joystickSlider;
                }
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
      Machine.updateJoystick($scope.machine.joystickSlider / 100).then(function(response) {
          if($scope.machine) {
             response.data.joystickSlider = $scope.machine.joystickSlider;
          }
          $scope.machine = response.data;
      });
  };

})


