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
    $scope.Account = Account;
    ////////////////////////

    var roomId = $routeParams.roomId; //get the id from the url

    var thisEvent = Events.join(roomId);
    $scope.event = thisEvent;
    $scope.friends = Friends;
    $scope.invites = [];
    $scope.myId = Account.getId();
//TODO uncomment the line below
    // thisEvent.map = undefined;

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
    $scope.loadMap = function() {
      // Obtain the default map types from the platform object
      var maptypes = platform.createDefaultLayers();
      //   if (map == undefined) {
      // Instantiate (and display) a map object:
      thisEvent.map = new H.Map(
        document.getElementById('mapContainer'),
        maptypes.normal.map, {
          center: new H.geo.Point(Account.location.lat, Account.location.lng),
          zoom: 18
        });
      thisEvent.map.markers = {};

      //   }else{
      //       alert('map is already loaded');
      //   }
      var domIcon = new H.map.DomIcon('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" ' +
        'y="0px" style="margin:-112px 0 0 -32px" width="136px"' +
        'height="150px" viewBox="0 0 136 150"><ellipse fill="#000" ' +
        'cx="32" cy="128" rx="36" ry="4"><animate attributeName="cx" ' +
        'from="32" to="32" begin="0s" dur="1.5s" values="96;32;96" ' +
        'keySplines=".6 .1 .8 .1; .1 .8 .1 1" keyTimes="0;0.4;1"' +
        'calcMode="spline" repeatCount="indefinite"/>' +
        '<animate attributeName="rx" from="36" to="36" begin="0s"' +
        'dur="1.5s" values="36;10;36" keySplines=".6 .0 .8 .0; .0 .8 .0 1"' +
        'keyTimes="0;0.4;1" calcMode="spline" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" from=".2" to=".2"  begin="0s" ' +
        ' dur="1.5s" values=".1;.7;.1" keySplines=" .6.0 .8 .0; .0 .8 .0 1" ' +
        'keyTimes=" 0;0.4;1" calcMode="spline" ' +
        'repeatCount="indefinite"/></ellipse><ellipse fill="#1b468d" ' +
        'cx="26" cy="20" rx="16" ry="12"><animate attributeName="cy" ' +
        'from="20" to="20" begin="0s" dur="1.5s" values="20;112;20" ' +
        'keySplines=".6 .1 .8 .1; .1 .8 .1 1" keyTimes=" 0;0.4;1" ' +
        'calcMode="spline" repeatCount="indefinite"/> ' +
        '<animate attributeName="ry" from="16" to="16" begin="0s" ' +
        'dur="1.5s" values="16;12;16" keySplines=".6 .0 .8 .0; .0 .8 .0 1" ' +
        'keyTimes="0;0.4;1" calcMode="spline" ' +
        'repeatCount="indefinite"/></ellipse></svg>');


      //   '<svg version="1.1" id="Layer_12" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
      // 'width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">' +
      // '<g>' +
      // '<path d="M70.062,84.747H29.938L9.878,50l20.06-34.747h40.123L90.122,50L70.062,84.747z M31.671,81.747h36.658L86.658,50' +
      // 'L68.329,18.253H31.671L13.342,50L31.671,81.747z"/>' +
      // '</g>' +
      // '</svg>');

      // var icon = new H.map.Icon('/images/home_pointer.png');
      var myMarker = new H.map.DomMarker({
        'lng': Account.location.lng,
        'lat': Account.location.lat
      }, {
        icon: domIcon
      });
      thisEvent.map.addObject(myMarker);

      var range = new H.map.Circle({
        'lng': Account.location.lng,
        'lat': Account.location.lat
      }, Account.location.accuracy)
      thisEvent.map.addObject(range);
      var memIds = Object.keys(thisEvent.meta.members);
      for (var m = 0; m < memIds.length; m++) {
        if (memIds[m] == Account.getId() || !thisEvent.meta.members[memIds[m]].location) {
          continue;
        }

        var myMarker = new H.map.Marker({
          'lng': thisEvent.meta.members[memIds[m]].location.lng,
          'lat': thisEvent.meta.members[memIds[m]].location.lat,
          'data': {
            'uid': memIds[m]
          }
        });
        thisEvent.map.addObject(myMarker);
        thisEvent.map.markers[memIds[m]] = myMarker;
      }
    };

    document.addEventListener("deviceready", function() {
        alert('device is ready and background mode is enabled');
      cordova.plugins.backgroundMode.enable();
    }, false);

  });
