angular.module('therapyui', ['ionic', 'therapyui.controllers', 'therapyui.machine-service', 'therapyui.common'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })
    .state('app.demo', {
        url: '/demo',
        views: {
          'menuContent': {
            templateUrl: 'templates/demo.html',
            controller: 'DemoCtrl'
          }
        }
    })
    .state('app.users', {
        url: '/users',
        views: {
          'menuContent': {
            templateUrl: 'templates/users.html',
            controller: 'UsersCtrl'
          }
        }
    })
    .state('app.user', {
      url: '/user/:userId',
      views: {
        'menuContent': {
          templateUrl: 'templates/user.html',
          controller: 'UserCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/demo');


    // Disable AJAX Caching
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

});
