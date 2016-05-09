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
