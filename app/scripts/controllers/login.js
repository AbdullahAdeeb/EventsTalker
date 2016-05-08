'use strict';
/**
 * @ngdoc function
 * @name onTimeApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('onTimeApp')
  .controller('LoginCtrl', function($scope, Auth, $location, $q, UsersRef, $timeout) {
    // $scope.username = '';
    // $scope.email = '';
    // $scope.oauthLogin = function(provider) {
    //   $scope.err = null;
    //   Auth.$authWithOAuthPopup(provider, {
    //     rememberMe: true
    //   }).then(redirect, window.alert);
    // };

    // $scope.anonymousLogin = function() {
    //   $scope.err = null;
    //   Auth.$authAnonymously({
    //     rememberMe: true
    //   }).then(redirect, window.alert);
    // };

    $scope.passwordLogin = function(email, pass) {
      console.log('attempting to login');
      $scope.err = null;
      Auth.$authWithPassword({
        email: email,
        password: pass
      }, {
        rememberMe: true
      }).then(
        redirect, window.alert
      );
    };

    $scope.createAccount = function() {
      $scope.err = null;
      console.log($scope.login);
      if (!$scope.login.pass) {
        window.alert('Please enter a password!');
      } else if ($scope.login.pass !== $scope.login.confirm) {
        window.alert('Passwords do not match!');
      } else if (!$scope.login.email) {
        window.alert('Email is missing!');
      } else if (!$scope.login.phone) {
        window.alert('Phone number is missing!');
      } else if (!$scope.login.username) {
        window.alert('Username is missing!');
      } else {
        console.debug('creating user>>', $scope.login.email, $scope.login.pass);
        Auth.$createUser({
          email: $scope.login.email,
          password: $scope.login.pass
        }).then(
          function(userData) {
            console.debug('authenticating');
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword({
              email: $scope.login.email,
              password: $scope.login.pass
            }, {
              rememberMe: true
            });
          }).then(
          function(authData) {
            console.debug('creating user profile', authData);
            return UsersRef.child(authData.uid).set({
              email: $scope.login.email,
              username: $scope.login.username,
              phone: $scope.login.phone
            });
            // .then(redirect, window.alert)
        }).then(function(){
            redirect();
        }).catch(function(error) {
          console.error(error);
          switch (error.code) {
            case 'EMAIL_TAKEN':
              window.alert('The new user account cannot be created because the email is already in use.');
              break;
            case 'INVALID_EMAIL':
              window.alert('The specified email is not a valid email.');
              break;
            default:
              window.alert(error);
          }
          return;
        });

        //
        //   var createProfile = function(user) {
        //     console.log('Auth worked: id= ', user.uid);
        //     var def = $q.defer();,
        //     function(err) {
        //       $timeout(function() {
        //         if (err) {
        //           def.reject(err);
        //         } else {
        //           def.resolve();
        //         }
        //       });
        //     });
        //   return def.promise;
        // };
      }
    };

    function redirect() {
      $location.path('/');
    }
  });

//   angular.module('onTimeApp').directive('phoneInput', function($filter, $browser) {
//     return {
//         require: 'ngModel',
//         link: function($scope, $element, $attrs, ngModelCtrl) {
//             var listener = function() {
//                 var value = $element.val().replace(/[^0-9]/g, '');
//                 $element.val($filter('tel')(value, false));
//             };
//
//             // This runs when we update the text field
//             ngModelCtrl.$parsers.push(function(viewValue) {
//                 return viewValue.replace(/[^0-9]/g, '').slice(0,10);
//             });
//
//             // This runs when the model gets updated on the scope directly and keeps our view in sync
//             ngModelCtrl.$render = function() {
//                 $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
//             };
//
//             $element.bind('change', listener);
//             $element.bind('keydown', function(event) {
//                 var key = event.keyCode;
//                 // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
//                 // This lets us support copy and paste too
//                 if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){
//                     return;
//                 }
//                 $browser.defer(listener); // Have to do this or changes don't get picked up properly
//             });
//
//             $element.bind('paste cut', function() {
//                 $browser.defer(listener);
//             });
//         }
//
//     };
// });
// angular.module('onTimeApp').filter('tel', function () {
//     return function (tel) {
//         console.log(tel);
//         if (!tel) { return ''; }
//
//         var value = tel.toString().trim().replace(/^\+/, '');
//
//         if (value.match(/[^0-9]/)) {
//             return tel;
//         }
//
//         var country, city, number;
//
//         switch (value.length) {
//             case 1:
//             case 2:
//             case 3:
//                 city = value;
//                 break;
//
//             default:
//                 city = value.slice(0, 3);
//                 number = value.slice(3);
//         }
//
//         if(number){
//             if(number.length>3){
//                 number = number.slice(0, 3) + '-' + number.slice(3,7);
//             }
//             else{
//                 number = number;
//             }
//
//             return ('(' + city + ') ' + number).trim();
//         }
//         else{
//             return '(' + city;
//         }
//
//     };
// });
