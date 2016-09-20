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
    Account, Main, UsersRef, RoomMetaRef, RoomMsgsRef, RoomUsersRef, $firebaseArray, $firebaseObject, $location, $scope) {
    $scope.account = Account;
    $scope.$location = $location;
    $scope.events = {
      list: Main.list, // Async
      discover: Main.discover,
      invites: Main.invites
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

    /////// TODO test/ /////
    window.s = $scope;
    $scope.loadMap = function() {
        // Obtain the default map types from the platform object
        var maptypes = platform.createDefaultLayers();
        // Instantiate (and display) a map object:
        var map = new window.H.Map(
          document.getElementById('map_container'),
          defaultLayers.normal.map, {
              center: new window.H.geo.Point(Account.getLocation().lat, Account.getLocation().lng),
              zoom: 18
            });
      }
      ////////////////////////
  });
