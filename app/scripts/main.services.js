///////////////////////////////
//[[[    Main SERVICE  ]]]]]
//////////////////////////////
angular.module('onTimeApp').factory('Main', ['$location', 'Firebase', 'FireRef', '$firebaseArray', '$firebaseObject', 'RoomMetaRef', 'RoomMsgsRef', 'UsersRef', 'Account', 'Friends',
  function($location, Firebase, FireRef, $firebaseArray, $firebaseObject, RoomMetaRef, RoomMsgsRef, UsersRef, Account, Friends) {
    'use strict';
    var createUserRoomObj = function(name) {
      return {
        'joinedAt': firebase.database.ServerValue.TIMESTAMP,
        'roomName': name
      };
    };

    var createRoomMemberObj = function(username, role) {
      return {
        role: role || 'mooch',
        username: username
      };
  };

    var mainServices = {};

    mainServices.createEvent = function(newEvent, callback) {

      var newRoomKey = RoomMetaRef.push().key;

      console.debug(newEvent);

      var hostMmbr = {};
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

      var updates = {};
      updates['/' + RoomMetaRef.key + '/' + newRoomKey] = newRoomMeta;
      updates['/' + RoomMsgsRef.key + '/' + newRoomKey] = [newRoomMessage];
      updates['/' + UsersRef.key + '/' + Account.getId() + '/rooms/' + newRoomKey] = createUserRoomObj(newRoomMeta.name);
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
    //     console.debug('event watch fired >>', e);
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
      //add use to room-members + add room to user rooms + remove invite from room + remove invite from user
      var updates = {};
      updates[Account.$ref().path.toString() + '/rooms/' + invite.roomId] = createUserRoomObj(invite.roomName);
      //TODO add invite.userRole by allowing the invitor/room admin to pick a role
      updates['/' + RoomMetaRef.key + '/' + invite.roomId + '/members/' + Account.getId()] = createRoomMemberObj(Account.getUsername(), invite.userRole);
      updates[Account.$ref().path.toString() + '/invites/' + invite.roomId] = {};
      FireRef.update(updates, function(error) {
        if (error) {
          console.error(error);
          window.alert('Error removing the invite');
          return;
        }
        //TODO send a message to the event saying the user has joined
      });


    };

    mainServices.rejectInvite = function(invite) {
      var updates = {};
      //TODO add invite.userRole by allowing the invitor/room admin to pick a role
      updates['/' + RoomMetaRef.key + '/' + invite.roomId + '/members/' + Account.getId()] = createRoomMemberObj(Account.getUsername(), 'ditcher');
      updates[Account.$ref().path.toString() + '/invites/' + invite.roomId] = {};
      FireRef.update(updates, function(error) {
        if (error) {
          console.error(error);
          window.alert('Error removing the invite');
          return;
        }
      });
    };



    // Account.addLocationChangeListener(function() {

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
    // });


    // function getEvent(id) {
    //   return mainServices.list[getIndex(id)];
    // }


    //load mainServices.invites
    mainServices.invites = $firebaseArray(UsersRef.child(Account.getId()).child('invites'));

    //load mainServices.discover
    mainServices.discover = $firebaseArray(RoomMetaRef.orderByChild('type').equalTo('public'));

    //load mainServices.list
    mainServices.list = $firebaseArray(Account.$ref().child('rooms'));
    mainServices.list.$loaded().then(function() {
      mainServices.eventMeta = {};
      mainServices.eventMessages = {};

      for (var i = 0; i < mainServices.list.length; i++) {
        console.debug('loading rooms list',mainServices.list[i]);
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


    return mainServices;
  }
]).run(function() {

});
