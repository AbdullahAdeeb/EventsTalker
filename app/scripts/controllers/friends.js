'use strict';
angular.module('onTimeApp')
  .controller('FriendsCtrl', function($scope, $rootScope, Auth, Account, $location, Friends) {
    /// TODO FOR TESTING ////
    window.s = $scope;
    $scope.account = Account;
    /////////////////////////////////

    console.debug('this friends ctrl');

    $scope.friends = {};
    $scope.friends.list = Friends.list;
    $scope.friends.requests = Friends.requests;
    $scope.$location = $location;
    $scope.search = {
      type: 'username',
      query: '',
      isEmptyQuery: true,
      isShortQuery: false,
      isLoading: false
    };

    //loading the popover to show the dropdown for search type selection
    ons.ready(function() {
      ons.createPopover('friends.search.dropdown').then(
        function(popover) {
          var dropdownButton = document.querySelector("#dropdown-button");
          $scope.search.showDropdown = function() {
            popover.show(dropdownButton);
          };
          $scope.search.hideDropdown = function() {
            popover.hide();
          }
        });
    });

    // this function is called from a different scope (i.e. the popover scope) so it must be in the rootScope to be accessd by popover and this scopes.
    $rootScope.setFriendSearchType = function(type) {
        console.info('setting search type = ', type);
        $scope.search.type = type;
        $scope.search.hideDropdown();
      }
      // Scope function definitions start
    $scope.search.executeQuery = function() {
      $scope.search.results = []; // clear old results
      var query = $scope.search.query;
      var type = $scope.search.type;
      // throw exception if any before searching
      $scope.search.isEmptyQuery = false;
      $scope.search.isShortQuery = false;
      if (query.length == 0) {
        $scope.search.isEmptyQuery = true;
        return;
      } else if (query.length < 3) {
        $scope.search.isShortQuery = true;
        return;
      }
      $scope.search.isLoading = true;
      console.debug('searching ' + type + ' = ' + query);
      $scope.search.results = Friends.search(type, query);
      // var username = $scope.frienObjectds.search.query;
      //   var username = $scope.friends.search.query;
      $scope.search.results.$loaded().then(function() {
        for (var i = 0; i < $scope.search.results.length; i++) {
          //   var res = $scope.friends.search.results[i];
          var key = $scope.search.results[i].$id;
          if (!!Account.fbo.requests && !!Account.fbo.requests.sent && Account.fbo.requests.sent.hasOwnProperty(key)) {
            $scope.search.results[i].relation = 'requested';
          } else if (!!Account.fbo.friends && Account.fbo.friends.hasOwnProperty(key)) {
            $scope.search.results[i].relation = 'friend';
          } else {
            $scope.search.results[i].relation = 'stranger';
          }
        }
        //done loading
        $scope.search.isLoading = false;
      });
    };
    // $scope.friends.searchUsername = function(username) {
    //   console.log('searching username', username);
    //   // var username = $scope.frienObjectds.search.query;
    //   //   var username = $scope.friends.search.query;
    //   $scope.friends.search.results = Friends.searchUsername(username);
    //   $scope.friends.search.results.$loaded().then(function() {
    //     for (var i = 0; i < $scope.friends.search.results.length; i++) {
    //       //   var res = $scope.friends.search.results[i];
    //       var key = $scope.friends.search.results[i].$id;
    //       if (!!Account.fbo.requests && !!Account.fbo.requests.sent && Account.fbo.requests.sent.hasOwnProperty(key)) {
    //         $scope.friends.search.results[i].relation = 'requested';
    //       } else if (!!Account.fbo.friends && Account.fbo.friends.hasOwnProperty(key)) {
    //         $scope.friends.search.results[i].relation = 'friend';
    //       } else {
    //         $scope.friends.search.results[i].relation = 'stranger';
    //       }
    //     }
    //   });
    // };

    $scope.test = function() {
      console.info('test');
      console.log($scope.search);
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


angular.module('onTimeApp')
  .controller('FriendsSearchDropdownCtrl', function($scope, $rootScope) {
    //controller to handle the search type dropdown choice
    $scope.setSearchType = function(type) {
      $rootScope.setFriendSearchType(type);
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
