'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('onTimeApp')
  .controller('AccountCtrl', function($scope, Account, Auth, FireRef, $firebaseObject, $timeout, $location) {
    // $scope.user = user;
    $scope.$location = $location;
    $scope.messages = [];
    // var profile = $firebaseObject(FireRef.child('users/' + user.uid));
    // profile.$bindTo($scope, 'profile');
    $scope.account = Account;

    $scope.logout = function() {
      Auth.$unauth();
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
          console.error("Error:",error);
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
          console.log("Error",error);
                         });
          console.log('Email changed');
        })
        .catch(function(error){
        console.error("Error:",error);
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
      $scope.messages.unshift(obj);
      $timeout(function() {
        $scope.messages.splice($scope.messages.indexOf(obj), 1);
      }, 10000);
    }

  });
