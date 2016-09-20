angular.module('onTimeApp').factory('Event', ['$location', 'Firebase', 'FireRef', '$firebaseArray', '$firebaseObject', 'RoomMetaRef', 'RoomMsgsRef', 'UsersRef', 'Account', 'Friends',
function($location, Firebase, FireRef, $firebaseArray, $firebaseObject, RoomMetaRef, RoomMsgsRef, UsersRef, Account, Friends) {
  'use strict';
  var Message = function(message) {
    this.from = Account.getId();
      this.fromUsername = Account.getUsername();
      this.time = firebase.database.ServerValue.TIMESTAMP;
      this.message = message;
  };

  var services = {};
  services.join = function(roomId) {
    // if (getIndex(roomId) !== -1 || !roomId || roomId === 'undefined') {
    //   console.log('joinRoom ignored');
    //   return getEvent(roomId);
    // }
    var e = {};
    e.test = RoomMetaRef.child(roomId);
    e.meta = $firebaseObject(RoomMetaRef.child(roomId));
    e.messages = $firebaseArray(RoomMsgsRef.child(roomId));
    e.membersProfiles = {
      'joined': [],
      'invited': [],
      'ditchers': []
    };
    $firebaseArray(RoomMetaRef.child(roomId + '/members')).$loaded().then(function(members) {
      reloadMembersProfiles(members);
      members.$watch(function(event) {
        console.log('Event triggered', event);
        reloadMembersProfiles(members);
      });
    });

    function reloadMembersProfiles(members) {
      e.membersProfiles.joined.splice(0);
      e.membersProfiles.invited.splice(0);
      e.membersProfiles.ditchers.splice(0);

      // load members
      console.info('Loading members with the following ID', members);
      for (var m = 0; m < members.length; m++) {
        if (members[m].role === 'invitee') {
          // not yet members (invitee) will not have their account fetched
          e.membersProfiles.invited.push(members[m]);
        } else if (members[m].role === 'ditcher') {
          // invitee rejected the invitation
          e.membersProfiles.ditchers.push(members[m]);
        } else {
          // any other role means the user is already a member
          e.membersProfiles.joined.push($firebaseObject(UsersRef.child(members[m].$id)));
        }
      }
    }
    // e.meta.$loaded().then(function(meta) {
    //   // room-metadate is loaded
    //   console.debug('meta is done loading >>', meta);
    //   // load members
    //   var membersIDs = Object.keys(meta.members);
    //   console.info('Loading members with the following ID', membersIDs);
    //   for (var m = 0; m < membersIDs.length; m++) {
    //     if (meta.members[membersIDs[m]].role == 'invitee' || meta.members[membersIDs[m]].role == 'ditcher') {
    //       // not yet members (invitee) will not have their account fetched
    //       e.members.invited.push(meta.members[membersIDs[m]]);
    //     } else {
    //       // any other role means the user is already a member
    //       e.members.list.push($firebaseObject(UsersRef.child(membersIDs[m])));
    //     }
    //   }
    //   console.info('Done loading members', e.members);
    // }).catch(function(error){
    //   window.alert('Failed to get event\'s members');
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

  services.sendInvite = function(meta, user) {
    var roomId = meta.$id;
    var roomName = meta.name;
    var uid = user.$id;
    var username = user.username;

    var updates = {};
    // add user invite to the room
    updates['/' + RoomMetaRef.key + '/' + roomId + '/members/' + uid] = {
      'username': username,
      'role': 'invitee'
    };
    // add the invite to the user account
    updates['/' + UsersRef.key + '/' + uid + '/invites/' + roomId] = {
      'toUserId': uid,
      'fromUserId': Account.getId(),
      'fromUserName': Account.getUsername(),
      'roomId': roomId,
      'roomName': roomName,
      'time': firebase.database.ServerValue.TIMESTAMP
    };

    FireRef.update(updates, function(error) {
      if (error) {
        console.error(error);
        window.alert('Error sending invite');
        return;
      }
    });
};

  services.sendBulkInvites = function(eventMeta, invites) {
    var roomId = eventMeta.$id;
    var roomName = eventMeta.name;
    //   var uids = Object.keys(invites);
    var updates = {};
    for (var i = 0; i < invites.length; i++) {
      var uid = invites[i];
      var username = Friends.list[uid];
      console.info('sending invite to >> ', username, uid);
      // add user invite to the room
      updates['/' + RoomMetaRef.key + '/' + roomId + '/members/' + uid] = {
        'username': username,
        'role': 'invitee'
      };
      // add the invite to the user account
      updates['/' + UsersRef.key + '/' + uid + '/invites/' + roomId] = {
        'toUserId': uid,
        'fromUserId': Account.getId(),
        'fromUserName': Account.getUsername(),
        'roomId': roomId,
        'roomName': roomName,
        'time': firebase.database.ServerValue.TIMESTAMP
      };
    }
    FireRef.update(updates, function(error) {
      if (error) {
        console.error(error);
        window.alert('Error sending invite');
        return;
      }
    });
  };

  return services;
}]);
