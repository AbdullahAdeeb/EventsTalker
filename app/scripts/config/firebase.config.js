angular.module('firebase.config', ['firebase'])
  .constant('FBURL', 'https://luminous-torch-8131.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])
  .constant('loginRedirectPath', '/login')
  .config(
    function(FBURL) {
      'use strict';
      var config = {
        apiKey: "AIzaSyCZzwwM6s3noMhlp7RJFmcCqGgZk2RjqEo",
        authDomain: "luminous-torch-8131.firebaseapp.com",
        databaseURL: "https://luminous-torch-8131.firebaseio.com",
        storageBucket: "luminous-torch-8131.appspot.com"
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
