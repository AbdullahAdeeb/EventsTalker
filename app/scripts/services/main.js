///////////////////////////////
//[[[    Main SERVICE  ]]]]]
//////////////////////////////
angular.module('onTimeApp').factory('Main', ['$location', 'Firebase', 'FireRef', '$firebaseArray', '$firebaseObject', 'RoomMetaRef', 'RoomMsgsRef', 'UsersRef', 'Account', 'Friends',
  function($location, Firebase, FireRef, $firebaseArray, $firebaseObject, RoomMetaRef, RoomMsgsRef, UsersRef, Account, Friends) {
    'use strict';

    var mainServices = {};
    mainServices.list = UsersRef.rooms;
    mainServices.eventMeta = {};
    mainServices.eventMessages = {};
    mainServices.createEvent = function(newEvent, callback) {

      var newRoomKey = RoomMetaRef.push().key;

      console.debug(newEvent);

      var hostMmbr = {}
      hostMmbr[Account.getId()] = {
        username: Account.getUsername(),
        role: 'Host'
      };

      //init room metadata
      var newRoomMeta = {
        name: newEvent.name,
        isPrivate: newEvent.isPrivate,
        isBillSplit: newEvent.isBillSplit,
        isChat: newEvent.isChat,
        isLiveTracking: newEvent.isLiveTracking,
        isMediaShare: newEvent.isMediaShare,
        isPoll: newEvent.isPoll,
        createdByUserId: Account.getId(),
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        invited: [],
        members: hostMmbr
          // startDate: Date.parse(newEvent.startDate.toString().substring(0, 15))
      };

      // init first room message
      var newRoomMessage = {
        'from': 'info',
        'fromUsername': Account.getUsername(),
        'time': firebase.database.ServerValue.TIMESTAMP,
        'message': 'Event created by ' + Account.getUsername()
      };

      var userNewRoom = {
        'joinedAt': firebase.database.ServerValue.TIMESTAMP,
        'roomName': newRoomMeta.name
      };
      var updates = {};
      updates['/'+RoomMetaRef.key+'/' + newRoomKey] = newRoomMeta;
      updates['/'+RoomMsgsRef.key+'/' + newRoomKey] = [newRoomMessage];
      updates['/'+UsersRef.key+'/' + Account.getId() + '/rooms/' + newRoomKey] = userNewRoom;
      FireRef.update(updates, function(error) {
        if (error) {
          console.error(error);
          window.alert('Error creating new event');
          return;
        }
        mainServices.openEvent(newRoomKey);
      });
    };



    // mainServices.join = function(roomId) {
    //   if (getIndex(roomId) !== -1 || !roomId || roomId === 'undefined') {
    //     console.log('joinRoom ignored');
    //     return getEvent(roomId);
    //   }
    //   var e = {};
    //   e.meta = $firebaseObject(RoomMetaRef.child(roomId));
    //   e.messages = $firebaseArray(RoomMsgsRef.child(roomId));
    //   e.meta.$loaded().then(function() {
    //     //room-metadate is loaded
    //     e.messages.$loaded().then(function() {
    //       //room-messages is loaded
    //       mainServices.list.push(e);
    //       Account.broadcastLocationCallback(Account.location);
    //       //   mainServices.list.sort(function(a,b){
    //       //       // if b before a then return 1
    //       //       // if b after a then return -1
    //       //       return (Date.parse(a.meta.startDate) - Date.parse(b.meta.startDate));
    //       //   });
    //     });
    //   });
    //
    //   e.meta.$watch(function(input) {
    //     //watching changes in e.meta
    //     console.log(input, e);
    //     if (input.event != 'value' || !e.map) {
    //       // map has not been loaded and there's no need to update markers
    //       console.debug(' event is not value or e.map doesnt exist');
    //       return;
    //     }
    //     console.debug("event watch fired >>", e);
    //     var memIds = Object.keys(e.meta.members);
    //     for (var m = 0; m < memIds.length; m++) {
    //       if (memIds[m] == Account.getId()) {
    //         //set map center
    //         continue;
    //       } else if (!e.meta.members[memIds[m]].location) {
    //         //user has no location
    //         continue;
    //       } else {
    //         //update user location on the map
    //         e.map.markers[memIds[m]].setPosition({
    //           'lng': e.meta.members[memIds[m]].location.lng,
    //           'lat': e.meta.members[memIds[m]].location.lat
    //         })
    //       }
    //     }
    //   });
    //   return e;
    // };

    mainServices.openEvent = function(eventId) {
      $location.path('/event/' + eventId);
    };

    mainServices.acceptInvite = function(invite) {
      console.log('acceptInvite >> ', invite);
      // add user to room-meta.members
      RoomMetaRef.child(invite.roomId).child('members').child(Account.getId()).set({
        role: invite.userRole || 'mooch',
        username: Account.getUsername()
      }, function(error) {
        if (error) {
          console.error(error);
          window.alert('Error removing the invite');
        }
        //add room-id to users.rooms
        Account.$ref().child('rooms/' + invite.roomId).set({
            'joinedAt': firebase.database.ServerValue.TIMESTAMP,
            'roomName': invite.roomName
          },
          function(error) {
            if (error) {
              console.error(error);
              window.alert('Error removing the invite');
            }
            // remove the room from the invites
            // Account.$ref().child('invites/' + invite.$id).remove(function(error) {
            //   if (error) {
            //     console.error(error);
            //     window.alert('Error removing the invite from user');
            //   }
            // });
            removeInvite(invite);
          });
      });
    };
    mainServices.rejectInvite = function(invite) {
      removeInvite(invite);
    };



    Account.addLocationChangeListener(function(){

       // for (var e = 0; e < mainServices.list.length; e++) {
       //   console.debug('broadcasting location to ', mainServices.list[e], ' location =', position);
       //   mainServices.list[e].meta.$ref().child('members').child(Account.getId()).child('location').set(position, function(error) {
       //     if (error) {
       //       console.log('Error:', error);
       //       return;
       //     }
       //     console.info('location broadcasted to event =', mainServices.list[e], position);
       //
       //   });
       //   // mainServices.list[e].meta.$save().then(function(ref) {
       //   //   ref.key === obj.$id; // true
       //   // }, function(error) {
       //   // });
       // }
    });
    function removeInvite(invite) {
      //remove user-id from the room-meta/invited
      console.debug('removing the invite from user', invite);
      RoomMetaRef.child(invite.roomId + '/members/' + invite.toUserId).remove(function(error) {
        if (error) {
          console.error(error);
          window.alert('Error removing the invite from room');
        } else {
          console.debug('removing the invite from user', invite);
          //remove room-id from users
          Account.$ref().child('invites/' + invite.$id).remove(function(error) {
        if (error) {
              console.error(error);
              window.alert('Error removing the invite from user');
            }
          });
        }
      });
    }

    // function getIndex(id) {
    //   for (var l = 0; l < mainServices.list.length; l++) {
    //     if (mainServices.list[l].meta.$id === id) {
    //       return l;
    //     }
    //   }
    //   return -1;
    // }

    function getEvent(id) {
      return mainServices.list[getIndex(id)];
    }

    //load mainServices.list
    mainServices.list = $firebaseArray(UsersRef.child(Account.getId()).child('rooms'));
    mainServices.list.$loaded().then(function() {
      for (var i = 0; i < mainServices.list.length; i++) {
        console.debug(mainServices.list[i]);
        var id = mainServices.list[i].$id;
        mainServices.eventMeta[id] = $firebaseObject(RoomMetaRef.child(id));
        mainServices.eventMessages[id] = $firebaseObject(RoomMetaRef.child(id));
      }
    });
    // .$watch(function(room) {
    //   console.log('new update from:', room);
    //   if (room.event === 'child_added' || room.event === 'child_changed') {
    //     mainServices.join(room.key);
    //
    //   } else if (room.event === 'child_removed') {
    //     mainServices.list.splice([getIndex(room.key)], 1);
    //     // delete mainServices.list[]
    //   } else {
    //     console.error('event is not handled', event);
    //   }
    // });

    //load mainServices.invites
    mainServices.invites = $firebaseArray(UsersRef.child(Account.getId()).child('invites'));

    //load mainServices.discover
    mainServices.discover = $firebaseArray(RoomMetaRef.orderByChild('type').equalTo('public'));

    return mainServices;
  }
]).run(function() {

});
