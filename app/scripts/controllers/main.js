'use strict';

/**
 * @ngdoc function
 * @name onTimeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the onTimeApp
 */
////////////////////////////////////////////
angular.module('onTimeApp')
  .controller('MainCtrl', function(
    Account,
    Main,
    //   Auth,
    //   user,
    UsersRef,
    RoomMetaRef,
    RoomMsgsRef,
    RoomUsersRef,
    $firebaseArray,
    $firebaseObject,
    $location,
    $scope
  ) {
    /////// TODO test/ /////
    window.s = $scope;
    ////////////////////////
    $scope.account = Account;
    $scope.$location = $location;
    $scope.events = {
      list : Main.list, // Async
      discover : Main.discover,
      invites : Main.invites
    };
    $scope.createEvent = Main.createEvent;
    $scope.acceptInvite = Main.acceptInvite;
    $scope.rejectInvite = Main.rejectInvite;
    $scope.todaysDate = new Date();

    $scope.openEvent = Main.openEvent;
    //default values for new event
    $scope.newEvent = {
      isPrivate: true,
      isAdvancedOptions: false,
      isChat: true,
      isPoll: true,
      isMediaShare: true,
      isBillSplit: true,
      isLiveTracking: true
    };

    angular.module('onTimeApp').controller('EventCtrl', function($scope){});

  });
