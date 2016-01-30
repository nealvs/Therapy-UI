angular.module('therapyui.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  $scope.$on('$ionicView.enter', function(e) {
  });

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('DemoCtrl', function($scope) {

  $scope.machine = {};
  $scope.machine.joystick = { value: 0 };

  $scope.stop = function() {
      console.log("stop session")
  };

  $scope.reset = function() {
      console.log("reset")
  };

  $scope.updateJoystick = function() {
      //console.log("Joystick: " + $scope.machine.joystick.value);
  };

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
