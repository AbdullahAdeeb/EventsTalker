'use strict';
/**
 * @ngdoc function
 * @name onTimeApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */
angular.module('onTimeApp')
  .controller('EventCtrl', function($scope, Account, Friends, Event, $location, $routeParams, $timeout, $cordovaGeolocation) {
    $scope.$location = $location;

    // Declaring global variables
    var roomId = $routeParams.roomId; //get the id from the url
    var thisEvent = Event.join(roomId); //returns normal object = firebaseObjects + my objects

    $scope.slider = {
      togglePeek: function() {
        var x = $('#peek_slider');
        console.log(x);
        // var  = $scope.peek_slider;
        if (x.hasClass('open')) {
          //close action
          x.animate({
            left: '20em'
          }, 150).removeClass('open');
        } else {
          // open action
          x.animate({
            left: '11em'
          }, 150).addClass('open');
        }
      },
      openPage: function(page) {
        if (nav.topPage.name != page) {
          $scope.slider.isPageLoaded = $scope.nav.replacePage(page, {
            'animation': 'slide'
          });

        }
      }
    };

    ///// META TAB /////
    $scope.meta = thisEvent.meta;
    ///-----------------------/////

    ///// CHAT TAB ////
    $scope.chat = {
      newMessage: '',
      messages: thisEvent.messages,
      sendMessage: function() {
        if (this.newMessage) {
          Event.sendMessage(roomId, this.newMessage);
        }
      },
      getMessageClass: function(message) {
        if (message.from === Account.getId()) {
          return 'sent-msg';
        } else if (message.from === 'info') {
          return 'info-msg';
        } else {
          return 'received-msg';
        }
      },
      formatDate: function(timestamp) {
        var t = new Date(timestamp);
        var h = (t.getHours() > 12 ? t.getHours() - 12 : t.getHours());
        var m = t.getMinutes();
        var xm = (t.getHours() < 12 ? ' AM' : ' PM');
        return h + ':' + m + xm;
      }
    };
    ///-----------------------/////

    ///// MEMBERS TAB ////
    $scope.members = {
      'list': thisEvent.members.list, // create a list of memebrs from with UserRef,
      'invited': thisEvent.members.invited,
      'friends': Friends.list,
      sendInvite: function() {
        console.log('invite members ', $scope.invites);
        Event.sendInvite(thisEvent.meta, $scope.invites);
        dialog.hide();
      }
    };
    $scope.invites = [];
    ///-----------------------/////

    ///// MAP TAB ////
    $scope.map = {
      // load the map and configure it
      loadMap: function() {
          $scope.slider.isPageLoaded.then(function() {
            console.debug("loading map");
            // Obtain the default map types from the platform object
            // Instantiate (and display) a map object:
            thisEvent.map = new H.Map(
              document.getElementById('map_container'),
              defaultLayers.normal.map,
              {center: new H.geo.Point(Account.getLocation().lat, Account.getLocation().lng),
                zoom: 18
              });
            // MapEvents enables the event system
            // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
            var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(thisEvent.map));

            // Create the default UI components
            // var ui = H.ui.UI.createDefault(thisEvent.map, defaultLayers);
            var myElem = document.createElement('div');
              myElem.appendChild(
                document.createElement('div')).className = 'pin bounce';
              myElem.appendChild(
                document.createElement('div')).className = 'pulse';
            var myIcon = new H.map.DomIcon(myElem);
            var myMarker = new H.map.DomMarker({
              'lng': Account.getLocation().lng,
              'lat': Account.getLocation().lat
            }, {
              icon: myIcon
            });
            thisEvent.map.addObject(myMarker);


            var range = new H.map.Circle({
              'lng': Account.getLocation().lng,
              'lat': Account.getLocation().lat
            }, Account.getLocation().accuracy)
            thisEvent.map.addObject(range);

            // Show traffic tiles
            thisEvent.map.setBaseLayer(defaultLayers.normal.traffic);

            // Enable traffic incidents layer
            thisEvent.map.addLayer(defaultLayers.incidents);

            // var icon = new H.map.Icon('/images/home_pointer.png');

            // var memIds = Object.keys(thisEvent.meta.members);
            // for (var m = 0; m < memIds.length; m++) {
            //   if (memIds[m] == Account.getId() || !thisEvent.meta.members[memIds[m]].location) {
            //     continue;
            //   }
            //
            //   var myMarker = new H.map.Marker({
            //     'lng': thisEvent.meta.members[memIds[m]].location.lng,
            //     'lat': thisEvent.meta.members[memIds[m]].location.lat,
            //     'data': {
            //       'uid': memIds[m]
            //     }
            //   });
            //   thisEvent.map.addObject(myMarker);
            //   thisEvent.map.markers[memIds[m]] = myMarker;
            // }
          });
        } // close loadMap()
    }; // close map{}
    ///-----------------------/////
    ///// POLL TAB ////
    $scope.poll = {

    };
    ///-----------------------/////
    ///// PAY SPLIT TAB ////

    $scope.paySplit = {

    };
    ///-----------------------/////
    ///// MEDIA TAB ////

    $scope.media = {

    };
    ///-----------------------/////



    $scope.myId = Account.getId();
    //TODO uncomment the line below
    // thisEvent.map = undefined;

    // var profile = $firebaseObject(FireRef.child('users/' + user.uid));
    // profile.$bindTo($scope, 'profile');

    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    console.log($scope.event);

    // $scope.sliderPreclose = function(e, v) {
    //   console.log('pre close >>>', e, v);
    // };
    // $scope.sliderPostclose = function() {
    //   console.log('post close>>>');
    // };
    // $scope.sliderPreopen = function(e, v) {
    //   console.log('pre open >>>', e, v);
    // };
    // $scope.sliderPostopen = function(e, v) {
    //   console.log('post open >>', e, v);
    // };

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
      if (thisEvent.members.invited.length == 0) {
        return false;
      }
      return $scope.invited.length > 0;
    };


    document.addEventListener("deviceready", function() {
      alert('device is ready and background mode is enabled');
      cordova.plugins.backgroundMode.enable();
    }, false);

    /////// TODO detete : FOR DEBUGGING //////
    window.s = $scope;
    $scope.Event = Event;
    $scope.Account = Account;
    $scope.thisEvent = thisEvent; //TODO delete this line for testing
    ////////////////////////
  });
