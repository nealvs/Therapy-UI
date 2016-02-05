angular.module('therapyui.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  $scope.$on('$ionicView.enter', function(e) {

  });

})

.controller('UsersCtrl', function($scope) {
    $scope.$on('$ionicView.enter', function(e) {
        console.log("Users...");
    });

})

.controller('UserCtrl', function($scope) {
    $scope.$on('$ionicView.enter', function(e) {
        console.log("User...");
    });

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


