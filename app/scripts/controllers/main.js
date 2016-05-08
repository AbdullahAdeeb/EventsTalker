'use strict';

/**
 * @ngdoc function
 * @name onTimeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the onTimeApp
 */
// ---- from firechat js to angular ---- //
// _firebase = FireRef
//
////////////////////////////////////////////
angular.module('onTimeApp')
  .controller('MainCtrl', function(
      Account,
      Events,
    //   user,
    //   Auth,
      UsersRef,
      RoomMetaRef,
      RoomMsgsRef,
      RoomUsersRef,
      $firebaseArray,
      $firebaseObject,
      $location,
      $scope
  ){
    /////// TODO test/ /////
    window.s = $scope;
    ////////////////////////
    $scope.account = Account;
    $scope.$location = $location;
    $scope.awesomeThings = 'Awesome';
    $scope.events = {};
    $scope.events.list = Events.list;
    $scope.events.discover = Events.discover;
    $scope.events.invites = Events.invites;
    $scope.createEvent = Events.createEvent;
    $scope.acceptInvite = Events.acceptInvite;
    $scope.rejectInvite = Events.rejectInvite;
    $scope.test = function(){
        window.alert('test2');
    };

    $scope.reload = function() {
      //   chat.getRoomList(function(events) {
      //     $scope.eventsList = events;
      //   });
    };


    $scope.openEvent = Events.openEvent;

  });
