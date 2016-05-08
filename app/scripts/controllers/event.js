'use strict';
/**
 * @ngdoc function
 * @name onTimeApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */
angular.module('onTimeApp')
  .controller('EventCtrl', function($scope, Account, Friends, Events, $location, $routeParams, $timeout, $cordovaGeolocation) {
    $scope.$location = $location;
    /////// test/ /////
    window.s = $scope;
    $scope.Events = Events;
    $scope.account = Account;
    ////////////////////////

    var roomId = $routeParams.roomId; //get the id from the url

    var thisEvent = Events.join(roomId);
    $scope.event = thisEvent;
    $scope.friends = Friends;
    $scope.invites = [];
    $scope.myId = Account.getId();

    // var profile = $firebaseObject(FireRef.child('users/' + user.uid));
    // profile.$bindTo($scope, 'profile');

    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    console.log($scope.event);

    $scope.sliderPreclose = function(e, v) {
      console.log('pre close >>>', e, v);
    };
    $scope.sliderPostclose = function() {
      console.log('post close>>>');
    };
    $scope.sliderPreopen = function(e, v) {
      console.log('pre open >>>', e, v);
    };
    $scope.sliderPostopen = function(e, v) {
      console.log('post open >>', e, v);
    };

    // display any errors
    // $scope.messages.$loaded().catch(alert);
    // ons.ready(function() {
    //   console.log($scope.event_slider);
    //   $scope.event_slider.on('preclose', function(e, vObj) {
    //     console.log(e, vObj);
    //   });
    //   $scope.event_slider.on('postclose', function(e, vObj) {
    //     console.log(e, vObj);
    //   });
    // });
    // provide a method for adding a message
    $scope.sendMessage = function(msgText) {
      if (msgText) {
        Events.sendMessage(roomId, msgText);
      }
    };

    $scope.inviteMembers = function() {
      console.log('invite members ', $scope.invites);
      Events.inviteMember(thisEvent, $scope.invites);
      dialog.hide();
    };

    $scope.getMessageClass = function(message) {
      if (message.from === Account.getId()) {
        return 'sent-msg';
      } else if (message.from === 'info') {
        return 'info-msg';
      } else {
        return 'received-msg';
      }
    };

    $scope.formatDate = function(timestamp) {
      var t = new Date(timestamp);
      var h = (t.getHours() > 12 ? t.getHours() - 12 : t.getHours());
      var m = t.getMinutes();
      var xm = (t.getHours() < 12 ? ' AM' : ' PM');
      return h + ':' + m + xm;
    };

    // // Setup message listeners
    // RoomRef.child($scope.event.id).once('value', function(snapshot) {
    //   RoomMsgsRef.child($scope.event.id).limitToLast(10).on('child_added', function(snapshot) {
    //       self._onNewMessage(roomId, snapshot);
    //     },
    //     /* onCancel */
    //     function() {
    //       // Turns out we don't have permission to access these messages.
    //       self.leaveRoom($scope.event.id);
    //     }, /* context */ self);
    //
    //   RoomMsgsRef.child(roomId).limitToLast(self._options.numMaxMessages).on('child_removed', function(snapshot) {
    //     self._onRemoveMessage(roomId, snapshot);
    //   }, /* onCancel */ function() {}, /* context */ self);
    // }, /* onFailure */ function() {}, self);

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }

    // var chatRef = new Firebase('https://<YOUR-FIREBASE>.firebaseio.com/chat');
    $scope.isShowInvited = function() {
      if (!$scope.invited) {
        return false;
      }
      return $scope.invited.length > 0;
    };

// load the map and configure it
    var map = undefined;
    $scope.loadMap = function() {
      // Obtain the default map types from the platform object
      var maptypes = platform.createDefaultLayers();
    //   if (map == undefined) {
        // Instantiate (and display) a map object:
        map = new H.Map(
          document.getElementById('mapContainer'),
          maptypes.normal.map, {
            center: new H.geo.Point(Account.location.lat,Account.location.lng),
            zoom: 18
          });
    //   }else{
    //       alert('map is already loaded');
    //   }
    var myMarker = new H.map.Marker({'lng':Account.location.lng, 'lat':Account.location.lat});
    map.addObject(myMarker)
    }

  });
