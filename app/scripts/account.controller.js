'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('onTimeApp')
  .controller('AccountCtrl', function($scope, Account, Auth, $firebaseObject, $timeout, $location) {
    // $scope.user = user;
    $scope.$location = $location;
    $scope.alerts = [];
    // var profile = $firebaseObject(FireRef.child('users/' + user.uid));
    // profile.$bindTo($scope, 'profile');
    $scope.account = Account;

    $scope.logout = function() {
      Auth.$signOut();
      Account.fbo.$destroy();
      Account.fbo = undefined;
    };

    $scope.changePassword = function(oldPass, newPass, confirm) {
      $scope.err = null;
      if (!oldPass || !newPass) {
        error('Please enter all fields');
      } else if (newPass !== confirm) {
        error('Passwords do not match');
      } else {
        console.log('In change pass function');
        Auth.$changePassword({
            email: Account.fbo.email,
            oldPassword: oldPass,
            newPassword: newPass
          })
          .then(function() {
          console.log('Password changed successfully');
          //success('Password changed');
          }).catch(function(error){
          console.error('Error:',error);
        });
      }
    };

    $scope.changeEmail = function(pass, newEmail) {
      $scope.err = null;
      Auth.$changeEmail({
          password: pass,
          newEmail: newEmail,
          oldEmail: Account.fbo.email
        })
        .then(function() {
          Account.fbo.email = newEmail;
          Account.fbo.$save().then(function(){
          },function(error){
          console.log('Error',error);
                         });
          console.log('Email changed');
        })
        .catch(function(error){
        console.error('Error:',error);
      });

    };

    function error(err) {
      alert(err, 'danger');
    }

    function success(msg) {
      alert(msg, 'success');
    }


    function alert(msg, type) {
      var obj = {
        text: msg + '',
        type: type
      };
      $scope.alerts.unshift(obj);
      $timeout(function() {
        $scope.alerts.splice($scope.alerts.indexOf(obj), 1);
      }, 10000);
    }

  });
