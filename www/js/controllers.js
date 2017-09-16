angular.module('therapyui.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $location, $timeout) {

    $scope.showTop = function() {
       if($location.path() == '/app/current') {
          return false;
       }
       return true;
    };
})

.controller('PatientsCtrl', function($scope, Machine, $location) {

    $scope.form = {search: ""};
    $scope.patients = [];
    $scope.newPatient = {firstName: "", lastName: ""};
    $scope.loadAll = false;

    $scope.loadPatients = function(all) {
        $scope.loadAll = all;
        console.log("Loading patients...");
        Machine.loadPatients(all)
          .success(function(response) {
              $scope.patients.list = response.patients;
              console.log("Patients: " + $scope.patients.list.length);
              try {
                $scope.$digest();
              } catch(ex) {}
          })
          .error(function(response) {
              console.log("Error getting patients. Trying again.");
              setTimeout($scope.loadPatients, 0);
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
        $scope.newPatient.error = "";
        $scope.showNewPatientForm = true;
    };

    $scope.cancel = function() {
        $scope.newPatient.firstName = "";
        $scope.newPatient.lastName = "";
        $scope.newPatient.error = "";
        $scope.showNewPatientForm = false;
    };

    $scope.onChange = function() {
        $scope.newPatient.error = "";
    }

    $scope.createPatient = function() {
        if($scope.newPatient.firstName && $scope.newPatient.lastName) {
            Machine.createPatient($scope.newPatient)
            .success(function(response) {
                console.log(JSON.stringify(response));
                if(response.error) {
                  $scope.newPatient.error = response.error;
                } else {
                  //console.log(JSON.stringify(response));
                  $scope.showNewPatientForm = false;
                  $scope.loadPatients($scope.loadAll);
                  $location.path("/app/patient/" + response.id);
                }
            }).error(function(response) {
                console.log("Error: " + response);
                $scope.newPatient.error = response.error;
            });
        } else {
            $scope.newPatient.error = 'Please provide a First Name and Last Name';
        }
    };

    $scope.loadPatients(false);
})

.controller('PatientCtrl', function($scope, $state, $stateParams, $location, Machine) {

    $scope.patientView = {mode: 'normal', minutes: 15, useTimer: true};
    $scope.patient = {};
    $scope.loadPatient = function() {
        Machine.loadPatient($stateParams.patientId).then(function(response) {
            //console.log(JSON.stringify(response.data));
            $scope.patient = response.data.patient;
        });
    };
    $scope.newSession = function() {
      $scope.patientView.mode = 'timer';
    };
    $scope.startNewSession = function() {
        console.log("startNewSession: " + $stateParams.patientId);
        var minutes = $scope.patientView.minutes;
        if(!$scope.patientView.useTimer) {
            minutes = -1;
        }
        Machine.startSession($stateParams.patientId, minutes)
          .success(function(response) {
                //console.log("startSession: " + JSON.stringify(response));
                $state.go("app.current");
          }).error(function(response) {
              console.log(response);
          });
    };

    $scope.useTimer = function() {
        $scope.patientView.useTimer = $("#useTimer").is(":checked");
        console.log("Use Timer: " + $scope.patientView.useTimer);
    };

    $scope.timerUp = function() {
      if($scope.patientView.minutes < 60) {
        $scope.patientView.minutes += 5;
      }
    };
    $scope.timerDown = function() {
      if($scope.patientView.minutes > 5) {
        $scope.patientView.minutes -= 5;
      }
    };

    $scope.setGoals = function() {
        $scope.patientView.lowGoalConfig = $scope.patient.lowGoal;
        $scope.patientView.highGoalConfig = $scope.patient.highGoal;
        $scope.patientView.mode = 'setGoals';
    };
    $scope.cancel = function() {
          $scope.patientView.mode = 'normal';
    };
    $scope.submitGoals = function() {
        $scope.patientView.lowGoalConfig = $('#lowGoal').val();
        $scope.patientView.highGoalConfig = $('#highGoal').val();
        console.log("Set goals: " + $scope.patientView.lowGoalConfig + " - " + $scope.patientView.highGoalConfig);
        if($scope.patientView.lowGoalConfig && $scope.patientView.lowGoalConfig < -5 ||
           $scope.patientView.lowGoalConfig && $scope.patientView.lowGoalConfig > 140 ||
           $scope.patientView.highGoalConfig && $scope.patientView.highGoalConfig < -5 ||
           $scope.patientView.highGoalConfig && $scope.patientView.highGoalConfig > 140
        ) {
            $scope.patientView.goalsError = "Goals must be between -5 and 140";
        } else if($scope.patientView.lowGoal >= $scope.patientView.highGoal) {
            $scope.patientView.goalsError = "Low Goal must be less than High Goal";
        } else {
           Machine.setGoals({
              lowGoal: $scope.patientView.lowGoalConfig,
              highGoal: $scope.patientView.highGoalConfig,
              patientId: $scope.patient.id
           }).success(function(response) {
               $scope.patient = response;
               $scope.patientView.mode = 'normal';
           }).error(function(response) {
               $scope.patientView.goalsError = response.error;
           });
        }
    };

    $scope.lowFocus = function() {
        $scope.patientView.goalsError = "";
        $scope.lowKeyboard();
    };
    $scope.highFocus = function() {
        $scope.patientView.goalsError = "";
        $scope.highKeyboard();
    };

    $scope.lowKeyboard = function() {
      $('#lowGoal')
        .keyboard({
          layout : 'num',
          restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
          preventPaste : true,  // prevent ctrl-v and right click
          autoAccept : true
        });
    };
    $scope.highKeyboard = function() {
      $('#highGoal')
        .keyboard({
          layout : 'num',
          restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
          preventPaste : true,  // prevent ctrl-v and right click
          autoAccept : true
        });
    }
    $scope.lowKeyboard();
    $scope.highKeyboard();


    $scope.deletePatient = function() {
        $scope.patientView.mode = 'confirmDelete';
    };
    $scope.cancelConfirm = function() {
        $scope.patientView.mode = 'normal';
    };
    $scope.deleteConfirm = function() {
        $scope.patientView.confirmError = '';
        Machine.deletePatient($scope.patient.id)
           .success(function(response) {
               console.log(JSON.stringify(response));
               $location.path("/app/patients");
           }).error(function(response) {
               $scope.patientView.confirmError = 'Error deleting patient';
           });
    }

    $scope.loadPatient();

    $scope.loadChart = function() {
        $scope.chart = Highcharts.chart('sessionsChart', {
            chart: {
                type: 'boxplot',
                spacingBottom: 0
            },
            title: {
                text: ''
            },
            legend: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            xAxis: {
                categories: $scope.patient.repetitionNumbers,
                labels: {
                  style: {
                     fontSize: '16px'
                  }
                }
            },
            yAxis: {
                gridZIndex: -5,
                tickPositions: [-10, 0, 20, 40, 60, 80, 100, 120, 140],
                breaks: [
                  {from: -1, to: -1, breakSize: 10},
                  {from: -2, to: -2, breakSize: 10},
                  {from: -3, to: -3, breakSize: 10},
                  {from: -4, to: -4, breakSize: 10},
                  {from: -5, to: -5, breakSize: 10},
                  {from: -6, to: -6, breakSize: 10},
                  {from: -7, to: -7, breakSize: 10},
                  {from: -8, to: -8, breakSize: 10},
                  {from: -9, to: -9, breakSize: 10}
                ],
                title: {
                  text: ''
                },
                plotLines: [],
                labels: {
                  style: {
                     fontSize: '20px'
                  }
                }
            },
            series: [{
                name: 'Sessions',
                data: $scope.patient.repetitionList
            }],
            plotOptions: {
                boxplot: {
                    fillColor: '#339933',
                    //lineWidth: 2,
                    medianWidth: 0,
                    stemWidth: 0,
                    whiskerWidth: 0
                }
            },
            credits: { enabled: false }
        });
        // Move to plotLines: [] initialization
        $scope.chart.series[0].yAxis.addPlotLine({id: 2, value: $scope.patient.lowGoal, color: 'yellow', width: 1 });
        $scope.chart.series[0].yAxis.addPlotLine({id: 3, value: $scope.patient.highGoal, color: 'yellow', width: 1 });
      };

})

.controller('SessionCtrl', function($scope, $location, $stateParams, Machine) {
    $scope.session = {  };
    $scope.sessionView = { mode: 'normal' };

    $scope.loadSession = function() {
        Machine.loadSession($stateParams.sessionId).then(function(response) {
            //console.log(JSON.stringify(response.data));
            $scope.session = response.data.session;
        });
    };

    $scope.deleteSession = function() {
        $scope.sessionView.confirmError = '';
        $scope.sessionView.mode = 'confirmDelete';
    };
    $scope.cancelConfirm = function() {
        $scope.sessionView.confirmError = '';
        $scope.sessionView.mode = 'normal';
    };
    $scope.deleteConfirm = function() {
        $scope.sessionView.confirmError = '';
        Machine.deleteSession($scope.session.id)
           .success(function(response) {
               console.log(JSON.stringify(response));
               $location.path("/app/patient/" + $scope.session.patientId);
           }).error(function(response) {
               $scope.sessionView.confirmError = 'Error deleting session';
           });
    }

    $scope.loadSession();
})

.controller('SettingsCtrl', function($scope, $stateParams, $timeout, Machine) {
      $scope.machine = {};
      $scope.settings = { mode: 'password', firstLoad: true, holdTimeConfig: null, timeZone: "America/Denver", password: null, submittedPassword: "", passwordError: "" };

      console.log("settings running=true");
      $scope.running = true;
      $scope.getMachineStatus = function() {
        Machine.getStatus().then(function(response) {
            if(response.data) {
                $scope.machine = response.data;

                if($scope.settings.firstLoad) {
                    $scope.settings.firstLoad = false;
                    $scope.settings.holdTimeConfig = $scope.machine.holdTimeConfig;
                    $scope.settings.timeZone = $scope.machine.timeZone;
                    $scope.settings.password = $scope.machine.password;
                    $scope.settings.day = $scope.machine.day;
                    $scope.settings.month = $scope.machine.month;
                    $scope.settings.year = $scope.machine.year;
                    $scope.settings.hour = $scope.machine.hour;
                    $scope.settings.minute = $scope.machine.minute;
                    $scope.settings.volume = $scope.machine.volume;
                }
            }
            if($scope.running) {
              $timeout($scope.getMachineStatus, 50);
            }
        });
      };
      $scope.getMachineStatus();

      $scope.$on('$viewContentLoaded', function readyToTrick() {
          console.log("SettingsCtrl ViewContentLoaded");
      });
      $scope.$on('$destroy', function destroy() {
          console.log("SettingsCtrl Destroy");
          $scope.running = false;
      });

      $scope.changeCalibration = function() {
          $scope.settings.mode = 'calibrate';
      };

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

      $scope.applyAngleLimits = function(event) {
          console.log("apply angle limits");
          Machine.applyAngleLimits();
      };
      $scope.removeAngleLimits = function(event) {
          console.log("remove angle limits");
          Machine.removeAngleLimits();
      };

      $scope.holdFocus = function() {
          $scope.settings.successMsg = "";
          $scope.settings.errorMsg = "";
          $scope.holdKeyboard();
      };

      $scope.holdKeyboard = function() {
        $('#holdTime')
          .keyboard({
            layout : 'num',
            restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
            preventPaste : true,  // prevent ctrl-v and right click
            autoAccept : true
          });
      };
      $scope.holdKeyboard();

      $scope.setHoldTime = function() {
          $scope.settings.holdTimeConfig = $('#holdTime').val();
          console.log("Set hold time: " + $scope.settings.holdTimeConfig);
          if($scope.settings.holdTimeConfig && $scope.settings.holdTimeConfig > 0) {
              Machine.setHoldTime($scope.settings.holdTimeConfig);
          } else {
              $scope.settings.errorMsg = "Hold time must be > 0";
          }
      };

      $scope.updateVolume = function() {
          $scope.settings.volume = $('#volume').val();
          console.log("Set volume: " + $scope.settings.volume);
          Machine.setVolume($scope.settings.volume);
      };

      $scope.range = function(min, max, step) {
          step = step || 1;
          var input = [];
          for (var i = min; i <= max; i += step) {
              input.push(i);
          }
          return input;
      };
      $scope.changeDateTime = function() {
          $scope.settings.mode = 'dateTime';
          $scope.settings.timeZone = $scope.machine.timeZone;
          $scope.settings.password = $scope.machine.password;
          $scope.settings.day = $scope.machine.day;
          $scope.settings.month = $scope.machine.month;
          $scope.settings.year = $scope.machine.year;
          $scope.settings.hour = $scope.machine.hour;
          $scope.settings.minute = $scope.machine.minute;
      };
      $scope.saveDateTime = function() {
          Machine.setDateTime($scope.settings.timeZone, $scope.settings.day, $scope.settings.month, $scope.settings.year, $scope.settings.hour, $scope.settings.minute);
          $scope.goBack();
      };
      $scope.changeTimeZone = function() {
          console.log("Set timeZone: " + $scope.settings.timeZone);
          if($scope.settings.timeZone) {
              Machine.setTimeZone($scope.settings.timeZone);
          }
      };

      $scope.validatePassword = function() {
        var valid =  $scope.settings.submittedPassword.toLowerCase() == $scope.settings.password.toLowerCase() || $scope.settings.submittedPassword.toLowerCase() == 'genuease';
        $scope.settings.submittedPassword = "";
        return valid;
      };

      $scope.submitPassword = function() {
          if($scope.settings.submittedPassword) {
            if($scope.validatePassword()) {
                $('#password').getkeyboard().close();
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
          $scope.settings.newPassword = '';
      };
      $scope.submitChangePassword = function() {
          if($scope.settings.submittedPassword) {

            if($scope.validatePassword()) {
                if($scope.settings.newPassword && $scope.settings.newPassword.length > 3) {
                    Machine.setPassword($scope.settings.newPassword);
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
                Machine.clearDatabase();
                $scope.settings.passwordError = "";
                $scope.settings.mode = "all";
            } else {
                $scope.settings.passwordError = "Invalid Password";
            }
          } else {
              $scope.settings.passwordError = "Enter the Password";
          }
      };

      $scope.changeWifi = function() {
          $scope.settings.mode = 'wifi';
      };


      $scope.goBack = function() {
          if($scope.settings.mode == 'changePassword' ||
             $scope.settings.mode == 'clearDatabase' ||
             $scope.settings.mode == 'calibrate' ||
             $scope.settings.mode == 'wifi' ||
             $scope.settings.mode == 'dateTime') {

            $scope.settings.mode = "all";
          } else {
            console.log("settings running=false");
            $scope.running = false;
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

.controller('CurrentSessionCtrl', function($scope, $location, $state, $timeout, Machine) {

  $scope.machine = { session: { repetitionList: [] } };
  $scope.machine.joystick = 0;
  $scope.chart = null;
  $scope.goalsLoaded = false;
  console.log("CurrentSessionCtrl running=true");

  $scope.running = true;

  $scope.getMachineStatus = function() {
    Machine.getStatus().then(function(response) {
        if($scope.machine) {
          response.data.joystickSlider = $scope.machine.joystickSlider;
        }
        $scope.machine = response.data;
        if(!$scope.machine.session.patient && $location.path() == '/app/current') {
            $location.path("/app/patients");
        }

        if($scope.chart) {
            // Redraw current angle line
            $scope.chart.series[0].yAxis.removePlotLine(1);
            var angleLineColor = $scope.machine.angle < 0 ? 'blue' : 'green';
            $scope.chart.series[0].yAxis.addPlotLine({id: 1, value: $scope.machine.angle, color: angleLineColor, width: 4 });
            // Redraw X Axis Numbers
            $scope.chart.series[0].xAxis.update({categories: $scope.machine.session.repetitionNumbers}, true);
            // Redraw repetition boxes
            $scope.chart.series[0].update({data: $scope.machine.session.repetitionList});

            if(!$scope.goalsLoaded && $scope.machine.session.patient) {
              $scope.goalsLoaded = true;
              console.log("lowGoal: " + $scope.machine.session.patient.lowGoal);
              console.log("highGoal: " + $scope.machine.session.patient.highGoal);
              if($scope.machine.session.patient.lowGoal != null && $scope.machine.session.patient.highGoal != null) {
                $scope.chart.series[0].yAxis.addPlotLine({id: 2, value: $scope.machine.session.patient.lowGoal, color: 'yellow', width: 1 });
                $scope.chart.series[0].yAxis.addPlotLine({id: 3, value: $scope.machine.session.patient.highGoal, color: 'yellow', width: 1 });
              }
            }
        }

        if($scope.running) {
            $timeout($scope.getMachineStatus, 50);
        }
    });
  }
  $scope.getMachineStatus();

  $scope.$on('$viewContentLoaded', function readyToTrick() {
      console.log("CurrentSessionCtrl ViewContentLoaded");
  });
  $scope.$on('$destroy', function destroy() {
      console.log("CurrentSessionCtrl Destroy");
      $scope.running = false;
  });

  $scope.joystickDown = function(event) {
      console.log("joystick down");
      Machine.joystickDown();
  };
  $scope.joystickStop = function(event) {
      console.log("joystick stop");
      Machine.joystickStop();
  };
  $scope.joystickUp = function(event) {
      console.log("joystick up");
      Machine.joystickUp();
  };

//   $scope.$on('$ionicView.leave', function(e) {
//       console.log("Leaving current...");
//       $scope.running = false;
//   });

  $scope.stopSession = function() {
      console.log("stop session");
      $scope.running = false;
      Machine.stopSession()
      .success(function(response) {
            //console.log("stopSession: " + JSON.stringify(response));
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

    $scope.chart = Highcharts.chart('currentChart', {
        chart: {
            type: 'boxplot',
            spacingBottom: 0
        },
        title: {
            text: ''
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        xAxis: {
            categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            labels: {
              style: {
                 fontSize: '20px'
              }
            }
        },
        yAxis: {
            gridZIndex: -5,
            tickPositions: [-10, 0, 20, 40, 60, 80, 100, 120, 140],
            breaks: [
              {from: -1, to: -1, breakSize: 10},
              {from: -2, to: -2, breakSize: 10},
              {from: -3, to: -3, breakSize: 10},
              {from: -4, to: -4, breakSize: 10},
              {from: -5, to: -5, breakSize: 10},
              {from: -6, to: -6, breakSize: 10},
              {from: -7, to: -7, breakSize: 10},
              {from: -8, to: -8, breakSize: 10},
              {from: -9, to: -9, breakSize: 10}
            ],
            title: {
              text: ''
            },
            plotLines: [
            {
                id: 1,
                value: $scope.machine.angle,
                color: 'green',
                width: 4
            }],
            labels: {
              style: {
                 fontSize: '18px'
              }
            }
        },
        series: [{
            name: 'Repetitions',
            data: $scope.machine.session.repetitionList
        }],
        plotOptions: {
            boxplot: {
                fillColor: '#339933',
                //lineWidth: 2,
                medianWidth: 0,
                stemWidth: 0,
                whiskerWidth: 0
            }
        },
        credits: { enabled: false }
    });
  };

  $scope.loadChart();

})

.controller('PowerCtrl', function($scope, $location, $stateParams, $timeout, Machine) {
  $scope.sleep = function() {
      $location.path("/sleep");
  }
  $scope.restart = function() {
      Machine.restart();
      $scope.sleep();
  }
  $scope.shutdown = function() {
      Machine.shutdown();
      $scope.sleep();
  }
  $scope.goBack = function() {
      window.history.back();
  }
})

.controller('SleepCtrl', function($scope, $stateParams, $timeout, Machine) {
  $scope.goBack = function() {
      window.history.back();
  }
})

.controller('SoftwareCtrl', function($scope, $location, $state, $interval, Machine) {

  $scope.machine = {};
  $scope.machine.joystick = 0;

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
  }, 100);

  $scope.joystickDown = function(event) {
      console.log("joystick down");
      Machine.joystickDown();
  };
  $scope.joystickStop = function(event) {
      console.log("joystick stop");
      Machine.joystickStop();
  };
  $scope.joystickUp = function(event) {
      console.log("joystick up");
      Machine.joystickUp();
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

})

