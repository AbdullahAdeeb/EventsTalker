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
    $scope.myId = Account.getId();


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
        if (nav.topPage.name !== page) {
          $scope.slider.isPageLoaded = $scope.nav.replacePage(page, {
            'animation': 'slide'
          });

        }
      }
    };


    ///// PLAN TAB /////
    $scope.isDescriptionEdit = false;
    $scope.plan = {
      meta: thisEvent.meta,
      saveDescription: function() {
        thisEvent.meta.description = $('#descriptionEditor').html();
        thisEvent.meta.$save();
      }
    };
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
      'joined': thisEvent.membersProfiles.joined, // create a list of memebrs from with UserRef,
      'invited': thisEvent.membersProfiles.invited,
      'ditchers': thisEvent.membersProfiles.ditchers,
      'friends': Friends.list,
      sendBulkInvites: function() {
        console.log('invite members ', $scope.invites);
        Event.sendBulkInvites(thisEvent.meta, $scope.invites);
        dialog.hide();
      },
      sendInvite: function(meta, member) {
        Event.sendInvite(meta, member);
      },
      getMember: function(uid) {
        for (var m = 0; m < $scope.members.joined.length; m++) {
          if ($scope.members.joined[m].$id == uid) {
            return $scope.members.joined[m];
          }
        }
        return undefined;
      }
    };
    $scope.invites = [];
    ///-----------------------/////

    ///// MAP TAB ////
    $scope.map = {
      markers: {},
      lines: {},
      poly: {},
      toggleControls: function() {
        $('#map_controls').toggleClass('open');
      }
    }; // end map{}
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
    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }

    $scope.isShowInvited = function() {
      if (thisEvent.members.invited.length === 0) {
        return false;
      }
      return $scope.invited.length > 0;
    };


    document.addEventListener('deviceready', function() {
      alert('device is ready and background mode is enabled');
      cordova.plugins.backgroundMode.enable();
    }, false);

    /////// TODO detete : FOR DEBUGGING //////
    window.s = $scope;
    $scope.Event = Event;
    $scope.Account = Account;
    $scope.thisEvent = thisEvent; //TODO delete this line for testing
    $scope.testin = 'this is a test message';
    $scope.coverPhoto = '/images/calypso-waterpark.jpg';
    ////////////////////////
  });

angular.module('onTimeApp').directive('scrollToLast', ['$location', '$anchorScroll',
  function($location, $anchorScroll) {
    function linkFn(scope, element, attrs) {

      $location.hash('chat_bottom_anchor');
      $anchorScroll();
    }
    return {
      restrict: 'A',
      scope: {

      },
      link: linkFn
    };

  }
]);

angular.module('onTimeApp').controller('locationPickerCtrl',
  function($scope, Account, $timeout) {
    console.debug('locationPickerController loading');
    var geocoderService = platform.getGeocodingService();
    $scope.geocode = function(addr) {
      // Create the parameters for the geocoding request:
      var geocodingParams = {
        searchText: addr
      };

      // Define a callback function to process the geocoding response:
      var onResult = function(result) {
        var locations = result.Response.View[0].Result;
        console.log(locations);
        $scope.searchLocationResults = locations;
      };

      // Get an instance of the geocoding service:

      // Call the geocode method with the geocoding parameters,
      // the callback and an error callback function (called if a
      // communication error occurs):
      geocoderService.geocode(geocodingParams, onResult, function(e) {
        alert(e);
      });
    }
    $scope.loadMap = function() {
      var defaultLayers = window.platform.createDefaultLayers();
      var map = new window.H.Map(
        //   document.getElementById('map_container'),
        $('#map_iris')[0],
        defaultLayers.normal.map, {
          center: new window.H.geo.Point(Account.getLocation().lat, Account.getLocation().lng),
          zoom: 18
        });
    }
    window.ss = $scope;
  });
