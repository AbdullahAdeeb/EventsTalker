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
      e.meta.$loaded().then(function() {
        //room-metadate is loaded
        e.messages.$loaded().then(function() {
          //room-messages is loaded
          events.list.push(e);
          Account.broadcastLocationCallback(Account.location);
          //   events.list.sort(function(a,b){
          //       // if b before a then return 1
          //       // if b after a then return -1
          //       return (Date.parse(a.meta.startDate) - Date.parse(b.meta.startDate));
          //   });
        });
      });

      e.meta.$watch(function(input) {
        //watching changes in e.meta
        console.log(input, e);
        if (input.event != 'value' || !e.map) {
          // map has not been loaded and there's no need to update markers
          console.debug(' event is not value or e.map doesnt exist');
          return;
        }
        console.debug("event watch fired >>", e);
        var memIds = Object.keys(e.meta.members);
        for (var m = 0; m < memIds.length; m++) {
          if (memIds[m] == Account.getId()) {
            //set map center
            continue;
          } else if (!e.meta.members[memIds[m]].location) {
            //user has no location
            continue;
          } else {
            //update user location on the map
            e.map.markers[memIds[m]].setPosition({
              'lng': e.meta.members[memIds[m]].location.lng,
              'lat': e.meta.members[memIds[m]].location.lat
            })
          }
        }
      });
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
            'time': firebase.database.ServerValue.TIMESTAMP
          });
        });
        // }
      }
    };

    Account.broadcastLocationCallback = function(position) {
      for (var e = 0; e < events.list.length; e++) {
        console.debug('broadcasting location to ', events.list[e], ' location =', position);
        events.list[e].meta.$ref().child('members').child(Account.getId()).child('location').set(position, function(error) {
          if (error) {
            console.log('Error:', error);
            return;
          }
          console.info('location broadcasted to event =', events.list[e], position);

        });
        // events.list[e].meta.$save().then(function(ref) {
        //   ref.key === obj.$id; // true
        // }, function(error) {
        // });
      }
    }

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
        Account.$ref().child('rooms/' + invite.roomId).set(firebase.database.ServerValue.TIMESTAMP, function(error) {
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

    events.createEvent = function(newEvent, callback) {
      //   var self = this
      console.debug(newEvent);
      var hostMmbr = {};
      hostMmbr[Account.getId()] = {
        username: Account.getUsername(),
        role: 'Host'
      };

      var newRoomRef = RoomMetaRef.push({
          //init room
          // id: newRoomRef.key,
          name: newEvent.name,
          type: (newEvent.isPrivate ? 'private' : 'public'),
          createdByUserId: Account.getId(),
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          invited: [],
          members: [],
          startDate: Date.parse(newEvent.startDate.toString().substring(0, 15)),
          members: hostMmbr
        },
        function(error) {
          //onComplete of room create
          if (error) {
            console.error(error);
            window.alert('unable to create room main.js');
            return;
          } else {
            // init first room message
            RoomMsgsRef.child(newRoomRef.key).push(
              //init message
              {
                'from': 'info',
                'fromUsername': Account.getUsername(),
                'time': firebase.database.ServerValue.TIMESTAMP,
                'message': 'Event created by ' + Account.getUsername()
              },
              function(error) {
                if (error) {
                  console.error(error);
                  window.alert('Error removing the invite');
                  return;
                }
                // add room to user account
                Account.$ref().child('rooms').child(newRoomRef.key).set(firebase.database.ServerValue.TIMESTAMP, function(error) {
                  if (error) {
                    console.error(error);
                    window.alert('Error removing the invite');
                    return;
                  }
                  events.openEvent(newRoomRef.key);
                });
              });
          }
        }
      ); // End of creating room and init message
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
        'time': firebase.database.ServerValue.TIMESTAMP,
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
