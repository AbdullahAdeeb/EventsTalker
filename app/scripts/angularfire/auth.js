(function() {
  'use strict';
  angular.module('firebase.auth', ['firebase', 'firebase.ref'])
    .factory('Auth', function($firebaseAuth, FireRef) {
      return $firebaseAuth(FireRef);
    });
})();
