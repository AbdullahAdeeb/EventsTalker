angular.module('firebase.config', ['firebase'])
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])
  .constant('loginRedirectPath', '/login')
  .config(
    function() {
      'use strict';
      var config = {
        apiKey: "AIzaSyBAEeeDn1SRqDCe7-4RR3aMnTbyCJnrbbU",
        authDomain: "eventstalker-c4fbc.firebaseapp.com",
        databaseURL: "https://eventstalker-c4fbc.firebaseio.com",
        storageBucket: "eventstalker-c4fbc.appspot.com",
      };
      firebase.initializeApp(config);
    });

angular.module('firebase.ref', ['firebase', 'firebase.config'])
  .factory('Auth', function($firebaseAuth) {
    'use strict';
    return $firebaseAuth();
  })
  .factory('FireRef', [function() {
    'use strict';
    return firebase.database().ref();
  }]).factory('RoomMetaRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('room-metadata');
    // }]).factory('PrvtRoomRef', ['FireRef', function(FireRef) {
    //   'use strict';
    //   return FireRef.child('room-private-metadata');
  }]).factory('RoomMsgsRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('room-messages');
  }]).factory('ModeratorsRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('moderators');
  }]).factory('SuspensionsRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('suspensions');
  }]).factory('OnlineUsersRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('user-names-online');
  }]).factory('RoomUsersRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('room-users');
  }]).factory('UsersRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('users');
  }]).factory('TestRef', ['FireRef', function(FireRef) {
    'use strict';
    return FireRef.child('test');
  }]);
