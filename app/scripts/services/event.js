angular.module('onTimeApp').factory('Event', ['$location', 'Firebase', 'FireRef', '$firebaseArray', '$firebaseObject', 'RoomMetaRef', 'RoomMsgsRef', 'UsersRef', 'Account', 'Friends',
  function($location, Firebase, FireRef, $firebaseArray, $firebaseObject, RoomMetaRef, RoomMsgsRef, UsersRef, Account, Friends) {
    'use strict';
    var services = {};
    var Message = function(message){
      this.from = Account.getId(),
      this.fromUsername = Account.getUsername(),
      this.time = firebase.database.ServerValue.TIMESTAMP,
      this.message = message
    };

    services.join = function(roomId) {
      // if (getIndex(roomId) !== -1 || !roomId || roomId === 'undefined') {
      //   console.log('joinRoom ignored');
      //   return getEvent(roomId);
      // }
      var e = {};
      e.meta = $firebaseObject(RoomMetaRef.child(roomId));
      e.messages = $firebaseArray(RoomMsgsRef.child(roomId));
      // services.meta.$loaded().then(function() {
        //room-metadate is loaded
      // });

      // services.messages.$loaded().then(function() {
        //room-messages is loaded
        // events.list.push(e);
        //   events.list.sort(function(a,b){
        //       // if b before a then return 1
        //       // if b after a then return -1
        //       return (Date.parse(a.meta.startDate) - Date.parse(b.meta.startDate));
        //   });
      // });

      // e.meta.$watch(function(input) {
      //   //watching changes in e.meta
      //   console.log(input, e);
      //   if (input.event != 'value' || !e.map) {
      //     // map has not been loaded and there's no need to update markers
      //     console.debug(' event is not value or e.map doesnt exist');
      //     return;
      //   }
      //   console.debug("event watch fired >>", e);
      //   var memIds = Object.keys(e.meta.members);
      //   for (var m = 0; m < memIds.length; m++) {
      //     if (memIds[m] == Account.getId()) {
      //       //set map center
      //       continue;
      //     } else if (!e.meta.members[memIds[m]].location) {
      //       //user has no location
      //       continue;
      //     } else {
      //       //update user location on the map
      //       e.map.markers[memIds[m]].setPosition({
      //         'lng': e.meta.members[memIds[m]].location.lng,
      //         'lat': e.meta.members[memIds[m]].location.lat
      //       })
      //     }
      //   }
      // });
      return e;
    };

    services.sendMessage = function(roomId, msgText) {
      var msgObj = new Message(msgText);
      RoomMsgsRef.child(roomId).push(msgObj, function(error) {
        if (error) {
          window.alert('there was an error sending the message');
          return false;
        } else {
          return true;
        }
      });
    };

    services.sendInvite = function(event, invites) {
      console.log(event);
      //   var uids = Object.keys(invites);
      for (var i = 0; i < invites.length; i++) {
        // if (invites[uids[i]]) {
        var uid = invites[i];
        var username = Friends.list[uid];
        console.log('sending invite to >> ', username, uid);
        RoomMetaRef.child(event.meta.$id + '/members/' + uid).set({
          'username': username,
          'role': 'invitee'
        }).then(function() {
          console.log('invaitee added to room list, now sending the invite to him');
          UsersRef.child(uid).child('invites').child(event.meta.$id).set({
            'toUserId': uid,
            'fromUserId': Account.getId(),
            'fromUserName': Account.getUsername(),
            'roomId': event.meta.$id,
            'roomName': event.meta.name,
            'time': firebase.database.ServerValue.TIMESTAMP
          });
        });
        // }
      }
    };

    return services;
}]);
