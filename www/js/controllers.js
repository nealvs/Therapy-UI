angular.module('therapyui.controllers', [])

.controller('AppCtrl', function($scope, $timeout) {


})

.controller('PatientsCtrl', function($scope, Machine, $location) {

    $scope.form = {search: ""};
    $scope.patients = [];
    $scope.newPatient = {firstName: "", lastName: ""};
    $scope.loadAll = false;

    $scope.loadPatients = function(all) {
        $scope.loadAll = all;
        Machine.loadPatients(all).then(function(response) {
            $scope.patients.list = response.data.patients;
            console.log("Patients: " + $scope.patients.list.length);
            try {
              $scope.$digest();
            } catch(ex) {}
        });
    };

    $scope.clearSearch = function() {
        console.log('Clear Search');
        $scope.form.search = "";
    };

    $scope.patientSelected = function() {

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
                $scope.loadPatients($scope.loadAll);
                $location.path("/app/patient/" + response.id);
            }).error(function(response) {
                // $ionicPopup.alert({
                //    title: 'Error',
                //    template: 'Error adding patient'
                // });
            });
        } else {
            // $ionicPopup.alert({
            //    title: 'Missing Data',
            //    template: 'Please provide a First Name and Last Name'
            // });
        }
    };

    $scope.loadPatients(false);
})

.controller('PatientCtrl', function($scope, $state, $stateParams, Machine) {

    $scope.patient = {};
    $scope.loadPatient = function() {
        Machine.loadPatient($stateParams.patientId).then(function(response) {
            console.log(JSON.stringify(response.data));
            $scope.patient = response.data.patient;
        });
    };
    $scope.startNewSession = function() {
        console.log("startNewSession: " + $stateParams.patientId);
        Machine.startSession($stateParams.patientId)
          .success(function(response) {
                console.log("startSession: " + JSON.stringify(response));
                $state.go("app.current");
          }).error(function(response) {
            //    $ionicPopup.alert({
            //       title: 'Error',
            //       template: 'Error starting new session'
            //    });
          });
    };

    $scope.deletePatient = function(patient) {
        var confirmPopup = confirm('Are you sure you want to delete this patient?');

        // confirmPopup.then(function(res) {
        //     if(res) {
        //         Machine.deletePatient(patient.id)
        //             .success(function(response) {
        //                 console.log(JSON.stringify(response));
        //                 $scope.loadPatients();
        //             }).error(function(response) {
        //                 $ionicPopup.alert({
        //                 title: 'Error',
        //                 template: 'Error deleting patient'
        //                 });
        //             });
        //     }
        // });
    };

    $scope.loadPatient();
})

.controller('SessionCtrl', function($scope, $stateParams, Machine) {
    $scope.session = {};
    $scope.loadSession = function() {
        Machine.loadSession($stateParams.sessionId).then(function(response) {
            console.log(JSON.stringify(response.data));
            $scope.session = response.data.session;
        });
    };
    $scope.loadSession();
})

.controller('SettingsCtrl', function($scope, $stateParams, $interval, Machine) {
    $scope.machine = {};
    $scope.settings = { mode: 'password', holdTimeConfig: null, password: null, submittedPassword: "", passwordError: "" };
    $scope.running = true;
      var timer = $interval(function() {
          if($scope.running) {
            Machine.getStatus().then(function(response) {
                if(response.data) {
                    $scope.machine = response.data;
                    if(!$scope.settings.holdTimeConfig) {
                        console.log($scope.machine.holdTimeConfig);
                        $scope.settings.holdTimeConfig = $scope.machine.holdTimeConfig;
                        $scope.settings.password = $scope.machine.password;
                    }
                }
            });
          }
      }, 100);

      $scope.calibrate = function() {
          console.log("calibrate");
          Machine.calibrate()
            .success(function(response) {
                 $scope.machine = response.data;
            }).error(function(response) {
                //  $ionicPopup.alert({
                //     title: 'Error',
                //     template: 'Error calibrating angle voltage'
                //  });
            });
      };

      $scope.holdFocus = function() {
          $scope.settings.successMsg = "";
          $scope.settings.errorMsg = "";
      };
      $scope.setHoldTime = function() {
          console.log("Set hold time: " + $scope.settings.holdTimeConfig);
          if($scope.settings.holdTimeConfig && $scope.settings.holdTimeConfig > 0) {

          } else {
              $scope.settings.errorMsg = "Hold time must be > 0";
          }
      };

      $scope.validatePassword = function() {
        var valid =  $scope.settings.submittedPassword.toLowerCase() == $scope.settings.password.toLowerCase() || $scope.settings.submittedPassword.toLowerCase() == 'kneeease';
        $scope.settings.submittedPassword = "";
        return valid;
      };

      $scope.submitPassword = function() {
          if($scope.settings.submittedPassword) {
            if($scope.validatePassword()) {
                $scope.settings.passwordError = "";
                $scope.settings.mode = "all";
                $scope.loadAll();
            } else {
                $scope.settings.passwordError = "Invalid Password";
            }
          } else {
              $scope.settings.passwordError = "Enter the Password";
          }
      };
      $scope.passwordChanged = function() {
          $scope.settings.passwordError = "";
      };


      $scope.changePassword = function() {
          $scope.settings.mode = 'changePassword';
      };
      $scope.submitChangePassword = function() {
          if($scope.settings.submittedPassword) {

            if($scope.validatePassword()) {
                if($scope.settings.newPassword && $scope.settings.newPassword.length > 3) {
                    $scope.settings.passwordError = "";
                    $scope.settings.mode = "all";
                } else {
                    $scope.settings.passwordError = "New password must be at least 4 characters";
                }
            } else {
                $scope.settings.passwordError = "Invalid Current Password";
            }

          } else {
              $scope.settings.passwordError = "Enter the Current Password";
          }
      }

      $scope.clearDatabase = function() {
          $scope.settings.mode = "clearDatabase";
      };
      $scope.submitClearDatabase = function() {
          if($scope.settings.submittedPassword) {
            if($scope.validatePassword()) {
                $scope.settings.passwordError = "";
                $scope.settings.mode = "all";
            } else {
                $scope.settings.passwordError = "Invalid Password";
            }
          } else {
              $scope.settings.passwordError = "Enter the Password";
          }
      };

      $scope.goBack = function() {
          if($scope.settings.mode == 'changePassword' || $scope.settings.mode == 'clearDatabase') {
            $scope.settings.mode = "all";
          } else {
            window.history.back();
          }
      };

      $scope.loadAll = function() {
          console.log("num: " + $('.num').length);
          $('.num')
            .keyboard({
                layout : 'custom',
                customLayout: {
                    'normal': [
                        '1 2 3 4 5',
                        '6 7 8 9 0',
                        '{bksp} {cancel} {accept}'
                    ]
                },
                restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
                preventPaste : true,  // prevent ctrl-v and right click
                autoAccept : true
            });
      };

    //   $scope.$on('$ionicView.leave', function(e) {
    //       console.log("Leaving settings...");
    //       $scope.running = false;
    //   });
})

.controller('CurrentSessionCtrl', function($scope, $location, $state, $interval, Machine) {

  $scope.machine = {};
  $scope.machine.joystick = 0;

  //$scope.$on('$ionicView.enter', function(e) {
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
  //});

//   $scope.$on('$ionicView.leave', function(e) {
//       console.log("Leaving current...");
//       $scope.running = false;
//   });

  $scope.stopSession = function() {
      console.log("stop session");
      Machine.stopSession()
      .success(function(response) {
            console.log("stopSession: " + JSON.stringify(response));
            if($scope.machine && $scope.machine.session && $scope.machine.session.patient && $scope.machine.session.patient.id) {
                $state.go("app.patient", {'patientId' : $scope.machine.session.patient.id });
            } else {
                $location.path("/app/patients");
            }
      }).error(function(response) {
        //    $ionicPopup.alert({
        //       title: 'Error',
        //       template: 'Error stopping session'
        //    });
      });
  };

  $scope.reset = function() {
      Machine.reset().then(function(response) {
          $scope.machine = response.data;
      });
  };

  $scope.resetSession = function() {
      Machine.resetSession().then(function(response) {
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

  $scope.loadChart = function() {
    Highcharts.chart('currentChart', {
        chart: {
            type: 'boxplot'
        },
        title: {
            text: ''
        },
        legend: {
            enabled: false
        },
        xAxis: {
            categories: ['1', '2', '3', '4', '5']
        },
        yAxis: {
            min: -10,
            max: 180,
            tickInterval: 10,

            title: {
              text: ''
            },
            plotLines: [{
                value: 0,
                color: 'orange',
                width: 2
            },
            {
                value: 90,
                color: 'green',
                width: 2
            }]
        },
        series: [{
            name: 'Repetitions',
            data: [
                [-5, -5, -5, 160, 160],
                [0, 0, 0, 150, 150],
                [-1, -1, -1, 140, 140],
                [5, 5, 5, 130, 130],
                [2, 2, 2, 170, 170],
                [10, 10, 10, 180, 180],
                [-10, -10, -10, 160, 160],
                [0, 0, 0, 150, 150]
            ]
        }]
    });
  };

  $scope.loadChart();

})


