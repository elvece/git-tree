
factories.factory('authFactory', authService);

authService.$inject = ['$rootScope','$window', '$auth', '$location', '$rootScope'];

	function authService ($rootScope, $window, $auth, $location) {

		var service = {
			authenticateUser: authenticateUser,
			isUserAuthenticated: isUserAuthenticated,
			logoutUser: logoutUser
		};
		return service;

		function authenticateUser(provider){
	    $auth.authenticate(provider)
	      .then(function(response) {
	        $window.localStorage.currentUser = JSON.stringify(response.data.user);
	        $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	        console.log(response);
	        $location.path('/tree');
	      })
		    .catch(function(response) {
					console.log(response);
		    });
			}

		function isUserAuthenticated(){
			// console.log($auth.isAuthenticated())
			return $auth.isAuthenticated();
		}

		function logoutUser(){
	    $auth.logout();
	    delete $window.localStorage.currentUser;
	    $location.path('/login');
		}
	}
