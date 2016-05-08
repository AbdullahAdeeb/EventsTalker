'use strict';
angular.module('onTimeApp')
  .controller('FriendsCtrl', function($scope, Auth, Account, $location, Friends) {
    /// TODO FOR TESTING ////
    window.s = $scope;
    $scope.account = Account;
    /////////////////////////////////

    $scope.friends = {};
    $scope.friends.list = Friends.list;
    $scope.friends.requests = Friends.requests;
    $scope.$location = $location;
    console.log('friends ctrlr is loaded');
    $scope.friends.searchUsername = function(username) {
      console.log('searching username', username);
      // var username = $scope.frienObjectds.search.query;
      //   var username = $scope.friends.search.query;
      $scope.friends.search.results = Friends.searchUsername(username);
      $scope.friends.search.results.$loaded().then(function() {
        for (var i = 0; i < $scope.friends.search.results.length; i++) {
          //   var res = $scope.friends.search.results[i];
          var key = $scope.friends.search.results[i].$id;
          if (!!Account.fbo.requests && !!Account.fbo.requests.sent && Account.fbo.requests.sent.hasOwnProperty(key)) {
            $scope.friends.search.results[i].relation = 'requested';
          } else if (!!Account.fbo.friends && Account.fbo.friends.hasOwnProperty(key)) {
            $scope.friends.search.results[i].relation = 'friend';
          } else {
            $scope.friends.search.results[i].relation = 'stranger';
          }
        }
      });
    };

    $scope.test = function() {
      window.alert('test');
    };

    $scope.sendFriendRequest = function($id, username) {
      console.log('sending friend request to >>' + $id);
      console.log(Account);
      Friends.sendFriendRequest($id, username);
      //   $scope.friends.search.results[i].isRequested =

    };


    //reqId is requster user $id and the request ID
    $scope.acceptFriendRequest = function(reqId, request) {
      Friends.acceptFriendRequest(reqId, request);
      // $scope.friends.list.$add({Account.requests.received[reqId].$id}); // remove firend sent request
    };
    $scope.ignoreFriendRequest = function(reqId, request) {
      Friends.ignoreFriendRequest(reqId, request);
    };

    $scope.cancelFriendRequest = function(reqId, request) {
      Friends.cancelFriendRequest(reqId, request);
    };

    $scope.isReceived = function() {
      if (!Friends.requests) {
        return false;
      }
      return !!Friends.requests.received;
    };
    $scope.isSent = function() {
      if (!Friends.requests) {
        return false;
      }
      return !!Friends.requests.sent;
    };
  });

angular.module('onTimeApp').filter('friendsFilter', function() {
  return function(input, search) {
    if (!input) return input;
    if (!search) return input;
    var expected = ('' + search).toLowerCase();
    var result = {};
    angular.forEach(input, function(value, key) {
      var actual = ('' + value).toLowerCase();
      if (actual.indexOf(expected) !== -1) {
        result[key] = value;
      }
    });
    return result;
  }
});
