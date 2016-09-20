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
      }
    };
    $scope.invites = [];
    ///-----------------------/////

    ///// MAP TAB ////
    $scope.map = {
      markers: {}
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




    console.log($scope.event);


    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }

    // var chatRef = new Firebase('https://<YOUR-FIREBASE>.firebaseio.com/chat');
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
