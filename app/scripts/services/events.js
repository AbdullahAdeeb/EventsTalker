///////////////////////////////
//[[[    Events SERVICE  ]]]]]
//////////////////////////////
angular.module('onTimeApp').factory('Events', ['$location', 'Firebase', 'FireRef', '$firebaseArray', '$firebaseObject', 'RoomMetaRef', 'RoomMsgsRef', 'UsersRef', 'Account', 'Friends',
  function($location, Firebase, FireRef, $firebaseArray, $firebaseObject, RoomMetaRef, RoomMsgsRef, UsersRef, Account, Friends) {
    'use strict';

    var events = {};
    events.list = [];

    events.join = function(roomId) {
      if (getIndex(roomId) !== -1 || !roomId || roomId === 'undefined') {
        console.log('joinRoom ignored');
        return getEvent(roomId);
      }
      var e = {};
      e.meta = $firebaseObject(RoomMetaRef.child(roomId));
      e.messages = $firebaseArray(RoomMsgsRef.child(roomId));
      events.list.push(e);
      return e;
    };

    events.openEvent = function(eventId) {
      $location.path('/event/' + eventId);
    };

    events.acceptInvite = function(invite) {
      console.log('acceptInvite >> ', invite);
      addUser(invite);
    };
    events.rejectInvite = function(invite) {
      removeInvite(invite);
    };

    events.inviteMember = function(event, invites) {
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
            'time': Firebase.ServerValue.TIMESTAMP
          });
        });
        // }
      }
    };

    function addUser(invite) {
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
        Account.$ref().child('rooms/' + invite.roomId).set(Firebase.ServerValue.TIMESTAMP, function(error) {
          if (error) {
            console.error(error);
            window.alert('Error removing the invite');
          }
          Account.$ref().child('invites/' + invite.$id).remove(function(error) {
            if (error) {
              console.error(error);
              window.alert('Error removing the invite from user');
            }
          });
        });
      });
    }

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

    events.createEvent = function(roomName, isPrivate, callback) {
      //   var self = this
      RoomMetaRef.push({}).then(function(newRoomRef) {

        // init room
        var newRoom = {
          id: newRoomRef.key(),
          name: roomName,
          type: (isPrivate ? 'private' : 'public'),
          createdByUserId: Account.getId(),
          createdAt: Firebase.ServerValue.TIMESTAMP,
          invited: [],
          members: []
        };
        // set creator as the host
        newRoom.members[Account.getId()] = {
          username: Account.getUsername(),
          role: 'Host'
        };

        // push the new room
        newRoomRef.set(newRoom, function(error) {
          if (error) {
            console.error(error);
            window.alert('unable to create room main.js');
          }

          // init first room message
          var roomId = newRoomRef.key();
          var initMsg = {
            'from': 'info',
            'fromUsername': Account.getUsername(),
            'time': Firebase.ServerValue.TIMESTAMP,
            'message': 'Event created by ' + Account.getUsername()
          };
          // push message
          RoomMsgsRef.child(roomId).push(initMsg, function(msgsref) {
            events.openEvent(newRoomRef.key());
          });
          Account.$ref().child('rooms').child(newRoomRef.key()).set(Firebase.ServerValue.TIMESTAMP, function(error) {
            if (error) {
              console.error(error);
              window.alert('Error removing the invite');
            }
          });
        });
      });
    }

    function getIndex(id) {
      for (var l = 0; l < events.list.length; l++) {
        if (events.list[l].meta.$id === id) {
          return l;
        }
      }
      return -1;
    }

    function getEvent(id) {
      return events.list[getIndex(id)];
    }

    events.sendMessage = function(roomId, msgText) {
      var msgObj = {
        'from': Account.getId(),
        'fromUsername': Account.getUsername(),
        'time': Firebase.ServerValue.TIMESTAMP,
        'message': msgText
      }
      RoomMsgsRef.child(roomId).push(msgObj, function(error) {
        if (error) {
          window.alert('there was an error sending the message');
          return false;
        } else {
          return true;
        }
      });
    };

    //load events.list
    $firebaseArray(UsersRef.child(Account.getId()).child('rooms')).$watch(function(room) {
      console.log('new update from:', room);
      if (room.event === 'child_added' || room.event === 'child_changed') {
        events.join(room.key);
      } else if (room.event === 'child_removed') {
        events.list.splice([getIndex(room.key)], 1);
        // delete events.list[]
      } else {
        console.error('event is not handled', event);
      }
    });

    //load events.invites
    events.invites = $firebaseArray(UsersRef.child(Account.getId()).child('invites'));

    //load events.discover
    events.discover = $firebaseArray(RoomMetaRef.orderByChild('type').equalTo('public'));

    return events;
  }
]);
