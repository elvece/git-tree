var app = angular.module('routes', ['ngRoute', 'satellizer']);

app.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/',{
    templateUrl: '../views/visual.html',
    access: {restricted: false}
  })
  .when('/login', {
    templateUrl: '../auth/login.html',
    access: {restricted: false}
  })
  .when('/tree', {
    templateUrl: '../views/visual.html',
    access: {restricted: true}
  });
}]);

app.config(['$authProvider', function($authProvider){
  $authProvider.github({
    url: '/auth/github',
    clientId: '264120f7c49937010354', // HEROKU
    redirectUri: 'https://git-tree.herokuapp.com/'
  });
}]);


