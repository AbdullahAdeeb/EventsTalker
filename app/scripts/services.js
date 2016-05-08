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

///////////////////////////////
//[[[    FRIENDS SERVICE  ]]]]]
//////////////////////////////
angular.module('onTimeApp').factory('Friends', ['UsersRef', 'Account', 'RoomMetaRef', 'RoomMsgsRef', 'RoomUsersRef', '$firebaseArray', '$firebaseObject',
  function(UsersRef, Account, RoomMetaRef, RoomMsgsRef, RoomUsersRef, $firebaseArray, $firebaseObject) {
    'use strict';

    ///////decalre variables
    var friends = {
      //   list: {'x':'u'},
      //   requests: {'x':'u'}
    };

    ///////define variables
    // Account.fbo.$loaded().then(function(x) {
    console.log('loaded account');
    friends.list = $firebaseObject(Account.fbo.$ref().child('friends'));
    friends.requests = $firebaseObject(Account.fbo.$ref().child('requests'));
    // });

    //////private functions

    //////public functions
    friends.searchUsername = function(username) {
      return $firebaseArray(UsersRef.orderByChild('username').startAt(username).endAt(username + 'z'));
    };

    friends.sendFriendRequest = function($id, username) {
      UsersRef.child($id).child('requests/received').child(Account.getId()).set(Account.getUsername(), function(error) {
        if (error) {
          window.alert('Ops! :S Unable to send the request.');
          return;
        }
        friends.requests.$ref().child('sent').child($id).set(username, function(error) {
          if (error) {
            window.alert(error);
            return;
          }
          window.alert('request sent');
        });
      });
    };

    friends.acceptFriendRequest = function(reqId, request) {
      var username = request;
      //use friends.requests
      friends.list[reqId] = username; // add friend to my list
      friends.list.$save();

      UsersRef.child(reqId).child('friends').child(Account.getId()).set(Account.getUsername()); // add me to friend's list
      friends.ignoreFriendRequest(reqId);

      // $scope.friends.list.$add({Account.requests.received[reqId].$id}); // remove firend sent request
    };
    friends.ignoreFriendRequest = function(reqId, request) {
      friends.requests.received[reqId] = null;
      friends.requests.$save();
      UsersRef.child(reqId).child('requests').child('sent').child(Account.getId()).remove();
    };
    friends.cancelFriendRequest = function(reqId, request) {
      friends.requests.sent[reqId] = null;
      friends.requests.$save();
      UsersRef.child(reqId).child('requests').child('received').child(Account.getId()).remove();
    };
    return friends;
  }
]);




///////////////////////////////
//[[[    ACCOUNT SERVICE  ]]]]]
//////////////////////////////

angular.module('onTimeApp').factory('Account', function(FireRef, UsersRef, $firebaseObject, Auth, $cordovaGeolocation) {
  'use strict';

  var account = {
    'location': {
      'lat': 0,
      'lng': 0,
      'accuracy': 0,
      'speed': 0
    }
  };

  account.$ref = function() {
    return account.fbo.$ref();
  };
  account.getUsername = function() {
    return account.fbo.username;
  };
  account.getId = function() {
    return account.fbo.$id;
  };

  // start the GeoLocation watcher and update the Account.location
  account.startLocationWatching = function() {
    var watchOptions = {
      timeout: 3000,
      enableHighAccuracy: false // may cause errors if true
    };
    $cordovaGeolocation.watchPosition(watchOptions).then(
      null,
      function(err) {
        // error
        alert(err);
      },
      function(position) {
        account.location.timestamp = position.timestamp;
        account.location.lat = position.coords.latitude;
        account.location.lng = position.coords.longitude;
        account.location.accuracy = position.coords.accuracy;
        account.location.speed = position.coords.speed;

        account.$ref().child('location').set(account.location);
        console.debug('location watcher >> ', position, ' || account.location=', account.location);

      });
  }

  function loadAccount(authData) {
    console.debug(Auth.$getAuth());
    console.log("Logged in as:", authData.uid);
    account.fbo = $firebaseObject(UsersRef.child(authData.uid));
    console.debug(account);
    var myConnectionsRef = account.$ref().child('connections');
    // stores the timestamp of my last disconnect (the last time I was seen online)
    var lastOnlineRef = account.$ref().child('lastOnline');
    var connectedRef = FireRef.child('.info/connected');
    connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        // add this device to my connections list
        // this value could contain info about the device or a timestamp too
        var con = myConnectionsRef.push(true);
        // when I disconnect, remove this device
        con.onDisconnect().remove();
        // when I disconnect, update the last time I was seen online
        lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
      }
    });
    account.startLocationWatching();
  }
  
  var authData = Auth.$getAuth();
  if (authData) {
    //authenticated
    loadAccount(authData);
  } else {
    //not authenticated
    console.log("Logged out");
    Auth.$onAuth(function(authData) {
      loadAccount(authData);
    });
  }




  return account;
});
